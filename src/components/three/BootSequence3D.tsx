'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { COLORS } from '@/utils/constants';
import { usePortalStore } from '@/state/portalStore';

// Ported from azimuth-portal/src/scenes/BootSequence.tsx (mm_idst_demo).
// Adapted: default export (Scene.tsx imports default), no auto-transition
// to gauntlet — boot holds on the 'done' phase until the user taps the
// overlay (BootSequence.tsx HTML), which calls goTo('hub').

const PARTICLE_COUNT = 500;

const PHASE_BLACK = 500;
const PHASE_RESOLVE = 1000;
const PHASE_HOLD = 500;
const PHASE_SCATTER = 500;

type BootPhase = 'black' | 'resolve' | 'hold' | 'scatter' | 'done';

export default function BootSequence3D() {
  const currentScene = usePortalStore((s) => s.currentScene);

  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const [phase, setPhase] = useState<BootPhase>('black');
  const opacityRef = useRef({ value: 0 });
  const lightIntensityRef = useRef({ value: 0 });

  const { particlePositions, particleVelocities } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 0.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 2 + Math.random() * 4;
      vel[i * 3]     = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vel[i * 3 + 2] = Math.cos(phi) * speed;
    }

    return { particlePositions: pos, particleVelocities: vel };
  }, []);

  useEffect(() => {
    if (currentScene !== 'boot') return;

    setPhase('black');
    opacityRef.current.value = 0;
    lightIntensityRef.current.value = 0;

    const timeline = gsap.timeline();

    // Phase 1: Black
    timeline.to({}, {
      duration: PHASE_BLACK / 1000,
      onComplete: () => setPhase('resolve'),
    });

    // Phase 2: Resolve — monogram fades in
    timeline.to(opacityRef.current, {
      value: 1,
      duration: PHASE_RESOLVE / 1000,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (meshRef.current) {
          const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
          mat.opacity = opacityRef.current.value;
        }
      },
    });

    // Amber core light ignites partway through resolve
    timeline.to(lightIntensityRef.current, {
      value: 3,
      duration: (PHASE_RESOLVE / 1000) * 0.6,
      ease: 'power3.in',
      onUpdate: () => {
        if (lightRef.current) {
          lightRef.current.intensity = lightIntensityRef.current.value;
        }
      },
    }, `-=${(PHASE_RESOLVE / 1000) * 0.4}`);

    // Phase 3: Hold
    timeline.to({}, {
      duration: PHASE_HOLD / 1000,
      onComplete: () => setPhase('scatter'),
    });

    // Phase 4: Scatter — monogram fades out, particles burst
    timeline.to(opacityRef.current, {
      value: 0,
      duration: PHASE_SCATTER / 1000,
      ease: 'power2.in',
      onUpdate: () => {
        if (meshRef.current) {
          const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
          mat.opacity = opacityRef.current.value;
        }
      },
    });

    timeline.to(lightIntensityRef.current, {
      value: 0,
      duration: PHASE_SCATTER / 1000,
      onUpdate: () => {
        if (lightRef.current) {
          lightRef.current.intensity = lightIntensityRef.current.value;
        }
      },
    }, `-=${PHASE_SCATTER / 1000}`);

    // Boot animation complete — stay on boot scene until user taps overlay
    timeline.call(() => {
      setPhase('done');
    });

    return () => {
      timeline.kill();
    };
  }, [currentScene]);

  useFrame((_, delta) => {
    if (phase !== 'scatter' || !particlesRef.current) return;

    const posAttr = particlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posArray[i3]     += particleVelocities[i3]     * delta;
      posArray[i3 + 1] += particleVelocities[i3 + 1] * delta;
      posArray[i3 + 2] += particleVelocities[i3 + 2] * delta;
    }
    posAttr.needsUpdate = true;
  });

  if (currentScene !== 'boot') return null;

  return (
    <group>
      {/* Crystalline "A" monogram — 3-sided cone (pyramid) */}
      <mesh ref={meshRef} scale={1.5}>
        <coneGeometry args={[0.6, 1.2, 3]} />
        <meshPhysicalMaterial
          color={COLORS.CYAN_STRUCT}
          transmission={0.85}
          thickness={0.8}
          roughness={0.1}
          ior={1.8}
          envMapIntensity={1.2}
          transparent
          opacity={0}
          emissive={COLORS.AMBER_CORE}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Amber core light inside the monogram */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0]}
        color={COLORS.AMBER_CORE}
        intensity={0}
        distance={10}
        decay={2}
      />

      {/* Scatter particles — only visible during scatter phase */}
      {phase === 'scatter' && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particlePositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color={COLORS.AMBER_CORE}
            size={0.03}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}
