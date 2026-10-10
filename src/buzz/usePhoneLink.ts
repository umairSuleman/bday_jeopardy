import { useCallback, useEffect, useRef, useState } from 'react';
import {
  buzzSocketUrl,
  type ClientMessage,
  type DisplayState,
  type ServerMessage
} from './protocol';

const ID_KEY = 'mermaid-jeopardy.playerId';

export type PhoneStatus = 'connecting' | 'naming' | 'ready' | 'lost';

export interface PhoneLink {
  status: PhoneStatus;
  playerId: string | null;
  name: string | null;
  display: DisplayState | null;
  join: (name: string) => void;
  buzz: () => void;
}

/**
 * A phone's link to the buzz server. The player id is kept in localStorage so
 * a refresh or a locked screen rejoins as the same player with the same score.
 */
export function usePhoneLink(): PhoneLink {
  const socketRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<PhoneStatus>('connecting');
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [display, setDisplay] = useState<DisplayState | null>(null);

  // Name is needed inside the socket's open handler on reconnect.
  const nameRef = useRef<string | null>(null);

  useEffect(() => {
    let closed = false;
    let retryTimer: number | undefined;

    const connect = () => {
      if (closed) return;

      let socket: WebSocket;
      try {
        socket = new WebSocket(buzzSocketUrl());
      } catch {
        setStatus('lost');
        return;
      }
      socketRef.current = socket;

      socket.addEventListener('open', () => {
        if (closed) return;
        const saved = nameRef.current;
        if (saved) {
          // Rejoin automatically after a drop.
          const id = localStorage.getItem(ID_KEY) ?? undefined;
          socket.send(JSON.stringify({ type: 'join', name: saved, id } satisfies ClientMessage));
        } else {
          setStatus('naming');
        }
      });

      socket.addEventListener('message', (event) => {
        let message: ServerMessage;
        try {
          message = JSON.parse(String(event.data)) as ServerMessage;
        } catch {
          return;
        }

        switch (message.type) {
          case 'joined':
            localStorage.setItem(ID_KEY, message.id);
            setPlayerId(message.id);
            setName(message.name);
            nameRef.current = message.name;
            setStatus('ready');
            break;
          case 'display':
            setDisplay(message.payload);
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
        socketRef.current = null;
        setStatus('lost');
        retryTimer = window.setTimeout(connect, 1200);
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

  const join = useCallback((chosen: string) => {
    const trimmed = chosen.trim();
    if (!trimmed) return;

    nameRef.current = trimmed;
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      const id = localStorage.getItem(ID_KEY) ?? undefined;
      socket.send(JSON.stringify({ type: 'join', name: trimmed, id } satisfies ClientMessage));
    }
  }, []);

  const buzz = useCallback(() => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'buzz' } satisfies ClientMessage));
    }
  }, []);

  return { status, playerId, name, display, join, buzz };
}
