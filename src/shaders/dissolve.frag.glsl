// Gauntlet → Hub dissolve transition — fragment shader
// Handles fracture lines, color transition (gray → cyan), and fade-out

uniform float progress;
uniform float time;
uniform vec3 colorGray;   // #6B6B6B
uniform vec3 colorCyan;   // #00CED1

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying float vDisplacement;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Grid-aligned fracture pattern — follows structural lines
float fractureLine(vec2 uv, float scale, float width) {
  vec2 grid = fract(uv * scale);
  float lineX = smoothstep(0.0, width, grid.x) * smoothstep(0.0, width, 1.0 - grid.x);
  float lineY = smoothstep(0.0, width, grid.y) * smoothstep(0.0, width, 1.0 - grid.y);
  return 1.0 - min(lineX, lineY);
}

void main() {
  // --- Phase 1: Fractures (progress 0.0–0.3) ---
  float fractureT = smoothstep(0.0, 0.3, progress);

  // Multi-scale fracture lines aligned to grid structure
  float fracture = 0.0;
  fracture += fractureLine(vUv, 4.0, 0.02) * 0.6;   // major grid (ceiling/door frames)
  fracture += fractureLine(vUv, 8.0, 0.015) * 0.3;   // minor subdivision
  fracture += fractureLine(vUv, 16.0, 0.01) * 0.1;   // hairline cracks

  // Fractures reveal progressively
  float fractureReveal = fracture * fractureT;

  // Fracture glow — first hint of cyan at the crack edges
  vec3 fractureGlow = colorCyan * fractureReveal * 0.4;

  // --- Phase 2: Color transition (progress 0.3–0.8) ---
  float colorT = smoothstep(0.3, 0.8, progress);

  // Base concrete color
  vec3 baseColor = colorGray;

  // Transition: gray → cyan, fracture lines lead the color change
  float colorMix = colorT + fractureReveal * 0.3;
  colorMix = clamp(colorMix, 0.0, 1.0);
  vec3 surfaceColor = mix(baseColor, colorCyan, colorMix);

  // Add fracture glow on top
  surfaceColor += fractureGlow * (1.0 - colorT);

  // --- Phase 3: Fragment luminance + fade (progress 0.6–1.0) ---
  float fadeT = smoothstep(0.7, 1.0, progress);

  // Displaced fragments become luminous
  float luminance = smoothstep(0.0, 3.0, vDisplacement) * 0.8;
  surfaceColor += colorCyan * luminance;

  // Fragments fade to transparent as they stream away
  float alpha = 1.0 - fadeT;

  // Displaced fragments that are far out fade faster
  alpha *= 1.0 - smoothstep(3.0, 8.0, vDisplacement);

  // Early discard for fully faded fragments
  if (alpha < 0.01) discard;

  // Ensure displaced fragments are bright enough for bloom to catch
  if (vDisplacement > 1.0) {
    surfaceColor = mix(surfaceColor, colorCyan * 1.5, smoothstep(1.0, 3.0, vDisplacement));
  }

  gl_FragColor = vec4(surfaceColor, alpha);
}
