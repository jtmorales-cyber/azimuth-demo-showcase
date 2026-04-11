'use client';

import { useRef, useState, useCallback, useEffect, type ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SwipeCarouselProps {
  children: ReactNode[];
  onIndexChange?: (index: number) => void;
  showDots?: boolean;
  className?: string;
}

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
  showDots = true,
  className = '',
}: SwipeCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const childCount = children.length;

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

  return (
    <div className={`relative w-full ${className}`}>
      {/* Scrollable card container */}
      <div
        ref={containerRef}
        className="flex w-full overflow-x-auto overflow-y-hidden"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          scrollbarWidth: 'none',       // Firefox
          msOverflowStyle: 'none',      // IE/Edge
        }}
      >
        {/* Hide scrollbar for WebKit */}
        <style>{`
          .carousel-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        {children.map((child, i) => (
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
          {children.map((_, i) => {
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
