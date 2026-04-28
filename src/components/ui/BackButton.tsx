'use client';

import { usePortalStore } from '@/state/portalStore';

const SANCTUARY_SCENES = new Set(['maps', 'kit', 'base', 'scout', 'lifecycle']);

export default function BackButton() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const goTo = usePortalStore((s) => s.goTo);

  if (!SANCTUARY_SCENES.has(currentScene)) return null;

  return (
    <button
      onClick={() => goTo('hub')}
      className="fixed top-6 left-6 z-30 flex items-center gap-2 px-4 py-2 rounded-full"
      style={{
        background: 'rgba(28,35,49,0.75)',
        border: '1px solid rgba(0,206,209,0.3)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: 'var(--silver)',
        fontSize: 'var(--text-caption)',
        fontFamily: 'var(--font-inter)',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        touchAction: 'manipulation',
      }}
    >
      <span style={{ fontSize: '1.1em' }}>←</span>
      <span>NOVA HUB</span>
    </button>
  );
}
