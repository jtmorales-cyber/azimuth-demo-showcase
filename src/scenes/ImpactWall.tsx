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
 *   - Glass panel wrapper (anchors the composition against the 3D canvas)
 *   - Section headline: "The Scope of the Mission" (amber-core)
 *   - 5 metrics in a row with 150ms sequential stagger
 *   - NOVA narration below
 *   - Amber bottom accent line signals climactic moment
 */
export default function ImpactWall() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const [narrationReady, setNarrationReady] = useState(false);
  const narrationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    <div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
      <div
        className="pointer-events-auto"
        style={{ width: 'min(1100px, 92vw)' }}
      >
        {/* Glass panel wrapper — anchors the composition visually */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(var(--glass-blur))',
            WebkitBackdropFilter: 'blur(var(--glass-blur))',
            boxShadow:
              'inset 0 1px 0 0 var(--glass-highlight), 0 0 60px 0 rgba(232, 160, 48, 0.12)',
            padding: 'clamp(32px, 5vw, 64px)',
          }}
        >
          {/* Amber bottom accent line — climactic signal */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '16%',
              right: '16%',
              bottom: 0,
              height: 1,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(232, 160, 48, 0.6) 50%, transparent 100%)',
            }}
          />

          <div className="flex flex-col items-center gap-xl">
            {/* Section headline */}
            <motion.h2
              className="font-satoshi font-bold text-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontSize: 'var(--text-h1)',
                lineHeight: 1.15,
                color: 'var(--amber-core)',
                textShadow: '0 0 30px rgba(232, 160, 48, 0.4)',
                letterSpacing: '0.01em',
                margin: 0,
              }}
            >
              The Scope of the Mission
            </motion.h2>

            {/* 5 metrics — horizontal row with 150ms stagger */}
            <motion.div
              className="grid grid-cols-5 gap-lg w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <MetricCard
                value="200K"
                label="Service members separate each year"
                delay={500}
              />
              <MetricCard
                value="125"
                label="Average days to process a VA claim today"
                delay={650}
              />
              <MetricCard
                value="7"
                label="Integrated tools across the full military lifecycle"
                delay={800}
              />
              <MetricCard
                value="2.4M"
                label="Veterans in the active VA disability claims system"
                delay={950}
              />
              <MetricCard
                value="1"
                label="Platform built by veterans, for the person in the uniform"
                delay={1100}
              />
            </motion.div>

            {/* NOVA narration — appears after metrics finish animating */}
            <motion.div
              className="max-w-3xl w-full"
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
        </motion.div>
      </div>
    </div>
  );
}
