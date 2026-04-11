'use client';

import { useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import DepthGrid from './DepthGrid';
import NOVASphere from './NOVASphere';
import CameraController from '@/camera/CameraController';

/**
 * Configures the camera to only render layer 0 for the bloom pass.
 * The DepthGrid is on layer 1, so bloom won't catch its cyan lines.
 * The main render pass sees all layers.
 */
function SceneSetup() {
  const { camera } = useThree();

  useEffect(() => {
    // Camera sees layer 0 (default) — bloom only processes this layer.
    // DepthGrid sets layers-mask={2} which corresponds to layer 1.
    // The main scene render sees everything; bloom is limited by luminance threshold.
    camera.layers.enableAll();
  }, [camera]);

  return null;
}

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 3, 20], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => {
        gl.setClearColor('#0A0E1A');
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <SceneSetup />
      <CameraController />
      <ambientLight intensity={0.15} />
      <NOVASphere position={[0, 0, 0]} />
      <DepthGrid opacity={0.22} color="#00CED1" />
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
