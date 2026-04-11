'use client';
export default function ToolNode() {
  return (
    <mesh>
      <dodecahedronGeometry args={[1]} />
      <meshStandardMaterial color="#00CED1" />
    </mesh>
  );
}
