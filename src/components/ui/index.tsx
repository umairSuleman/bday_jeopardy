import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import styles from './ui.module.css';

const cx = (...parts: (string | false | undefined)[]) =>
  parts.filter(Boolean).join(' ');

/* ------------------------------- Panel -------------------------------- */

interface PanelProps extends HTMLAttributes<HTMLElement> {
  glow?: boolean;
  as?: 'div' | 'section' | 'aside';
  children: ReactNode;
}

export function Panel({
  glow,
  as: Tag = 'div',
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <Tag className={cx(styles.panel, glow && styles.panelGlow, className)} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------- Button ------------------------------- */

type Variant = 'default' | 'primary' | 'good' | 'bad' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClass: Record<Variant, string | undefined> = {
  default: undefined,
  primary: styles.primary,
  good: styles.good,
  bad: styles.bad,
  ghost: styles.ghost
};

/**
 * Buttons drop focus after a click because the game claims the spacebar for
 * pause: a focused button would otherwise swallow it. Keyboard users activate
 * buttons with Enter, which still works normally.
 */
export function Button({
  variant = 'default',
  className,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.btn, variantClass[variant], className)}
      onClick={(event) => {
        onClick?.(event);
        event.currentTarget.blur();
      }}
      {...rest}
    />
  );
}

/* --------------------------------- Kbd -------------------------------- */

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={styles.kbd}>{children}</kbd>;
}

/* -------------------------------- Label ------------------------------- */

export function SectionLabel({
  children,
  as: Tag = 'p',
  className,
  ...rest
}: HTMLAttributes<HTMLElement> & { as?: 'p' | 'h2' | 'h3'; children: ReactNode }) {
  return (
    <Tag className={cx(styles.label, className)} {...rest}>
      {children}
    </Tag>
  );
}
