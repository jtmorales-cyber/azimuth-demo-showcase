'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollSceneProps {
  id: string;
  children: ReactNode;
  onProgress?: (progress: number) => void;
  pin?: boolean;
  className?: string;
}

export default function ScrollScene({
  id,
  children,
  onProgress,
  pin = true,
  className = '',
}: ScrollSceneProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom top',
      pin,
      scrub: true,
      onUpdate: (self) => {
        onProgress?.(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, [pin, onProgress]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative w-full h-screen overflow-hidden ${className}`}
      data-scene={id}
    >
      {children}
    </section>
  );
}
