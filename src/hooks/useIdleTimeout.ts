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
 * After IDLE_TIMEOUT_SEC (60s) of inactivity:
 *   1. Triggers fade to black (2s, handled by IdleOverlay)
 *   2. After fade: calls resetToHub() — camera flies back to hub
 *
 * Any interaction resets the timer.
 */
export function useIdleTimeout() {
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const store = usePortalStore;

    function clearTimers() {
      if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
      if (fadeTimerRef.current) { clearTimeout(fadeTimerRef.current); fadeTimerRef.current = null; }
    }

    function startIdleTimer() {
      clearTimers();
      idleTimerRef.current = setTimeout(() => {
        store.getState().beginFadeOut();
        fadeTimerRef.current = setTimeout(() => {
          store.getState().resetToHub();
        }, FADE_OUT_DURATION_SEC * 1000);
      }, IDLE_TIMEOUT_SEC * 1000);
    }

    function handleInteraction() {
      store.getState().registerInteraction();
      startIdleTimer();
    }

    startIdleTimer();

    const events: Array<keyof WindowEventMap> = [
      'touchstart', 'touchmove', 'mousemove', 'mousedown', 'keydown', 'wheel', 'pointerdown',
    ];
    events.forEach((e) => window.addEventListener(e, handleInteraction, { passive: true }));

    return () => {
      clearTimers();
      events.forEach((e) => window.removeEventListener(e, handleInteraction));
    };
  }, []);
}
