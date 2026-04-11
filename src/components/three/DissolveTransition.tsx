'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortalStore } from '@/state/portalStore';
import dissolveVert from '@/shaders/dissolve.vert.glsl';
import dissolveFrag from '@/shaders/dissolve.frag.glsl';

// ---------------------------------------------------------------------------
// Dissolve transition wraps the Gauntlet geometry.
// This component owns ALL visibility for the gauntlet:
//   - Visible during boot + gauntlet + early hub transition
//   - Dissolve shader applied during scroll 0.15–0.30
//   - Hidden after dissolve completes
//
// GauntletGeometry itself has NO visibility logic.
// ---------------------------------------------------------------------------

const DISSOLVE_SCROLL_START = 0.15;
const DISSOLVE_SCROLL_END = 0.30;

interface DissolveTransitionProps {
  children: React.ReactNode;
}

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

  const originalMaterials = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  const isApplied = useRef(false);

  useFrame((_, delta) => {
    const scrollProgress = usePortalStore.getState().scrollProgress;
    timeRef.current += delta;

    if (!groupRef.current) return;

    // --- Visibility: show during boot, gauntlet, and transition ---
    // Hide only after dissolve is fully complete (scroll > DISSOLVE_SCROLL_END)
    const pastDissolve = scrollProgress >= DISSOLVE_SCROLL_END;
    groupRef.current.visible = !pastDissolve;

    if (!groupRef.current.visible) {
      // Clean up any applied dissolve materials
      if (isApplied.current) {
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const original = originalMaterials.current.get(child);
            if (original) child.material = original;
          }
        });
        originalMaterials.current.clear();
        isApplied.current = false;
      }
      return;
    }

    // --- Dissolve progress ---
    const dissolveProgress = Math.max(
      0,
      Math.min(1, (scrollProgress - DISSOLVE_SCROLL_START) / (DISSOLVE_SCROLL_END - DISSOLVE_SCROLL_START))
    );

    uniforms.progress.value = dissolveProgress;
    uniforms.time.value = timeRef.current;

    // --- Material swap: apply dissolve shader when transition is active ---
    const shouldApply = dissolveProgress > 0.001;

    if (shouldApply && !isApplied.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          originalMaterials.current.set(child, child.material);
          child.material = dissolveMaterial;
        }
      });
      isApplied.current = true;
    } else if (!shouldApply && isApplied.current) {
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const original = originalMaterials.current.get(child);
          if (original) child.material = original;
        }
      });
      originalMaterials.current.clear();
      isApplied.current = false;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}
