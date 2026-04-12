import { describe, it, expect } from 'vitest';
import {
  createDodecahedron,
  createCube,
  createSphere,
  createOctahedron,
  createCuboctahedron,
  createBrandGeometry,
} from '../geometries';

describe('createDodecahedron', () => {
  it('produces a BufferGeometry with position attribute', () => {
    const geom = createDodecahedron(1);
    expect(geom.attributes.position).toBeDefined();
    expect(geom.attributes.position.itemSize).toBe(3);
  });
});

describe('createCube', () => {
  it('produces a BufferGeometry', () => {
    const geom = createCube(2);
    expect(geom.attributes.position).toBeDefined();
  });
});

describe('createSphere', () => {
  it('produces a BufferGeometry with default 48 segments', () => {
    const geom = createSphere(1);
    expect(geom.attributes.position).toBeDefined();
    // 48 segments = many vertices
    expect(geom.attributes.position.count).toBeGreaterThan(2000);
  });

  it('accepts custom segment count', () => {
    const geom = createSphere(1, 8);
    expect(geom.attributes.position.count).toBeLessThan(200);
  });
});

describe('createOctahedron', () => {
  it('produces a BufferGeometry', () => {
    const geom = createOctahedron(1);
    expect(geom.attributes.position).toBeDefined();
  });
});

describe('createCuboctahedron', () => {
  const radius = 2;
  const geom = createCuboctahedron(radius);

  it('has exactly 12 vertices', () => {
    expect(geom.attributes.position.count).toBe(12);
  });

  it('has exactly 20 triangles (60 indices)', () => {
    // 8 triangular faces + 6 square faces × 2 triangles each = 20 triangles
    const index = geom.index;
    expect(index).not.toBeNull();
    expect(index!.count).toBe(60);
  });

  it('all vertices are at distance ≈ radius from origin', () => {
    const pos = geom.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i];
      const y = pos[i + 1];
      const z = pos[i + 2];
      const dist = Math.sqrt(x * x + y * y + z * z);
      expect(dist).toBeCloseTo(radius, 5);
    }
  });

  it('has computed normals', () => {
    expect(geom.attributes.normal).toBeDefined();
    expect(geom.attributes.normal.count).toBe(12);
  });

  it('normals point outward (dot product with vertex position > 0)', () => {
    const pos = geom.attributes.position.array as Float32Array;
    const norm = geom.attributes.normal.array as Float32Array;
    for (let i = 0; i < pos.length; i += 3) {
      const px = pos[i];
      const py = pos[i + 1];
      const pz = pos[i + 2];
      const nx = norm[i];
      const ny = norm[i + 1];
      const nz = norm[i + 2];
      // Vertex-position-to-center dot with averaged-normal should be > 0
      // (vertices are on the outside of the hull, normals average to outward)
      const dot = px * nx + py * ny + pz * nz;
      expect(dot).toBeGreaterThan(0);
    }
  });
});

describe('createBrandGeometry', () => {
  it('dispatches to createDodecahedron for "dodecahedron"', () => {
    const geom = createBrandGeometry('dodecahedron', 1);
    expect(geom.attributes.position).toBeDefined();
  });

  it('dispatches to createCuboctahedron for "cuboctahedron"', () => {
    const geom = createBrandGeometry('cuboctahedron', 1);
    expect(geom.attributes.position.count).toBe(12);
  });

  it('dispatches to createSphere for "sphere"', () => {
    const geom = createBrandGeometry('sphere', 1);
    expect(geom.attributes.position.count).toBeGreaterThan(100);
  });
});
