'use client';

import dynamic from 'next/dynamic';
import ScrollScene from '@/components/layout/ScrollScene';
import ScrollManager from '@/components/layout/ScrollManager';

// R3F canvas — client-only, no SSR
const Scene = dynamic(() => import('@/components/three/Scene'), { ssr: false });

// Scene content (lazy-loaded, client-only)
const BootSequence = dynamic(() => import('@/scenes/BootSequence'), { ssr: false });
const Gauntlet = dynamic(() => import('@/scenes/Gauntlet'), { ssr: false });
const GauntletTransition = dynamic(() => import('@/scenes/GauntletTransition'), { ssr: false });
const NOVAHub = dynamic(() => import('@/scenes/NOVAHub'), { ssr: false });
const LifecycleOverview = dynamic(() => import('@/scenes/LifecycleOverview'), { ssr: false });
const MAPSShowcase = dynamic(() => import('@/scenes/MAPSShowcase'), { ssr: false });
const KITShowcase = dynamic(() => import('@/scenes/KITShowcase'), { ssr: false });
const BASEShowcase = dynamic(() => import('@/scenes/BASEShowcase'), { ssr: false });
const SCOUTShowcase = dynamic(() => import('@/scenes/SCOUTShowcase'), { ssr: false });
const ImpactWall = dynamic(() => import('@/scenes/ImpactWall'), { ssr: false });
const ClosingCTA = dynamic(() => import('@/scenes/ClosingCTA'), { ssr: false });

export default function Home() {
  return (
    <>
      {/* Fixed full-viewport 3D canvas — sits behind scroll content */}
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>

      {/* Scrollytelling sections — transparent, overlaid on the canvas */}
      <div className="relative z-10">
        <ScrollManager />

        {/* S0: Boot Sequence — auto-plays on load */}
        <ScrollScene id="boot">
          <BootSequence />
        </ScrollScene>

        {/* S1: The Gauntlet — brutalist corridor labyrinth */}
        <ScrollScene id="gauntlet">
          <Gauntlet />
        </ScrollScene>

        {/* S2: Gauntlet → Hub transition — dissolution + camera flight */}
        <ScrollScene id="gauntlet-transition">
          <GauntletTransition />
        </ScrollScene>

        {/* S3: NOVA Hub — command center assembly */}
        <ScrollScene id="hub">
          <NOVAHub />
        </ScrollScene>

        {/* S4: Lifecycle Overview — timeline arrangement */}
        <ScrollScene id="lifecycle">
          <LifecycleOverview />
        </ScrollScene>

        {/* S5: MAPS Showcase — pre-enlistment carousel */}
        <ScrollScene id="maps">
          <MAPSShowcase />
        </ScrollScene>

        {/* S6: K.I.T. Showcase — active duty carousel */}
        <ScrollScene id="kit">
          <KITShowcase />
        </ScrollScene>

        {/* S7: BASE Showcase — wellness carousel */}
        <ScrollScene id="base">
          <BASEShowcase />
        </ScrollScene>

        {/* S8: SCOUT Showcase — claims carousel */}
        <ScrollScene id="scout">
          <SCOUTShowcase />
        </ScrollScene>

        {/* S9: Impact Wall — aggregate metrics */}
        <ScrollScene id="impact">
          <ImpactWall />
        </ScrollScene>

        {/* S10: Closing CTA — partnership ask */}
        <ScrollScene id="closing" pin={false}>
          <ClosingCTA />
        </ScrollScene>
      </div>
    </>
  );
}
