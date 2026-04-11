# Design Review: Dissolve Transition Shader
**Date**: 2026-04-11
**Component**: `src/shaders/dissolve.{vert,frag}.glsl` + `src/components/three/DissolveTransition.tsx`
**Narrative target**: "The concrete doesn't fade — it fails."

## Overall Impression

The dissolve shader implements all four phases specified in The Gauntlet.md: hairline fractures → fragment separation → color shift → particle stream. The GPU-only approach (vertex displacement + fragment color) avoids CPU geometry modification. The grid-aligned fracture pattern follows structural lines (ceiling grid, door frames) as specified. The transition maps cleanly to scroll range 0.15–0.30.

## Shader Architecture Review

### Vertex Shader (dissolve.vert.glsl)

| Phase | Progress | Effect | Assessment |
|-------|----------|--------|------------|
| Idle | 0.0 | No displacement | Correct — normal concrete |
| Fragment lift | 0.3–0.8 | Outward + upward displacement | Correct — staggered per grid cell via `hash(cell)` |
| Streaming | 0.6–1.0 | Forward (negative Z) stream | Correct — fragments fly past camera |
| Turbulence | Throughout | Sin-based wobble | Subtle (0.15 amplitude) — not nauseating |

**Per-fragment stagger**: Each grid cell has a unique delay (0–0.3s) based on hash. This prevents the uniform "everything lifts at once" look. Good design — the stagger IS the liberation narrative.

**Displacement direction**: `normal * 0.6 + up * 0.4 + forward * streamT * 3.0`. The normal-based lift ensures fragments go outward from walls/ceiling/floor correctly, not all in one direction.

### Fragment Shader (dissolve.frag.glsl)

| Phase | Progress | Effect | Assessment |
|-------|----------|--------|------------|
| Fractures | 0.0–0.3 | Grid-aligned crack lines | 3 scales (4x, 8x, 16x) — reads as structural failure |
| Fracture glow | 0.0–0.3 | Faint cyan at crack edges | First hint of color — "the fracture pattern is the most beautiful thing in the Gauntlet" |
| Color shift | 0.3–0.8 | Gray → cyan | Fracture lines lead the color change (0.3 bias) — correct |
| Luminance | 0.6–1.0 | Displaced fragments glow | Fragments above 1.0 displacement get `colorCyan * 1.5` — should trigger bloom |
| Fade | 0.7–1.0 | Alpha → 0, discard | Clean exit, no abrupt cutoff |

## Findings

### Medium

- **Fracture line width may be too subtle at tablet distance** — The hairline cracks use `smoothstep` widths of 0.02/0.015/0.01. At the camera's gauntlet distance (Z ~10-20 from corridor surfaces), these may be subpixel. The "most beautiful thing in the Gauntlet" needs to be visible.
  - **Mitigation**: Test in browser. If invisible, increase widths to 0.03/0.025/0.015 and the fracture glow multiplier from 0.4 to 0.6.

- **Material override approach has edge cases** — `DissolveTransition` traverses child meshes and swaps materials. If the GauntletGeometry uses shared materials (which it does — module-level `concreteMaterial`), the swap works. But if any child mesh has `material` set to an array (multi-material), the swap would fail silently.
  - **Current risk**: Low — GauntletGeometry uses single materials per mesh. Monitor if branch corridor geometry gets more complex.

- **No chromatic aberration increase during transition** — The design spec mentions ChromaticAberration increasing during transitions (Section 6.4). This shader doesn't drive that. The postprocessing stack's ChromaticAberration should be driven by `transitionProgress` from the store.
  - **Future enhancement**: Connect `usePortalStore.transitionProgress` to ChromaticAberration offset in Scene.tsx.

### Low

- **Bloom catch timing** — Displaced fragments at `vDisplacement > 1.0` get `colorCyan * 1.5`, which should exceed the bloom luminance threshold of 0.6. However, with `toneMapped: false` not set on the ShaderMaterial... wait — ShaderMaterial bypasses tone mapping by default (no built-in tone mapping). The raw `gl_FragColor` values go directly to the postprocessing pipeline. Bloom WILL catch these fragments. No issue.

- **`time` uniform turbulence** — The sin-based wobble in the vertex shader uses `time * 2.0`, producing a gentle oscillation. At 60fps this is smooth. No jitter risk.

## What Looks Good

- **Grid-aligned fractures** — Multi-scale `fractureLine()` follows UV grid structure, not random noise. This matches "fractures race across the walls in geometric patterns — not random cracks, but clean lines that follow the grid."
- **Staggered fragment timing** — Hash-based per-cell delay creates progressive dissolution, not simultaneous collapse. Liberation, not destruction.
- **Color transition leading at fracture edges** — `colorMix = colorT + fractureReveal * 0.3` means fracture lines turn cyan before the surrounding surface. The cracks are the first to transform.
- **Clean scroll mapping** — Progress 0–1 maps to scroll 0.15–0.30. The DissolveTransition reads scrollProgress directly, no intermediate state needed.
- **Performance** — Zero CPU geometry ops. All displacement in vertex shader, all color in fragment shader. Same triangle count whether progress is 0 or 1.

## Top 3 Fixes

1. **Test fracture visibility at camera distance** — May need wider lines if subpixel at tablet viewing
2. **Wire ChromaticAberration to transition progress** — Missing postprocessing enhancement from the spec
3. **Add `toneMapped={false}` equivalent** — Verify bloom catches the cyan fragments by checking in browser with bloom on/off
