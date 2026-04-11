/**
 * Pure data initialization and physics math for the NOVA particle sphere.
 * Extracted for testability — no React or Three.js dependencies.
 */

export const PARTICLE_COUNT = 15000;
export const ORBIT_RADIUS_MIN = 1.2;
export const ORBIT_RADIUS_MAX = 3.8;
export const PARTICLE_SIZE_MIN = 0.02;
export const PARTICLE_SIZE_MAX = 0.08;
export const ATTRACTION_LERP = 0.07;

export interface ParticleData {
  orbitRadius: Float32Array;
  angularVelocity: Float32Array;
  phaseOffset: Float32Array;
  orbitTilt: Float32Array;
  orbitTiltAxis: Float32Array;
  baseSize: Float32Array;
  colorT: Float32Array;
}

export function initParticles(count: number = PARTICLE_COUNT): ParticleData {
  const orbitRadius = new Float32Array(count);
  const angularVelocity = new Float32Array(count);
  const phaseOffset = new Float32Array(count);
  const orbitTilt = new Float32Array(count);
  const orbitTiltAxis = new Float32Array(count * 2);
  const baseSize = new Float32Array(count);
  const colorT = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const r = Math.random();
    orbitRadius[i] = ORBIT_RADIUS_MIN + (ORBIT_RADIUS_MAX - ORBIT_RADIUS_MIN) * (r * r * 0.6 + r * 0.4);

    const normalizedR = (orbitRadius[i] - ORBIT_RADIUS_MIN) / (ORBIT_RADIUS_MAX - ORBIT_RADIUS_MIN);
    angularVelocity[i] = (0.15 + Math.random() * 0.25) * (1.0 - normalizedR * 0.6);

    phaseOffset[i] = Math.random() * Math.PI * 2;
    orbitTilt[i] = (Math.random() - 0.5) * Math.PI * 0.9;
    orbitTiltAxis[i * 2] = Math.random() * Math.PI * 2;
    orbitTiltAxis[i * 2 + 1] = (Math.random() - 0.5) * 0.3;

    baseSize[i] = PARTICLE_SIZE_MIN + (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN) * (1.0 - normalizedR * 0.7) * (0.5 + Math.random() * 0.5);
    colorT[i] = normalizedR;
  }

  return { orbitRadius, angularVelocity, phaseOffset, orbitTilt, orbitTiltAxis, baseSize, colorT };
}

/**
 * Compute hover attraction force with inverse-square falloff.
 * Clamped to prevent infinity at close range.
 */
export function attractionForce(distance: number): number {
  return Math.min(0.4, 1.0 / (distance * distance + 0.5));
}

/**
 * Compute breathing animation value for core light.
 * Returns { intensity, distance } for the point light.
 */
export function breatheAnimation(time: number, period: number): { intensity: number; distance: number } {
  const breathe = Math.sin(time * (Math.PI * 2 / period));
  return {
    intensity: 2.5 + breathe * 0.4,
    distance: 12 + breathe * 0.5,
  };
}
