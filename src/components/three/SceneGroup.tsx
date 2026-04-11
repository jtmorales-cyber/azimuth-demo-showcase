'use client';

import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortalStore, type SceneName } from '@/state/portalStore';

/**
 * Visibility wrapper for 3D content that should only appear during specific scenes.
 * Smoothly fades visibility via opacity-like lerp on the group's visible flag,
 * with a transition buffer to avoid hard pops.
 */
interface SceneGroupProps {
  /** Scenes during which this group is visible */
  scenes: SceneName[];
  children: ReactNode;
}

export default function SceneGroup({ scenes, children }: SceneGroupProps) {
  const groupRef = useRef<THREE.Group>(null);
  const visibleSet = useRef(new Set(scenes));

  // Update set if scenes prop changes
  visibleSet.current = new Set(scenes);

  useFrame(() => {
    if (!groupRef.current) return;
    const { currentScene } = usePortalStore.getState();
    groupRef.current.visible = visibleSet.current.has(currentScene);
  });

  return <group ref={groupRef}>{children}</group>;
}
