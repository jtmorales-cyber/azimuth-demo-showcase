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
// Per-color brightness normalization
//
// The Bloom postprocess threshold (0.6 luminance) means the bright cyan KIT
// and amber MAPS bloom strongly while the darker BASE purple and SCOUT navy
// barely register. Compute a per-color boost so every node's hover state
// reaches the same perceived brightness in the bloom buffer.
//
// Strategy: take the color's Rec. 601 luminance and scale toward a target
// brightness of 0.65 (matching the brightest brand color, AMBER_CORE).
// Capped to avoid runaway HDR values.
// ---------------------------------------------------------------------------

const TARGET_LUMINANCE = 0.65;
const MAX_BOOST = 3.5;

function colorLuminance(color: string): number {
  const c = new THREE.Color(color);
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
}

function getBloomBoost(color: string): number {
  const lum = Math.max(0.15, colorLuminance(color));
  return Math.min(MAX_BOOST, TARGET_LUMINANCE / lum);
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
// Catches bloom so it glows through the transmission material.
// Brightens on hover via the shared hoverState ref (0 at rest, 1 fully hovered).
// ---------------------------------------------------------------------------

function InnerCore({
  color,
  hoverState,
}: {
  color: string;
  hoverState: { current: number };
}) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  // Dark colors need higher emissive intensity to reach the same perceived brightness.
  const boost = useMemo(() => getBloomBoost(color), [color]);

  useFrame(() => {
    if (matRef.current) {
      // Base 2.5 at rest, +1.5 × boost at full hover (≈ 4.0 for bright colors, ≈ 7.0 for SCOUT navy).
      matRef.current.emissiveIntensity = 2.5 * boost + hoverState.current * 1.5 * boost;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        emissive={color}
        emissiveIntensity={2.5}
        toneMapped={false}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Hover glow halo — additive-blended sphere that fades in only on hover.
// Additive blending guarantees a bright pixel contribution regardless of the
// node's base color luminance, so dark nodes (BASE purple, SCOUT navy) bloom
// just as visibly as the bright cyan KIT.
// ---------------------------------------------------------------------------

function HoverGlow({
  color,
  hoverState,
}: {
  color: string;
  hoverState: { current: number };
}) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  // Pre-multiply the base color by the per-luminance boost so dark colors
  // contribute as much HDR brightness as bright ones when the halo blends in.
  const haloColor = useMemo(() => {
    const c = new THREE.Color(color);
    c.multiplyScalar(getBloomBoost(color));
    return c;
  }, [color]);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity = hoverState.current * 0.7;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshBasicMaterial
        ref={matRef}
        color={haloColor}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
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
  // Per-color brightness boost — applied to body emissive on hover too.
  const bloomBoost = useMemo(() => getBloomBoost(color), [color]);

  // Animation state refs
  const isHovered = useRef(false);
  const currentScale = useRef(1.0);
  const currentEmissive = useRef(0.2);
  // hoverState: smooth 0..1 ref that other meshes (HoverGlow, InnerCore) read each frame.
  const hoverState = useRef(0);
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

    // --- Shared hover state lerp (0..1) — drives glow halo + InnerCore + label ---
    const targetHover = isHovered.current ? 1.0 : 0.0;
    hoverState.current += (targetHover - hoverState.current) * 0.12;

    // --- Hover scale lerp ---
    const targetScale = isHovered.current ? 1.08 : 1.0;
    currentScale.current += (targetScale - currentScale.current) * 0.1;
    meshRef.current.scale.setScalar(currentScale.current);
    if (edgesGroupRef.current) edgesGroupRef.current.scale.setScalar(currentScale.current);

    // --- Hover emissive lerp on the body. Multiplied by per-color bloomBoost
    //     so all four nodes reach the same perceived bloom intensity. ---
    const targetEmissive = isHovered.current ? 1.8 * bloomBoost : 0.2;
    currentEmissive.current += (targetEmissive - currentEmissive.current) * 0.1;
    materialRef.current.emissiveIntensity = currentEmissive.current;

    // --- Label opacity follows hoverState ---
    labelOpacity.current = hoverState.current;
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
      <InnerCore color={color} hoverState={hoverState} />

      {/* Hover-only additive halo — guarantees bloom for ALL node colors */}
      <HoverGlow color={color} hoverState={hoverState} />

      {/* Selection ring pulse */}
      <SelectionRing active={isActive} />

      {/* HTML label overlay — fades in with hoverState */}
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
        distanceFactor={8}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <span
            style={{
              fontFamily: 'Satoshi, DM Sans, system-ui, sans-serif',
              fontWeight: 900,
              fontSize: 18,
              color: '#FFFFFF',
              textShadow: '0 1px 8px rgba(0,0,0,0.85)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </span>
          <span
            style={{
              fontFamily: 'Inter, IBM Plex Sans, system-ui, sans-serif',
              fontWeight: 400,
              fontSize: 11,
              color: '#8896A8',
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
            }}
          >
            {subtitle}
          </span>
        </div>
      </Html>
    </group>
  );
}
