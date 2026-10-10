import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buzzSocketUrl,
  type ClientMessage,
  type DisplayState,
  type ServerMessage
} from './protocol';

interface Options {
  /** Fires when the server awards the buzz to a player. */
  onBuzz: (playerId: string, name: string) => void;
  /** Fires whenever the phone roster changes. */
  onRoster: (players: { id: string; name: string }[]) => void;
}

export interface HostLink {
  connected: boolean;
  /** True when no buzz server is reachable, e.g. on a static host. */
  unavailable: boolean;
  openBuzzers: (lockedOut: string[]) => void;
  closeBuzzers: () => void;
  pushDisplay: (payload: DisplayState) => void;
}

/**
 * Host screen's link to the local buzz server. Degrades quietly: if no server
 * is running (GitHub Pages, say), `unavailable` goes true and the game carries
 * on with keyboard buzzers only.
 */
export function useHostLink({ onBuzz, onRoster }: Options): HostLink {
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  // Keep callbacks in refs so reconnect logic does not depend on them.
  const onBuzzRef = useRef(onBuzz);
  onBuzzRef.current = onBuzz;
  const onRosterRef = useRef(onRoster);
  onRosterRef.current = onRoster;

  useEffect(() => {
    let closed = false;
    let retries = 0;
    let retryTimer: number | undefined;

    const connect = () => {
      if (closed) return;

      let socket: WebSocket;
      try {
        socket = new WebSocket(buzzSocketUrl());
      } catch {
        setUnavailable(true);
        return;
      }
      socketRef.current = socket;

      socket.addEventListener('open', () => {
        if (closed) return;
        retries = 0;
        setConnected(true);
        setUnavailable(false);
        socket.send(JSON.stringify({ type: 'host' } satisfies ClientMessage));
      });

      socket.addEventListener('message', (event) => {
        let message: ServerMessage;
        try {
          message = JSON.parse(String(event.data)) as ServerMessage;
        } catch {
          return;
        }

        switch (message.type) {
          case 'buzz':
            onBuzzRef.current(message.playerId, message.name);
            break;
          case 'roster':
            onRosterRef.current(message.players);
            break;
          case 'ping':
            socket.send(
              JSON.stringify({ type: 'pong', at: message.at } satisfies ClientMessage)
            );
            break;
          default:
            break;
        }
      });

      socket.addEventListener('close', () => {
        if (closed) return;
        setConnected(false);
        socketRef.current = null;

        // Back off, then give up and mark the server unavailable.
        retries += 1;
        if (retries > 4) {
          setUnavailable(true);
          return;
        }
        retryTimer = window.setTimeout(connect, Math.min(1000 * retries, 4000));
      });

      socket.addEventListener('error', () => {
        if (retries >= 4) setUnavailable(true);
      });
    };

    connect();

    return () => {
      closed = true;
      window.clearTimeout(retryTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const send = useCallback((message: ClientMessage) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }, []);

  const openBuzzers = useCallback(
    (lockedOut: string[]) => send({ type: 'open', lockedOut }),
    [send]
  );
  const closeBuzzers = useCallback(() => send({ type: 'close' }), [send]);
  const pushDisplay = useCallback(
    (payload: DisplayState) => send({ type: 'display', payload }),
    [send]
  );

  return { connected, unavailable, openBuzzers, closeBuzzers, pushDisplay };
}
