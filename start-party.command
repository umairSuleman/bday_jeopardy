#!/bin/bash
#
# Double-click this file to start the game. Nothing to type.
#
# On macOS a .command file opens in Terminal and runs, so a host who has never
# used a terminal can still get the party server going. It installs and builds
# on first run only, then serves the game and opens the board.

set -u
cd "$(dirname "$0")" || exit 1

echo ""
echo "  ✦ Mermaid Jeopardy"
echo ""

# ---------------------------------------------------------------- Node check
if ! command -v node >/dev/null 2>&1; then
  cat <<'MSG'
  Node.js is not installed, and the game needs it to run.

  1. Download the "LTS" version from  https://nodejs.org
  2. Open the downloaded file and click through the installer
  3. Double-click this file again

  Opening the download page for you now...

MSG
  open "https://nodejs.org/en/download" 2>/dev/null
  echo "  Press return to close this window."
  read -r _
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo 0)
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "  Node.js $(node -v) is too old. Please install version 18 or newer"
  echo "  from https://nodejs.org, then double-click this file again."
  echo ""
  echo "  Press return to close this window."
  read -r _
  exit 1
fi

# ------------------------------------------------------------ Install & build
if [ ! -d node_modules ]; then
  echo "  First run, so setting things up. This takes a minute..."
  echo ""
  if ! npm install --no-audit --no-fund; then
    echo ""
    echo "  Setup failed. Check your internet connection and try again."
    echo "  Press return to close this window."
    read -r _
    exit 1
  fi
fi

# Shared with the Windows launcher; exits 0 when a rebuild is needed.
if node server/needs-build.mjs; then
  echo "  Preparing the game..."
  echo ""
  if ! npm run build; then
    echo ""
    echo "  Build failed. Press return to close this window."
    read -r _
    exit 1
  fi
fi

# ------------------------------------------------------------------ Go
echo ""
echo "  Starting up. Your browser will open in a moment."
echo "  Guests scan the QR code shown on the page to get their buzzer."
echo ""
echo "  Keep this window open while you play."
echo "  To stop the game, close this window."
echo ""

# Give the server a moment to bind before opening the board.
( sleep 2; open "http://localhost:8787/" 2>/dev/null ) &

exec node server/index.mjs
