'use client';

import { type ReactNode } from 'react';

/**
 * Scroll section container — 100vh block that consumes scroll distance.
 *
 * This component no longer uses GSAP ScrollTrigger or pinning. The previous
 * per-section `pin: true + scrub: true` architecture conflicted with the
 * global scroll progress tracker in ScrollManager and caused:
 *   - Scroll feeling locked and discrete instead of smooth
 *   - Scene overlay mount/unmount thrashing at pin boundaries
 *   - Touch gesture conflicts (pinned section ate vertical scroll)
 *
 * New architecture:
 *   - Each section is a simple 100vh <section> that scrolls normally
 *   - ScrollManager tracks global document scroll → portal store scrollProgress
 *   - Scene overlays render `position: fixed` while their scene is active
 *   - Camera flies smoothly through flight paths keyed to global scroll
 *
 * The `pin` prop is accepted for backwards compatibility but ignored.
 */
interface ScrollSceneProps {
  id: string;
  children: ReactNode;
  /** @deprecated pinning removed — prop is ignored */
  pin?: boolean;
  className?: string;
}

export default function ScrollScene({
  id,
  children,
  className = '',
}: ScrollSceneProps) {
  return (
    <section
      id={id}
      data-scene={id}
      className={`relative w-full h-screen ${className}`}
      style={{ scrollSnapAlign: 'start' }}
    >
      {children}
    </section>
  );
}
