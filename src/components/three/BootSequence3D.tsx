'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { COLORS } from '@/utils/constants';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BOOT_DURATION = 2.5; // seconds
const DAMPING = 3.5;       // compass settling damping coefficient
const INITIAL_SPIN = 12;   // initial angular velocity (rad/s)

// ---------------------------------------------------------------------------
// "A" monogram geometry — derived from SVG path
// Scaled to fit ~2 unit height, centered at origin
// ---------------------------------------------------------------------------

function createAShape(): THREE.Shape {
  const scale = 0.005; // SVG viewBox 500×480 → ~2.5×2.4 units
  const offsetX = -250; // center horizontally
  const offsetY = -240; // center vertically

  const s = (x: number, y: number) => ({
    x: (x + offsetX) * scale,
    y: -(y + offsetY) * scale, // flip Y
  });

  const shape = new THREE.Shape();

  // Outer A shape
  const p = s(190, 40);
  shape.moveTo(p.x, p.y);

  const points = [
    s(310, 40), s(475, 432), s(357, 432), s(331, 371),
    s(366, 371), s(260, 116), s(240, 116), s(134, 371),
    s(169, 371), s(143, 432), s(25, 432),
  ];
  points.forEach((pt) => shape.lineTo(pt.x, pt.y));
  shape.lineTo(p.x, p.y);

  // Horizontal band void (y=296, height=27) — crossbar cutout
  const hole1 = new THREE.Path();
  const h1 = [s(80, 296), s(420, 296), s(420, 323), s(80, 323)];
  hole1.moveTo(h1[0].x, h1[0].y);
  h1.slice(1).forEach((pt) => hole1.lineTo(pt.x, pt.y));
  hole1.lineTo(h1[0].x, h1[0].y);
  shape.holes.push(hole1);

  return shape;
}

// ---------------------------------------------------------------------------
// Compass settling physics — damped harmonic oscillator
// ---------------------------------------------------------------------------

function compassAngle(t: number): number {
  // θ(t) = A * e^(-γt) * cos(ωt) + drift*t
  const amplitude = INITIAL_SPIN;
  const decay = Math.exp(-DAMPING * t);
  const oscillation = Math.cos(8 * t); // natural frequency
  const drift = 0.15 * t; // slow processional drift
  return amplitude * decay * oscillation * 0.1 + drift;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface BootSequence3DProps {
  onComplete?: () => void;
}

export default function BootSequence3D({ onComplete }: BootSequence3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const aRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.PointLight>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const timeRef = useRef(0);
  const completedRef = useRef(false);

  // Animation progress (driven by GSAP)
  const progress = useRef({ value: 0 });

  // Extruded A geometry
  const aGeometry = useMemo(() => {
    const shape = createAShape();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.3,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
  }, []);

  // Start the 2.5s timeline after a brief render delay
  useEffect(() => {
    const timer = setTimeout(() => {
      gsap.to(progress.current, {
        value: 1,
        duration: BOOT_DURATION,
        ease: 'power2.inOut',
        onComplete: () => {
          completedRef.current = true;
          onComplete?.();
        },
      });
    }, 300); // 300ms delay so page renders before animation starts
    return () => clearTimeout(timer);
  }, [onComplete]);

  useFrame((_, delta) => {
    const t = progress.current.value;
    timeRef.current += delta;

    if (!groupRef.current) return;

    // Visibility is managed by SceneGroup wrapper in Scene.tsx

    // --- A monogram materialization ---
    if (aRef.current) {
      const mat = aRef.current.material as THREE.MeshPhysicalMaterial;

      // Opacity ramps up 0→1 over first 40% of timeline
      const materializeT = Math.min(1, t / 0.4);
      mat.opacity = materializeT;
      mat.transmission = 0.9 * materializeT;

      // Compass settling rotation
      aRef.current.rotation.y = compassAngle(timeRef.current);

      // Scatter at end: scale down and spread
      if (t > 0.85) {
        const scatterT = (t - 0.85) / 0.15;
        const s = 1 - scatterT * 0.5;
        aRef.current.scale.setScalar(s);
        mat.opacity = 1 - scatterT;
      }
    }

    // --- Amber core ignition ---
    if (coreRef.current) {
      // Core ignites at 20% of timeline, peaks at 60%
      const igniteT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
      coreRef.current.intensity = igniteT * 4.0;
      coreRef.current.distance = 15 + igniteT * 10;

      // Dim at end for transition
      if (t > 0.8) {
        const dimT = (t - 0.8) / 0.2;
        coreRef.current.intensity = 4.0 * (1 - dimT);
      }
    }

    // --- Core halo mesh ---
    if (haloRef.current) {
      const mat = haloRef.current.material as THREE.MeshStandardMaterial;
      const igniteT = Math.max(0, Math.min(1, (t - 0.2) / 0.3));
      mat.opacity = igniteT * 0.8;
      mat.emissiveIntensity = igniteT * 2.0;

      // Fade at end
      if (t > 0.8) {
        const dimT = (t - 0.8) / 0.2;
        mat.opacity = 0.8 * (1 - dimT);
      }
    }

    // --- Compass ring fade-in ---
    if (ringRef.current) {
      const mat = ringRef.current.material as THREE.MeshPhysicalMaterial;
      // Ring appears at 50% of timeline
      const ringT = Math.max(0, Math.min(1, (t - 0.5) / 0.3));
      mat.opacity = ringT * 0.7;

      // Counter-rotate slightly vs the A
      ringRef.current.rotation.y = -compassAngle(timeRef.current) * 0.3;

      // Fade at end
      if (t > 0.85) {
        const dimT = (t - 0.85) / 0.15;
        mat.opacity = 0.7 * (1 - dimT);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, 20]} scale={[4, 4, 4]}>
      {/* Crystalline "A" monogram — scaled 4x, positioned near boot camera */}
      <mesh ref={aRef} geometry={aGeometry} position={[0, 0, -0.15]}>
        <meshPhysicalMaterial
          color={COLORS.CYAN_STRUCT}
          transmission={0}
          thickness={0.5}
          roughness={0.1}
          ior={1.8}
          envMapIntensity={1.2}
          transparent
          opacity={0}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Amber core point light — triggers bloom */}
      <pointLight
        ref={coreRef}
        color={COLORS.AMBER_CORE}
        intensity={0}
        distance={20}
        decay={2}
      />

      {/* Core halo sphere */}
      <mesh ref={haloRef}>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshStandardMaterial
          color={COLORS.AMBER_CORE}
          emissive={COLORS.AMBER_CORE}
          emissiveIntensity={0}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>

      {/* Compass ring — thin torus */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.02, 8, 64]} />
        <meshPhysicalMaterial
          color={COLORS.CYAN_STRUCT}
          transmission={0.5}
          roughness={0.2}
          ior={1.5}
          transparent
          opacity={0}
          toneMapped={false}
          emissive={COLORS.CYAN_STRUCT}
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
}
