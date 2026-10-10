@echo off
rem
rem Double-click this file to start the game. Nothing to type.
rem
rem It installs and builds on first run only, then serves the game and opens
rem the board in your browser.
rem
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo   Mermaid Jeopardy
echo.

rem ------------------------------------------------------------- Node check
where node >nul 2>nul
if errorlevel 1 (
  echo   Node.js is not installed, and the game needs it to run.
  echo.
  echo     1. Download the "LTS" version from  https://nodejs.org
  echo     2. Run the installer and click through it
  echo     3. Double-click this file again
  echo.
  echo   Opening the download page for you now...
  start "" "https://nodejs.org/en/download"
  echo.
  pause
  exit /b 1
)

for /f "delims=" %%v in ('node -p "process.versions.node.split('.')[0]"') do set NODE_MAJOR=%%v
if !NODE_MAJOR! LSS 18 (
  echo   Node.js is too old ^(found version !NODE_MAJOR!^).
  echo   Please install version 18 or newer from https://nodejs.org
  echo   then double-click this file again.
  echo.
  pause
  exit /b 1
)

rem --------------------------------------------------------- Install ^& build
if not exist "node_modules" (
  echo   First run, so setting things up. This takes a minute...
  echo.
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo   Setup failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

node server\needs-build.mjs
if not errorlevel 1 (
  echo   Preparing the game...
  echo.
  call npm run build
  if errorlevel 1 (
    echo.
    echo   Build failed.
    pause
    exit /b 1
  )
)

rem ------------------------------------------------------------------- Go
echo.
echo   Starting up. Your browser will open in a moment.
echo.
echo   IMPORTANT: if Windows asks about allowing Node.js through the
echo   firewall, click "Allow access" and make sure "Private networks"
echo   is ticked. Phones cannot reach the game otherwise.
echo.
echo   Guests scan the QR code shown on the page to get their buzzer.
echo.
echo   Keep this window open while you play.
echo   To stop the game, close this window or press Ctrl+C.
echo.

start "" "http://localhost:8787/"
node server\index.mjs

rem Keep the window up if the server exits unexpectedly, so the error is readable.
echo.
echo   The game server has stopped.
pause
