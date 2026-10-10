# Mermaid Jeopardy

A Jeopardy-style party game with a glittery mermaid theme. Categories across
the top, dollar tiles below, and clues that reveal one word at a time so the
room can race to buzz in.

**Play it: https://umairsuleman.github.io/bday_jeopardy/**

The hosted version covers the board, the slow reveal, and keyboard buzzers.
Phone buzzers need the local server — see below.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
```

That is all you need for a game played on one screen with keyboard buzzers.

### Playing with phone buzzers

```bash
npm run party      # builds, then serves on http://localhost:8787
```

Open the host screen on the TV or laptop. The terminal prints a second URL for
guests: they open it on their phones, type a name, and get one big BUZZ button.
Everyone needs to be on the same wifi.

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
