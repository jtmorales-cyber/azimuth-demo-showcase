'use client';

import { useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { ToneMappingMode, BlendFunction } from 'postprocessing';
import { Vector2 } from 'three';
import SceneGroup from './SceneGroup';
import DepthGrid from './DepthGrid';
import AzimuthLogo3D from './AzimuthLogo3D';
import CompassRing from './CompassRing';
import ToolNode from './ToolNode';
import CameraController from '@/camera/CameraController';
import { NODE_POSITIONS, TIMELINE_POSITIONS } from '@/camera/flightPaths';
import { COLORS } from '@/utils/constants';
import { usePortalStore, type SceneName } from '@/state/portalStore';

// ---------------------------------------------------------------------------
// Scene setup
// ---------------------------------------------------------------------------

function SceneSetup() {
  const { camera } = useThree();
  useEffect(() => { camera.layers.enableAll(); }, [camera]);
  return null;
}

// ---------------------------------------------------------------------------
// Hub content — NOVA + tool nodes + compass ring
// Only visible during hub and showcase scenes via SceneGroup
// ---------------------------------------------------------------------------

const HUB_SCENES: SceneName[] = ['hub', 'maps', 'kit', 'base', 'scout', 'lifecycle'];

// Stable Vector2 instance — avoids new allocation on every render
const ZERO_OFFSET = new Vector2(0, 0);

// Stable tuples for ToolNode position props — avoids new array refs on each render
// which would fight the useFrame lerp inside ToolNode.
const MAPS_POS:  [number, number, number] = [NODE_POSITIONS.maps.x,  NODE_POSITIONS.maps.y,  NODE_POSITIONS.maps.z];
const KIT_POS:   [number, number, number] = [NODE_POSITIONS.kit.x,   NODE_POSITIONS.kit.y,   NODE_POSITIONS.kit.z];
const BASE_POS:  [number, number, number] = [NODE_POSITIONS.base.x,  NODE_POSITIONS.base.y,  NODE_POSITIONS.base.z];
const SCOUT_POS: [number, number, number] = [NODE_POSITIONS.scout.x, NODE_POSITIONS.scout.y, NODE_POSITIONS.scout.z];

const MAPS_LIFE:  [number, number, number] = [TIMELINE_POSITIONS.maps.x,  TIMELINE_POSITIONS.maps.y,  TIMELINE_POSITIONS.maps.z];
const KIT_LIFE:   [number, number, number] = [TIMELINE_POSITIONS.kit.x,   TIMELINE_POSITIONS.kit.y,   TIMELINE_POSITIONS.kit.z];
const BASE_LIFE:  [number, number, number] = [TIMELINE_POSITIONS.base.x,  TIMELINE_POSITIONS.base.y,  TIMELINE_POSITIONS.base.z];
const SCOUT_LIFE: [number, number, number] = [TIMELINE_POSITIONS.scout.x, TIMELINE_POSITIONS.scout.y, TIMELINE_POSITIONS.scout.z];

// Per-tool lifecycle copy (storyboard S4 value props)
const MAPS_COPY  = 'Find your path before you commit';
const KIT_COPY   = 'Track, grow, and own your career in real-time';
const BASE_COPY  = "A safe space that's always there";
const SCOUT_COPY = 'Get what you earned — optimized, fast, confident';

function HubWorld() {
  const hoveredNode = usePortalStore((s) => s.hoveredNode);
  const goTo = usePortalStore((s) => s.goTo);
  const currentScene = usePortalStore((s) => s.currentScene);
  const isLifecycle = currentScene === 'lifecycle';

  const selectNode = useCallback(
    (scene: SceneName) => { goTo(scene); },
    [goTo]
  );

  return (
    <SceneGroup scenes={HUB_SCENES}>
      <AzimuthLogo3D />
      <CompassRing radius={8} activeNode={hoveredNode} visible={!isLifecycle} />
      <ToolNode geometry="dodeca" color={COLORS.AMBER_CORE} label="MAPS" subtitle="Pre-Enlistment"
        position={MAPS_POS} lifecyclePosition={MAPS_LIFE} lifecycleMode={isLifecycle}
        lifecycleCopy={MAPS_COPY}
        onSelect={() => selectNode('maps')} isActive={currentScene === 'maps'}
        rotationAxis="y" />
      <ToolNode geometry="cube" color={COLORS.CYAN_STRUCT} label="K.I.T." subtitle="Active Duty"
        position={KIT_POS} lifecyclePosition={KIT_LIFE} lifecycleMode={isLifecycle}
        lifecycleCopy={KIT_COPY}
        onSelect={() => selectNode('kit')} isActive={currentScene === 'kit'}
        rotationAxis="xy" />
      <ToolNode geometry="sphere" color={COLORS.CALM_PURPLE} label="BASE" subtitle="Wellness"
        position={BASE_POS} lifecyclePosition={BASE_LIFE} lifecycleMode={isLifecycle}
        lifecycleCopy={BASE_COPY}
        onSelect={() => selectNode('base')} isActive={currentScene === 'base'}
        rotationAxis="none" />
      <ToolNode geometry="octa" color={COLORS.SCOUT_BLUE} label="SCOUT" subtitle="Claims"
        position={SCOUT_POS} lifecyclePosition={SCOUT_LIFE} lifecycleMode={isLifecycle}
        lifecycleCopy={SCOUT_COPY}
        onSelect={() => selectNode('scout')} isActive={currentScene === 'scout'}
        rotationAxis="yz" />
    </SceneGroup>
  );
}

// ---------------------------------------------------------------------------
// Main Scene
// ---------------------------------------------------------------------------

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 1.5]}
      onCreated={({ gl }) => {
        gl.setClearColor('#0A0E1A');
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <SceneSetup />
      <CameraController />
      <ambientLight intensity={0.15} />

      {/* HUB: NOVA + compass + tool nodes — hidden outside hub scenes */}
      <HubWorld />

      {/* DEPTH GRID: internal scene visibility check */}
      <DepthGrid opacity={0.22} color="#00CED1" />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.3}
          intensity={0.8}
          radius={1.2}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={ZERO_OFFSET}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette darkness={0.4} offset={0.3} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
    </Canvas>
  );
}
