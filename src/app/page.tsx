'use client';

import dynamic from 'next/dynamic';

const Scene = dynamic(() => import('@/components/three/Scene'), { ssr: false });

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-deep-navy">
      <Scene />
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* UI overlay layer — glass panels, narration, progress bar render here */}
      </div>
    </main>
  );
}
