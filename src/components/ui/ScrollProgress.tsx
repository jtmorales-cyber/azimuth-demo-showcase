'use client';

import { useEffect, useRef, useState } from 'react';
import { usePortalStore, type SceneName } from '@/state/portalStore';

/**
 * Vertical scroll progress indicator fixed to the right edge of the viewport.
 *
 * Design spec (design-system.md §5.2):
 * - 4px wide, full viewport height
 * - Background: midnight at 30% opacity
 * - Fill: cyan-struct gradient, height tracks scroll progress
 * - Scene labels at corresponding positions (active: amber-core, others: slate-blue/50)
 * - Labels appear on hover/touch, auto-hide after 3s
 * - Tapping a label scrolls to that section
 */

interface SceneMarker {
  scene: SceneName;
  label: string;
  // Position on the bar (0-1) — corresponds to the middle of the scroll range
  position: number;
}

// Labels to display — matches task spec (Boot and Closing are omitted
// from the visible markers; the bar covers the full journey regardless)
const MARKERS: SceneMarker[] = [
  { scene: 'gauntlet', label: 'Gauntlet', position: 0.125 },
  { scene: 'hub',      label: 'Hub',      position: 0.275 },
  { scene: 'maps',     label: 'MAPS',     position: 0.505 },
  { scene: 'kit',      label: 'K.I.T.',   position: 0.615 },
  { scene: 'base',     label: 'BASE',     position: 0.725 },
  { scene: 'scout',    label: 'SCOUT',    position: 0.835 },
  { scene: 'impact',   label: 'Impact',   position: 0.92 },
];

const AUTO_HIDE_MS = 3000;

export default function ScrollProgress() {
  const scrollProgress = usePortalStore((s) => s.scrollProgress);
  const currentScene = usePortalStore((s) => s.currentScene);
  const [labelsVisible, setLabelsVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show labels on interaction, auto-hide after 3s
  const showLabels = () => {
    setLabelsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setLabelsVisible(false), AUTO_HIDE_MS);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Clamped fill percentage for the bar
  const fillPct = Math.max(0, Math.min(1, scrollProgress)) * 100;

  // Tap a label → scroll the page to that scene position
  const scrollToScene = (marker: SceneMarker) => {
    const el = document.getElementById(marker.scene === 'hub' ? 'hub' : marker.scene);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    showLabels();
  };

  return (
    <>
      {/* Hover/touch zone — 24px wide strip on the right edge */}
      <div
        onPointerEnter={showLabels}
        onTouchStart={showLabels}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 48,
          height: '100vh',
          zIndex: 50,
          pointerEvents: 'auto',
          // Invisible hover zone, doesn't block clicks when labels hidden
          background: 'transparent',
        }}
      />

      {/* The vertical bar — always visible */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 24,
          width: 4,
          height: '100vh',
          background: 'rgba(28, 35, 49, 0.3)', // midnight at 30%
          borderRadius: 2,
          zIndex: 51,
          pointerEvents: 'none',
        }}
      >
        {/* Fill — cyan gradient, height tracks scroll */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${fillPct}%`,
            background: 'linear-gradient(to bottom, rgba(0, 206, 209, 0.9), rgba(0, 206, 209, 0.5))',
            borderRadius: 2,
            transition: 'height 0.15s ease-out',
            boxShadow: '0 0 12px rgba(0, 206, 209, 0.4)',
          }}
        />

        {/* Scene marker dots on the bar — always visible */}
        {MARKERS.map((marker) => {
          const isActive = marker.scene === currentScene;
          const isPassed = scrollProgress > marker.position;
          return (
            <div
              key={marker.scene}
              style={{
                position: 'absolute',
                top: `${marker.position * 100}%`,
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isActive ? 10 : 6,
                height: isActive ? 10 : 6,
                borderRadius: '50%',
                background: isActive
                  ? 'var(--amber-core)'
                  : isPassed
                  ? 'var(--cyan-struct)'
                  : 'var(--slate-blue)',
                boxShadow: isActive ? '0 0 10px var(--amber-core)' : 'none',
                transition: 'all 0.2s ease-out',
              }}
            />
          );
        })}
      </div>

      {/* Scene labels — appear on hover/touch, auto-hide after 3s */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 40,
          height: '100vh',
          width: 120,
          zIndex: 52,
          pointerEvents: labelsVisible ? 'auto' : 'none',
          opacity: labelsVisible ? 1 : 0,
          transition: 'opacity 0.25s ease-out',
        }}
      >
        {MARKERS.map((marker) => {
          const isActive = marker.scene === currentScene;
          return (
            <button
              key={marker.scene}
              type="button"
              onClick={() => scrollToScene(marker)}
              className="font-inter focus-cyan"
              style={{
                position: 'absolute',
                top: `${marker.position * 100}%`,
                right: 8,
                transform: 'translateY(-50%)',
                fontSize: 'var(--text-caption)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--amber-core)' : 'rgba(82, 106, 130, 0.7)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase' as const,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 10px',
                textAlign: 'right' as const,
                whiteSpace: 'nowrap' as const,
                textShadow: isActive ? '0 0 8px rgba(232, 160, 48, 0.3)' : '0 1px 4px rgba(0,0,0,0.6)',
                transition: 'color 0.2s ease-out, font-weight 0.2s ease-out',
              }}
            >
              {marker.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
