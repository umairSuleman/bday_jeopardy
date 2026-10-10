import { useState } from 'react';
import { usePhoneLink } from '../../buzz/usePhoneLink';
import { Button, Panel, SectionLabel } from '../ui';
import styles from './Buzz.module.css';

/**
 * The page a guest opens on their phone. One big buzzer, nothing else.
 */
export function BuzzPage() {
  const { status, playerId, name, display, join, buzz } = usePhoneLink();
  const [draft, setDraft] = useState('');

  const iHaveTheBuzz = Boolean(playerId && display?.holder === playerId);
  const amLockedOut = Boolean(playerId && display?.lockedOut.includes(playerId));
  const canBuzz =
    status === 'ready' && Boolean(display?.open) && !amLockedOut && !iHaveTheBuzz;

  const myScore = playerId ? display?.scores[playerId] : undefined;

  /* ------------------------- Not connected ---------------------------- */

  if (status === 'lost') {
    return (
      <div className={styles.shell}>
        <header className={styles.head}>
          <h1 className={`${styles.title} shimmer`}>Buzzer</h1>
        </header>
        <Panel className={styles.notice}>
          <SectionLabel as="h2">Not connected</SectionLabel>
          <p className={styles.noticeHint}>
            Trying to reach the game. Make sure the host is running the party
            server and that you are on the same wifi, then keep this page open.
          </p>
        </Panel>
      </div>
    );
  }

  /* ----------------------------- Join --------------------------------- */

  if (status === 'connecting' || status === 'naming') {
    return (
      <div className={styles.shell}>
        <header className={styles.head}>
          <h1 className={`${styles.title} shimmer`}>Buzzer</h1>
        </header>
        <Panel className={styles.join}>
          <SectionLabel as="h2">
            {status === 'connecting' ? 'Connecting…' : 'Who are you?'}
          </SectionLabel>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              join(draft);
            }}
            style={{ display: 'grid', gap: 'var(--sp-4)' }}
          >
            <label className="srOnly" htmlFor="name">
              Your name
            </label>
            <input
              id="name"
              className={styles.input}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Your name"
              maxLength={18}
              autoComplete="given-name"
              disabled={status === 'connecting'}
            />
            <Button
              variant="primary"
              type="submit"
              disabled={status === 'connecting' || !draft.trim()}
            >
              Join the game
            </Button>
          </form>
        </Panel>
      </div>
    );
  }

  /* ---------------------------- Buzzing -------------------------------- */

  return (
    <div className={styles.shell}>
      <header className={styles.head}>
        {display ? (
          <>
            <p className={styles.clueMeta}>{display.category}</p>
            <p className={styles.value}>${display.value}</p>
          </>
        ) : (
          <p className={styles.clueMeta}>Waiting for the next clue…</p>
        )}
      </header>

      <div className={styles.buzzArea}>
        <button
          className={styles.buzzer}
          onClick={buzz}
          disabled={!canBuzz}
          aria-label={canBuzz ? 'Buzz in' : 'Buzzer not available'}
        >
          {iHaveTheBuzz ? 'You!' : 'Buzz'}
        </button>

        <p className={styles.state}>
          {iHaveTheBuzz ? (
            <span className={styles.youHaveIt}>Answer out loud, quickly</span>
          ) : amLockedOut ? (
            'You already had a go at this one'
          ) : display?.holder ? (
            `${display.holderName} got in first`
          ) : display?.open ? (
            'Buzzers are open'
          ) : (
            'Wait for the host'
          )}
        </p>
      </div>

      <Panel className={styles.foot}>
        <span className={styles.name}>{name}</span>
        <span className={styles.score}>${myScore ?? 0}</span>
      </Panel>
    </div>
  );
}
