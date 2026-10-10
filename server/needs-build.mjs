/**
 * Decides whether the app needs rebuilding, for the double-click launchers.
 *
 * Exits 0 when a build IS needed and 1 when it is not, so a launcher can write
 * `node server/needs-build.mjs && npm run build` in either bash or cmd.exe.
 * Doing the comparison here rather than in shell keeps one implementation
 * instead of separate mtime logic for macOS `find` and Windows batch.
 *
 * Uses no dependencies, so it runs before `npm install` has ever happened.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const builtIndex = join(root, 'dist', 'index.html');

const needsBuild = () => {
  if (!existsSync(builtIndex)) return true;

  const builtAt = statSync(builtIndex).mtimeMs;

  /** Newest mtime anywhere under a file or directory. */
  const newestUnder = (path) => {
    if (!existsSync(path)) return 0;

    const info = statSync(path);
    if (!info.isDirectory()) return info.mtimeMs;

    let newest = info.mtimeMs;
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      newest = Math.max(newest, newestUnder(join(path, entry.name)));
    }
    return newest;
  };

  const watched = ['src', 'index.html', 'vite.config.ts', 'package.json'];
  return watched.some((name) => newestUnder(join(root, name)) > builtAt);
};

process.exit(needsBuild() ? 0 : 1);
