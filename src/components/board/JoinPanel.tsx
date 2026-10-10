import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Panel, SectionLabel } from '../ui';
import styles from './Board.module.css';

interface JoinInfo {
  url: string | null;
  address: string | null;
  iface: string | null;
  port: number;
}

type State =
  | { kind: 'loading' }
  | { kind: 'ready'; url: string; qr: string }
  | { kind: 'noServer' }
  | { kind: 'noNetwork' };

/**
 * Shows a QR code guests scan to get their buzzer. Nobody has to type a URL,
 * which is the whole point: the only instruction a guest needs is "scan this".
 *
 * The address comes from the server's /api/join rather than window.location,
 * because the host normally browses localhost and a QR of localhost is useless
 * on a phone. When no server is running (a static host like GitHub Pages),
 * this explains how to start one instead of silently showing nothing.
 */
export function JoinPanel({ connected }: { connected: boolean }) {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/api/join', { cache: 'no-store' });
        if (!response.ok) throw new Error(`status ${response.status}`);

        const info = (await response.json()) as JoinInfo;
        if (cancelled) return;

        if (!info.url) {
          setState({ kind: 'noNetwork' });
          return;
        }

        // Dark modules on a light field scan far more reliably than a
        // theme-coloured code, so the QR keeps its own palette.
        const qr = await QRCode.toDataURL(info.url, {
          width: 460,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#071a2fff', light: '#ffffffff' }
        });
        if (cancelled) return;

        setState({ kind: 'ready', url: info.url, qr });
      } catch {
        if (!cancelled) setState({ kind: 'noServer' });
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === 'loading') {
    return (
      <Panel as="section" className={styles.join}>
        <SectionLabel as="h2">Phone buzzers</SectionLabel>
        <p className={styles.joinHint}>Looking for the buzzer server…</p>
      </Panel>
    );
  }

  if (state.kind === 'noServer' || state.kind === 'noNetwork') {
    return (
      <Panel as="section" className={styles.join}>
        <SectionLabel as="h2">Phone buzzers</SectionLabel>
        {state.kind === 'noNetwork' ? (
          <p className={styles.joinHint}>
            The buzzer server is running but this machine has no network
            connection, so phones have no address to reach. Join a wifi network
            and reload.
          </p>
        ) : (
          <p className={styles.joinHint}>
            Not available on this hosted copy, because phone buzzers need a
            small server running on the host's own machine. Everything else
            works, and players can still buzz with keyboard keys.
            <br />
            <br />
            To switch them on, run{' '}
            <span className={styles.joinCode}>npm run party</span> and open the
            address it prints.
          </p>
        )}
      </Panel>
    );
  }

  return (
    <Panel as="section" className={styles.join}>
      <div className={styles.joinHead}>
        <SectionLabel as="h2">Phone buzzers</SectionLabel>
        <p className={styles.joinStatus}>
          <span className={`${styles.dot} ${connected ? styles.dotLive : ''}`} />
          {connected ? 'Ready' : 'Connecting…'}
        </p>
      </div>

      <div className={styles.joinBody}>
        <div className={styles.qrFrame}>
          {/* Decorative: the adjacent text carries the same information. */}
          <img src={state.qr} alt="" width={200} height={200} />
        </div>

        <div className={styles.joinText}>
          <p className={styles.joinBig}>Scan to get your buzzer</p>
          <p className={styles.joinHint}>
            Point a phone camera at the code. Guests type a name and get one big
            buzz button. Everyone needs to be on the same wifi as this machine.
          </p>
          <p className={styles.joinHint}>
            Or open it by hand:{' '}
            <a className={styles.joinCode} href={state.url}>
              {state.url.replace(/^https?:\/\//, '')}
            </a>
          </p>
        </div>
      </div>
    </Panel>
  );
}
