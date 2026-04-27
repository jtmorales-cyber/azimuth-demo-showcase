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
import BootSequence3D from './BootSequence3D';
import DepthGrid from './DepthGrid';
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
  useEffect(() => { camera.layers.enableAll(); }, [camera]);
  return null;
}

// ---------------------------------------------------------------------------
// Hub content — NOVA + tool nodes + compass ring
// Only visible during hub and showcase scenes via SceneGroup
// ---------------------------------------------------------------------------

const HUB_SCENES: SceneName[] = ['hub', 'maps', 'kit', 'base', 'scout'];

// Stable Vector2 instance — avoids new allocation on every render
const ZERO_OFFSET = new Vector2(0, 0);

function HubWorld() {
  const hoveredNode = usePortalStore((s) => s.hoveredNode);
  const goTo = usePortalStore((s) => s.goTo);
  const currentScene = usePortalStore((s) => s.currentScene);

  const selectNode = useCallback(
    (scene: SceneName) => { goTo(scene); },
    [goTo]
  );

  return (
    <SceneGroup scenes={HUB_SCENES}>
      <NOVASphere position={[0, 0, 0]} />
      <CompassRing radius={8} activeNode={hoveredNode} />
      <ToolNode geometry="dodeca" color={COLORS.AMBER_CORE} label="MAPS" subtitle="Pre-Enlistment"
        position={[NODE_POSITIONS.maps.x, NODE_POSITIONS.maps.y, NODE_POSITIONS.maps.z]}
        onSelect={() => selectNode('maps')} isActive={currentScene === 'maps'}
        rotationAxis="y" />
      <ToolNode geometry="cube" color={COLORS.CYAN_STRUCT} label="K.I.T." subtitle="Active Duty"
        position={[NODE_POSITIONS.kit.x, NODE_POSITIONS.kit.y, NODE_POSITIONS.kit.z]}
        onSelect={() => selectNode('kit')} isActive={currentScene === 'kit'}
        rotationAxis="xy" />
      <ToolNode geometry="sphere" color={COLORS.CALM_PURPLE} label="BASE" subtitle="Wellness"
        position={[NODE_POSITIONS.base.x, NODE_POSITIONS.base.y, NODE_POSITIONS.base.z]}
        onSelect={() => selectNode('base')} isActive={currentScene === 'base'}
        rotationAxis="none" />
      <ToolNode geometry="octa" color={COLORS.SCOUT_BLUE} label="SCOUT" subtitle="Claims"
        position={[NODE_POSITIONS.scout.x, NODE_POSITIONS.scout.y, NODE_POSITIONS.scout.z]}
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
      onCreated={({ gl }) => {
        gl.setClearColor('#0A0E1A');
      }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <SceneSetup />
      <CameraController />
      <ambientLight intensity={0.15} />

      {/* BOOT: crystalline A monogram — unmounts when not boot */}
      <BootSequence3D />

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
