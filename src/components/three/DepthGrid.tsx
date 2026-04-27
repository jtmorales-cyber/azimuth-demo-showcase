'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePortalStore, type SceneName } from '@/state/portalStore';

interface DepthGridProps {
  opacity?: number;
  color?: string;
}

/** Scenes where the grid is visible */
const VISIBLE_SCENES = new Set<SceneName>([
  'hub', 'maps', 'kit', 'base', 'scout',
]);

const vertexShader = /* glsl */ `
  varying vec2 vWorldPos;
  varying float vDistFromCenter;
  varying vec2 vUv;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xz;
    vDistFromCenter = length(worldPos.xz);
    vUv = uv;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uFadeDistance;
  uniform float uVisibility;

  varying vec2 vWorldPos;
  varying float vDistFromCenter;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    if (uVisibility < 0.001) discard;

    float distFade = 1.0 - smoothstep(0.0, uFadeDistance, vDistFromCenter);

    vec2 edgeUv = vUv * 2.0 - 1.0;
    float edgeDist = length(edgeUv);
    float edgeSoftness = 1.0 - smoothstep(0.6, 1.0, edgeDist);

    vec2 majorGrid = abs(fract(vWorldPos / 2.0 - 0.5) - 0.5) * 2.0;
    float majorLineX = 1.0 - smoothstep(0.0, 0.04, majorGrid.x);
    float majorLineY = 1.0 - smoothstep(0.0, 0.04, majorGrid.y);
    float majorLines = max(majorLineX, majorLineY);

    vec2 minorGrid = abs(fract(vWorldPos / 0.5 - 0.5) - 0.5) * 0.5;
    float minorLineX = 1.0 - smoothstep(0.0, 0.02, minorGrid.x);
    float minorLineY = 1.0 - smoothstep(0.0, 0.02, minorGrid.y);
    float minorLines = max(minorLineX, minorLineY) * 0.1;

    float minorDistFade = 1.0 - smoothstep(0.0, uFadeDistance * 0.4, vDistFromCenter);
    minorLines *= minorDistFade;

    vec2 sectionGrid = abs(fract(vWorldPos / 10.0 - 0.5) - 0.5) * 10.0;
    float sectionLineX = 1.0 - smoothstep(0.0, 0.06, sectionGrid.x);
    float sectionLineY = 1.0 - smoothstep(0.0, 0.06, sectionGrid.y);
    float sectionLines = max(sectionLineX, sectionLineY) * 1.4;

    float lines = max(max(majorLines, minorLines), sectionLines);

    vec2 nearestIntersection = round(vWorldPos / 2.0) * 2.0;
    float distToIntersection = length(vWorldPos - nearestIntersection);
    float dot = 1.0 - smoothstep(0.06, 0.12, distToIntersection);

    float phase = hash(nearestIntersection) * 6.2831;
    float speed = 0.4 + hash(nearestIntersection + 1.0) * 0.6;
    float pulse = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * speed + phase));

    float pulseChance = step(0.7, hash(nearestIntersection + 2.0));
    float intersectionGlow = dot * mix(0.2, pulse, pulseChance) * 0.6;

    float alpha = (lines + intersectionGlow) * distFade * edgeSoftness * uOpacity * uVisibility;

    vec3 gridColor = uColor * 0.55;
    vec3 intersectionColor = uColor * 0.7;
    float intersectionMix = intersectionGlow / max(lines + intersectionGlow, 0.001);
    vec3 finalColor = mix(gridColor, intersectionColor, intersectionMix);

    if (alpha < 0.005) discard;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export default function DepthGrid({ opacity = 0.22, color = '#00CED1' }: DepthGridProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  const smoothPointer = useRef({ x: 0, y: 0 });
  const targetVisibility = useRef(1);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
      uFadeDistance: { value: 60.0 },
      uVisibility: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, delta) => {
    const currentScene = usePortalStore.getState().currentScene;

    targetVisibility.current = VISIBLE_SCENES.has(currentScene) ? 1 : 0;
    const currentVis = uniforms.uVisibility.value;
    uniforms.uVisibility.value += (targetVisibility.current - currentVis) * Math.min(delta * 3, 1);

    if (uniforms.uVisibility.value < 0.001) {
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }
    if (meshRef.current) meshRef.current.visible = true;

    uniforms.uTime.value += delta;

    if (meshRef.current) {
      const lerpFactor = 0.05;
      smoothPointer.current.x += (pointer.x - smoothPointer.current.x) * lerpFactor;
      smoothPointer.current.y += (pointer.y - smoothPointer.current.y) * lerpFactor;

      meshRef.current.position.x = smoothPointer.current.x * 0.4;
      meshRef.current.position.z = -smoothPointer.current.y * 0.3;
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -5, 0]}
    >
      <planeGeometry args={[200, 200, 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}
