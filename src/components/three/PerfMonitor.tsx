'use client';

import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface PerfData {
  fps: number;
  frameMs: number;
  drawCalls: number;
  triangles: number;
}

/**
 * Real-time performance monitor for the R3F scene.
 * Displays FPS, frame time, draw calls, and triangle count.
 *
 * Mount inside <Canvas> during development. Remove for production.
 *
 * Usage: <PerfMonitor visible={true} />
 */
export default function PerfMonitor({ visible = false }: { visible?: boolean }) {
  const { gl } = useThree();
  const [data, setData] = useState<PerfData>({ fps: 0, frameMs: 0, drawCalls: 0, triangles: 0 });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const frameTimes = useRef<number[]>([]);

  useFrame(() => {
    const now = performance.now();
    const dt = now - lastTime.current;
    lastTime.current = now;

    frameTimes.current.push(dt);
    frameCount.current++;

    // Update display every 30 frames
    if (frameCount.current >= 30) {
      const avgMs = frameTimes.current.reduce((a, b) => a + b, 0) / frameTimes.current.length;
      const info = gl.info.render;

      setData({
        fps: Math.round(1000 / avgMs),
        frameMs: Math.round(avgMs * 10) / 10,
        drawCalls: info.calls,
        triangles: info.triangles,
      });

      frameTimes.current = [];
      frameCount.current = 0;
    }
  });

  if (!visible) return null;

  const fpsColor = data.fps >= 55 ? '#4ade80' : data.fps >= 40 ? '#fbbf24' : '#ef4444';

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        fontFamily: 'monospace',
        fontSize: 11,
        color: '#D8DEE9',
        background: 'rgba(10, 14, 26, 0.85)',
        padding: '6px 10px',
        borderRadius: 4,
        border: '1px solid rgba(0, 206, 209, 0.2)',
        pointerEvents: 'none',
        zIndex: 9999,
        whiteSpace: 'pre',
        lineHeight: 1.5,
      }}
    >
      <span style={{ color: fpsColor }}>{data.fps} fps</span>
      {`  ${data.frameMs}ms\n`}
      {`${data.drawCalls} draws  ${(data.triangles / 1000).toFixed(1)}K tris`}
    </Html>
  );
}
