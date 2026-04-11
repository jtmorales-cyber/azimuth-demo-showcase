'use client';

import { useRef, type ReactNode, type PointerEvent } from 'react';
import { motion } from 'motion/react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PanelSize = 'sm' | 'md' | 'lg' | 'full';

interface GlassPanelProps {
  size?: PanelSize;
  children: ReactNode;
  tiltOnTouch?: boolean;
  className?: string;
  animate?: boolean;
}

// ---------------------------------------------------------------------------
// Size → max-width mapping
// ---------------------------------------------------------------------------

const SIZE_CLASSES: Record<PanelSize, string> = {
  sm: 'max-w-xs',      // 320px
  md: 'max-w-md',      // 448px
  lg: 'max-w-xl',      // 576px
  full: 'w-full',
};

// ---------------------------------------------------------------------------
// WCAG Contrast Audit (glass-morphic surface)
// ---------------------------------------------------------------------------
// Effective glass bg: ~#131B28 (65% midnight over deep-navy)
//
// | Text Color       | Hex     | Ratio  | WCAG Level        |
// |------------------|---------|--------|-------------------|
// | Silver           | #D8DEE9 | 11.2:1 | AAA (body text)   |
// | Peak-light       | #FFFFFF | 16.8:1 | AAA               |
// | Amber-core       | #E8A030 | 7.1:1  | AAA (metrics)     |
// | Cyan-struct      | #00CED1 | 8.4:1  | AAA (headings)    |
// | Slate-blue       | #526A82 | 3.4:1  | AA large text only|
//
// USAGE RULES:
// - Body text (16px regular): use Silver (#D8DEE9) minimum
// - Captions (<16px): must use Silver or brighter — NOT slate-blue
// - Large text (≥18px or ≥14px bold): slate-blue is acceptable
// - Metrics/data: amber-core or peak-light
// - Interactive labels: cyan-struct
// ---------------------------------------------------------------------------

export default function GlassPanel({
  size = 'md',
  children,
  tiltOnTouch = false,
  className = '',
  animate = true,
}: GlassPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!tiltOnTouch || !panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // ±3° max tilt
    panelRef.current.style.transform =
      `perspective(800px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  };

  const handlePointerLeave = () => {
    if (!tiltOnTouch || !panelRef.current) return;
    panelRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg)';
  };

  const baseClasses = `
    ${SIZE_CLASSES[size]}
    glass-panel focus-cyan
    relative rounded-2xl p-lg
    transition-colors duration-200 ease-out
    ${className}
  `.trim();

  const inlineStyle = {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    backdropFilter: 'blur(var(--glass-blur))',
    WebkitBackdropFilter: 'blur(var(--glass-blur))',
    boxShadow: 'inset 0 1px 0 0 var(--glass-highlight)',
    ...(tiltOnTouch && {
      willChange: 'transform' as const,
      transition: 'transform 0.15s ease-out, background 0.2s ease-out, border-color 0.2s ease-out',
    }),
  };

  if (!animate) {
    return (
      <div
        ref={panelRef}
        className={baseClasses}
        style={inlineStyle}
        onPointerMove={tiltOnTouch ? handlePointerMove : undefined}
        onPointerLeave={tiltOnTouch ? handlePointerLeave : undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={panelRef}
      className={baseClasses}
      style={inlineStyle}
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onPointerMove={tiltOnTouch ? handlePointerMove : undefined}
      onPointerLeave={tiltOnTouch ? handlePointerLeave : undefined}
    >
      {children}
    </motion.div>
  );
}
