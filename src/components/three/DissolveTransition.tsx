'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortalStore } from '@/state/portalStore';
import dissolveVert from '@/shaders/dissolve.vert.glsl';
import dissolveFrag from '@/shaders/dissolve.frag.glsl';

// ---------------------------------------------------------------------------
// Dissolve transition wraps the Gauntlet geometry with a custom shader
// that drives fractures, displacement, and color shift from scroll progress.
//
// Scroll mapping:
//   progress 0.0 = scroll 0.15 (fractures begin in late gauntlet)
//   progress 1.0 = scroll 0.30 (fully dissolved, hub assembled)
//
// The transition spans the gauntlet→hub boundary (scroll 0.15–0.30).
// ---------------------------------------------------------------------------

const DISSOLVE_SCROLL_START = 0.15;
const DISSOLVE_SCROLL_END = 0.30;

interface DissolveTransitionProps {
  children: React.ReactNode;
}

/**
 * Wraps Gauntlet geometry and applies the dissolve shader material
 * to all mesh children when the transition is active.
 *
 * The shader material is applied by overriding materials on child meshes
 * during the transition range. Outside that range, original materials are used.
 */
export default function DissolveTransition({ children }: DissolveTransitionProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      progress: { value: 0 },
      time: { value: 0 },
      colorGray: { value: new THREE.Color('#6B6B6B') },
      colorCyan: { value: new THREE.Color('#00CED1') },
    }),
    []
  );

  const dissolveMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: dissolveVert,
        fragmentShader: dissolveFrag,
        uniforms,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: true,
      }),
    [uniforms]
  );

  // Store original materials to restore after transition
  const originalMaterials = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  const isApplied = useRef(false);

  useFrame((_, delta) => {
    const scrollProgress = usePortalStore.getState().scrollProgress;
    timeRef.current += delta;

    // Map scroll range to dissolve progress 0–1
    const dissolveProgress = Math.max(
      0,
      Math.min(1, (scrollProgress - DISSOLVE_SCROLL_START) / (DISSOLVE_SCROLL_END - DISSOLVE_SCROLL_START))
    );

    uniforms.progress.value = dissolveProgress;
    uniforms.time.value = timeRef.current;

    if (!groupRef.current) return;

    const shouldApply = dissolveProgress > 0.001 && dissolveProgress < 0.999;

    if (shouldApply && !isApplied.current) {
      // Apply dissolve material to all meshes
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          originalMaterials.current.set(child, child.material);
          child.material = dissolveMaterial;
        }
      });
      isApplied.current = true;
    } else if (!shouldApply && isApplied.current) {
      // Restore original materials
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const original = originalMaterials.current.get(child);
          if (original) {
            child.material = original;
          }
        }
      });
      originalMaterials.current.clear();
      isApplied.current = false;
    }

    // Hide gauntlet geometry entirely once dissolved
    if (dissolveProgress >= 0.999) {
      groupRef.current.visible = false;
    } else {
      groupRef.current.visible = true;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}
