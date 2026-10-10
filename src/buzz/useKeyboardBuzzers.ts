import { useEffect } from 'react';
import type { Player } from '../game/types';

interface Options {
  players: Player[];
  enabled: boolean;
  onBuzz: (playerId: string) => void;
  onTogglePause: () => void;
  onCorrect: () => void;
  onWrong: () => void;
  /** True while a buzz is being ruled on, which changes what Enter does. */
  ruling: boolean;
}

/**
 * Keyboard controls for the host screen: spacebar pauses, letter keys buzz,
 * Enter and Backspace rule on an active buzz.
 *
 * Space is claimed globally for pause, so buttons are activated with Enter
 * instead. Buttons blur themselves after a click to keep Space free.
 */
export function useKeyboardBuzzers({
  players,
  enabled,
  onBuzz,
  onTogglePause,
  onCorrect,
  onWrong,
  ruling
}: Options): void {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      // Never hijack keys while the user is typing somewhere.
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      if (event.code === 'Space') {
        event.preventDefault();
        onTogglePause();
        return;
      }

      if (ruling) {
        if (event.key === 'Enter') {
          event.preventDefault();
          onCorrect();
          return;
        }
        if (event.key === 'Backspace') {
          event.preventDefault();
          onWrong();
          return;
        }
      }

      if (/^[a-z]$/i.test(event.key)) {
        const pressed = event.key.toUpperCase();
        const player = players.find((p) => p.key === pressed);
        if (player) {
          event.preventDefault();
          onBuzz(player.id);
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [players, enabled, onBuzz, onTogglePause, onCorrect, onWrong, ruling]);
}
