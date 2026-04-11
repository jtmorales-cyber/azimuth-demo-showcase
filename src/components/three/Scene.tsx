'use client';

import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import DepthGrid from './DepthGrid';

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 5, 15], fov: 60 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor('#0A0E1A');
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.15} />
      <DepthGrid opacity={0.2} color="#00CED1" />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.3}
          intensity={0.8}
        />
        <Vignette darkness={0.4} offset={0.3} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
