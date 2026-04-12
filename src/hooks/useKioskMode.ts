'use client';

import { useEffect } from 'react';
import { usePortalStore } from '@/state/portalStore';

/**
 * Kiosk mode initialization hook.
 *
 * Handles three concerns that require a real user gesture:
 * 1. Fullscreen API — browsers only allow requestFullscreen() from user input
 * 2. AudioContext.resume() — browsers block audio autoplay without interaction
 * 3. Kiosk cursor hiding — adds .kiosk class to body after first interaction
 *
 * All three trigger on the first user interaction after page load.
 * After that, the listeners are removed.
 *
 * Enabled only when NEXT_PUBLIC_KIOSK_MODE env var is truthy, OR when the
 * URL contains ?kiosk=1. Dev mode stays fully interactive by default.
 */
export function useKioskMode() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if kiosk mode is enabled via env or URL param
    const kioskFromEnv = process.env.NEXT_PUBLIC_KIOSK_MODE === '1';
    const kioskFromUrl =
      new URLSearchParams(window.location.search).get('kiosk') === '1';
    const kioskEnabled = kioskFromEnv || kioskFromUrl;

    if (!kioskEnabled) return;

    let initialized = false;

    function initializeKiosk() {
      if (initialized) return;
      initialized = true;

      // 1. Request fullscreen
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {
          // Fullscreen may be denied — not critical, continue
        });
      } else if ((el as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
        (el as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
      }

      // 2. Add kiosk class to body (hides cursor via CSS)
      document.body.classList.add('kiosk');

      // 3. Mark audio as resumed in the store
      // (The AudioEngine, when wired in a later phase, will read this flag
      //  and call AudioContext.resume() accordingly.)
      usePortalStore.getState().markAudioResumed();

      // Remove listeners after first trigger
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
