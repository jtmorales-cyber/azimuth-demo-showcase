'use client';

import { useEffect } from 'react';
import { usePortalStore } from '@/state/portalStore';
import { getAudioEngine } from '@/audio/AudioEngine';

/**
 * Bridges the portal store's audio state with the AudioEngine singleton.
 *
 * - Mount: init engine, sync mute, fire current scene's audio.
 * - audioMuted change → engine.setMuted(muted)
 * - audioResumed flip (false → true) → engine.markUnlocked()
 * - currentScene change → engine.play(scene) (queues if not unlocked yet)
 *
 * Also registers a first-gesture listener as a fallback for non-kiosk mode,
 * since useKioskMode only calls markAudioResumed() when kiosk env/URL is set.
 */
export function useAudioOrchestrator() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const engine = getAudioEngine();
    engine.init();

    const initial = usePortalStore.getState();
    engine.setMuted(initial.audioMuted);
    if (initial.audioResumed) engine.markUnlocked();
    engine.play(initial.currentScene);

    const unsubMute = usePortalStore.subscribe(
      (s) => s.audioMuted,
      (muted) => engine.setMuted(muted),
    );
    const unsubResumed = usePortalStore.subscribe(
      (s) => s.audioResumed,
      (resumed) => {
        if (resumed) engine.markUnlocked();
      },
    );
    const unsubScene = usePortalStore.subscribe(
      (s) => s.currentScene,
      (scene) => engine.play(scene),
    );

    // Fallback unlock for non-kiosk dev: useKioskMode only fires
    // markAudioResumed() when kiosk env/URL is set, so we listen ourselves.
    const onFirstGesture = () => {
      usePortalStore.getState().markAudioResumed();
    };
    const events: Array<keyof WindowEventMap> = [
      'touchstart',
      'pointerdown',
      'mousedown',
      'keydown',
    ];
    events.forEach((e) =>
      window.addEventListener(e, onFirstGesture, { once: true, passive: true }),
    );

    return () => {
      unsubMute();
      unsubResumed();
      unsubScene();
      events.forEach((e) => window.removeEventListener(e, onFirstGesture));
    };
  }, []);
}
