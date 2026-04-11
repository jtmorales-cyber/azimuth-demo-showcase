'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS, TIMING } from '@/utils/constants';
import { usePortalStore } from '@/state/portalStore';

import {
  PARTICLE_COUNT,
  ORBIT_RADIUS_MAX,
  ATTRACTION_LERP,
  initParticles,
  attractionForce,
} from './novaParticles';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BREATHE_PERIOD = TIMING.GLOW_BREATHE / 1000; // 4s

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NOVAState = 'idle' | 'hover' | 'processing';

interface NOVASphereProps {
  state?: NOVAState;
  position?: [number, number, number];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// Module-level temps — zero per-frame allocations
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _amberColor = new THREE.Color(COLORS.AMBER_CORE);
const _cyanColor = new THREE.Color(COLORS.CYAN_STRUCT);
const _sphereCenter = new THREE.Vector3();
const _closestPoint = new THREE.Vector3();

export default function NOVASphere({
  state: stateProp,
  position = [0, 0, 0],
}: NOVASphereProps) {
  const instancedRef = useRef<THREE.InstancedMesh>(null);
  const coreLightRef = useRef<THREE.PointLight>(null);
  const { pointer, camera, raycaster } = useThree();

  // Particle data (initialized once)
  const particles = useMemo(() => initParticles(), []);

  // Per-instance color buffer
  const colorArray = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);

  // Time accumulator
  const timeRef = useRef(0);

  // Smoothed attraction target (world-space)
  const attractTarget = useRef(new THREE.Vector3());
  const isHovered = useRef(false);

  // Initialize instance colors
  useEffect(() => {
    if (!instancedRef.current) return;
    const mesh = instancedRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      _color.copy(_amberColor).lerp(_cyanColor, particles.colorT[i] * 0.7);
      _color.toArray(colorArray, i * 3);
    }

    mesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
    mesh.instanceColor.needsUpdate = true;
  }, [particles, colorArray]);

  useFrame((_, delta) => {
    if (!instancedRef.current) return;

    const mesh = instancedRef.current;
    timeRef.current += delta;
    const t = timeRef.current;

    // Determine state from prop or store
    const hoveredNode = usePortalStore.getState().hoveredNode;
    const currentState = stateProp ?? (isHovered.current ? 'hover' : 'idle');

    // --- Hover attraction target ---
    // Project pointer into 3D space at the sphere's depth
    raycaster.setFromCamera(pointer, camera);
    _sphereCenter.set(position[0], position[1], position[2]);
    raycaster.ray.closestPointToPoint(_sphereCenter, _closestPoint);
    attractTarget.current.lerp(_closestPoint, ATTRACTION_LERP);

    // --- Breathing animation on core light ---
    if (coreLightRef.current) {
      const breathe = Math.sin(t * (Math.PI * 2 / BREATHE_PERIOD));
      // Intensity: 0.85 → 1.0
      coreLightRef.current.intensity = 2.5 + breathe * 0.4;
      // Scale proxy: we vary distance slightly for the "breathing" effect
      coreLightRef.current.distance = 12 + breathe * 0.5;
    }

    // --- Update each particle ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = particles.orbitRadius[i];
      const angVel = particles.angularVelocity[i];
      const phase = particles.phaseOffset[i];
      const tilt = particles.orbitTilt[i];
      const tiltAxisAngle = particles.orbitTiltAxis[i * 2];
      const size = particles.baseSize[i];

      // Orbital position in the tilted plane
      const angle = phase + t * angVel;
      let px = Math.cos(angle) * radius;
      let py = Math.sin(angle) * radius * Math.sin(tilt);
      let pz = Math.sin(angle) * radius * Math.cos(tilt);

      // Rotate orbital plane around Y axis for 3D distribution
      const cosA = Math.cos(tiltAxisAngle);
      const sinA = Math.sin(tiltAxisAngle);
      const rotX = px * cosA - pz * sinA;
      const rotZ = px * sinA + pz * cosA;
      px = rotX;
      pz = rotZ;

      // Apply hover attraction (inverse-square falloff)
      if (currentState === 'hover') {
        const dx = attractTarget.current.x - position[0] - px;
        const dy = attractTarget.current.y - position[1] - py;
        const dz = attractTarget.current.z - position[2] - pz;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const force = attractionForce(dist);
        px += dx * force * ATTRACTION_LERP;
        py += dy * force * ATTRACTION_LERP;
        pz += dz * force * ATTRACTION_LERP;
      }

      // Position relative to sphere center
      _dummy.position.set(
        position[0] + px,
        position[1] + py,
        position[2] + pz
      );

      // Size: subtle breathing variation
      const sizeBreath = 1.0 + Math.sin(t * 1.5 + phase) * 0.08;
      const s = size * sizeBreath;
      _dummy.scale.setScalar(s);

      _dummy.updateMatrix();
      mesh.setMatrixAt(i, _dummy.matrix);

      // Update color: particles near attraction point get slightly brighter
      if (currentState === 'hover' && i % 4 === 0) {
        // Only update every 4th particle per frame for performance
        const colorIdx = i + ((timeRef.current * 60 | 0) % 4);
        if (colorIdx < PARTICLE_COUNT) {
          const ci = particles.colorT[colorIdx];
          _color.copy(_amberColor).lerp(_cyanColor, ci * 0.7);
          // Brighten particles that are near the cursor
          const distToAttract = _dummy.position.distanceTo(attractTarget.current);
          if (distToAttract < 2) {
            _color.multiplyScalar(1.0 + (1.0 - distToAttract / 2) * 0.5);
          }
          _color.toArray(colorArray, colorIdx * 3);
        }
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    // Only upload color buffer when hover is actively modifying colors
    if (currentState === 'hover' && mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group
      position={position}
      onPointerOver={() => { isHovered.current = true; }}
      onPointerOut={() => { isHovered.current = false; }}
    >
      {/* Central amber core — catches bloom at threshold 0.6 */}
      <pointLight
        ref={coreLightRef}
        color={COLORS.AMBER_CORE}
        intensity={2.5}
        distance={12}
        decay={2}
      />

      {/* Inner core glow mesh — emissive to trigger bloom */}
      <mesh>
        <sphereGeometry args={[0.3, 24, 24]} />
        <meshStandardMaterial
          color={COLORS.AMBER_CORE}
          emissive={COLORS.AMBER_CORE}
          emissiveIntensity={2.0}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Outer glow halo — softer, larger */}
      <mesh>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial
          color={COLORS.AMBER_CORE}
          emissive={COLORS.AMBER_CORE}
          emissiveIntensity={0.6}
          transparent
          opacity={0.15}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Instanced particle system */}
      <instancedMesh
        ref={instancedRef}
        args={[undefined, undefined, PARTICLE_COUNT]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 6, 6]} />
        <meshStandardMaterial
          toneMapped={false}
          transparent
          opacity={0.85}
          depthWrite={false}
        />
      </instancedMesh>

      {/* Invisible hit sphere for hover detection */}
      <mesh visible={false}>
        <sphereGeometry args={[ORBIT_RADIUS_MAX + 0.5, 16, 16]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  );
}
