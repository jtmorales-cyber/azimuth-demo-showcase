import { describe, it, expect } from 'vitest';
import {
  initParticles,
  attractionForce,
  breatheAnimation,
  PARTICLE_COUNT,
  ORBIT_RADIUS_MIN,
  ORBIT_RADIUS_MAX,
  PARTICLE_SIZE_MIN,
  PARTICLE_SIZE_MAX,
} from '../novaParticles';

describe('initParticles', () => {
  const data = initParticles(1000); // smaller count for test speed

  it('produces correct array lengths', () => {
    expect(data.orbitRadius.length).toBe(1000);
    expect(data.angularVelocity.length).toBe(1000);
    expect(data.phaseOffset.length).toBe(1000);
    expect(data.orbitTilt.length).toBe(1000);
    expect(data.orbitTiltAxis.length).toBe(2000); // 2 per particle
    expect(data.baseSize.length).toBe(1000);
    expect(data.colorT.length).toBe(1000);
  });

  it('orbit radii are within spec bounds [1.2, 3.8]', () => {
    for (let i = 0; i < data.orbitRadius.length; i++) {
      expect(data.orbitRadius[i]).toBeGreaterThanOrEqual(ORBIT_RADIUS_MIN);
      expect(data.orbitRadius[i]).toBeLessThanOrEqual(ORBIT_RADIUS_MAX);
    }
  });

  it('angular velocities are positive', () => {
    for (let i = 0; i < data.angularVelocity.length; i++) {
      expect(data.angularVelocity[i]).toBeGreaterThan(0);
    }
  });

  it('phase offsets are within [0, 2PI]', () => {
    for (let i = 0; i < data.phaseOffset.length; i++) {
      expect(data.phaseOffset[i]).toBeGreaterThanOrEqual(0);
      expect(data.phaseOffset[i]).toBeLessThan(Math.PI * 2);
    }
  });

  it('particle sizes are within spec bounds [0.02, 0.08]', () => {
    for (let i = 0; i < data.baseSize.length; i++) {
      expect(data.baseSize[i]).toBeGreaterThanOrEqual(PARTICLE_SIZE_MIN);
      expect(data.baseSize[i]).toBeLessThanOrEqual(PARTICLE_SIZE_MAX);
    }
  });

  it('colorT values are within [0, 1]', () => {
    for (let i = 0; i < data.colorT.length; i++) {
      expect(data.colorT[i]).toBeGreaterThanOrEqual(0);
      expect(data.colorT[i]).toBeLessThanOrEqual(1);
    }
  });

  it('uses default PARTICLE_COUNT when no count specified', () => {
    const full = initParticles();
    expect(full.orbitRadius.length).toBe(PARTICLE_COUNT);
  });
});

describe('attractionForce', () => {
  it('clamps to 0.4 at very close range', () => {
    expect(attractionForce(0.01)).toBe(0.4);
    expect(attractionForce(0)).toBe(0.4);
  });

  it('returns clamped value at distance 1.0', () => {
    // 1/(1+0.5) = 0.667, clamped to 0.4
    expect(attractionForce(1.0)).toBe(0.4);
  });

  it('falls off at distance 5.0', () => {
    // 1/(25+0.5) ≈ 0.039
    const force = attractionForce(5.0);
    expect(force).toBeCloseTo(0.039, 2);
    expect(force).toBeLessThan(0.1);
  });

  it('approaches zero at large distances', () => {
    expect(attractionForce(100)).toBeLessThan(0.001);
  });

  it('never exceeds 0.4', () => {
    for (let d = 0; d < 50; d += 0.1) {
      expect(attractionForce(d)).toBeLessThanOrEqual(0.4);
    }
  });

  it('is always non-negative', () => {
    for (let d = 0; d < 50; d += 0.1) {
      expect(attractionForce(d)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('breatheAnimation', () => {
  const period = 4; // 4 seconds

  it('returns baseline at t=0', () => {
    const result = breatheAnimation(0, period);
    expect(result.intensity).toBe(2.5);
    expect(result.distance).toBe(12);
  });

  it('reaches max at quarter period', () => {
    const result = breatheAnimation(period / 4, period);
    expect(result.intensity).toBeCloseTo(2.9, 1);
    expect(result.distance).toBeCloseTo(12.5, 1);
  });

  it('reaches min at three-quarter period', () => {
    const result = breatheAnimation((3 * period) / 4, period);
    expect(result.intensity).toBeCloseTo(2.1, 1);
    expect(result.distance).toBeCloseTo(11.5, 1);
  });

  it('intensity always within [2.1, 2.9]', () => {
    for (let t = 0; t < period * 3; t += 0.01) {
      const { intensity } = breatheAnimation(t, period);
      expect(intensity).toBeGreaterThanOrEqual(2.1 - 0.01);
      expect(intensity).toBeLessThanOrEqual(2.9 + 0.01);
    }
  });

  it('distance always within [11.5, 12.5]', () => {
    for (let t = 0; t < period * 3; t += 0.01) {
      const { distance } = breatheAnimation(t, period);
      expect(distance).toBeGreaterThanOrEqual(11.5 - 0.01);
      expect(distance).toBeLessThanOrEqual(12.5 + 0.01);
    }
  });
});
