'use client';

import { useRef, useState, useEffect } from 'react';

interface MetricCardProps {
  value: string;
  label: string;
  prefix?: string;
  suffix?: string;
}

/**
 * Animated metric counter + label.
 * Number counts up from 0 to target over 1200ms when scrolled into view.
 * Uses Space Grotesk 600 for the number, Inter for the label.
 * WCAG: amber-core on glass panel = 7.1:1 AAA.
 */
export default function MetricCard({ value, label, prefix = '', suffix = '' }: MetricCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounter();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  });

  function animateCounter() {
    // Extract numeric part from value (e.g., "38%" → 38, "125-day" → 125)
    const numericMatch = value.match(/[\d.]+/);
    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const matchStr = numericMatch[0];
    const target = parseFloat(matchStr);
    const isFloat = value.includes('.');
    const duration = 1200;
    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 2);
      const current = target * eased;

      const formatted = isFloat ? current.toFixed(1) : Math.round(current).toString();
      setDisplayValue(value.replace(matchStr, formatted));

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        setDisplayValue(value);
      }
    }

    requestAnimationFrame(update);
  }

  return (
    <div ref={ref} className="text-center py-sm">
      <div
        className="font-space-grotesk font-semibold"
        style={{
          fontSize: 'var(--text-data)',
          lineHeight: 1.0,
          color: 'var(--amber-core)',
        }}
      >
        {prefix}{displayValue}{suffix}
      </div>
      <div
        className="font-inter mt-xs"
        style={{
          fontSize: 'var(--text-caption)',
          lineHeight: 1.4,
          color: 'var(--silver)',
        }}
      >
        {label}
      </div>
    </div>
  );
}
