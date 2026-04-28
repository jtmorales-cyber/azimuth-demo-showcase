'use client';

import { motion } from 'motion/react';
import { usePortalStore } from '@/state/portalStore';
import SwipeCarousel from '@/components/ui/SwipeCarousel';
import GlassPanel from '@/components/ui/GlassPanel';
import NOVANarration from '@/components/ui/NOVANarration';

/**
 * S4: Lifecycle Overview — triggered by tapping the Azimuth logo in the hub.
 *
 * Camera pulls back, 4 ToolNodes animate to a horizontal timeline
 * (handled in Scene.tsx / ToolNode.tsx), and this DOM overlay reveals the
 * platform lifecycle arc: Pre-Enlistment → Active Duty → Wellness → Claims.
 *
 * Content verbatim from storyboard.md S4.
 * Tap the card → returns to hub (matches SwipeCarousel pattern in showcases).
 * BackButton (global) also returns to hub.
 */

const LIFECYCLE_PHASES = [
  {
    phase: 'Pre-Enlistment',
    tool: 'MAPS',
    copy: 'Find your path before you commit',
  },
  {
    phase: 'Active Duty',
    tool: 'K.I.T.',
    copy: 'Track, grow, and own your career in real-time',
  },
  {
    phase: 'Wellness',
    tool: 'BASE',
    copy: "A safe space that's always there",
  },
  {
    phase: 'Claims',
    tool: 'SCOUT',
    copy: 'Get what you earned — optimized, fast, confident',
  },
] as const;

export default function LifecycleOverview() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const goTo = usePortalStore((s) => s.goTo);

  if (currentScene !== 'lifecycle') return null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center pointer-events-auto"
      style={{ touchAction: 'pan-y' }}
    >
      <div className="w-full max-w-2xl px-lg">
        <SwipeCarousel onLastCardTap={() => goTo('hub')} showDots={false}>
          <GlassPanel size="full" tiltOnTouch>
          <div className="space-y-lg p-md">
            {/* Eyebrow */}
            <div
              className="font-inter font-medium tracking-wider uppercase"
              style={{ color: 'var(--cyan-struct)', fontSize: 'var(--text-caption)' }}
            >
              The Platform
            </div>

            {/* Title */}
            <h2
              className="font-satoshi font-bold"
              style={{
                fontSize: 'var(--text-h2)',
                lineHeight: 1.2,
                color: 'var(--peak-light)',
              }}
            >
              One Platform. Complete Coverage.
            </h2>

            {/* Subtitle */}
            <div
              className="font-space-grotesk italic"
              style={{
                fontSize: 'var(--text-h3)',
                lineHeight: 1.3,
                color: 'var(--amber-core)',
                fontWeight: 300,
              }}
            >
              From Enlistment to Benefits — Guided by AI.
            </div>

            {/* 4 lifecycle phase rows — stagger reveal */}
            <div className="space-y-md pt-sm">
              {LIFECYCLE_PHASES.map((item, i) => (
                <motion.div
                  key={item.tool}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-[1fr_auto_2fr] gap-md items-start"
                  style={{
                    borderBottom: '1px solid rgba(82, 106, 130, 0.2)',
                    paddingBottom: '0.75rem',
                  }}
                >
                  {/* Phase + Tool name */}
                  <div>
                    <div
                      className="font-inter font-medium tracking-wider uppercase"
                      style={{
                        color: 'var(--slate-blue)',
                        fontSize: 'var(--text-caption)',
                        marginBottom: 4,
                      }}
                    >
                      {item.phase}
                    </div>
                    <div
                      className="font-satoshi font-bold"
                      style={{
                        color: 'var(--amber-core)',
                        fontSize: 'var(--text-h3)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {item.tool}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div
                    className="font-space-grotesk"
                    style={{
                      color: 'var(--cyan-struct)',
                      fontSize: 'var(--text-body)',
                      fontWeight: 600,
                      paddingTop: 14,
                    }}
                  >
                    →
                  </div>

                  {/* Value prop copy */}
                  <div
                    className="font-inter"
                    style={{
                      color: 'var(--silver)',
                      fontSize: 'var(--text-body)',
                      lineHeight: 1.5,
                      paddingTop: 14,
                    }}
                  >
                    {item.copy}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* NOVA narration */}
            <NOVANarration
              text="Each tool is a showcase — built by veterans, powered by AI, designed for the mission you're on right now."
              typing
            />
          </div>
          </GlassPanel>
        </SwipeCarousel>
      </div>
    </div>
  );
}
