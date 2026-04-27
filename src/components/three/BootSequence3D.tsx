'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { usePortalStore } from '@/state/portalStore';

// Boot sequence: black → resolve → hold-forever-until-tap.
// Geometry: SVG-traced "A" wordmark with horizontal band cutout +
// orange sun sphere inside the band. The HTML overlay
// (src/scenes/BootSequence.tsx) provides the AZIMUTH wordmark and
// TAP TO BEGIN prompt and calls goTo('hub') on tap.

const PHASE_BLACK = 500;    // ms
const PHASE_RESOLVE = 1200; // ms

type BootPhase = 'black' | 'resolve' | 'hold';

// Trace the Azimuth "A" monogram from the brand SVG path.
// Coordinates are in SVG space (viewBox roughly 0-500 wide, 0-500 tall);
// we recenter on (cx,cy) and scale down by `s` so the geometry sits in
// a ~5-unit-tall world space comfortably visible from camera (0,0,5).
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

  // Horizon band cutout that the sun sits inside.
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

function AzimuthLogo({ opacity }: { opacity: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const aShape = useMemo(() => createAzimuthAShape(), []);

  const aMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
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
      }),
    []
  );

  const sunMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#FF5601'),
        emissive: new THREE.Color('#FF5601'),
        emissiveIntensity: 0.8,
        roughness: 0.3,
        metalness: 0.1,
        transparent: true,
        opacity: 0,
      }),
    []
  );

  useEffect(() => {
    aMaterial.opacity = opacity;
    sunMaterial.opacity = opacity;
    sunMaterial.emissiveIntensity = 0.8 * opacity;
  }, [opacity, aMaterial, sunMaterial]);

  // Damped Y-rotation that slows to a near-stop after a few seconds
  // — keeps the boot logo from feeling completely lifeless without
  // distracting from the wordmark.
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsedRef.current += delta;
    const t = elapsedRef.current;
    const dampedSpeed = 0.15 * Math.exp(-t * 0.3) + 0.05;
    groupRef.current.rotation.y += dampedSpeed * delta;
  });

  // SVG circle was at (250, 302) — in our recentered coords that's (0, -0.62).
  const sunY = -0.62;

  return (
    <group ref={groupRef} scale={1.2}>
      <mesh material={aMaterial} position={[0, 0, -0.25]}>
        <extrudeGeometry
          args={[
            aShape,
            {
              depth: 0.5,
              bevelEnabled: true,
              bevelThickness: 0.03,
              bevelSize: 0.02,
              bevelSegments: 3,
            },
          ]}
        />
      </mesh>

      <mesh material={sunMaterial} position={[0, sunY, 0]}>
        <sphereGeometry args={[0.55, 32, 32]} />
      </mesh>

      <pointLight position={[0, sunY, 0.5]} color="#FF5601" intensity={2 * opacity} distance={8} decay={2} />
      <pointLight position={[0, sunY, -0.5]} color="#E8A030" intensity={1 * opacity} distance={6} decay={2} />
      <pointLight position={[0, 1.5, 1]}    color="#00CED1" intensity={0.5 * opacity} distance={5} decay={2} />
    </group>
  );
}

export default function BootSequence3D() {
  const currentScene = usePortalStore((s) => s.currentScene);
  const [phase, setPhase] = useState<BootPhase>('black');
  const opacityRef = useRef({ value: 0 });
  const [logoOpacity, setLogoOpacity] = useState(0);

  useEffect(() => {
    if (currentScene !== 'boot') return;

    setPhase('black');
    opacityRef.current.value = 0;
    setLogoOpacity(0);

    const tl = gsap.timeline();

    // Phase 1: Black
    tl.to({}, {
      duration: PHASE_BLACK / 1000,
      onComplete: () => setPhase('resolve'),
    });

    // Phase 2: Resolve — logo fades in
    tl.to(opacityRef.current, {
      value: 1,
      duration: PHASE_RESOLVE / 1000,
      ease: 'power2.inOut',
      onUpdate: () => setLogoOpacity(opacityRef.current.value),
      onComplete: () => setPhase('hold'),
    });

    // Phase 3: Hold forever — user must tap the overlay to advance.
    // (No scatter, no auto-transition. 60s idle resets to hub via useIdleTimeout.)

    return () => {
      tl.kill();
    };
  }, [currentScene]);

  if (currentScene !== 'boot') return null;

  return (
    <group>
      <ambientLight intensity={0.03} color="#0A0E1A" />
      <AzimuthLogo opacity={logoOpacity} />
    </group>
  );
}
