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
import SceneGroup from './SceneGroup';
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

// ---------------------------------------------------------------------------
// Scene setup
// ---------------------------------------------------------------------------

function SceneSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.layers.enableAll();
  }, [camera]);
  return null;
}

// ---------------------------------------------------------------------------
// Dynamic lighting — bright fluorescent during gauntlet, dim ambient for hub
// ---------------------------------------------------------------------------

function DynamicLighting() {
  const directionalRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  useFrame(() => {
    const { currentScene } = usePortalStore.getState();
    const isGauntlet = currentScene === 'boot' || currentScene === 'gauntlet';

    if (directionalRef.current) {
      const target = isGauntlet ? 0.6 : 0;
      directionalRef.current.intensity += (target - directionalRef.current.intensity) * 0.08;
    }
    if (ambientRef.current) {
      const target = isGauntlet ? 0.4 : 0.15;
      ambientRef.current.intensity += (target - ambientRef.current.intensity) * 0.08;
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.15} />
      <directionalLight
        ref={directionalRef}
        color="#C8C8C8"
        intensity={0}
        position={[0, 10, 0]}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Hub content — NOVA + tool nodes + compass ring
// Only visible during hub and showcase scenes
// ---------------------------------------------------------------------------

const HUB_SCENES: SceneName[] = ['hub', 'maps', 'kit', 'base', 'scout', 'impact', 'closing'];

function HubWorld() {
  const hoveredNode = usePortalStore((s) => s.hoveredNode);
  const setScene = usePortalStore((s) => s.setScene);
  const currentScene = usePortalStore((s) => s.currentScene);

  const selectNode = useCallback(
    (scene: SceneName) => { setScene(scene); },
    [setScene]
  );

  return (
    <SceneGroup scenes={HUB_SCENES}>
      <NOVASphere position={[0, 0, 0]} />
      <CompassRing radius={8} activeNode={hoveredNode} />
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
    </SceneGroup>
  );
}

// ---------------------------------------------------------------------------
// Main Scene — proper isolation between visual worlds
// ---------------------------------------------------------------------------

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
      <DynamicLighting />

      {/* BOOT: "A" monogram — visible only during boot */}
      <SceneGroup scenes={['boot']}>
        <BootSequence3D />
      </SceneGroup>

      {/* GAUNTLET: corridors — visible during boot + gauntlet, dissolves at transition */}
      <DissolveTransition>
        <GauntletGeometry />
      </DissolveTransition>

      {/* HUB: NOVA sphere, compass ring, tool nodes — visible after transition */}
      <HubWorld />

      {/* DEPTH GRID: visible during hub + showcases (has internal scene check) */}
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
