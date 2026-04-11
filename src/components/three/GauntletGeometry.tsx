'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { usePortalStore, type SceneName } from '@/state/portalStore';

// ---------------------------------------------------------------------------
// Constants — Gauntlet Exception Rule (grayscale only)
// ---------------------------------------------------------------------------

const SURFACE_COLOR = '#6B6B6B';   // --gauntlet-surface
const DOOR_COLOR = '#5A5A5A';      // slightly darker for doors
const LIGHT_COLOR = '#C8C8C8';     // --gauntlet-light
const WINDOW_COLOR = '#3A3A3A';    // wire-glass (dark with hint of glow)

const CORRIDOR_WIDTH = 4;
const CORRIDOR_HEIGHT = 3;
const SEGMENT_DEPTH = 12;
const SEGMENT_COUNT = 8;
const WALL_THICKNESS = 0.15;

// Door numbers — nonsensical, bureaucratic
const DOOR_NUMBERS = [
  '1143', '207B', '4', '88-A', '3301', '19', '742', '6F',
  '2', '1077', '55C', '308', '91', '4420', '7', '163B',
  '512', '23', '900', '1', '247D', '66', '3088', '14-R',
];

// Branch angles (degrees) — non-standard, Escher-like
const BRANCH_ANGLES = [30, 70, 110, -30, -70, -110];

// Scenes where gauntlet is visible
const VISIBLE_SCENES = new Set<SceneName>(['boot', 'gauntlet']);

// ---------------------------------------------------------------------------
// Shared materials (created once, reused across all segments)
// ---------------------------------------------------------------------------

const concreteMaterial = new THREE.MeshStandardMaterial({
  color: SURFACE_COLOR,
  roughness: 0.9,
  metalness: 0.1,
  side: THREE.DoubleSide,
});

const doorMaterial = new THREE.MeshStandardMaterial({
  color: DOOR_COLOR,
  roughness: 0.85,
  metalness: 0.05,
  side: THREE.DoubleSide,
});

const lightMaterial = new THREE.MeshStandardMaterial({
  color: LIGHT_COLOR,
  emissive: LIGHT_COLOR,
  emissiveIntensity: 0.3,
  roughness: 0.5,
  metalness: 0,
});

const windowMaterial = new THREE.MeshStandardMaterial({
  color: WINDOW_COLOR,
  emissive: LIGHT_COLOR,
  emissiveIntensity: 0.09,
  roughness: 0.3,
  metalness: 0.1,
  transparent: true,
  opacity: 0.6,
});

// ---------------------------------------------------------------------------
// Segment data type
// ---------------------------------------------------------------------------

interface SegmentConfig {
  zPosition: number;
  branchAngle: number;
  branchSide: 1 | -1;
  doorNumbers: string[];
  hasWindow: boolean[];
}

