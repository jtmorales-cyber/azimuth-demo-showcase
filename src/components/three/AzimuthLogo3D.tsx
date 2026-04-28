'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COLORS } from '@/utils/constants';
import { usePortalStore } from '@/state/portalStore';
import { getAudioEngine } from '@/audio/AudioEngine';

// ---------------------------------------------------------------------------
// AzimuthLogo3D — replaces the legacy NOVASphere at the hub center.
//
// Geometry follows public/logo/azimuth-logomark.svg (viewBox 0 0 500 480):
//   - Cyan "A" path (12 vertices)
//   - Amber sun centered at (250, 302), radius 68
// The two horizontal mask bands from the SVG are omitted — they're a 2D
// graphic device and would not read sensibly on a rotating 3D object.
// ---------------------------------------------------------------------------

const SVG_VIEWBOX = { width: 500, height: 480 };
const SCALE = 0.012;

// Map SVG (x, y_down) → 3D (x_centered, y_up). Multiplied by SCALE.
function svg([x, y]: [number, number]): [number, number] {
  return [
    (x - SVG_VIEWBOX.width / 2) * SCALE,
    -(y - SVG_VIEWBOX.height / 2) * SCALE,
  ];
}

// 12 vertices of the A path, in SVG order.
const A_PATH_SVG: [number, number][] = [
  [190, 40], [310, 40], [475, 432], [357, 432], [331, 371], [366, 371],
  [260, 116], [240, 116], [134, 371], [169, 371], [143, 432], [25, 432],
];

// Sun in 3D coords (slightly forward in Z so it floats inside the A's bevel)
const SUN_POS_2D = svg([250, 302]);
const SUN_POS_3D: [number, number, number] = [SUN_POS_2D[0], SUN_POS_2D[1], 0];
const SUN_RADIUS = 68 * SCALE; // ~0.82

function buildAGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const [x0, y0] = svg(A_PATH_SVG[0]);
  shape.moveTo(x0, y0);
  for (let i = 1; i < A_PATH_SVG.length; i++) {
    const [x, y] = svg(A_PATH_SVG[i]);
    shape.lineTo(x, y);
  }
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.4,
    bevelEnabled: true,
    bevelSize: 0.04,
    bevelThickness: 0.04,
    bevelSegments: 3,
    curveSegments: 1,
  });
}

export default function AzimuthLogo3D() {
  const groupRef = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const goTo = usePortalStore((s) => s.goTo);

  const aGeometry = useMemo(buildAGeometry, []);
  const aEdges = useMemo(() => new THREE.EdgesGeometry(aGeometry, 1), [aGeometry]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsed.current += delta;

    // Slow Y spin + subtle Z wobble
    groupRef.current.rotation.y += 0.003;
    groupRef.current.rotation.z = Math.sin(elapsed.current * 0.3) * 0.04;
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, -0.2]}
      onPointerDown={(e) => {
        e.stopPropagation();
        getAudioEngine().playInteraction('hub');
        goTo('lifecycle');
      }}
    >
      {/* Crystalline cyan A body */}
      <mesh geometry={aGeometry}>
        <meshPhysicalMaterial
          color={COLORS.CYAN_STRUCT}
          transmission={0.88}
          thickness={0.6}
          roughness={0.08}
          ior={1.8}
          envMapIntensity={1.4}
          emissive={COLORS.CYAN_STRUCT}
          emissiveIntensity={0.35}
          transparent
          toneMapped={false}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Edge outline */}
      <lineSegments geometry={aEdges}>
        <lineBasicMaterial
          color={COLORS.CYAN_STRUCT}
          transparent
          opacity={0.55}
          toneMapped={false}
          depthWrite={false}
        />
      </lineSegments>

      {/* Amber sun — sits in the lower band of the A */}
      <mesh position={SUN_POS_3D}>
        <sphereGeometry args={[SUN_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color={COLORS.AMBER_CORE}
          emissive={COLORS.AMBER_CORE}
          emissiveIntensity={4.0}
          toneMapped={false}
        />
      </mesh>

      {/* Point light inside the sun — illuminates the A from within */}
      <pointLight
        position={SUN_POS_3D}
        color={COLORS.AMBER_CORE}
        intensity={2.5}
        distance={6}
        decay={2}
      />
    </group>
  );
}
