'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePortalStore } from '@/state/portalStore';

gsap.registerPlugin(ScrollTrigger);

/**
 * Tracks global scroll position (0–1) across the entire page and writes it
 * to the Zustand store. The store's `setScrollProgress` action derives the
 * active scene automatically from the scroll ranges in design-system.md §4.3.
 *
 * Mounted once in page.tsx — no visual output.
 */
export default function ScrollManager() {
  const setScrollProgress = usePortalStore((s) => s.setScrollProgress);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [setScrollProgress]);

  return null;
}
