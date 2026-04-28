'use client';

import dynamic from 'next/dynamic';
import IdleOverlay from '@/components/ui/IdleOverlay';
import BackButton from '@/components/ui/BackButton';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';
import { useKioskMode } from '@/hooks/useKioskMode';

// R3F canvas — client-only
const Scene = dynamic(() => import('@/components/three/Scene'), { ssr: false });

// Scene HTML overlays — each self-gates on currentScene
const BootOverlay  = dynamic(() => import('@/scenes/BootSequence'),  { ssr: false });
const NOVAHub      = dynamic(() => import('@/scenes/NOVAHub'),       { ssr: false });
const MAPSShowcase = dynamic(() => import('@/scenes/MAPSShowcase'),  { ssr: false });
const KITShowcase  = dynamic(() => import('@/scenes/KITShowcase'),   { ssr: false });
const BASEShowcase = dynamic(() => import('@/scenes/BASEShowcase'),  { ssr: false });
const SCOUTShowcase     = dynamic(() => import('@/scenes/SCOUTShowcase'),     { ssr: false });
const LifecycleOverview = dynamic(() => import('@/scenes/LifecycleOverview'), { ssr: false });

export default function Home() {
  useKioskMode();
  useIdleTimeout();

  return (
    <>
      {/* Fixed full-viewport 3D canvas behind everything */}
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>

      {/* Kiosk idle fade-to-black curtain */}
      <IdleOverlay />

      {/* Back button — appears in sanctuary scenes */}
      <BackButton />

      {/* Scene HTML overlays — conditionally rendered by each component */}
      <BootOverlay />
      <NOVAHub />
      <MAPSShowcase />
      <KITShowcase />
      <BASEShowcase />
      <SCOUTShowcase />
      <LifecycleOverview />
    </>
  );
}
