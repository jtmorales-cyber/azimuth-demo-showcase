'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { usePortalStore } from '@/state/portalStore';
import MetricCard from '@/components/ui/MetricCard';
import NOVANarration from '@/components/ui/NOVANarration';

/**
 * S9: Impact Wall — The climactic proof moment
 *
 * Visual: Return to Hub view (NOVA + 4 nodes visible via HubWorld, which is
 * already mounted for hub/showcase scenes including 'impact').
 *
 * Layout:
 *   - Section headline: "The Scope of the Mission" (amber-core, centered)
 *   - 5 metrics in a row with 150ms sequential stagger
 *   - NOVA narration below
 *
 * Each metric counter fires 150ms after the previous one when the section
 * scrolls into view.
 */
export default function ImpactWall() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const [narrationReady, setNarrationReady] = useState(false);
  const narrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger NOVA narration after the metrics have had time to animate
  // (5 metrics × 150ms stagger + 1200ms animation ≈ 1950ms)
  useEffect(() => {
    if (currentScene !== 'impact') {
      setNarrationReady(false);
      if (narrationTimer.current) clearTimeout(narrationTimer.current);
      return;
    }

    narrationTimer.current = setTimeout(() => setNarrationReady(true), 2000);
    return () => {
      if (narrationTimer.current) clearTimeout(narrationTimer.current);
    };
  }, [currentScene]);

  if (currentScene !== 'impact') return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div className="w-full max-w-5xl px-lg flex flex-col items-center gap-xl">
        {/* Section headline — fades in first */}
        <motion.h2
          className="font-satoshi font-bold text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontSize: 'var(--text-h1)',
            lineHeight: 1.15,
            color: 'var(--amber-core)',
            textShadow: '0 0 30px rgba(232, 160, 48, 0.4)',
            letterSpacing: '0.01em',
          }}
        >
          The Scope of the Mission
        </motion.h2>

        {/* 5 metrics — horizontal row with 150ms stagger */}
        <motion.div
          className="grid grid-cols-5 gap-lg w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <MetricCard
            value="200K"
            label="Service members separate each year"
            delay={400}
          />
          <MetricCard
            value="125"
            label="Average days to process a VA claim today"
            delay={550}
          />
          <MetricCard
            value="7"
            label="Integrated tools across the full military lifecycle"
            delay={700}
          />
          <MetricCard
            value="2.4M"
            label="Veterans in the active VA disability claims system"
            delay={850}
          />
          <MetricCard
            value="1"
            label="Platform built by veterans, for the person in the uniform"
            delay={1000}
          />
        </motion.div>

        {/* NOVA narration — appears after metrics finish animating */}
        <motion.div
          className="max-w-3xl w-full px-lg"
          initial={{ opacity: 0, y: 15 }}
          animate={narrationReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {narrationReady && (
            <NOVANarration
              text="Seven tools. One platform. Built for every stage of the mission — before, during, and after service. This is Mission Mentor."
              typing
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
