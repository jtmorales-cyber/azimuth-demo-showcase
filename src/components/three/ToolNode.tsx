'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '@/utils/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GeometryType = 'dodeca' | 'cube' | 'sphere' | 'octa';

interface ToolNodeProps {
  geometry: GeometryType;
  color: string;
  label: string;
  subtitle: string;
  position: [number, number, number];
  onSelect: () => void;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Geometry sub-component
// ---------------------------------------------------------------------------

function NodeGeometry({ type }: { type: GeometryType }) {
  switch (type) {
    case 'dodeca':
      return <dodecahedronGeometry args={[1, 0]} />;
    case 'cube':
      return <boxGeometry args={[1.4, 1.4, 1.4]} />;
    case 'sphere':
      return <sphereGeometry args={[1, 48, 48]} />;
    case 'octa':
      return <octahedronGeometry args={[1, 0]} />;
  }
}

// ---------------------------------------------------------------------------
// Selection ring pulse
// ---------------------------------------------------------------------------

function SelectionRing({ active }: { active: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const pulseTime = useRef(0);

  useFrame((_, delta) => {
    if (!active || !ringRef.current || !materialRef.current) {
      if (ringRef.current) ringRef.current.visible = false;
      return;
    }

    ringRef.current.visible = true;
    pulseTime.current += delta;

    // Pulse cycle: expand and fade over 2 seconds, then repeat
    const cycle = (pulseTime.current % 2) / 2; // 0→1 over 2s
    const scale = 1.0 + cycle * 1.5;
    const opacity = 0.6 * (1.0 - cycle);

    ringRef.current.scale.setScalar(scale);
    materialRef.current.opacity = opacity;
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} visible={false}>
      <torusGeometry args={[1.3, 0.03, 8, 64]} />
      <meshBasicMaterial
        ref={materialRef}
        color={COLORS.CYAN_STRUCT}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ToolNode({
  geometry,
  color,
  label,
  subtitle,
  position,
  onSelect,
  isActive,
}: ToolNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Animation state refs (no re-renders)
  const isHovered = useRef(false);
  const currentScale = useRef(1.0);
  const currentEmissive = useRef(0.15);
  const labelOpacity = useRef(0);

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;

    // --- Idle rotation ---
    meshRef.current.rotation.y += 0.002;

    // --- Hover scale lerp ---
    const targetScale = isHovered.current ? 1.08 : 1.0;
    currentScale.current += (targetScale - currentScale.current) * 0.1;
    meshRef.current.scale.setScalar(currentScale.current);

    // --- Hover emissive lerp ---
    // 0.15 idle → 0.5 hover (roughly 1.4x brightness increase on the crystalline)
    const targetEmissive = isHovered.current ? 0.5 : 0.15;
    currentEmissive.current += (targetEmissive - currentEmissive.current) * 0.1;
    materialRef.current.emissiveIntensity = currentEmissive.current;

    // --- Label opacity lerp ---
    const targetLabelOpacity = isHovered.current ? 1.0 : 0.0;
    labelOpacity.current += (targetLabelOpacity - labelOpacity.current) * 0.12;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        isHovered.current = true;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        isHovered.current = false;
        document.body.style.cursor = 'auto';
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Crystalline geometry */}
      <mesh ref={meshRef}>
        <NodeGeometry type={geometry} />
        <meshPhysicalMaterial
          ref={materialRef}
          color={color}
          transmission={0.9}
          thickness={1.0}
          roughness={0.1}
          ior={1.8}
          envMapIntensity={1.2}
          emissive={color}
          emissiveIntensity={0.15}
          transparent
          toneMapped={false}
        />
      </mesh>

      {/* Selection ring pulse */}
      <SelectionRing active={isActive} />

      {/* HTML label overlay */}
      <Html
        position={[0, 1.8, 0]}
        center
        style={{
          opacity: labelOpacity.current,
          transition: 'none',
          pointerEvents: 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
        // Keep label facing camera
        distanceFactor={10}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}>
          <span style={{
            fontFamily: 'Satoshi, DM Sans, system-ui, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: '#D8DEE9',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            letterSpacing: '0.02em',
          }}>
            {label}
          </span>
          <span style={{
            fontFamily: 'Inter, IBM Plex Sans, system-ui, sans-serif',
            fontWeight: 400,
            fontSize: 11,
            color: '#526A82',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}>
            {subtitle}
          </span>
        </div>
      </Html>
    </group>
  );
}