function randomConfig(z: number, seed: number): SegmentConfig {
  const rng = (offset: number) => {
    const x = Math.sin((seed + offset) * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };

  const angleIdx = Math.floor(rng(0) * BRANCH_ANGLES.length);
  const branchSide = rng(1) > 0.5 ? 1 : -1;

  const numStart = Math.floor(rng(2) * (DOOR_NUMBERS.length - 3));
  const doorNumbers = [
    DOOR_NUMBERS[numStart % DOOR_NUMBERS.length],
    DOOR_NUMBERS[(numStart + 1) % DOOR_NUMBERS.length],
    DOOR_NUMBERS[(numStart + 2) % DOOR_NUMBERS.length],
  ];

  const hasWindow = [rng(3) > 0.6, rng(4) > 0.7, rng(5) > 0.65];

  return {
    zPosition: z,
    branchAngle: BRANCH_ANGLES[angleIdx],
    branchSide: branchSide as 1 | -1,
    doorNumbers,
    hasWindow,
  };
}

// ---------------------------------------------------------------------------
// CorridorSegment — one 12m unit of corridor
// ---------------------------------------------------------------------------

function CorridorSegment({ config }: { config: SegmentConfig }) {
  const hw = CORRIDOR_WIDTH / 2;
  const hh = CORRIDOR_HEIGHT / 2;
  const hd = SEGMENT_DEPTH / 2;

  const branchRad = (config.branchAngle * Math.PI) / 180;
  const bx = config.branchSide * hw;

  return (
    <group position={[0, hh, config.zPosition]}>
      {/* Floor */}
      <mesh position={[0, -hh, 0]} rotation={[-Math.PI / 2, 0, 0]} material={concreteMaterial}>
        <planeGeometry args={[CORRIDOR_WIDTH, SEGMENT_DEPTH]} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, hh, 0]} rotation={[Math.PI / 2, 0, 0]} material={concreteMaterial}>
        <planeGeometry args={[CORRIDOR_WIDTH, SEGMENT_DEPTH]} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-hw, 0, 0]} rotation={[0, Math.PI / 2, 0]} material={concreteMaterial}>
        <planeGeometry args={[SEGMENT_DEPTH, CORRIDOR_HEIGHT]} />
      </mesh>

      {/* Right wall */}
      <mesh position={[hw, 0, 0]} rotation={[0, -Math.PI / 2, 0]} material={concreteMaterial}>
        <planeGeometry args={[SEGMENT_DEPTH, CORRIDOR_HEIGHT]} />
      </mesh>

      {/* Ceiling grid ribs — 4 cross-ribs per segment */}
      {[0, 1, 2, 3].map((i) => {
        const ribZ = -hd + (i + 0.5) * (SEGMENT_DEPTH / 4);
        return (
          <mesh key={`rib-${i}`} position={[0, hh - 0.02, ribZ]} material={concreteMaterial}>
            <boxGeometry args={[CORRIDOR_WIDTH, 0.04, 0.08]} />
          </mesh>
        );
      })}

      {/* Fluorescent light strips — 2 per segment */}
      {[0, 1].map((i) => {
        const stripZ = -hd + (i + 0.5) * (SEGMENT_DEPTH / 2);
        return (
          <mesh key={`light-${i}`} position={[0, hh - 0.06, stripZ]} material={lightMaterial}>
            <boxGeometry args={[2.4, 0.03, 0.12]} />
          </mesh>
        );
      })}

      {/* Doors — 3 per segment, alternating sides */}
      {config.doorNumbers.map((num, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const doorZ = -hd + 2 + i * 3.5;
        const doorX = side * (hw - 0.01);
        const doorRotY = side === -1 ? Math.PI / 2 : -Math.PI / 2;

        return (
          <group key={`door-${i}`} position={[doorX, -0.2, doorZ]}>
            {/* Door panel */}
            <mesh rotation={[0, doorRotY, 0]} material={doorMaterial}>
              <planeGeometry args={[0.9, 2.2]} />
            </mesh>

            {/* Door frame — top */}
            <mesh position={[0, 1.15, 0]} rotation={[0, doorRotY, 0]} material={concreteMaterial}>
              <boxGeometry args={[1.0, 0.08, 0.05]} />
            </mesh>

            {/* Wire-glass window (if applicable) */}
            {config.hasWindow[i] && (
              <mesh
                position={[side * 0.01, 0.5, 0]}
                rotation={[0, doorRotY, 0]}
                material={windowMaterial}
              >
                <planeGeometry args={[0.35, 0.25]} />
              </mesh>
            )}

            {/* Door number */}
            <Text
              position={[side * 0.02, 1.3, 0]}
              rotation={[0, doorRotY, 0]}
              fontSize={0.12}
              color={LIGHT_COLOR}
              anchorX="center"
              anchorY="middle"
              fillOpacity={0.5}
            >
              {num}
            </Text>
          </group>
        );
      })}

      {/* Branch corridor stub */}
      <group
        position={[bx, 0, 0]}
        rotation={[0, branchRad * config.branchSide, 0]}
      >
        {/* Branch floor */}
        <mesh position={[config.branchSide * 2, -hh, 0]} rotation={[-Math.PI / 2, 0, 0]} material={concreteMaterial}>
          <planeGeometry args={[2.5, 6]} />
        </mesh>
        {/* Branch ceiling */}
        <mesh position={[config.branchSide * 2, hh, 0]} rotation={[Math.PI / 2, 0, 0]} material={concreteMaterial}>
          <planeGeometry args={[2.5, 6]} />
        </mesh>
        {/* Branch far wall (dead end visible) */}
        <mesh position={[config.branchSide * 2, 0, -3]} material={concreteMaterial}>
          <planeGeometry args={[2.5, CORRIDOR_HEIGHT]} />
        </mesh>
        {/* Branch side wall */}
        <mesh
          position={[config.branchSide * 3.25, 0, 0]}
          rotation={[0, -config.branchSide * Math.PI / 2, 0]}
          material={concreteMaterial}
        >
          <planeGeometry args={[6, CORRIDOR_HEIGHT]} />
        </mesh>
        {/* Branch light strip */}
        <mesh position={[config.branchSide * 2, hh - 0.06, -1]} material={lightMaterial}>
          <boxGeometry args={[1.2, 0.03, 0.1]} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main GauntletGeometry — manages segment pool and recycling
