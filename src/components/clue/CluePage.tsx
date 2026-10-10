import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '../../router';
import { GAME } from '../../game/content';
import { useGame } from '../../game/store';
import { useReveal } from '../../game/useReveal';
import { useKeyboardBuzzers } from '../../buzz/useKeyboardBuzzers';
import { useHostLink } from '../../buzz/useHostLink';
import { Button, Kbd, Panel, SectionLabel } from '../ui';
import { CountdownRing } from './CountdownRing';
import styles from './Clue.module.css';

interface Buzzed {
  id: string;
  name: string;
}

interface Flash {
  label: string;
  hint: string;
}

const FLASH_MS = 1500;

interface Props {
  categoryIndex: number;
  clueIndex: number;
}

export function CluePage({ categoryIndex, clueIndex }: Props) {
  const navigate = useNavigate();

  const category = GAME.categories[categoryIndex];
  const clue = category?.clues[clueIndex];

  const players = useGame((s) => s.players);
  const speed = useGame((s) => s.speed);
  const answerSeconds = useGame((s) => s.answerSeconds);
  const adjustScore = useGame((s) => s.adjustScore);
  const markUsed = useGame((s) => s.markUsed);
  const upsertRemotePlayer = useGame((s) => s.upsertRemotePlayer);

  const [buzzed, setBuzzed] = useState<Buzzed | null>(null);
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(answerSeconds);
  const [lockedOut, setLockedOut] = useState<string[]>([]);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [answerShown, setAnswerShown] = useState(false);

  const reveal = useReveal(clue?.clue ?? '', speed);
  const { pause, resume, toggle, finish } = reveal;

  /* ----------------------------- Buzz in ------------------------------- */

  const busy = Boolean(buzzed) || Boolean(flash) || answerShown;

  const handleBuzz = useCallback(
    (playerId: string, fallbackName?: string) => {
      if (busy) return;
      if (lockedOut.includes(playerId)) return;

      const player = players.find((p) => p.id === playerId);
      const name = player?.name ?? fallbackName ?? 'Player';

      pause();
      setBuzzed({ id: playerId, name });
      setDeadline(performance.now() + answerSeconds * 1000);
      setRemaining(answerSeconds);
    },
    [busy, lockedOut, players, pause, answerSeconds]
  );

  // Destructured because the hook returns a fresh object each render; these
  // callbacks are stable, so effects below do not re-fire needlessly.
  const { openBuzzers, closeBuzzers, pushDisplay } = useHostLink({
    onBuzz: (playerId, name) => {
      upsertRemotePlayer(playerId, name);
      handleBuzz(playerId, name);
    },
    onRoster: (roster) => roster.forEach((p) => upsertRemotePlayer(p.id, p.name))
  });

  const showAnswer = useCallback(() => {
    finish();
    setAnswerShown(true);
    markUsed(categoryIndex, clueIndex);
  }, [finish, markUsed, categoryIndex, clueIndex]);

  /**
   * Host ruling on the active buzz.
   * @param timedOut true when the countdown expired rather than the host ruling
   */
  const rule = useCallback(
    (correct: boolean, timedOut = false) => {
      if (!buzzed || !clue) return;

      const { id, name } = buzzed;
      adjustScore(id, correct ? clue.value : -clue.value);
      setBuzzed(null);

      if (correct) {
        showAnswer();
        return;
      }

      // Wrong or out of time: lock them out, then put the clue back in play.
      setLockedOut((current) => [...current, id]);
      setFlash({
        label: timedOut ? "Time's up!" : 'Sorry, no.',
        hint: `${name} loses $${clue.value}`
      });
    },
    [buzzed, clue, adjustScore, showAnswer]
  );

  // The countdown reads `rule` from a ref so the interval never goes stale.
  const ruleRef = useRef(rule);
  ruleRef.current = rule;

  useEffect(() => {
    if (!buzzed) return;

    const tick = () => {
      const left = Math.max(0, (deadline - performance.now()) / 1000);
      setRemaining(left);
      if (left <= 0) ruleRef.current(false, true);
    };

    tick();
    const id = window.setInterval(tick, 100);
    return () => window.clearInterval(id);
  }, [buzzed, deadline]);

  // Clear the flash message, then let the reveal carry on.
  useEffect(() => {
    if (!flash) return;
    const id = window.setTimeout(() => {
      setFlash(null);
      resume();
    }, FLASH_MS);
    return () => window.clearTimeout(id);
  }, [flash, resume]);

  /* --------------------------- Keyboard -------------------------------- */

  useKeyboardBuzzers({
    players,
    enabled: Boolean(clue),
    ruling: Boolean(buzzed),
    onBuzz: handleBuzz,
    onTogglePause: () => {
      if (!flash && !buzzed) toggle();
    },
    onCorrect: () => rule(true),
    onWrong: () => rule(false)
  });

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [navigate]);

  /* ------------------------ Phone mirroring ---------------------------- */

  const scores = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p.score])),
    [players]
  );

  useEffect(() => {
    if (!clue || !category) return;

    if (busy) closeBuzzers();
    else openBuzzers(lockedOut);

    pushDisplay({
      category: category.name,
      value: clue.value,
      open: !busy,
      holder: buzzed?.id ?? null,
      holderName: buzzed?.name ?? null,
      lockedOut,
      scores
    });
  }, [
    busy,
    lockedOut,
    buzzed,
    scores,
    clue,
    category,
    openBuzzers,
    closeBuzzers,
    pushDisplay
  ]);

  /* ----------------------------- Render -------------------------------- */

  // A hand-edited or stale URL can point at a clue that does not exist.
  const missing = !category || !clue;
  useEffect(() => {
    if (missing) navigate('/');
  }, [missing, navigate]);

  if (!category || !clue) return null;

  const progress = reveal.words.length
    ? (reveal.revealed / reveal.words.length) * 100
    : 100;

  const statusLabel = buzzed
    ? `${buzzed.name} buzzed in`
    : reveal.status === 'paused'
      ? 'Paused'
      : reveal.status === 'complete'
        ? 'Reveal complete'
        : 'Revealing…';

  const dotClass =
    reveal.status === 'complete'
      ? styles.statusDotDone
      : reveal.status === 'paused'
        ? styles.statusDotPaused
        : '';

  // One veil serves pause, buzz-in, and the post-ruling flash.
  const veil = flash
    ? { label: flash.label, hint: flash.hint, hintNode: null }
    : buzzed
      ? {
          label: `${buzzed.name}!`,
          hint: 'Answer before the timer runs out',
          hintNode: null
        }
      : reveal.status === 'paused'
        ? {
            label: 'Paused',
            hint: '',
            hintNode: (
              <>
                Press <Kbd>Space</Kbd> to resume
              </>
            )
          }
        : null;

  return (
    <div className={styles.shell}>
      <header className={styles.head}>
        <Button className={styles.back} onClick={() => navigate('/')}>
          ← Board
        </Button>
        <div className={styles.meta}>
          <p className={styles.category}>{category.name}</p>
          <p className={styles.value}>${clue.value}</p>
        </div>
        <div className={styles.headSpacer} aria-hidden="true" />
      </header>

      <main className={styles.main}>
        <Panel className={styles.card} glow={Boolean(buzzed)}>
          <h1 className="srOnly">Clue</h1>

          {/* aria-live is off here so readers are not spammed word by word;
              the full text is announced once the reveal completes. */}
          <p className={styles.text} aria-live="off">
            {reveal.words.slice(0, reveal.revealed).map((word, index) => (
              <span
                key={index}
                className={`${styles.word} ${
                  index === reveal.revealed - 1 ? styles.wordFresh : ''
                }`}
              >
                {word}
              </span>
            ))}
          </p>
          <p className="srOnly" aria-live="polite">
            {reveal.isComplete ? clue.clue : ''}
          </p>

          <p className={styles.status}>
            <span className={`${styles.statusDot} ${dotClass}`} aria-hidden="true" />
            {statusLabel}
          </p>

          <div className={styles.progress} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>

          {veil && (
            <div className={styles.veil}>
              <p className={`${styles.veilLabel} shimmer`}>{veil.label}</p>
              <p className={styles.veilHint}>{veil.hintNode ?? veil.hint}</p>
            </div>
          )}
        </Panel>

        {answerShown && (
          <Panel className={styles.answer}>
            <SectionLabel as="h2">Correct response</SectionLabel>
            <p className={`${styles.answerText} shimmer`}>{clue.response}</p>
          </Panel>
        )}
      </main>

      <section className={styles.buzz} aria-label="Buzzers">
        <SectionLabel as="h2">Buzzers</SectionLabel>

        {players.length === 0 ? (
          <p className={styles.empty}>
            No players yet. Add some on the board, or just play along.
          </p>
        ) : (
          <ul className={styles.buzzList}>
            {players.map((player) => (
              <li
                key={player.id}
                className={`${styles.buzzer} ${
                  buzzed?.id === player.id ? styles.buzzerActive : ''
                } ${lockedOut.includes(player.id) ? styles.buzzerLocked : ''}`}
              >
                {player.remote ? <span>▸</span> : <Kbd>{player.key}</Kbd>}
                <span className={styles.buzzerName}>{player.name}</span>
                <span className={styles.buzzerScore}>${player.score}</span>
              </li>
            ))}
          </ul>
        )}

        {buzzed && (
          <Panel className={styles.ruling} glow>
            <div className={styles.rulingWho}>
              <span className={styles.rulingName}>{buzzed.name}</span>
              <SectionLabel>is answering</SectionLabel>
            </div>

            <CountdownRing remaining={remaining} total={answerSeconds} />

            <div className={styles.rulingActions}>
              <Button variant="good" onClick={() => rule(true)}>
                Correct <Kbd>↵</Kbd>
              </Button>
              <Button variant="bad" onClick={() => rule(false)}>
                Wrong <Kbd>⌫</Kbd>
              </Button>
            </div>
          </Panel>
        )}
      </section>

      <footer className={styles.foot}>
        <Button
          onClick={toggle}
          disabled={reveal.isComplete || Boolean(buzzed) || Boolean(flash)}
        >
          {reveal.status === 'paused' ? 'Resume' : 'Pause'} <Kbd>Space</Kbd>
        </Button>
        <Button
          onClick={finish}
          disabled={reveal.isComplete || Boolean(buzzed) || Boolean(flash)}
        >
          Show all text
        </Button>
        <Button variant="primary" onClick={showAnswer} disabled={answerShown}>
          Reveal answer
        </Button>
        <Button
          onClick={() => {
            markUsed(categoryIndex, clueIndex);
            navigate('/');
          }}
        >
          Done → Board
        </Button>
      </footer>
    </div>
  );
}
