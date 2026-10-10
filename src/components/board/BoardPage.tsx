import { useMemo, useState } from 'react';
import { useNavigate } from '../../router';
import { GAME } from '../../game/content';
import { clueToken, useGame } from '../../game/store';
import { Button, Kbd, Panel, SectionLabel } from '../ui';
import { useHostLink } from '../../buzz/useHostLink';
import { JoinPanel } from './JoinPanel';
import styles from './Board.module.css';

export function BoardPage() {
  const navigate = useNavigate();
  const [draftName, setDraftName] = useState('');

  const players = useGame((s) => s.players);
  const used = useGame((s) => s.used);
  const speed = useGame((s) => s.speed);
  const answerSeconds = useGame((s) => s.answerSeconds);

  const addKeyboardPlayer = useGame((s) => s.addKeyboardPlayer);
  const upsertRemotePlayer = useGame((s) => s.upsertRemotePlayer);
  const removePlayer = useGame((s) => s.removePlayer);
  const setSpeed = useGame((s) => s.setSpeed);
  const setAnswerSeconds = useGame((s) => s.setAnswerSeconds);
  const resetBoard = useGame((s) => s.resetBoard);
  const resetScores = useGame((s) => s.resetScores);

  // Stay connected on the board so phones can join before the first clue.
  const link = useHostLink({
    onBuzz: () => {},
    onRoster: (roster) => roster.forEach((p) => upsertRemotePlayer(p.id, p.name))
  });

  const usedSet = useMemo(() => new Set(used), [used]);
  const totalClues = GAME.categories.reduce((sum, c) => sum + c.clues.length, 0);
  const remaining = totalClues - usedSet.size;
  const rows = Math.max(...GAME.categories.map((c) => c.clues.length));

  const keyboardSlotsLeft = players.filter((p) => !p.remote).length < 6;

  return (
    <>
      <header className={styles.masthead}>
        <p className={styles.eyebrow}>✦ Under the Sea ✦</p>
        <h1 className={`${styles.title} shimmer`}>{GAME.title}</h1>
        <p className={styles.subtitle}>{GAME.subtitle}</p>
        <div className={styles.rule} />
      </header>

      <main className={styles.stage}>
        {/* ----------------------------- Players ----------------------------- */}
        <Panel as="section" className={styles.roster}>
          <div className={styles.rosterHead}>
            <SectionLabel as="h2">Players</SectionLabel>
            <p className={styles.rosterHint}>
              Keyboard players get a buzzer key. Phones join by scanning the code
              below.
            </p>
          </div>

          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              addKeyboardPlayer(draftName);
              setDraftName('');
            }}
          >
            <label className="srOnly" htmlFor="playerName">
              Player name
            </label>
            <input
              id="playerName"
              className={styles.input}
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder={
                keyboardSlotsLeft ? 'Add a player…' : 'All buzzer keys in use'
              }
              maxLength={18}
              disabled={!keyboardSlotsLeft}
            />
            <Button variant="primary" type="submit" disabled={!keyboardSlotsLeft}>
              Add
            </Button>
          </form>

          {players.length === 0 ? (
            <p className={styles.empty}>
              No players yet. Add a few to start keeping score.
            </p>
          ) : (
            <ul className={styles.playerList}>
              {players.map((player) => (
                <li key={player.id} className={styles.player}>
                  {player.remote ? (
                    <span className={styles.phoneTag} title="Buzzes from a phone">
                      ▸
                    </span>
                  ) : (
                    <Kbd>{player.key}</Kbd>
                  )}
                  <span className={styles.playerName}>{player.name}</span>
                  <span
                    className={`${styles.playerScore} ${
                      player.score < 0 ? styles.playerScoreNeg : ''
                    }`}
                  >
                    ${player.score}
                  </span>
                  <button
                    className={styles.remove}
                    onClick={() => removePlayer(player.id)}
                    aria-label={`Remove ${player.name}`}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

        </Panel>

        <JoinPanel connected={link.connected} />

        {/* ------------------------------ Board ------------------------------ */}
        <section className={styles.boardWrap} aria-label="Game board">
          <div
            className={styles.board}
            style={{
              gridTemplateColumns: `repeat(${GAME.categories.length}, minmax(0, 1fr))`
            }}
          >
            {GAME.categories.map((category) => (
              <div key={category.name} className={styles.category}>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
            ))}

            {Array.from({ length: rows }).flatMap((_, row) =>
              GAME.categories.map((category, categoryIndex) => {
                const clue = category.clues[row];
                if (!clue) {
                  // Keep the grid aligned if a category has fewer clues.
                  return <div key={`${categoryIndex}-${row}-gap`} />;
                }

                const isUsed = usedSet.has(clueToken(categoryIndex, row));
                return (
                  <button
                    key={`${categoryIndex}-${row}`}
                    className={`${styles.tile} ${isUsed ? styles.tileUsed : ''}`}
                    disabled={isUsed}
                    aria-label={
                      isUsed
                        ? `${category.name}, $${clue.value}, already played`
                        : `${category.name} for $${clue.value}`
                    }
                    onClick={() => navigate(`/clue/${categoryIndex}/${row}`)}
                  >
                    {isUsed ? '✦' : `$${clue.value}`}
                  </button>
                );
              })
            )}
          </div>

          <p className={styles.boardNote}>
            {remaining === 0
              ? 'Every clue has been played. Reset the board for another round.'
              : `${remaining} of ${totalClues} clues remaining.`}
          </p>
        </section>

        {/* ---------------------------- Settings ----------------------------- */}
        <Panel as="section" className={styles.settings}>
          <SectionLabel as="h2">Game Settings</SectionLabel>

          <div className={styles.settingRow}>
            <label className={styles.settingLabel} htmlFor="speed">
              Reveal speed
              <output className={styles.settingValue}>{speed.toFixed(1)}×</output>
            </label>
            <input
              id="speed"
              className={styles.slider}
              type="range"
              min={0.4}
              max={2.5}
              step={0.1}
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
            />
          </div>

          <div className={styles.settingRow}>
            <label className={styles.settingLabel} htmlFor="answerSeconds">
              Answer timer
              <output className={styles.settingValue}>{answerSeconds}s</output>
            </label>
            <input
              id="answerSeconds"
              className={styles.slider}
              type="range"
              min={5}
              max={30}
              step={1}
              value={answerSeconds}
              onChange={(event) => setAnswerSeconds(Number(event.target.value))}
            />
          </div>

          <div className={styles.actions}>
            <Button
              onClick={() => {
                if (confirm('Open every clue on the board again?')) resetBoard();
              }}
            >
              Reset board
            </Button>
            <Button
              onClick={() => {
                if (confirm('Set every score back to $0?')) resetScores();
              }}
            >
              Reset scores
            </Button>
          </div>
        </Panel>
      </main>

      <footer className={styles.footer}>
        <p>
          Press <Kbd>Space</Kbd> during a clue to pause or resume the reveal.
        </p>
      </footer>
    </>
  );
}
