/**
 * Brand Geometry Factory — design-system.md §8
 *
 * Returns Three.js BufferGeometry instances for all five Azimuth brand forms.
 * Four wrap Three.js built-ins for API consistency; the cuboctahedron (NOVA's
 * form) is constructed manually from vertices and faces.
 *
 * Usage:
 *   const geom = createDodecahedron(1.5);
 *   const mesh = new THREE.Mesh(geom, material);
 *
 * For flat/faceted shading, set `material.flatShading = true`.
 */

import * as THREE from 'three';

// ═══════════════════════════════════════════════════════════════════════════
// MAPS — Dodecahedron (12 faces)
// ═══════════════════════════════════════════════════════════════════════════

export function createDodecahedron(radius: number): THREE.BufferGeometry {
  // detail=0 gives flat pentagonal faces (no subdivision)
  return new THREE.DodecahedronGeometry(radius, 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// K.I.T. — Cube / Hexahedron (6 faces)
// ═══════════════════════════════════════════════════════════════════════════

export function createCube(size: number): THREE.BufferGeometry {
  return new THREE.BoxGeometry(size, size, size);
}

// ═══════════════════════════════════════════════════════════════════════════
// BASE — Sphere (∞ faces, high-poly smooth)
// ═══════════════════════════════════════════════════════════════════════════

export function createSphere(
  radius: number,
  segments: number = 48
): THREE.BufferGeometry {
  return new THREE.SphereGeometry(radius, segments, segments);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCOUT — Octahedron (8 faces)
// ═══════════════════════════════════════════════════════════════════════════

export function createOctahedron(radius: number): THREE.BufferGeometry {
  return new THREE.OctahedronGeometry(radius, 0);
}

// ═══════════════════════════════════════════════════════════════════════════
// NOVA — Cuboctahedron (14 faces: 8 triangles + 6 squares)
//
// Not a Three.js built-in. Constructed manually from vertices/faces.
//
// 12 vertices are all permutations of (±1, ±1, 0), all at distance √2 from
// origin. We scale by radius/√2 so the circumradius equals the caller's
// requested radius.
// ═══════════════════════════════════════════════════════════════════════════

export function createCuboctahedron(radius: number): THREE.BufferGeometry {
  const s = radius / Math.SQRT2; // scale factor

  // 12 vertices — all permutations of (±1, ±1, 0) × s
  const vertices = new Float32Array([
    // z = 0 plane
     s,  s, 0,   //  0: ( 1,  1,  0)
     s, -s, 0,   //  1: ( 1, -1,  0)
    -s,  s, 0,   //  2: (-1,  1,  0)
    -s, -s, 0,   //  3: (-1, -1,  0)
    // y = 0 plane
     s, 0,  s,   //  4: ( 1,  0,  1)
     s, 0, -s,   //  5: ( 1,  0, -1)
    -s, 0,  s,   //  6: (-1,  0,  1)
    -s, 0, -s,   //  7: (-1,  0, -1)
    // x = 0 plane
    0,  s,  s,   //  8: ( 0,  1,  1)
    0,  s, -s,   //  9: ( 0,  1, -1)
    0, -s,  s,   // 10: ( 0, -1,  1)
    0, -s, -s,   // 11: ( 0, -1, -1)
  ]);

  // Faces are indices into the vertex array.
  // Winding is counter-clockwise when viewed from outside → normals face out.
  // (Verified via cross-product centroid dot test — see __tests__/geometries.test.ts)
  const indices: number[] = [
    // ───── 8 triangle faces (one per octant / corner of inscribed octahedron)
    // (+x, +y, +z) octant
    0, 8, 4,
    // (+x, +y, -z) octant
    0, 5, 9,
    // (+x, -y, +z) octant
    1, 4, 10,
    // (+x, -y, -z) octant
    1, 11, 5,
    // (-x, +y, +z) octant
    2, 6, 8,
    // (-x, +y, -z) octant
    2, 9, 7,
    // (-x, -y, +z) octant
    3, 10, 6,
    // (-x, -y, -z) octant
    3, 7, 11,

    // ───── 6 square faces (one per ±x/±y/±z axis of inscribed cube)
    // Each square is triangulated as 2 triangles sharing a diagonal.
    // +X face
    0, 4, 1,
    0, 1, 5,
    // -X face
    2, 7, 3,
    2, 3, 6,
    // +Y face
    0, 9, 2,
    0, 2, 8,
    // -Y face
    1, 10, 3,
    1, 3, 11,
    // +Z face
    4, 6, 10,
    4, 8, 6,
    // -Z face
    5, 7, 9,
    5, 11, 7,
  ];
  // Total: 8 + (6 × 2) = 20 triangles, 60 indices

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

// ═══════════════════════════════════════════════════════════════════════════
// Factory lookup — maps the GEOMETRY token form string to the factory fn
// ═══════════════════════════════════════════════════════════════════════════

export type BrandForm =
  | 'dodecahedron'
  | 'cube'
  | 'sphere'
  | 'octahedron'
  | 'cuboctahedron';

export function createBrandGeometry(
  form: BrandForm,
  radius: number
): THREE.BufferGeometry {
  switch (form) {
    case 'dodecahedron':
      return createDodecahedron(radius);
    case 'cube':
      return createCube(radius * 2); // cube "radius" is half-diagonal; pass diameter
    case 'sphere':
      return createSphere(radius);
    case 'octahedron':
      return createOctahedron(radius);
    case 'cuboctahedron':
      return createCuboctahedron(radius);
  }
}
