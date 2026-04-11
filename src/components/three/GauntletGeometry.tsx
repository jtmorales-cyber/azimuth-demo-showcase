'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { usePortalStore } from '@/state/portalStore';

// ---------------------------------------------------------------------------
// Constants — Gauntlet Exception Rule (grayscale only)
// Adapted from reference azimuth-portal GauntletCorridor
// ---------------------------------------------------------------------------

const CORRIDOR_WIDTH = 3;
const CORRIDOR_HEIGHT = 2.7;
const SEGMENT_LENGTH = 10;
const NUM_SEGMENTS = 5;

const SURFACE_COLOR = '#6B6B6B';
const DARK_COLOR = '#3A3A3A';
const LIGHT_COLOR = '#C8C8C8';
const TRIM_COLOR = '#555555';

const DOOR_NUMBERS = ['1143', '207B', '4', '88A', '16C', '3301', '7', '42F', '999', '0'];
const BRANCH_ANGLES = [30, 45, 120, -30, -45, 150];

// ---------------------------------------------------------------------------
// Segment data
// ---------------------------------------------------------------------------

interface SegmentData {
  position: THREE.Vector3;
  branchAngle: number;
  doorNumberLeft: string;
  doorNumberRight: string;
  hasBranchLeft: boolean;
  hasBranchRight: boolean;
  slope: number;
}

function generateSegment(index: number, zOffset: number): SegmentData {
  const seed = index * 137.5;
  return {
    position: new THREE.Vector3(0, 0, zOffset),
    branchAngle: BRANCH_ANGLES[index % BRANCH_ANGLES.length],
    doorNumberLeft: DOOR_NUMBERS[(index * 2) % DOOR_NUMBERS.length],
    doorNumberRight: DOOR_NUMBERS[(index * 2 + 1) % DOOR_NUMBERS.length],
    hasBranchLeft: Math.sin(seed) > 0.3,
    hasBranchRight: Math.sin(seed + 50) > 0.5,
    slope: Math.sin(seed + 100) * 0.02,
  };
}

function createInitialSegments(): SegmentData[] {
  return Array.from({ length: NUM_SEGMENTS }, (_, i) =>
    generateSegment(i, -i * SEGMENT_LENGTH)
  );
}

// ---------------------------------------------------------------------------
// CorridorSegment — one unit of corridor with walls, doors, lights, branches
// ---------------------------------------------------------------------------

