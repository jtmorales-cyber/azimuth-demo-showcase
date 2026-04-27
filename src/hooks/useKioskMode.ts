'use client';

import { useEffect } from 'react';
import { usePortalStore } from '@/state/portalStore';

/**
 * Kiosk mode initialization hook.
 *
 * Fullscreen API requires a real user gesture — browsers block it on load.
 * AudioContext.resume() also requires user interaction.
 * Both fire on first interaction and then the listeners are removed.
 *
 * Enabled when NEXT_PUBLIC_KIOSK_MODE=1 (set in Vercel env / .env.local)
 * OR when the URL contains ?kiosk=1 for booth use without a build.
 * cursor:none is handled unconditionally in globals.css (touch-only kiosk).
 */
export function useKioskMode() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const kioskFromEnv = process.env.NEXT_PUBLIC_KIOSK_MODE === '1';
    const kioskFromUrl =
      new URLSearchParams(window.location.search).get('kiosk') === '1';
    const kioskEnabled = kioskFromEnv || kioskFromUrl;

    if (!kioskEnabled) return;

    let initialized = false;

    function initializeKiosk() {
      if (initialized) return;
      initialized = true;

      // Fullscreen requires a user gesture — request on first interaction
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (el as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
      }

      // Mark audio context as ready to resume
      usePortalStore.getState().markAudioResumed();

      events.forEach((event) => {
        window.removeEventListener(event, initializeKiosk);
      });
    }

    const events: Array<keyof WindowEventMap> = [
      'touchstart',
      'pointerdown',
      'mousedown',
      'keydown',
    ];

    events.forEach((event) => {
      window.addEventListener(event, initializeKiosk, { once: false, passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, initializeKiosk);
      });
    };
  }, []);
}
