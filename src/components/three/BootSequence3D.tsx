'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { COLORS } from '@/utils/constants';
import { usePortalStore } from '@/state/portalStore';

// ---------------------------------------------------------------------------
// Config — adapted from reference azimuth-portal BootSequence
// ---------------------------------------------------------------------------

const PHASE_BLACK = 500;    // ms
const PHASE_RESOLVE = 1200; // ms — logo fades in
const PHASE_HOLD = 600;     // ms — logo visible
const PHASE_SCATTER = 500;  // ms — particles burst out

const PARTICLE_COUNT = 500;

type BootPhase = 'black' | 'resolve' | 'hold' | 'scatter' | 'done';

// ---------------------------------------------------------------------------
// "A" monogram — from SVG logomark (same approach as reference project)
// ---------------------------------------------------------------------------

function createAzimuthAShape(): THREE.Shape {
  const s = 1 / 100;
  const cx = 250, cy = 240;

  const shape = new THREE.Shape();
  shape.moveTo((190 - cx) * s, -(40 - cy) * s);
  shape.lineTo((310 - cx) * s, -(40 - cy) * s);
  shape.lineTo((475 - cx) * s, -(432 - cy) * s);
  shape.lineTo((357 - cx) * s, -(432 - cy) * s);
  shape.lineTo((331 - cx) * s, -(371 - cy) * s);
  shape.lineTo((366 - cx) * s, -(371 - cy) * s);
  shape.lineTo((260 - cx) * s, -(116 - cy) * s);
  shape.lineTo((240 - cx) * s, -(116 - cy) * s);
  shape.lineTo((134 - cx) * s, -(371 - cy) * s);
  shape.lineTo((169 - cx) * s, -(371 - cy) * s);
  shape.lineTo((143 - cx) * s, -(432 - cy) * s);
  shape.lineTo((25 - cx) * s, -(432 - cy) * s);
  shape.closePath();

  // Horizon band cutout
  const band = new THREE.Path();
  const b1y1 = -(296 - cy) * s;
  const b1y2 = -(323 - cy) * s;
  band.moveTo(-2.5, b1y1);
  band.lineTo(2.5, b1y1);
  band.lineTo(2.5, b1y2);
  band.lineTo(-2.5, b1y2);
  band.closePath();
  shape.holes.push(band);

  return shape;
}

// ---------------------------------------------------------------------------
// Logo mesh sub-component
// ---------------------------------------------------------------------------

function AzimuthLogo({ opacity }: { opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const aShape = useMemo(() => createAzimuthAShape(), []);

  const aMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#00B4CF'),
    transmission: 0.75,
    thickness: 0.8,
    roughness: 0.08,
    ior: 1.9,
    envMapIntensity: 1.5,
    emissive: new THREE.Color('#00B4CF'),
    emissiveIntensity: 0.15,
    transparent: true,
    opacity: 0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
  }), []);

  const sunMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#FF5601'),
    emissive: new THREE.Color('#FF5601'),
    emissiveIntensity: 0.8,
    roughness: 0.3,
    metalness: 0.1,
    transparent: true,
    opacity: 0,
  }), []);

  useEffect(() => {
    aMaterial.opacity = opacity;
    sunMaterial.opacity = opacity;
    sunMaterial.emissiveIntensity = 0.8 * opacity;
  }, [opacity, aMaterial, sunMaterial]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsedRef.current += delta;
    const t = elapsedRef.current;
    const dampedSpeed = 0.15 * Math.exp(-t * 0.3) + 0.05;
    groupRef.current.rotation.y += dampedSpeed * delta;
  });

  // Sun position: SVG circle at (250, 302) → (0, -0.62)
  const sunY = -0.62;

  return (
    <group ref={groupRef} scale={1.2}>
      <mesh material={aMaterial} position={[0, 0, -0.25]}>
        <extrudeGeometry args={[aShape, {
          depth: 0.5,
          bevelEnabled: true,
          bevelThickness: 0.03,
          bevelSize: 0.02,
          bevelSegments: 3,
        }]} />
      </mesh>

      <mesh material={sunMaterial} position={[0, sunY, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
      </mesh>

      <pointLight position={[0, sunY, 0.5]} color="#FF5601" intensity={2 * opacity} distance={8} decay={2} />
      <pointLight position={[0, sunY, -0.5]} color="#E8A030" intensity={1 * opacity} distance={6} decay={2} />
      <pointLight position={[0, 1.5, 1]} color="#00CED1" intensity={0.5 * opacity} distance={5} decay={2} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Main boot sequence — returns null when not active
// ---------------------------------------------------------------------------

export default function BootSequence3D() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const [phase, setPhase] = useState<BootPhase>('black');
  const opacityRef = useRef({ value: 0 });
  const [logoOpacity, setLogoOpacity] = useState(0);
  const particlesRef = useRef<THREE.Points>(null);

  const { particlePositions, particleVelocities } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2.0 - 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 2 + Math.random() * 4;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      vel[i * 3 + 2] = Math.cos(phi) * speed;
    }
    return { particlePositions: pos, particleVelocities: vel };
  }, []);

  // GSAP timeline drives the boot sequence
  useEffect(() => {
    if (currentScene !== 'boot') return;

    setPhase('black');
    opacityRef.current.value = 0;
    setLogoOpacity(0);

    const tl = gsap.timeline();

    // Phase 1: Black
    tl.to({}, { duration: PHASE_BLACK / 1000, onComplete: () => setPhase('resolve') });

    // Phase 2: Resolve — fade in
    tl.to(opacityRef.current, {
      value: 1,
      duration: PHASE_RESOLVE / 1000,
      ease: 'power2.inOut',
      onUpdate: () => setLogoOpacity(opacityRef.current.value),
    });

    // Phase 3: Hold
    tl.to({}, { duration: PHASE_HOLD / 1000, onComplete: () => setPhase('scatter') });

    // Phase 4: Scatter — fade out + particle burst
    tl.to(opacityRef.current, {
      value: 0,
      duration: PHASE_SCATTER / 1000,
      ease: 'power2.in',
      onUpdate: () => setLogoOpacity(opacityRef.current.value),
    });

    // Transition to gauntlet
    tl.call(() => {
      setPhase('done');
      usePortalStore.getState().setScene('gauntlet');
    });

    return () => { tl.kill(); };
  }, [currentScene]);

  // Animate scatter particles
  useFrame((_, delta) => {
    if (phase !== 'scatter' || !particlesRef.current) return;
    const posAttr = particlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      arr[i3] += particleVelocities[i3] * delta;
      arr[i3 + 1] += particleVelocities[i3 + 1] * delta;
      arr[i3 + 2] += particleVelocities[i3 + 2] * delta;
    }
    posAttr.needsUpdate = true;
  });

  // === CONDITIONAL RETURN — completely unmount when not boot ===
  if (currentScene !== 'boot') return null;

  return (
    <group>
      <ambientLight intensity={0.03} color="#0A0E1A" />
      <AzimuthLogo opacity={logoOpacity} />

      {phase === 'scatter' && (
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particlePositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#00B4CF"
            size={0.03}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </group>
  );
}
