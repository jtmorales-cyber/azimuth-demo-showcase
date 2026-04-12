'use client';

import { useState, useEffect, useRef } from 'react';

interface NOVANarrationProps {
  text: string;
  typing?: boolean;
}

/**
 * Typewriter narration text with NOVA avatar indicator.
 * Space Grotesk 300 (accent/NOVA voice font).
 * Left amber border for blockquote styling.
 * 30ms per character, linear timing.
 */
export default function NOVANarration({ text, typing = true }: NOVANarrationProps) {
  const [displayed, setDisplayed] = useState(typing ? '' : text);
  const [isComplete, setIsComplete] = useState(!typing);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    // Respect prefers-reduced-motion — show full text immediately
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!typing || prefersReducedMotion) {
      setDisplayed(text);
      setIsComplete(true);
      return;
    }

    setDisplayed('');
    setIsComplete(false);
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        setDisplayed(text);
        setIsComplete(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        setDisplayed(text.slice(0, indexRef.current));
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text, typing]);

  return (
    <div className="flex items-start gap-md">
      {/* NOVA avatar — amber dot with pulse */}
      <div className="flex-shrink-0 mt-xs relative">
        <div
          className="rounded-full"
          style={{
            width: 12,
            height: 12,
            backgroundColor: 'var(--amber-core)',
            boxShadow: '0 0 8px var(--amber-core)',
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Narration text — blockquote style */}
      <blockquote
        className="font-space-grotesk"
        aria-live="polite"
        aria-label={text}
        style={{
          fontWeight: 300,
          fontSize: 'var(--text-body)',
          lineHeight: 1.6,
          color: 'var(--silver)',
          borderLeft: '2px solid var(--amber-core)',
          paddingLeft: 'var(--space-md)',
          margin: 0,
          fontStyle: 'italic',
        }}
      >
        {displayed}
        {!isComplete && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: '1em',
              backgroundColor: 'var(--amber-core)',
              marginLeft: 2,
              animation: 'blink 0.8s step-end infinite',
            }}
          />
        )}
      </blockquote>

      {/* Keyframe animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
