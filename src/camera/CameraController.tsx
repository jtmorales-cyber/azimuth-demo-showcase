'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortalStore } from '@/state/portalStore';
import { COMPUTED_SEGMENTS, type ComputedSegment } from './flightPaths';
import { TIMING } from '@/utils/constants';

// Temp vectors to avoid per-frame allocations
const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

/**
 * Find the flight segment that contains a given scroll progress value.
 * Falls back to the last segment if past the end.
 */
function findSegment(scroll: number): { segment: ComputedSegment; localT: number } {
  for (const seg of COMPUTED_SEGMENTS) {
    if (scroll >= seg.scrollStart && scroll < seg.scrollEnd) {
      const range = seg.scrollEnd - seg.scrollStart;
      const localT = range > 0 ? (scroll - seg.scrollStart) / range : 0;
      return { segment: seg, localT: Math.max(0, Math.min(1, localT)) };
    }
  }
  // Past the end — clamp to last segment's final point
  const last = COMPUTED_SEGMENTS[COMPUTED_SEGMENTS.length - 1];
  return { segment: last, localT: 1 };
}

/**
 * Drives the camera position, lookAt, FOV, and roll based on scroll progress
 * read from the Zustand portal store. Uses pre-computed CatmullRomCurve3
 * paths for smooth interpolation.
 *
 * Also applies a gentle orbital drift when the hub scene is active and the
 * user isn't scrolling (idle drift).
 */
export default function CameraController() {
  const { camera } = useThree();
  const prevScrollRef = useRef(0);
  const idleDriftTime = useRef(0);

  useFrame((_, delta) => {
    const scrollProgress = usePortalStore.getState().scrollProgress;
    const currentScene = usePortalStore.getState().currentScene;

    // Determine scroll velocity for idle drift detection
    const scrollDelta = Math.abs(scrollProgress - prevScrollRef.current);
    prevScrollRef.current = scrollProgress;
    const isScrolling = scrollDelta > 0.0001;

    // --- Scroll-driven camera position ---
    const { segment, localT } = findSegment(scrollProgress);

    // Sample curves at localT
    segment.positionCurve.getPointAt(localT, _pos);
    segment.lookAtCurve.getPointAt(localT, _look);

    // Interpolate FOV and roll
    const fov = THREE.MathUtils.lerp(segment.fovStart, segment.fovEnd, localT);
    const roll = THREE.MathUtils.lerp(segment.rollStart, segment.rollEnd, localT);

    // --- Hub idle orbital drift ---
    // Additive sine-based orbit when in hub scene and not actively scrolling
    let driftX = 0;
    let driftZ = 0;

    if (currentScene === 'hub' && !isScrolling) {
      idleDriftTime.current += delta;
      const period = TIMING.ROTATION_PERIOD / 1000; // 45s
      const angle = (idleDriftTime.current / period) * Math.PI * 2;
      // Subtle orbital offset: ±1.5 units
      driftX = Math.sin(angle) * 1.5;
      driftZ = Math.cos(angle) * 0.8 - 0.8; // slight forward bias
    } else {
      // Decay drift time when scrolling so it doesn't accumulate
      idleDriftTime.current *= 0.95;
    }

    // Apply position with drift
    camera.position.set(
      _pos.x + driftX,
      _pos.y,
      _pos.z + driftZ
    );

    // Apply lookAt
    camera.lookAt(_look.x, _look.y, _look.z);

    // Apply dutch angle (roll) AFTER lookAt — lookAt resets rotation.z
    if (Math.abs(roll) > 0.001) {
      camera.rotation.z = roll;
    }

    // Apply FOV
    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
    }
  });

  return null;
}
