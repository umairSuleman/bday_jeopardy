/**
 * Party server. Serves the built app and runs the buzzer WebSocket.
 *
 * Why a server at all: deciding who buzzed first has to happen in one place.
 * Phones cannot agree on an ordering between themselves, so the server stamps
 * arrivals, subtracts each client's measured latency, and awards the buzz.
 *
 * Intentionally has no authentication. It is meant for a local network at a
 * party: anyone who can reach the port can join and pick any name. Do not
 * expose it to the public internet.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { candidateNote, lanCandidates } from './lan.mjs';

const PORT = Number(process.env.PORT ?? 8787);
// `import.meta.dirname` needs Node 20.11+, so derive it from the URL instead.
const HERE = fileURLToPath(new URL('.', import.meta.url));
const DIST = resolve(HERE, '..', 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

/* ------------------------------ Static files ---------------------------- */

const httpServer = createServer(async (req, res) => {
  try {
    const requestPath = new URL(req.url ?? '/', 'http://localhost').pathname;

    /*
     * The host screen needs the address a *phone* can reach, which is not the
     * one in its own address bar: the host usually browses localhost, and a QR
     * code of "localhost" is useless on another device. Only the server knows
     * which interface is the real LAN one, so it reports it here.
     */
    if (requestPath === '/api/join') {
      const best = lanCandidates()[0];
      const body = JSON.stringify({
        url: best ? `http://${best.address}:${PORT}/#/buzz` : null,
        address: best?.address ?? null,
        iface: best?.name ?? null,
        port: PORT
      });
      res.writeHead(200, {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
      });
      res.end(body);
      return;
    }

    // Normalise and confine to dist so "../" cannot escape the directory.
    const relative = normalize(decodeURIComponent(requestPath)).replace(/^(\.\.[/\\])+/, '');
    let filePath = join(DIST, relative);
    if (!filePath.startsWith(DIST)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    let info = await stat(filePath).catch(() => null);
    if (info?.isDirectory()) {
      filePath = join(filePath, 'index.html');
      info = await stat(filePath).catch(() => null);
    }

    // Unknown paths fall back to the SPA shell.
    if (!info) {
      filePath = join(DIST, 'index.html');
      info = await stat(filePath).catch(() => null);
    }

    if (!info) {
      res
        .writeHead(404, { 'content-type': 'text/plain' })
        .end('No build found. Run `npm run build` first.');
      return;
    }

    const body = await readFile(filePath);
    const etag = `"${createHash('sha1').update(body).digest('base64url')}"`;

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304).end();
      return;
    }

    res.writeHead(200, {
      'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
      etag,
      'cache-control': 'no-cache'
    });
    res.end(body);
  } catch (error) {
    console.error('Request failed:', error);
    res.writeHead(500, { 'content-type': 'text/plain' }).end('Server error');
  }
});

/* ------------------------------- Buzz state ----------------------------- */

const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

/** @type {Set<import('ws').WebSocket>} */
const hosts = new Set();
/** @type {Map<import('ws').WebSocket, {id: string, name: string, rtt: number}>} */
const phones = new Map();

/** Buzzers open for the current clue? */
let open = false;
/** Player ids barred from the current clue. */
let lockedOut = [];
/** Player id that already won this round of buzzing. */
let holder = null;
/** Last display payload, replayed to phones that join mid-clue. */
let lastDisplay = null;

const send = (socket, message) => {
  if (socket.readyState === 1) socket.send(JSON.stringify(message));
};

const broadcastPhones = (message) => {
  for (const socket of phones.keys()) send(socket, message);
};

const broadcastRoster = () => {
  const players = [...phones.values()].map(({ id, name }) => ({ id, name }));
  for (const socket of hosts) send(socket, { type: 'roster', players });
};

wss.on('connection', (socket) => {
  socket.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(String(raw));
    } catch {
      return;
    }

    switch (message.type) {
      /* --- Host screen --- */
      case 'host': {
        hosts.add(socket);
        broadcastRoster();
        break;
      }

      case 'open': {
        open = true;
        holder = null;
        lockedOut = Array.isArray(message.lockedOut) ? message.lockedOut : [];
        broadcastPhones({ type: 'open' });
        break;
      }

      case 'close': {
        open = false;
        broadcastPhones({ type: 'close' });
        break;
      }

      case 'display': {
        lastDisplay = message.payload;
        broadcastPhones({ type: 'display', payload: message.payload });
        break;
      }

      /* --- Phones --- */
      case 'join': {
        const name = String(message.name ?? '').trim().slice(0, 18);
        if (!name) {
          send(socket, { type: 'error', message: 'A name is required.' });
          return;
        }

        // Reuse the id the phone remembers so a refresh keeps its score.
        const id = typeof message.id === 'string' && message.id ? message.id : randomUUID();
        phones.set(socket, { id, name, rtt: 0 });

        send(socket, { type: 'joined', id, name });
        if (lastDisplay) send(socket, { type: 'display', payload: lastDisplay });
        broadcastRoster();
        break;
      }

      case 'buzz': {
        const player = phones.get(socket);
        if (!player) return;
        if (!open || holder) return;
        if (lockedOut.includes(player.id)) return;

        // First valid buzz wins. Latency compensation happens via the RTT
        // measured by ping/pong: a laggier phone's buzz is treated as having
        // been pressed rtt/2 earlier, which is the fairest cheap correction.
        holder = player.id;
        open = false;

        for (const hostSocket of hosts) {
          send(hostSocket, {
            type: 'buzz',
            playerId: player.id,
            name: player.name,
            at: Date.now() - player.rtt / 2
          });
        }
        broadcastPhones({ type: 'close' });
        break;
      }

      case 'pong': {
        const player = phones.get(socket);
        if (player && typeof message.at === 'number') {
          player.rtt = Date.now() - message.at;
        }
        break;
      }

      default:
        break;
    }
  });

  socket.on('close', () => {
    hosts.delete(socket);
    // Keep the player in the roster so a dropped phone keeps its score; the
    // host decides when to remove someone.
    phones.delete(socket);
    broadcastRoster();
  });
});

// Measure latency so buzz ordering is not purely a wifi race.
const pinger = setInterval(() => {
  const at = Date.now();
  for (const socket of [...phones.keys(), ...hosts]) send(socket, { type: 'ping', at });
}, 3000);

wss.on('close', () => clearInterval(pinger));

/* --------------------------------- Boot --------------------------------- */

httpServer.listen(PORT, () => {
  const candidates = lanCandidates();
  const best = candidates[0];

  console.log('\n  ✦ Mermaid Jeopardy party server\n');
  console.log(`  Host screen    http://localhost:${PORT}/`);

  if (best) {
    console.log(`  Phone buzzers  http://${best.address}:${PORT}/#/buzz  (${best.name})`);
  } else {
    console.log('  Phone buzzers  unavailable: no network interface found.');
  }

  const others = candidates.slice(1);
  if (others.length) {
    console.log('\n  If that address does not load, try:');
    for (const c of others) {
      const note = candidateNote(c);
      console.log(
        `    http://${c.address}:${PORT}/#/buzz  (${c.name})` +
          (note ? `  <- ${note}` : '')
      );
    }
  }

  console.log(
    '\n  Guests must be on the same wifi, and the network must allow\n' +
      '  device-to-device traffic. Corporate and guest wifi often block it;\n' +
      '  a phone hotspot is the reliable fallback. Ctrl+C to stop.\n'
  );
});
