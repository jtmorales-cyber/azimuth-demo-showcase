'use client';

import { motion } from 'motion/react';
import { usePortalStore } from '@/state/portalStore';

// Boot HTML overlay — sits over the 3D Azimuth logo while currentScene is
// 'boot'. The whole viewport is the tap target: any click/touch advances
// to the NOVA Hub. Layout matches the azimuth-portal screenshot:
//   • AZIMUTH wordmark below the logo (subtle, wide tracking)
//   • TAP TO BEGIN prompt at the bottom (pulsing)
export default function BootSequence() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const goTo = usePortalStore((s) => s.goTo);

  if (currentScene !== 'boot') return null;

  const advance = () => goTo('hub');

  return (
    <div
      className="fixed inset-0 z-20 pointer-events-auto"
      onClick={advance}
      onTouchStart={advance}
      style={{ cursor: 'pointer' }}
    >
      {/* Azimuth logomark — centered in the upper 60% of the viewport */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ top: '42%', pointerEvents: 'none', userSelect: 'none' }}
      >
        <img
          src="/logo/azimuth-logomark.svg"
          alt=""
          draggable={false}
          style={{ width: 'clamp(140px, 22vw, 240px)', display: 'block' }}
        />
      </div>

      {/* AZIMUTH wordmark — below the logo, just past center */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 0.55, y: 0 }}
        transition={{ delay: 1.4, duration: 0.9, ease: 'easeOut' }}
        className="absolute left-1/2 -translate-x-1/2 font-inter uppercase"
        style={{
          top: '62%',
          color: 'rgba(216, 222, 233, 0.55)',
          fontSize: 'clamp(1.25rem, 2.4vw, 2rem)',
          letterSpacing: '0.55em',
          paddingLeft: '0.55em', // compensate for trailing letter-spacing so visual center matches box center
          fontWeight: 300,
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Azimuth
      </motion.div>

      {/* TAP TO BEGIN prompt — anchored to the bottom, pulses gently */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.25, 0.7, 0.25] }}
        transition={{ delay: 2.2, duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 -translate-x-1/2 font-inter uppercase"
        style={{
          bottom: '12%',
          color: 'rgba(216, 222, 233, 0.5)',
          fontSize: 'clamp(0.75rem, 1.1vw, 0.95rem)',
          letterSpacing: '0.4em',
          paddingLeft: '0.4em', // compensate for trailing letter-spacing
          fontWeight: 400,
          userSelect: 'none',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        Tap to Begin
      </motion.div>
    </div>
  );
}
