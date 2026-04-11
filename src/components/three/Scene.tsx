'use client';

import { useEffect, useCallback, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import BootSequence3D from './BootSequence3D';
import DepthGrid from './DepthGrid';
import GauntletGeometry from './GauntletGeometry';
import DissolveTransition from './DissolveTransition';
import NOVASphere from './NOVASphere';
import CompassRing from './CompassRing';
import ToolNode from './ToolNode';
import CameraController from '@/camera/CameraController';
import { NODE_POSITIONS } from '@/camera/flightPaths';
import { COLORS } from '@/utils/constants';
import { usePortalStore, type SceneName } from '@/state/portalStore';

function SceneSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.layers.enableAll();
  }, [camera]);

  return null;
}

/**
 * Dynamic ambient lighting that increases during the gauntlet scene.
 * The gauntlet needs more light since its only sources are emissive strips
 * and two fixed RectAreaLights. A directional light simulating overhead
 * fluorescent coverage fills the corridor evenly.
 */
function GauntletLighting() {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    const { currentScene } = usePortalStore.getState();
    const isGauntlet = currentScene === 'boot' || currentScene === 'gauntlet';

    // Gauntlet: stronger overhead fill. Hub: dim ambient only.
    if (lightRef.current) {
      const target = isGauntlet ? 0.6 : 0;
      lightRef.current.intensity += (target - lightRef.current.intensity) * 0.08;
    }
    if (ambientRef.current) {
      const target = isGauntlet ? 0.4 : 0.15;
      ambientRef.current.intensity += (target - ambientRef.current.intensity) * 0.08;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.4} />
      <directionalLight
        ref={lightRef}
        color="#C8C8C8"
        intensity={0.6}
        position={[0, 10, 0]}
      />
    </>
  );
}

function HubNodes() {
  const hoveredNode = usePortalStore((s) => s.hoveredNode);
  const setHoveredNode = usePortalStore((s) => s.setHoveredNode);
  const setScene = usePortalStore((s) => s.setScene);
  const currentScene = usePortalStore((s) => s.currentScene);

  const selectNode = useCallback(
    (scene: SceneName) => {
      setScene(scene);
    },
    [setScene]
  );

  return (
    <>
      <ToolNode
        geometry="dodeca"
        color={COLORS.AMBER_CORE}
        label="MAPS"
        subtitle="Pre-Enlistment"
        position={[NODE_POSITIONS.maps.x, NODE_POSITIONS.maps.y, NODE_POSITIONS.maps.z]}
        onSelect={() => selectNode('maps')}
        isActive={currentScene === 'maps'}
      />
      <ToolNode
        geometry="cube"
        color={COLORS.CYAN_STRUCT}
        label="K.I.T."
        subtitle="Active Duty"
        position={[NODE_POSITIONS.kit.x, NODE_POSITIONS.kit.y, NODE_POSITIONS.kit.z]}
        onSelect={() => selectNode('kit')}
        isActive={currentScene === 'kit'}
      />
      <ToolNode
        geometry="sphere"
        color={COLORS.CALM_PURPLE}
        label="BASE"
        subtitle="Wellness"
        position={[NODE_POSITIONS.base.x, NODE_POSITIONS.base.y, NODE_POSITIONS.base.z]}
        onSelect={() => selectNode('base')}
        isActive={currentScene === 'base'}
      />
      <ToolNode
        geometry="octa"
        color={COLORS.SCOUT_BLUE}
        label="SCOUT"
        subtitle="Claims"
        position={[NODE_POSITIONS.scout.x, NODE_POSITIONS.scout.y, NODE_POSITIONS.scout.z]}
        onSelect={() => selectNode('scout')}
        isActive={currentScene === 'scout'}
      />

      <CompassRing radius={8} activeNode={hoveredNode} />
    </>
  );
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
      <GauntletLighting />
      <BootSequence3D />
      <DissolveTransition>
        <GauntletGeometry />
      </DissolveTransition>
      <NOVASphere position={[0, 0, 0]} />
      <HubNodes />
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
