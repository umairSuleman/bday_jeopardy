export interface Clue {
  value: number;
  clue: string;
  response: string;
}

export interface Category {
  name: string;
  clues: Clue[];
}

export interface GameContent {
  title: string;
  subtitle: string;
  categories: Category[];
}

export interface Player {
  id: string;
  name: string;
  /** Keyboard buzzer key. Absent for players who joined from a phone. */
  key?: string;
  score: number;
  /** True when this player buzzes from a phone rather than the keyboard. */
  remote: boolean;
}

/** Keys handed out to keyboard players, in order. */
export const BUZZER_KEYS = ['A', 'L', 'G', 'P', 'Z', 'M'] as const;
