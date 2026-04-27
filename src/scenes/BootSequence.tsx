'use client';

import { motion } from 'motion/react';
import { usePortalStore } from '@/state/portalStore';

export default function BootSequence() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const goTo = usePortalStore((s) => s.goTo);

  if (currentScene !== 'boot') return null;

  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center pointer-events-auto"
      style={{ paddingBottom: '15vh' }}
      onClick={() => goTo('hub')}
      onTouchStart={() => goTo('hub')}
    >
      <motion.div
        animate={{ opacity: [0.3, 0.9, 0.3] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="font-inter uppercase"
        style={{
          color: 'var(--silver)',
          fontSize: 'var(--text-caption)',
          letterSpacing: '0.35em',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        Tap to Enter
      </motion.div>
    </div>
  );
}
