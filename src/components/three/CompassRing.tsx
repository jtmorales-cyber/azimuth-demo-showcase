'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { COLORS, EASING } from '@/utils/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToolNode = 'maps' | 'kit' | 'base' | 'scout';

interface CompassRingProps {
  activeNode?: ToolNode | null;
  radius?: number;
}

// ---------------------------------------------------------------------------
// Node → angle mapping (radians, counter-clockwise from +X axis)
// Matches node positions in flightPaths.ts
// ---------------------------------------------------------------------------

const NODE_ANGLES: Record<ToolNode, number> = {
  maps: 0,                       // +X → 0°
  kit: Math.PI / 2,              // +Z → 90°
  base: Math.PI,                 // -X → 180°
  scout: (3 * Math.PI) / 2,     // -Z → 270°
};

// ---------------------------------------------------------------------------
// Ring configuration
// ---------------------------------------------------------------------------

const RING_CONFIG = [
  { radiusOffset: 0, thickness: 0.04, speed: 0.001, opacity: 0.9 },    // outer — degree markings
  { radiusOffset: -0.8, thickness: 0.03, speed: -0.0012, opacity: 0.6 }, // middle — counter-rotate
  { radiusOffset: -1.6, thickness: 0.025, speed: 0.0015, opacity: 0.4 }, // inner — fastest
] as const;

// Degree marking intervals
const CARDINAL_DEGREES = [0, 90, 180, 270];
const TICK_INTERVAL = 10; // tick every 10°
const TICK_COUNT = 360 / TICK_INTERVAL;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TickMarks({ radius }: { radius: number }) {
  const ticks = useMemo(() => {
    const result: Array<{ angle: number; length: number; isCardinal: boolean }> = [];
    for (let i = 0; i < TICK_COUNT; i++) {
      const deg = i * TICK_INTERVAL;
      const isCardinal = CARDINAL_DEGREES.includes(deg);
      result.push({
        angle: (deg * Math.PI) / 180,
        length: isCardinal ? 0.25 : 0.12,
        isCardinal,
      });
    }
    return result;
  }, []);

  return (
    <group>
      {ticks.map((tick, i) => {
        const innerR = radius - tick.length;
        const outerR = radius;
        const cos = Math.cos(tick.angle);
        const sin = Math.sin(tick.angle);

        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([
                  cos * innerR, 0, sin * innerR,
                  cos * outerR, 0, sin * outerR,
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={COLORS.CYAN_STRUCT}
              transparent
              opacity={tick.isCardinal ? 0.8 : 0.35}
            />
          </line>
        );
      })}
    </group>
  );
}

function DegreeLabels({ radius }: { radius: number }) {
  const labels = useMemo(() => {
    return CARDINAL_DEGREES.map((deg) => {
      const angle = (deg * Math.PI) / 180;
      const labelR = radius + 0.4;
      return {
        deg,
        text: `${deg}°`,
        x: Math.cos(angle) * labelR,
        z: Math.sin(angle) * labelR,
        angle,
      };
    });
  }, [radius]);

  return (
    <group>
      {labels.map((label) => (
        <Text
          key={label.deg}
          position={[label.x, 0.05, label.z]}
          rotation={[-Math.PI / 2, 0, -label.angle + Math.PI / 2]}
          fontSize={0.28}
          color={COLORS.CYAN_STRUCT}
          anchorX="center"
          anchorY="middle"
          font={undefined}
          outlineWidth={0}
          fillOpacity={0.7}
        >
          {label.text}
        </Text>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function CompassRing({
  activeNode = null,
  radius = 8,
}: CompassRingProps) {
  const outerGroupRef = useRef<THREE.Group>(null);
  const middleRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  // Track continuous rotation offset for outer ring
  const outerRotation = useRef(0);
  // Track alignment target (set by GSAP)
  const alignmentTarget = useRef<{ value: number }>({ value: 0 });
  const isAligning = useRef(false);

  // GSAP alignment when activeNode changes
  useEffect(() => {
    if (!activeNode) return;

    const targetAngle = -NODE_ANGLES[activeNode]; // negative to rotate node to "forward"
    isAligning.current = true;

    gsap.to(alignmentTarget.current, {
      value: targetAngle,
      duration: 1.5,
      ease: EASING.CAMERA_ORBIT, // power2.inOut equivalent feel
      onComplete: () => {
        isAligning.current = false;
      },
    });
  }, [activeNode]);

  useFrame(() => {
    // Outer ring: continuous rotation + alignment offset
    if (outerGroupRef.current) {
      if (!isAligning.current) {
        outerRotation.current += RING_CONFIG[0].speed;
      }
      outerGroupRef.current.rotation.y = outerRotation.current + alignmentTarget.current.value;
    }

    // Middle ring: counter-rotate
    if (middleRef.current) {
      middleRef.current.rotation.y += RING_CONFIG[1].speed;
    }

    // Inner ring: fastest rotation
    if (innerRef.current) {
      innerRef.current.rotation.y += RING_CONFIG[2].speed;
    }
  });

  const outerR = radius + RING_CONFIG[0].radiusOffset;
  const middleR = radius + RING_CONFIG[1].radiusOffset;
  const innerR = radius + RING_CONFIG[2].radiusOffset;

  return (
    <group>
      {/* Outer ring — degree markings, tick marks, labels */}
      <group ref={outerGroupRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[outerR, RING_CONFIG[0].thickness, 16, 128]} />
          <meshPhysicalMaterial
            color={COLORS.CYAN_STRUCT}
            transmission={0.7}
            thickness={0.3}
            roughness={0.15}
            ior={1.5}
            transparent
            opacity={RING_CONFIG[0].opacity}
            toneMapped={false}
            emissive={COLORS.CYAN_STRUCT}
            emissiveIntensity={0.15}
          />
        </mesh>
        <TickMarks radius={outerR} />
        <DegreeLabels radius={outerR} />
      </group>

      {/* Middle ring — counter-rotating, thinner */}
      <mesh ref={middleRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[middleR, RING_CONFIG[1].thickness, 12, 96]} />
        <meshPhysicalMaterial
          color={COLORS.CYAN_STRUCT}
          transmission={0.7}
          thickness={0.2}
          roughness={0.2}
          ior={1.5}
          transparent
          opacity={RING_CONFIG[1].opacity}
          toneMapped={false}
          emissive={COLORS.CYAN_STRUCT}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Inner ring — fastest, most subtle */}
      <mesh ref={innerRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[innerR, RING_CONFIG[2].thickness, 8, 80]} />
        <meshPhysicalMaterial
          color={COLORS.CYAN_STRUCT}
          transmission={0.7}
          thickness={0.15}
          roughness={0.25}
          ior={1.5}
          transparent
          opacity={RING_CONFIG[2].opacity}
          toneMapped={false}
          emissive={COLORS.CYAN_STRUCT}
          emissiveIntensity={0.05}
        />
      </mesh>
    </group>
  );
}
