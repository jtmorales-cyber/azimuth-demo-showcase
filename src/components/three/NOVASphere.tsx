'use client';
export default function NOVASphere() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#E8A030" />
    </mesh>
  );
}
