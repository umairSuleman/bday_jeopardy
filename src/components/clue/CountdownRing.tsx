import styles from './Clue.module.css';

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface Props {
  /** Seconds left on the clock. */
  remaining: number;
  /** Total seconds the player was given. */
  total: number;
}

export function CountdownRing({ remaining, total }: Props) {
  const fraction = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;

  const toneClass =
    fraction <= 0.25 ? styles.timerDanger : fraction <= 0.5 ? styles.timerWarn : '';

  return (
    <div
      className={styles.timer}
      role="timer"
      aria-label={`${Math.ceil(remaining)} seconds left to answer`}
    >
      <svg className={styles.timerSvg} viewBox="0 0 120 120" aria-hidden="true">
        <circle className={styles.timerTrack} cx="60" cy="60" r={RADIUS} />
        <circle
          className={`${styles.timerFill} ${toneClass}`}
          cx="60"
          cy="60"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
        />
      </svg>
      <span className={styles.timerNum}>{Math.ceil(remaining)}</span>
    </div>
  );
}
