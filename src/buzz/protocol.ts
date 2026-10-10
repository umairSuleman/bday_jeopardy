/**
 * Message shapes shared by the host screen, the phone buzzers, and the server.
 * Kept in one file so all three stay in step.
 */

/** Sent by phones and the host screen up to the server. */
export type ClientMessage =
  | { type: 'host' }
  | { type: 'join'; name: string; id?: string }
  | { type: 'buzz' }
  | { type: 'pong'; at: number }
  /** Host opens or closes the buzzers for the current clue. */
  | { type: 'open'; lockedOut: string[] }
  | { type: 'close' }
  /** Host pushes display state down to the phones. */
  | { type: 'display'; payload: DisplayState };

/** Sent by the server down to phones and the host screen. */
export type ServerMessage =
  | { type: 'joined'; id: string; name: string }
  | { type: 'roster'; players: { id: string; name: string }[] }
  | { type: 'buzz'; playerId: string; name: string }
  | { type: 'open' }
  | { type: 'close' }
  | { type: 'display'; payload: DisplayState }
  | { type: 'ping'; at: number }
  | { type: 'error'; message: string };

/** What a phone shows between buzzes. */
export interface DisplayState {
  category: string;
  value: number;
  /** True while this phone's player may buzz. */
  open: boolean;
  /** Player id currently holding the buzz, if any. */
  holder: string | null;
  holderName: string | null;
  lockedOut: string[];
  scores: Record<string, number>;
}

export const WS_PATH = '/ws';

/** WebSocket URL for the buzz server, same origin as the page. */
export function buzzSocketUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${WS_PATH}`;
}
