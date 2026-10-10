# Mermaid Jeopardy

A Jeopardy-style party game with a glittery mermaid theme. Categories across
the top, dollar tiles below, and clues that reveal one word at a time so the
room can race to buzz in.

**Play it: https://umairsuleman.github.io/bday_jeopardy/**

The hosted version covers the board, the slow reveal, and keyboard buzzers.
Phone buzzers need the host to run it locally, because a static site cannot run
a server — see "Running the party" below. It's a double-click.

## Running the party (no terminal needed)

You need [Node.js](https://nodejs.org) installed — the green **LTS** button. If
it's missing, the launcher opens the download page and tells you what to do.

Then double-click the launcher for your machine:

| Your computer | Double-click |
| --- | --- |
| Windows | `start-party.bat` |
| Mac | `start-party.command` |

It sets itself up on first run, then opens the board in your browser.

On the board page, **guests scan the QR code** to get their buzzer. They type a
name and get one big BUZZ button. No app, no typing a URL.

Everyone must be on the same wifi as the host machine. Keep the black
Terminal/Command Prompt window open while you play; closing it stops the game.

### Windows: allow it through the firewall

The first time you run it, Windows will ask whether to allow Node.js through
Windows Defender Firewall. Click **Allow access**, and make sure **Private
networks** is ticked. If you dismiss that prompt, the game still works on the
host's screen but phones cannot reach it.

To fix it afterwards: Windows Security → Firewall & network protection → Allow
an app through firewall → find Node.js → tick Private.

### Mac: the first double-click may be blocked

macOS may say the file "cannot be opened because it is from an unidentified
developer". Right-click `start-party.command` → **Open** → **Open** confirms it
once, and it works normally after that.

### Running it from a terminal instead

```bash
npm install
npm run party      # builds, then serves on http://localhost:8787
```

For development, with hot reloading:

```bash
npm run dev          # http://localhost:5173
npm run buzz-server  # second terminal, only if you want phone buzzers
```

## How to play

| Key | What it does |
| --- | --- |
| `Space` | Pause or resume the reveal |
| Player's letter | Buzz in (keyboard players) |
| `Enter` | Mark the buzzed player correct |
| `Backspace` | Mark them wrong |
| `Esc` | Back to the board |

Buzzing in freezes the clue immediately and starts the answer countdown. A
wrong answer deducts the clue value, locks that player out of the clue, and the
reveal picks up where it stopped. Running out of time counts as wrong.

Buttons are activated with `Enter` rather than `Space`, because the game claims
the spacebar for pause.

## Writing your own questions

Everything lives in [`src/game/content.ts`](src/game/content.ts). Edit the
categories and clues there; the board resizes itself to match however many you
define. `clue` is what the room sees, `response` is the hidden answer.

Reveal speed and the answer timer are sliders on the board page.

## Hosting

The app is fully static, so it deploys anywhere. A GitHub Actions workflow in
`.github/workflows/deploy.yml` publishes it to GitHub Pages on every push to
`main`. To switch it on: **Settings → Pages → Source → GitHub Actions**.

**Phone buzzers do not work on GitHub Pages.** They need the WebSocket server in
`server/`, which a static host cannot run. On Pages you get the board, the
reveal, and keyboard buzzers. For phone buzzers, whoever is hosting the party
clones the repo and runs `npm run party` on their own laptop.

## Phone can't reach the buzzer page?

Almost always the network, not the app. Run the built-in diagnostic, then open
the URL it prints on the phone:

```bash
node server/diagnose.mjs
```

It logs every connection that arrives, so it tells you immediately whether the
phone's traffic reaches the laptop at all. In order of likelihood:

1. **The phone providing the hotspot cannot reach its own hotspot clients.**
   This one is counter-intuitive and costs the most time. Android routes app
   traffic over the default network, which is mobile data, so the host phone
   sends the laptop's address out to the internet instead of over Wi-Fi. You
   get `ERR_CONNECTION_ABORTED` and the diagnostic logs nothing. Any *other*
   phone on the same hotspot works fine, and the hotspot host is normally the
   person running the game, who doesn't need a buzzer. Use a second device, or
   tunnel (below).
2. **The Wi-Fi blocks device-to-device traffic.** Corporate, campus, and guest
   networks commonly enable "client isolation." Nothing on the laptop can work
   around it. Use a hotspot, keeping point 1 in mind.
3. **You used a VPN address.** `npm run party` ranks physical interfaces first
   and labels tunnels, so take the top URL it prints.
4. **The browser forced HTTPS.** Type the address with an explicit `http://`
   prefix; the diagnostic reports "TLS attempt" when this happens.
5. **macOS firewall is blocking Node.** System Settings → Network → Firewall.

To confirm the laptop side is fine, load the LAN URL in a browser on the laptop
itself. If that works but the phone can't, it's the network, not the app.

For guests who aren't on your wifi at all, tunnel it — but read the security
note below first, because this exposes the server publicly:

```bash
cloudflared tunnel --url http://localhost:8787
```

## Security notes

The party server has **no authentication** on purpose. Anyone who can reach the
port can join and pick any name. It is built for a living room on a trusted
wifi network. Do not port-forward it or expose it to the internet.

## A note on Node

Built and tested on Node 18, which is past end-of-life. On Node 20.19+ or 22+
you can also take the current Vite release:

```bash
npm install -D vite@latest @vitejs/plugin-react@latest
```

Until then `npm audit` reports advisories in Vite's dev server (`esbuild`
request forwarding and some Windows-only path handling). They affect
`npm run dev` only, not the production build or anything you deploy.
