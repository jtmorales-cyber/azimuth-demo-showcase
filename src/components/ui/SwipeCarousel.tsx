'use client';

import { Children, useRef, useState, useCallback, useEffect, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { usePortalStore } from '@/state/portalStore';
import { getAudioEngine } from '@/audio/AudioEngine';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SwipeCarouselProps {
  children: ReactNode | ReactNode[];
  onIndexChange?: (index: number) => void;
  /**
   * Fired when the user taps (not swipes) the last card.
   * Used by sanctuary scenes to return to the hub.
   */
  onLastCardTap?: () => void;
  showDots?: boolean;
  className?: string;
}

// Movement under this threshold (px) within TAP_MAX_DURATION counts as a tap, not a swipe.
const TAP_MAX_DISTANCE = 8;
const TAP_MAX_DURATION = 350;

// ---------------------------------------------------------------------------
// SwipeCarousel — native scroll-snap + gesture detection
// No third-party carousel library.
//
// Touch conflict prevention:
//   - Container: touch-action: pan-x (allows horizontal swipe)
//   - Parent scroll sections: touch-action: pan-y (allows vertical scroll)
//   - Direction lock: first 10px of movement determines axis
// ---------------------------------------------------------------------------

export default function SwipeCarousel({
  children,
  onIndexChange,
  onLastCardTap,
  showDots = true,
  className = '',
}: SwipeCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Normalize single child / array uniformly
  const childArray = Children.toArray(children);
  const childCount = childArray.length;

  // Track scroll position to determine active index
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const scrollLeft = el.scrollLeft;
    const cardWidth = el.offsetWidth;
    if (cardWidth === 0) return;

    const index = Math.round(scrollLeft / cardWidth);
    const clamped = Math.max(0, Math.min(childCount - 1, index));

    if (clamped !== activeIndex) {
      setActiveIndex(clamped);
      onIndexChange?.(clamped);
      getAudioEngine().playInteraction(usePortalStore.getState().currentScene);
    }
  }, [activeIndex, childCount, onIndexChange]);

  // Scroll to a specific card
  const scrollToIndex = useCallback((index: number) => {
    const el = containerRef.current;
    if (!el) return;

    const target = index * el.offsetWidth;
    el.scrollTo({ left: target, behavior: 'smooth' });
  }, []);

  // Listen for scroll events
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Tap-to-advance: tap on a card → next card; tap on last card → onLastCardTap
  // Uses pointer movement + duration thresholds so that swipes never fire as taps.
  const handlePointerDown = useCallback((e: ReactPointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }, []);

  const handlePointerUp = useCallback((e: ReactPointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const dt = Date.now() - start.t;

    if (Math.hypot(dx, dy) > TAP_MAX_DISTANCE || dt > TAP_MAX_DURATION) return;

    // Suppress taps that originate on interactive elements (dot buttons, etc.)
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, [role="button"], input, textarea, select')) return;

    if (activeIndex >= childCount - 1) {
      onLastCardTap?.();
    } else {
      scrollToIndex(activeIndex + 1);
    }
  }, [activeIndex, childCount, onLastCardTap, scrollToIndex]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Scrollable card container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="flex w-full overflow-x-auto overflow-y-hidden"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          scrollbarWidth: 'none',       // Firefox
          msOverflowStyle: 'none',      // IE/Edge
          cursor: 'pointer',
        }}
      >
        {/* Hide scrollbar for WebKit */}
        <style>{`
          .carousel-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        {childArray.map((child, i) => (
          <div
            key={i}
            className="carousel-scroll w-full flex-shrink-0"
            style={{
              scrollSnapAlign: 'start',
              minWidth: '100%',
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      {showDots && childCount > 1 && (
        <div className="flex justify-center items-center gap-3 mt-lg py-sm">
          {childArray.map((_, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to card ${i + 1}`}
                className="rounded-full transition-all duration-200 ease-out focus-cyan"
                style={{
                  width: isActive ? 12 : 8,
                  height: isActive ? 12 : 8,
                  backgroundColor: isActive
                    ? 'var(--amber-core)'
                    : 'var(--slate-blue)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
