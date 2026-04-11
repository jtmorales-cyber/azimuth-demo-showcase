'use client';

import { useEffect, useCallback } from 'react';
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
      <ambientLight intensity={0.15} />
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