function CorridorSegment({ segment }: { segment: SegmentData }) {
  const halfW = CORRIDOR_WIDTH / 2;
  const halfH = CORRIDOR_HEIGHT / 2;

  return (
    <group position={segment.position} rotation={[segment.slope, 0, 0]}>
      {/* Floor */}
      <mesh position={[0, -halfH, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CORRIDOR_WIDTH, SEGMENT_LENGTH]} />
        <meshStandardMaterial color={DARK_COLOR} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, halfH, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[CORRIDOR_WIDTH, SEGMENT_LENGTH]} />
        <meshStandardMaterial color={SURFACE_COLOR} roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Ceiling grid lines */}
      {[-1, 0, 1].map((x) => (
        <mesh key={`gx-${x}`} position={[x, halfH - 0.01, 0]}>
          <boxGeometry args={[0.02, 0.01, SEGMENT_LENGTH]} />
          <meshStandardMaterial color={DARK_COLOR} roughness={0.8} />
        </mesh>
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`gz-${i}`} position={[0, halfH - 0.01, -SEGMENT_LENGTH / 2 + i * (SEGMENT_LENGTH / 4)]}>
          <boxGeometry args={[CORRIDOR_WIDTH, 0.01, 0.02]} />
          <meshStandardMaterial color={DARK_COLOR} roughness={0.8} />
        </mesh>
      ))}

      {/* Left wall */}
      <mesh position={[-halfW, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[SEGMENT_LENGTH, CORRIDOR_HEIGHT]} />
        <meshStandardMaterial color={SURFACE_COLOR} roughness={0.92} metalness={0.05} />
      </mesh>

      {/* Right wall */}
      <mesh position={[halfW, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[SEGMENT_LENGTH, CORRIDOR_HEIGHT]} />
        <meshStandardMaterial color={SURFACE_COLOR} roughness={0.92} metalness={0.05} />
      </mesh>

      {/* Baseboard trim */}
      <mesh position={[-halfW + 0.01, -halfH + 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[SEGMENT_LENGTH, 0.12]} />
        <meshStandardMaterial color={DARK_COLOR} roughness={0.85} />
      </mesh>
      <mesh position={[halfW - 0.01, -halfH + 0.06, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[SEGMENT_LENGTH, 0.12]} />
        <meshStandardMaterial color={DARK_COLOR} roughness={0.85} />
      </mesh>

      {/* Chair rail / form line */}
      <mesh position={[-halfW + 0.01, 0.1, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[SEGMENT_LENGTH, 0.02, 0.005]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.8} />
      </mesh>
      <mesh position={[halfW - 0.01, 0.1, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[SEGMENT_LENGTH, 0.02, 0.005]} />
        <meshStandardMaterial color={TRIM_COLOR} roughness={0.8} />
      </mesh>

      {/* Left door */}
      <group position={[-halfW + 0.01, -0.2, -1]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 2.1]} />
          <meshStandardMaterial color={DARK_COLOR} roughness={0.85} />
        </mesh>
        <mesh position={[0.01, 0.5, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color={LIGHT_COLOR} emissive={LIGHT_COLOR} emissiveIntensity={0.15} transparent opacity={0.3} />
        </mesh>
        <Text position={[0.02, 0.9, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.12} color={LIGHT_COLOR} anchorX="center">
          {segment.doorNumberLeft}
        </Text>
      </group>

      {/* Right door */}
      <group position={[halfW - 0.01, -0.2, 2]}>
        <mesh rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 2.1]} />
          <meshStandardMaterial color={DARK_COLOR} roughness={0.85} />
        </mesh>
        <mesh position={[-0.01, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial color={LIGHT_COLOR} emissive={LIGHT_COLOR} emissiveIntensity={0.15} transparent opacity={0.3} />
        </mesh>
        <Text position={[-0.02, 0.9, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.12} color={LIGHT_COLOR} anchorX="center">
          {segment.doorNumberRight}
        </Text>
      </group>

      {/* Branch corridor stubs — BackSide box so you see the interior */}
      {segment.hasBranchLeft && (
        <group position={[-halfW, 0, 3]} rotation={[0, THREE.MathUtils.degToRad(180 - segment.branchAngle), 0]}>
          <mesh position={[0, 0, -2]}>
            <boxGeometry args={[2, CORRIDOR_HEIGHT, 4]} />
            <meshStandardMaterial color={SURFACE_COLOR} roughness={0.9} metalness={0.1} side={THREE.BackSide} />
          </mesh>
        </group>
      )}
      {segment.hasBranchRight && (
        <group position={[halfW, 0, -2]} rotation={[0, THREE.MathUtils.degToRad(segment.branchAngle), 0]}>
          <mesh position={[0, 0, -2]}>
            <boxGeometry args={[2, CORRIDOR_HEIGHT, 4]} />
            <meshStandardMaterial color={SURFACE_COLOR} roughness={0.9} metalness={0.1} side={THREE.BackSide} />
          </mesh>
        </group>
      )}

      {/* Fluorescent light strips — two per segment with point lights */}
      {[-0.8, 0.8].map((x) => (
        <group key={`fl-${x}`}>
          <mesh position={[x, halfH - 0.04, 0]}>
            <boxGeometry args={[0.2, 0.04, SEGMENT_LENGTH * 0.85]} />
            <meshStandardMaterial color="#4A4A4A" roughness={0.7} metalness={0.3} />
          </mesh>
          <mesh position={[x, halfH - 0.07, 0]}>
            <boxGeometry args={[0.08, 0.015, SEGMENT_LENGTH * 0.8]} />
            <meshStandardMaterial color={LIGHT_COLOR} emissive={LIGHT_COLOR} emissiveIntensity={1.2} />
          </mesh>
          <pointLight position={[x, halfH - 0.12, -SEGMENT_LENGTH * 0.25]} color={LIGHT_COLOR} intensity={0.5} distance={4} decay={2} />
          <pointLight position={[x, halfH - 0.12, SEGMENT_LENGTH * 0.25]} color={LIGHT_COLOR} intensity={0.5} distance={4} decay={2} />
        </group>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main GauntletGeometry — returns null when not active
// Camera drift is handled by scroll-driven CameraController (not internal)
// ---------------------------------------------------------------------------

export default function GauntletGeometry() {
  const groupRef = useRef<THREE.Group>(null);
  const segmentIndexRef = useRef(NUM_SEGMENTS);

  const currentScene = usePortalStore((s) => s.currentScene);
  const scrollProgress = usePortalStore((s) => s.scrollProgress);

  const [segments, setSegments] = useState<SegmentData[]>(createInitialSegments);

  // Reset segments on gauntlet entry
  useEffect(() => {
    if (currentScene === 'gauntlet') {
      segmentIndexRef.current = NUM_SEGMENTS;
      setSegments(createInitialSegments());
    }
  }, [currentScene]);

  // Recycle segments based on camera Z (derived from scroll)
  useFrame(() => {
    if (currentScene !== 'gauntlet') return;

    // Camera Z: scroll 0.05→0.20 maps to Z 0→-30 (approximate)
    const gauntletT = Math.max(0, Math.min(1, (scrollProgress - 0.05) / 0.15));
    const cameraZ = -gauntletT * 30;

    let needsUpdate = false;
    const newSegs = [...segments];
    for (let i = 0; i < newSegs.length; i++) {
      if (newSegs[i].position.z > cameraZ + SEGMENT_LENGTH) {
        const frontZ = Math.min(...newSegs.map((s) => s.position.z)) - SEGMENT_LENGTH;
        segmentIndexRef.current++;
        newSegs[i] = generateSegment(segmentIndexRef.current, frontZ);
        needsUpdate = true;
      }
    }
    if (needsUpdate) setSegments(newSegs);
  });

  // === CONDITIONAL RETURN — completely unmount when not gauntlet ===
  if (currentScene !== 'gauntlet') return null;

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.05} color={SURFACE_COLOR} />
      {segments.map((segment) => (
        <CorridorSegment key={`seg-${segment.position.z.toFixed(1)}`} segment={segment} />
      ))}
    </group>
  );
}
