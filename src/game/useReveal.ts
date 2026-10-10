import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type RevealStatus = 'revealing' | 'paused' | 'complete';

/**
 * How long to dwell before showing a word. Longer words and sentence breaks
 * get more room so the reveal reads like speech rather than a metronome.
 */
export function delayForWord(word: string, speed: number): number {
  let ms = 150 + word.replace(/[^\p{L}\p{N}]/gu, '').length * 20;

  if (/[,;:—-]$/.test(word)) ms += 170;
  if (/[.!?]["')]?$/.test(word)) ms += 340;
  if (/^["'(]/.test(word)) ms += 60;

  return ms / speed;
}

export interface Reveal {
  words: string[];
  /** How many words are currently on screen. */
  revealed: number;
  status: RevealStatus;
  isComplete: boolean;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  /** Drop every remaining word at once. */
  finish: () => void;
}

/**
 * Drives a word-by-word reveal off requestAnimationFrame, so pausing simply
 * stops banking elapsed time rather than juggling timeouts.
 */
export function useReveal(text: string, speed: number): Reveal {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text]);

  const [revealed, setRevealed] = useState(0);
  const [status, setStatus] = useState<RevealStatus>('revealing');

  // Speed can change mid-clue, so read it from a ref inside the loop.
  const speedRef = useRef(speed);
  speedRef.current = speed;

  // Milliseconds of running (unpaused) time banked toward the next word.
  const clockRef = useRef(0);

  // Restart cleanly if the clue changes.
  useEffect(() => {
    setRevealed(0);
    setStatus(words.length === 0 ? 'complete' : 'revealing');
    clockRef.current = 0;
  }, [words]);

  useEffect(() => {
    if (status !== 'revealing') return;

    let frame = 0;
    let last: number | null = null;

    const tick = (now: number) => {
      if (last === null) last = now;
      const delta = now - last;
      last = now;

      clockRef.current += delta;

      setRevealed((current) => {
        let next = current;
        // Loop so a dropped frame catches up instead of stalling.
        while (next < words.length) {
          const word = words[next];
          if (word === undefined) break;
          const needed = delayForWord(word, speedRef.current);
          if (clockRef.current < needed) break;
          clockRef.current -= needed;
          next += 1;
        }
        return next;
      });

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [status, words]);

  // Flip to complete once the last word lands.
  useEffect(() => {
    if (revealed >= words.length && words.length > 0) {
      setStatus((s) => (s === 'complete' ? s : 'complete'));
    }
  }, [revealed, words.length]);

  const pause = useCallback(() => {
    setStatus((s) => (s === 'revealing' ? 'paused' : s));
  }, []);

  const resume = useCallback(() => {
    setStatus((s) => (s === 'paused' ? 'revealing' : s));
  }, []);

  const toggle = useCallback(() => {
    setStatus((s) => {
      if (s === 'revealing') return 'paused';
      if (s === 'paused') return 'revealing';
      return s;
    });
  }, []);

  const finish = useCallback(() => {
    setRevealed(words.length);
    setStatus('complete');
  }, [words.length]);

  return {
    words,
    revealed,
    status,
    isComplete: status === 'complete',
    pause,
    resume,
    toggle,
    finish
  };
}