// ---------------------------------------------------------------------------

export default function GauntletGeometry() {
  const groupRef = useRef<THREE.Group>(null);
  const visibilityRef = useRef(0);

  // Segment state — useState so React re-renders on recycle
  const [segments, setSegments] = useState<SegmentConfig[]>(() =>
    Array.from({ length: SEGMENT_COUNT }, (_, i) =>
      randomConfig(20 - i * SEGMENT_DEPTH, i)
    )
  );

  const recycleCounter = useRef(SEGMENT_COUNT);

  useFrame(() => {
    const { currentScene, scrollProgress } = usePortalStore.getState();

    // Scene visibility — fade in/out
    const targetVis = VISIBLE_SCENES.has(currentScene) ? 1 : 0;
    visibilityRef.current += (targetVis - visibilityRef.current) * 0.08;

    if (!groupRef.current) return;

    if (visibilityRef.current < 0.001) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    // Estimate camera Z from scroll progress (gauntlet range 0.05–0.20)
    const gauntletProgress = Math.max(0, Math.min(1, (scrollProgress - 0.05) / 0.15));
    const cameraZ = 20 - gauntletProgress * 30;

    // Check if any segment needs recycling
    let needsUpdate = false;
    const next = [...segments];
    for (let i = 0; i < next.length; i++) {
      const segEnd = next[i].zPosition + SEGMENT_DEPTH;
      if (segEnd < cameraZ - SEGMENT_DEPTH) {
        const furthestZ = Math.min(...next.map((s) => s.zPosition));
        next[i] = randomConfig(furthestZ - SEGMENT_DEPTH, recycleCounter.current++);
        needsUpdate = true;
      }
    }
    if (needsUpdate) {
      setSegments(next);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ambient fill lights — 2 RectAreaLights for general corridor illumination */}
      <rectAreaLight
        color={LIGHT_COLOR}
        intensity={0.6}
        width={CORRIDOR_WIDTH}
        height={0.3}
        position={[0, CORRIDOR_HEIGHT - 0.1, 10]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <rectAreaLight
        color={LIGHT_COLOR}
        intensity={0.6}
        width={CORRIDOR_WIDTH}
        height={0.3}
        position={[0, CORRIDOR_HEIGHT - 0.1, -5]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Corridor segments — keyed by zPosition for stable React identity */}
      {segments.map((config) => (
        <CorridorSegment key={`seg-${config.zPosition}`} config={config} />
      ))}
    </group>
  );
}
