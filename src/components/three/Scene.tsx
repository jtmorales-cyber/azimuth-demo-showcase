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
      <ToolNode geometry="dodeca" color={COLORS.AMBER_CORE} label="MAPS" subtitle="Pre-Enlistment"
        position={[NODE_POSITIONS.maps.x, NODE_POSITIONS.maps.y, NODE_POSITIONS.maps.z]}
        onSelect={() => selectNode('maps')} isActive={currentScene === 'maps'} />
      <ToolNode geometry="cube" color={COLORS.CYAN_STRUCT} label="K.I.T." subtitle="Active Duty"
        position={[NODE_POSITIONS.kit.x, NODE_POSITIONS.kit.y, NODE_POSITIONS.kit.z]}
        onSelect={() => selectNode('kit')} isActive={currentScene === 'kit'} />
      <ToolNode geometry="sphere" color={COLORS.CALM_PURPLE} label="BASE" subtitle="Wellness"
        position={[NODE_POSITIONS.base.x, NODE_POSITIONS.base.y, NODE_POSITIONS.base.z]}
        onSelect={() => selectNode('base')} isActive={currentScene === 'base'} />
      <ToolNode geometry="octa" color={COLORS.SCOUT_BLUE} label="SCOUT" subtitle="Claims"
        position={[NODE_POSITIONS.scout.x, NODE_POSITIONS.scout.y, NODE_POSITIONS.scout.z]}
        onSelect={() => selectNode('scout')} isActive={currentScene === 'scout'} />
    </SceneGroup>
  );
}

// ---------------------------------------------------------------------------
// Main Scene
// Each component handles its own visibility via return null pattern:
//   BootSequence3D:  returns null when currentScene !== 'boot'
//   GauntletGeometry: returns null when currentScene !== 'gauntlet'
//   HubWorld: uses SceneGroup for hub/showcase scenes
//   DepthGrid: internal scene check
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

      {/* GAUNTLET: corridors — unmounts when not gauntlet */}
      <GauntletGeometry />

      {/* HUB: NOVA + compass + tool nodes — hidden outside hub scenes */}
      <HubWorld />

      {/* DEPTH GRID: internal scene visibility check */}
      <DepthGrid opacity={0.22} color="#00CED1" />

      <DynamicPostprocessing />
    </Canvas>
  );
}

/**
 * Postprocessing wrapper that boosts bloom intensity during the Impact Wall
 * scene for the visual crescendo effect.
 */
function DynamicPostprocessing() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const bloomIntensity = currentScene === 'impact' ? 1.4 : 0.8;

  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.3}
        intensity={bloomIntensity}
      />
      <Vignette darkness={0.4} offset={0.3} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
    </EffectComposer>
  );
}

