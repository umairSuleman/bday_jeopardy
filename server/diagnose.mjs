/**
 * Connection diagnostic. Run this, then open the printed URL on your phone.
 *
 * It answers the only question that matters when a phone cannot reach the
 * game: does the phone's traffic arrive at this machine at all?
 *
 *   - Nothing printed        -> the network is blocking it (client isolation,
 *                               or the port is filtered). Nothing on this
 *                               machine can fix that; use a phone hotspot.
 *   - "TLS attempt" printed  -> the phone reached us but asked for HTTPS.
 *                               Type the address with an explicit http:// prefix.
 *   - "HTTP GET" printed     -> the phone can reach us; the game server itself
 *                               is the problem, not the network.
 *
 * Listens on a commonly-allowed port (8080) since some networks filter
 * unusual ones like 5173.
 */
import { createServer } from 'node:http';
import { networkInterfaces } from 'node:os';

const PORT = Number(process.env.PORT ?? 8080);

const stamp = () => new Date().toLocaleTimeString();
const clean = (addr) => String(addr ?? '').replace(/^::ffff:/, '');

const server = createServer((req, res) => {
  console.log(
    `  ${stamp()}  HTTP ${req.method} ${req.url}  from ${clean(req.socket.remoteAddress)}`
  );
  console.log(`              Host header: ${req.headers.host}`);
  console.log(`              User-Agent:  ${(req.headers['user-agent'] ?? '').slice(0, 80)}`);

  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(
    `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
     <title>It works</title></head>
     <body style="font-family:system-ui;background:#07192f;color:#7ef9e3;
                  display:grid;place-content:center;height:100vh;text-align:center;margin:0">
       <div>
         <h1 style="font-size:2rem">✦ Connected ✦</h1>
         <p style="color:#a8cadd">Your phone can reach this laptop.<br>
         The network is fine, so the game will work too.</p>
       </div>
     </body></html>`
  );
});

// Catch connections that never become valid HTTP, which is what an
// HTTPS-to-HTTP-port attempt looks like.
server.on('connection', (socket) => {
  socket.once('data', (chunk) => {
    // 0x16 is the TLS handshake record type.
    if (chunk[0] === 0x16) {
      console.log(
        `  ${stamp()}  TLS attempt from ${clean(socket.remoteAddress)} ` +
          `— the browser tried HTTPS. Use an explicit http:// prefix.`
      );
    }
  });
});

server.on('clientError', (error, socket) => {
  console.log(`  ${stamp()}  malformed request from ${clean(socket.remoteAddress)}: ${error.code}`);
  socket.destroy();
});

function candidates() {
  const found = [];
  for (const [name, entries] of Object.entries(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.family !== 'IPv4' || entry.internal) continue;
      const rank = /^(utun|ipsec|tun|tap|ppp)/i.test(name) ? 2 : /^(en|eth|wl)/i.test(name) ? 0 : 1;
      found.push({ name, address: entry.address, rank });
    }
  }
  return found.sort((a, b) => a.rank - b.rank);
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  ✦ Connection diagnostic listening on port ' + PORT + '\n');
  console.log('  Open these on your phone, typing the http:// prefix in full:\n');
  for (const c of candidates()) {
    const note = c.rank === 2 ? '   <- VPN tunnel, expected to fail' : '';
    console.log(`    http://${c.address}:${PORT}/${note}`);
  }
  console.log('\n  Watching for connections. Ctrl+C to stop.\n');
});
