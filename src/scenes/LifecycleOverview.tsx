'use client';

import { motion } from 'motion/react';
import { usePortalStore } from '@/state/portalStore';

/**
 * S4: Lifecycle Overview — triggered by tapping the Azimuth logo.
 *
 * HUD-style frame: header band on top, CTA band at bottom, middle is
 * pointer-events: none so the 3D canvas stays interactive (orbit, node taps).
 * Per-node phase/tool/value-prop labels live inside ToolNode.tsx as <Html>
 * overlays anchored beneath each node — they appear when lifecycleMode
 * is active.
 *
 * Tap either band → goTo('hub'). BackButton (top-left) is the redundant path.
 */
export default function LifecycleOverview() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const goTo = usePortalStore((s) => s.goTo);

  if (currentScene !== 'lifecycle') return null;

  return (
    <div
      className="fixed inset-0 z-20 flex flex-col justify-between"
      style={{ pointerEvents: 'none' }}
    >
      {/* Top band — title + tagline */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => goTo('hub')}
        className="w-full pt-12 pb-6 px-lg flex flex-col items-center text-center"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
      >
        <div
          className="font-inter font-medium tracking-wider uppercase"
          style={{
            color: 'var(--cyan-struct)',
            fontSize: 'var(--text-caption)',
            marginBottom: 8,
          }}
        >
          The Platform
        </div>
        <h2
          className="font-satoshi font-bold"
          style={{
            fontSize: 'var(--text-h2)',
            lineHeight: 1.15,
            color: 'var(--peak-light)',
            marginBottom: 6,
          }}
        >
          One Platform. Complete Coverage.
        </h2>
        <div
          className="font-space-grotesk italic"
          style={{
            fontSize: 'var(--text-h3)',
            color: 'var(--amber-core)',
            fontWeight: 300,
          }}
        >
          From Enlistment to Benefits — Guided by AI.
        </div>
      </motion.div>

      {/* Bottom band — subtle subtext-CTA, NOVANarration-styled */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => goTo('hub')}
        className="w-full pb-12 pt-6 px-lg flex justify-center"
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
      >
        <p
          className="font-space-grotesk italic text-center"
          style={{
            fontSize: 'calc(var(--text-body) * 1.15)',
            fontWeight: 300,
            color: 'var(--silver)',
            maxWidth: 720,
            lineHeight: 1.5,
            letterSpacing: '0.01em',
          }}
        >
          Built by veterans, powered by AI, designed for the mission you&rsquo;re on right now.
        </p>
      </motion.div>
    </div>
  );
}
