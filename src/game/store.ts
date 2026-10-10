import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BUZZER_KEYS, type Player } from './types';

interface GameStore {
  players: Player[];
  /** "categoryIndex:clueIndex" for clues already played. */
  used: string[];
  /** Reveal speed multiplier. 1 = normal, higher = faster. */
  speed: number;
  /** Seconds a player gets to answer after buzzing in. */
  answerSeconds: number;

  addKeyboardPlayer: (name: string) => void;
  /** Add or update a player who joined from a phone. */
  upsertRemotePlayer: (id: string, name: string) => void;
  removePlayer: (id: string) => void;
  adjustScore: (id: string, delta: number) => void;

  markUsed: (categoryIndex: number, clueIndex: number) => void;
  setSpeed: (speed: number) => void;
  setAnswerSeconds: (seconds: number) => void;

  resetBoard: () => void;
  resetScores: () => void;
}

export const clueToken = (categoryIndex: number, clueIndex: number) =>
  `${categoryIndex}:${clueIndex}`;

export const useGame = create<GameStore>()(
  persist(
    (set) => ({
      players: [],
      used: [],
      speed: 1,
      answerSeconds: 10,

      addKeyboardPlayer: (name) =>
        set((state) => {
          const trimmed = name.trim();
          if (!trimmed) return state;

          const taken = new Set(state.players.map((p) => p.key).filter(Boolean));
          const key = BUZZER_KEYS.find((k) => !taken.has(k));
          if (!key) return state;

          const player: Player = {
            id: crypto.randomUUID(),
            name: trimmed,
            key,
            score: 0,
            remote: false
          };
          return { players: [...state.players, player] };
        }),

      upsertRemotePlayer: (id, name) =>
        set((state) => {
          const existing = state.players.find((p) => p.id === id);
          if (existing) {
            // Keep the score; a phone refresh should not wipe it.
            return {
              players: state.players.map((p) => (p.id === id ? { ...p, name } : p))
            };
          }
          const player: Player = { id, name, score: 0, remote: true };
          return { players: [...state.players, player] };
        }),

      removePlayer: (id) =>
        set((state) => ({ players: state.players.filter((p) => p.id !== id) })),

      adjustScore: (id, delta) =>
        set((state) => ({
          players: state.players.map((p) =>
            p.id === id ? { ...p, score: p.score + delta } : p
          )
        })),

      markUsed: (categoryIndex, clueIndex) =>
        set((state) => {
          const token = clueToken(categoryIndex, clueIndex);
          return state.used.includes(token)
            ? state
            : { used: [...state.used, token] };
        }),

      setSpeed: (speed) => set({ speed }),
      setAnswerSeconds: (answerSeconds) => set({ answerSeconds }),

      resetBoard: () => set({ used: [] }),
      resetScores: () =>
        set((state) => ({ players: state.players.map((p) => ({ ...p, score: 0 })) }))
    }),
    {
      name: 'mermaid-jeopardy',
      version: 2
    }
  )
);
