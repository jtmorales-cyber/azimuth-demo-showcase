// Gauntlet → Hub dissolve transition — vertex shader
// Handles fragment displacement: pieces lift off along surface normals

uniform float progress;
uniform float time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDisplacement;

// Pseudo-random hash for per-fragment variation
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Grid-aligned noise — fractures follow structural lines
float gridNoise(vec2 uv, float scale) {
  vec2 cell = floor(uv * scale);
  return hash(cell);
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPos = worldPos.xyz;

  // --- Fragment displacement (progress 0.3–1.0) ---
  float displaceStart = 0.3;
  float displaceT = smoothstep(displaceStart, 0.8, progress);

  // Per-fragment seed based on UV grid (aligned to ceiling/door structure)
  float seed = gridNoise(uv, 8.0);

  // Stagger: each fragment lifts at a different time
  float fragmentDelay = seed * 0.3;
  float fragmentT = smoothstep(displaceStart + fragmentDelay, 0.7 + fragmentDelay, progress);

  // Displacement: outward along normal + upward drift + forward stream
  vec3 displaceDir = normal * 0.6 + vec3(0.0, 1.0, 0.0) * 0.4;

  // At high progress, fragments stream toward camera (negative Z)
  float streamT = smoothstep(0.6, 1.0, progress);
  displaceDir += vec3(0.0, 0.0, -1.0) * streamT * 3.0;

  // Add slight turbulence
  float turbulence = sin(time * 2.0 + seed * 6.28) * 0.15;
  displaceDir += vec3(turbulence, turbulence * 0.5, 0.0);

  float displaceMagnitude = fragmentT * (2.0 + seed * 4.0);
  vec3 displaced = position + displaceDir * displaceMagnitude;

  vDisplacement = displaceMagnitude;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
