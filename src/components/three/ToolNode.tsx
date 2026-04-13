'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { COLORS } from '@/utils/constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GeometryType = 'dodeca' | 'cube' | 'sphere' | 'octa';
export type RotationAxis = 'y' | 'xy' | 'yz' | 'none';

interface ToolNodeProps {
  geometry: GeometryType;
  color: string;
  label: string;
  subtitle: string;
  position: [number, number, number];
  onSelect: () => void;
  isActive: boolean;
  /** Per-node rotation character. Defaults to 'y' */
  rotationAxis?: RotationAxis;
}

// ---------------------------------------------------------------------------
// Geometry factory — returns a BufferGeometry we can share between the
// translucent body AND the edge highlights, so they always match
// ---------------------------------------------------------------------------

function createNodeGeometry(type: GeometryType): THREE.BufferGeometry {
  switch (type) {
    case 'dodeca':
      return new THREE.DodecahedronGeometry(1, 0);
    case 'cube':
      return new THREE.BoxGeometry(1.4, 1.4, 1.4);
    case 'sphere':
      return new THREE.SphereGeometry(1, 48, 48);
    case 'octa':
      return new THREE.OctahedronGeometry(1, 0);
  }
}

// ---------------------------------------------------------------------------
// Edge highlights — LineSegments overlay that outlines every edge
// Sphere geometries look bad with edges (too many lines), so we skip them
// ---------------------------------------------------------------------------

function EdgeHighlights({
  geometry,
  type,
  color,
}: {
  geometry: THREE.BufferGeometry;
  type: GeometryType;
  color: string;
}) {
  const edges = useMemo(() => {
    if (type === 'sphere') return null;
    return new THREE.EdgesGeometry(geometry, 1);
  }, [geometry, type]);

  if (!edges) return null;

  return (
    <lineSegments geometry={edges}>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0.55}
        toneMapped={false}
        depthWrite={false}
      />
    </lineSegments>
  );
}

// ---------------------------------------------------------------------------
// Inner core — small emissive sphere inside the crystalline body
// Catches bloom so it glows through the transmission material
// ---------------------------------------------------------------------------

function InnerCore({ color }: { color: string }) {
  return (
    <mesh>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.5}
        toneMapped={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Selection ring pulse — unchanged from previous
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

    const cycle = (pulseTime.current % 2) / 2;
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
  rotationAxis = 'y',
}: ToolNodeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesGroupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  // Shared geometry between body and edges
  const nodeGeometry = useMemo(() => createNodeGeometry(geometry), [geometry]);

  // Animation state refs
  const isHovered = useRef(false);
  const currentScale = useRef(1.0);
  const currentEmissive = useRef(0.2);
  const labelOpacity = useRef(0);
  const elapsedTime = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    elapsedTime.current += delta;

    // --- Per-node rotation character ---
    const t = elapsedTime.current;
    switch (rotationAxis) {
      case 'y':
        meshRef.current.rotation.y += 0.003;
        if (edgesGroupRef.current) edgesGroupRef.current.rotation.y += 0.003;
        break;
      case 'xy':
        // Cube: slow wobble on both X and Y — looks like it's "calculating"
        meshRef.current.rotation.y += 0.0025;
        meshRef.current.rotation.x = Math.sin(t * 0.6) * 0.12;
        if (edgesGroupRef.current) {
          edgesGroupRef.current.rotation.y += 0.0025;
          edgesGroupRef.current.rotation.x = Math.sin(t * 0.6) * 0.12;
        }
        break;
      case 'yz':
        // Octahedron: fast rotation on Y + slow tumble on Z
        meshRef.current.rotation.y += 0.006;
        meshRef.current.rotation.z = Math.sin(t * 0.4) * 0.25;
        if (edgesGroupRef.current) {
          edgesGroupRef.current.rotation.y += 0.006;
          edgesGroupRef.current.rotation.z = Math.sin(t * 0.4) * 0.25;
        }
        break;
      case 'none':
        // Sphere: no external rotation (particles inside give life)
        break;
    }

    // --- Hover scale lerp ---
    const targetScale = isHovered.current ? 1.08 : 1.0;
    currentScale.current += (targetScale - currentScale.current) * 0.1;
    meshRef.current.scale.setScalar(currentScale.current);
    if (edgesGroupRef.current) edgesGroupRef.current.scale.setScalar(currentScale.current);

    // --- Hover emissive lerp ---
    const targetEmissive = isHovered.current ? 0.6 : 0.2;
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
      {/* Crystalline geometry body */}
      <mesh ref={meshRef} geometry={nodeGeometry}>
        <meshPhysicalMaterial
          ref={materialRef}
          color={color}
          transmission={0.88}
          thickness={1.0}
          roughness={0.08}
          ior={1.8}
          envMapIntensity={1.4}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          toneMapped={false}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Edge highlights — same geometry, wireframe overlay */}
      <group ref={edgesGroupRef}>
        <EdgeHighlights geometry={nodeGeometry} type={geometry} color={color} />
      </group>

      {/* Inner glowing core — amber ember trapped in the crystal */}
      <InnerCore color={color} />

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
        distanceFactor={10}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <span
            style={{
              fontFamily: 'Satoshi, DM Sans, system-ui, sans-serif',
              fontWeight: 700,
              fontSize: 14,
              color: '#D8DEE9',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              letterSpacing: '0.02em',
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: 'Inter, IBM Plex Sans, system-ui, sans-serif',
              fontWeight: 400,
              fontSize: 11,
              color: '#526A82',
              textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
          >
            {subtitle}
          </span>
        </div>
      </Html>
    </group>
  );
}
