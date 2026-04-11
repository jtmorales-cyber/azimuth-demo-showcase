'use client';

import { useRef } from 'react';
import { Grid } from '@react-three/drei';

interface DepthGridProps {
  opacity?: number;
  color?: string;
}

export default function DepthGrid({ opacity = 0.2, color = '#00CED1' }: DepthGridProps) {
  const ref = useRef(null);

  return (
    <Grid
      ref={ref}
      args={[200, 200]}
      position={[0, -5, 0]}
      cellSize={2}
      cellThickness={0.6}
      cellColor={color}
      sectionSize={10}
      sectionThickness={1.2}
      sectionColor={color}
      fadeDistance={80}
      fadeStrength={1.5}
      infiniteGrid
    />
  );
}
