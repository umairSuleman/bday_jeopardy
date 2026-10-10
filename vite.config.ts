import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages serves a project site from /<repo>/, so the asset base has to
 * match. The deploy workflow passes it in as VITE_BASE; locally it stays at
 * the root. Vite needs a trailing slash, which some sources omit.
 */
const rawBase = process.env.VITE_BASE?.trim() || '/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    // During `npm run dev`, forward buzzer traffic to the local party server
    // so phones on the LAN can reach it through the Vite dev server.
    //
    // Addressed explicitly as 127.0.0.1 rather than localhost: Node resolves
    // localhost to ::1 first, which fails if the buzz server is IPv4-only.
    // Harmless proxy errors appear here if `npm run buzz-server` isn't running.
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:8787',
        ws: true
      }
    }
  }
});
