'use client';

import { usePortalStore, FADE_OUT_DURATION_SEC } from '@/state/portalStore';

/**
 * Full-viewport black overlay that fades in when the idle timeout triggers.
 * CSS-only — no 3D dependency, no GSAP. Simpler = more reliable in kiosk mode.
 *
 * Reads `isFadingOut` from the portal store:
 *   - false → overlay invisible, pointer-events: none
 *   - true  → overlay fades to black over FADE_OUT_DURATION_SEC (2s)
 *
 * After the fade completes, useIdleTimeout hook calls resetToIdle() which
 * sets isFadingOut back to false, so the overlay fades out of view as
 * the boot sequence restarts.
 */
export default function IdleOverlay() {
  const isFadingOut = usePortalStore((s) => s.isFadingOut);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000',
        opacity: isFadingOut ? 1 : 0,
        pointerEvents: 'none',
        transition: `opacity ${FADE_OUT_DURATION_SEC}s cubic-bezier(0.32, 0, 0.67, 0)`,
        zIndex: 9998, // above canvas + scroll content, below debug UI
      }}
    />
  );
}
