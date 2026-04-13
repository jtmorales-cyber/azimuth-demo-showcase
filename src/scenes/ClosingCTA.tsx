'use client';

import { motion } from 'motion/react';
import { usePortalStore } from '@/state/portalStore';
import CTAButton from '@/components/ui/CTAButton';

/**
 * S10: Closing CTA — "Stand With Us In The Arena"
 *
 * Design direction: Editorial gravitas. Not a landing-page CTA section.
 * Asymmetric left-aligned layout echoing a Roosevelt speech.
 * Hanging quote mark as the visual anchor. CTAs right-justified below
 * the statement, creating composition tension with the headline.
 * Colophon-style footer anchored to bottom edge.
 *
 * NO centered everything. NO glass cards wrapping content. NO hero template.
 * The typography and whitespace do the work.
 *
 * HubWorld (NOVA + nodes + compass) remains visible — the closing is
 * overlaid on the established Hub visual. Depth grid glows gently beneath.
 */

const REVEAL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ClosingCTA() {
  const currentScene = usePortalStore((s) => s.currentScene);

  if (currentScene !== 'closing') return null;

  return (
    <div className="fixed inset-0 z-20 pointer-events-none">
      {/* ═══════════════════════════════════════════════════════════
          Main composition — asymmetric, left-anchored
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="absolute pointer-events-auto"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(960px, 90vw)',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          columnGap: 24,
          rowGap: 32,
          alignItems: 'start',
        }}
      >
        {/* Hanging quote mark — editorial anchor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.35, x: 0 }}
          transition={{ duration: 1.2, ease: REVEAL_EASE }}
          aria-hidden="true"
          style={{
            fontFamily: 'Satoshi, DM Sans, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 'clamp(6rem, 12vw, 10rem)',
            lineHeight: 0.8,
            color: 'var(--amber-core)',
            marginTop: '-0.15em',
            userSelect: 'none',
          }}
        >
          "
        </motion.div>

        {/* Text column wrapped in glass panel — quote mark stays outside
             the panel to preserve editorial tension */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: REVEAL_EASE }}
          className="relative rounded-2xl flex flex-col gap-lg"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            boxShadow:
              'inset 0 1px 0 0 var(--glass-highlight), 0 0 80px 0 rgba(232, 160, 48, 0.1)',
            padding: 'clamp(32px, 4vw, 56px)',
          }}
        >
          {/* Amber bottom accent — echoes "In The Arena" amber split headline */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '10%',
              right: '10%',
              bottom: 0,
              height: 1,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(232, 160, 48, 0.55) 50%, transparent 100%)',
            }}
          />

          {/* Eyebrow label */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: REVEAL_EASE }}
            className="font-inter font-medium uppercase"
            style={{
              fontSize: 'var(--text-caption)',
              letterSpacing: '0.18em',
              color: 'var(--cyan-struct)',
            }}
          >
            Partnership · VCU Demo Day 2026
          </motion.div>

          {/* Headline — Satoshi Bold, editorial scale */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.5, ease: REVEAL_EASE }}
            className="font-satoshi font-bold"
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.015em',
              color: 'var(--peak-light)',
              margin: 0,
            }}
          >
            Stand With Us
            <br />
            <span style={{ color: 'var(--amber-core)' }}>In The Arena.</span>
          </motion.h1>

          {/* Body — restrained, not overselling */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease: REVEAL_EASE }}
            className="font-inter"
            style={{
              fontSize: 'clamp(1rem, 1.4vw, 1.125rem)',
              lineHeight: 1.65,
              color: 'var(--silver)',
              maxWidth: '52ch',
              margin: 0,
            }}
          >
            Azimuth is building the only integrated AI platform covering the entire
            military career lifecycle. We&#39;re looking for partners in Defense,
            Workforce, Veteran Services, and Mental Health.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.0, ease: REVEAL_EASE }}
            className="flex flex-wrap gap-md items-center pt-sm"
            style={{ justifyContent: 'flex-start' }}
          >
            <CTAButton variant="primary">
              Start a Conversation
            </CTAButton>
            <CTAButton variant="ghost">
              See the Platform
            </CTAButton>
            <CTAButton variant="ghost">
              Meet the Founder
            </CTAButton>
          </motion.div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          Colophon footer — anchored to bottom edge
          ═══════════════════════════════════════════════════════════ */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.4, ease: REVEAL_EASE }}
        className="absolute left-0 right-0 flex items-center justify-between pointer-events-auto"
        style={{
          bottom: 32,
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        {/* Left: brand identifier */}
        <div
          className="font-inter"
          style={{
            fontSize: 'var(--text-caption)',
            color: 'var(--slate-blue)',
            letterSpacing: '0.05em',
          }}
        >
          <span style={{ color: 'var(--silver)', fontWeight: 500 }}>Azimuth, LLC</span>
          <span style={{ margin: '0 12px', opacity: 0.5 }}>·</span>
          <span>SDVOSB Certified</span>
          <span style={{ margin: '0 12px', opacity: 0.5 }}>·</span>
          <span style={{ fontStyle: 'italic', color: 'var(--sage-muted)' }}>
            AI That Serves Those Who Served
          </span>
        </div>

        {/* Right: QR code placeholder */}
        <div className="flex items-center gap-sm">
          <div
            className="font-inter uppercase"
            style={{
              fontSize: '0.6875rem',
              letterSpacing: '0.2em',
              color: 'var(--slate-blue)',
              textAlign: 'right',
            }}
          >
            Scan to
            <br />
            continue
          </div>
          <QRPlaceholder />
        </div>
      </motion.footer>
    </div>
  );
}

/**
 * Minimal SVG QR code placeholder — abstract pattern, not a real scanning code.
 * Replace with a real QR-code library output when contact URL is set.
 */
function QRPlaceholder() {
  // 7×7 grid of blocks representing a stylized QR pattern
  const pattern = [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
    [0, 1, 0, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
  ];

  const blockSize = 6;
  const gap = 1;
  const size = pattern.length * (blockSize + gap) - gap + 8; // padding

  return (
    <div
      className="rounded"
      style={{
        width: size,
        height: size,
        padding: 4,
        background: 'rgba(216, 222, 233, 0.04)',
        border: '1px solid rgba(0, 206, 209, 0.2)',
      }}
    >
      <svg
        width={size - 8}
        height={size - 8}
        viewBox={`0 0 ${size - 8} ${size - 8}`}
        aria-label="QR code placeholder"
      >
        {pattern.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect
                key={`${x}-${y}`}
                x={x * (blockSize + gap)}
                y={y * (blockSize + gap)}
                width={blockSize}
                height={blockSize}
                fill="var(--silver)"
                rx={0.5}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
