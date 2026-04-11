'use client';
export default function CompassRing() {
  return (
    <mesh>
      <torusGeometry args={[8, 0.05, 16, 100]} />
      <meshStandardMaterial color="#00CED1" />
    </mesh>
  );
}
