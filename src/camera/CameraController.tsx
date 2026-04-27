'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three-stdlib';
import { usePortalStore } from '@/state/portalStore';
import { SCENE_FOCUS } from './flightPaths';
import { EASING } from '@/utils/constants';

/**
 * Camera system:
 *   - OrbitControls always active (drag/pinch/zoom freely)
 *   - GSAP flight triggered on scene change via Zustand subscription
 *   - Double-tap (< 350ms between taps) recenters camera to current scene focus
 *   - OrbitControls disabled during flights, re-enabled on complete
 */
export default function CameraController() {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  const isFlying = useRef(false);
  const lastTapTime = useRef(0);

  // Initialize OrbitControls
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const controls = new OrbitControls(cam, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 3;
    controls.maxDistance = 45;
    controls.minPolarAngle = Math.PI * 0.05;
    controls.maxPolarAngle = Math.PI * 0.8;

    // Snap camera to current scene focus on init
    const init = SCENE_FOCUS[usePortalStore.getState().currentScene];
    cam.position.set(...init.position);
    cam.lookAt(...init.target);
    controls.target.set(...init.target);
    controls.update();

    controlsRef.current = controls;
    return () => controls.dispose();
  }, [camera, gl]);

  // Drive orbit damping every frame — skip during GSAP flights
  useFrame(() => {
    if (controlsRef.current && !isFlying.current) {
      controlsRef.current.update();
    }
  });

  // Scene change → GSAP camera flight
  useEffect(() => {
    const unsub = usePortalStore.subscribe(
      (s) => s.currentScene,
      (scene) => {
        const focus = SCENE_FOCUS[scene];
        const controls = controlsRef.current;
        if (!focus || !controls) return;

        isFlying.current = true;
        controls.enabled = false;

        // Boot is instant (camera was already there on first load)
        const duration = scene === 'boot' ? 0.01 : scene === 'hub' ? 2.0 : 2.5;
        const ease = scene === 'hub' ? EASING.CAMERA_PULL_BACK : EASING.CAMERA_APPROACH;

        // Single tween object covers position + lookAt target simultaneously
        const s = {
          px: camera.position.x, py: camera.position.y, pz: camera.position.z,
          tx: controls.target.x, ty: controls.target.y, tz: controls.target.z,
        };

        gsap.to(s, {
          px: focus.position[0], py: focus.position[1], pz: focus.position[2],
          tx: focus.target[0],   ty: focus.target[1],   tz: focus.target[2],
          duration,
          ease,
          onUpdate: () => {
            camera.position.set(s.px, s.py, s.pz);
            camera.lookAt(s.tx, s.ty, s.tz);
            controls.target.set(s.tx, s.ty, s.tz);
          },
          onComplete: () => {
            controls.update();
            controls.enabled = true;
            isFlying.current = false;
            usePortalStore.getState().completeTransition();
          },
        });
      }
    );
    return unsub;
  }, [camera]);

  // Double-tap → recenter
  useEffect(() => {
    function handlePointerDown() {
      const now = Date.now();
      if (now - lastTapTime.current < 350 && !isFlying.current) {
        recenter();
      }
      lastTapTime.current = now;
    }

    function recenter() {
      const scene = usePortalStore.getState().currentScene;
      const focus = SCENE_FOCUS[scene];
      const controls = controlsRef.current;
      if (!focus || !controls) return;

      isFlying.current = true;
      controls.enabled = false;

      const s = {
        px: camera.position.x, py: camera.position.y, pz: camera.position.z,
        tx: controls.target.x, ty: controls.target.y, tz: controls.target.z,
      };

      gsap.to(s, {
        px: focus.position[0], py: focus.position[1], pz: focus.position[2],
        tx: focus.target[0],   ty: focus.target[1],   tz: focus.target[2],
        duration: 1.0,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.position.set(s.px, s.py, s.pz);
          camera.lookAt(s.tx, s.ty, s.tz);
          controls.target.set(s.tx, s.ty, s.tz);
        },
        onComplete: () => {
          controls.update();
          controls.enabled = true;
          isFlying.current = false;
        },
      });
    }

    gl.domElement.addEventListener('pointerdown', handlePointerDown);
    return () => gl.domElement.removeEventListener('pointerdown', handlePointerDown);
  }, [camera, gl]);

  return null;
}
