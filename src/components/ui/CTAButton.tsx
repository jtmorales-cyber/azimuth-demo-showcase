'use client';

import { type ReactNode, type MouseEventHandler } from 'react';
import { motion } from 'motion/react';

type Variant = 'primary' | 'ghost';

interface CTAButtonProps {
  children: ReactNode;
  variant?: Variant;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  href?: string;
  className?: string;
}

/**
 * Call-to-action button with two variants:
 *   - primary: amber-core background with breathing glow animation
 *   - ghost: transparent with cyan-struct border
 *
 * Satoshi Bold typography. Touch target ≥ 60×60px per Portal Architecture spec.
 * Motion 12.x for hover/focus transitions.
 */
export default function CTAButton({
  children,
  variant = 'primary',
  onClick,
  href,
  className = '',
}: CTAButtonProps) {
  const baseStyle = {
    fontFamily: 'Satoshi, DM Sans, system-ui, sans-serif',
    fontWeight: 700,
    fontSize: '1rem',
    letterSpacing: '0.02em',
    padding: '18px 32px',
    minHeight: 60,
    minWidth: 200,
    borderRadius: 4,
    cursor: 'pointer',
    border: '1px solid',
    outline: 'none',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    willChange: 'transform',
    transition: 'none',
  };

  const primaryStyle = {
    ...baseStyle,
    background: 'var(--amber-core)',
    borderColor: 'var(--amber-core)',
    color: '#1A0E00',
    boxShadow: '0 0 0 0 rgba(232, 160, 48, 0.5)',
  };

  const ghostStyle = {
    ...baseStyle,
    background: 'transparent',
    borderColor: 'var(--cyan-struct)',
    color: 'var(--cyan-struct)',
  };

  const style = variant === 'primary' ? primaryStyle : ghostStyle;

  const content = (
    <>
      <span>{children}</span>
      <span aria-hidden="true" style={{ display: 'inline-block', transform: 'translateY(-1px)' }}>
        →
      </span>
    </>
  );

  // Primary variant has breathing amber glow via keyframes
  const primaryAnimation =
    variant === 'primary'
      ? {
          animate: {
            boxShadow: [
              '0 0 0 0 rgba(232, 160, 48, 0.0)',
              '0 0 32px 4px rgba(232, 160, 48, 0.35)',
              '0 0 0 0 rgba(232, 160, 48, 0.0)',
            ],
          },
          transition: {
            duration: 3.2,
            repeat: Infinity,
            ease: 'easeInOut' as const,
          },
        }
      : {};

  const whileHover = {
    scale: 1.03,
    ...(variant === 'primary'
      ? { boxShadow: '0 0 40px 6px rgba(232, 160, 48, 0.55)' }
      : { backgroundColor: 'rgba(0, 206, 209, 0.08)' }),
  };

  const whileTap = { scale: 0.98 };

  if (href) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`focus-cyan ${className}`}
        style={style}
        {...primaryAnimation}
        whileHover={whileHover}
        whileTap={whileTap}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`focus-cyan ${className}`}
      style={style}
      {...primaryAnimation}
      whileHover={whileHover}
      whileTap={whileTap}
    >
      {content}
    </motion.button>
  );
}
