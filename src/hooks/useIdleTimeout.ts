'use client';

import { useEffect, useRef } from 'react';
import {
  usePortalStore,
  IDLE_TIMEOUT_SEC,
  FADE_OUT_DURATION_SEC,
} from '@/state/portalStore';

/**
 * Kiosk idle reset hook.
 *
 * Tracks time since last user interaction (touch, scroll, mouse, keyboard).
 * After IDLE_TIMEOUT_SEC (60s) of inactivity:
 *   1. Triggers fade to black (2s, handled by IdleOverlay)
 *   2. After fade completes: resets store to 'boot' scene
 *   3. Scrolls window to top (restart boot sequence)
 *   4. Clears isFadingOut flag so next visitor sees a clean state
 *
 * Any interaction during the countdown resets the timer.
 *
 * Attach once at the page root via `useIdleTimeout()`.
 */
export function useIdleTimeout() {
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const store = usePortalStore;

    function clearTimers() {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
    }

    function startIdleTimer() {
      clearTimers();
      idleTimerRef.current = setTimeout(() => {
        // Begin fade to black
        store.getState().beginFadeOut();

        // After fade completes, reset to boot
        fadeTimerRef.current = setTimeout(() => {
          store.getState().resetToIdle();
          // Scroll back to top so boot scene plays from start
          window.scrollTo({ top: 0, behavior: 'auto' });
        }, FADE_OUT_DURATION_SEC * 1000);
      }, IDLE_TIMEOUT_SEC * 1000);
    }

    function handleInteraction() {
      // Reset the store's interaction tracking + timer
      store.getState().registerInteraction();
      startIdleTimer();
    }

    // Start initial timer
    startIdleTimer();

    // Listen for any interaction type
    const events: Array<keyof WindowEventMap> = [
      'touchstart',
      'touchmove',
      'scroll',
      'mousemove',
      'mousedown',
      'keydown',
      'wheel',
      'pointerdown',
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleInteraction, { passive: true });
    });

    return () => {
      clearTimers();
      events.forEach((event) => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, []);
}
