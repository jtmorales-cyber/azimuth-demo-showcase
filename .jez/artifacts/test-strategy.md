# Test Strategy: DepthGrid + NOVASphere

**Date**: 2026-04-11
**Components**: `src/components/three/DepthGrid.tsx`, `src/components/three/NOVASphere.tsx`
**Performance target**: 60fps sustained at 1920x1080 with both components + postprocessing active

---

## Risk Assessment

| Component | Risk | Severity | Mitigation |
|-----------|------|----------|------------|
| NOVASphere: 15K CPU-side `setMatrixAt` per frame | Frame budget blown on particle loop | **High** | Benchmark loop time, bail to GPU compute if >4ms |
| NOVASphere: `instanceColor.needsUpdate` every frame | Buffer upload stall | **Medium** | Only mark dirty during hover state, not idle |
| NOVASphere: `new THREE.Vector3()` inside useFrame | GC pressure from per-frame allocations | **High** | Audit for allocations — must be zero per frame |
| DepthGrid: custom fragment shader | Shader compile failure on some GPUs | **Low** | Fallback to drei Grid if compile fails |
| DepthGrid: `discard` in fragment shader | Early-Z optimization defeated | **Low** | Acceptable — grid is a single draw call |
| Both + Bloom + Vignette + ToneMapping | Combined draw call and pass count | **Medium** | Measure full pipeline frame time |

---

## Test Plan

### 1. Performance Benchmark (Automated)

**What**: Measure per-frame cost of NOVASphere particle loop and DepthGrid shader.

**How**: Add a `<PerfMonitor>` component inside the R3F Canvas that measures:
- `useFrame` callback duration for NOVASphere (via `performance.now()` wrapper)
- Total frame time from R3F's internal clock
- Draw call count from `gl.info.render.calls`
- Triangle count from `gl.info.render.triangles`

**Pass criteria**:
| Metric | Target | Fail threshold |
|--------|--------|----------------|
| NOVASphere useFrame loop | <4ms | >6ms |
| Total frame time | <16.6ms (60fps) | >18ms (55fps) |
| Draw calls (full scene) | <15 | >25 |
| Triangle count | <500K | >750K |

**File**: `src/components/three/PerfMonitor.tsx`

### 2. GC Allocation Audit (Manual, one-time)

**What**: Verify zero per-frame heap allocations in useFrame callbacks.

**How**: Chrome DevTools → Performance → Record 5 seconds → check Allocation timeline. The NOVASphere useFrame currently has two `new THREE.Vector3()` calls inside the loop — these MUST be hoisted to module-level temps.

**Known issues to fix**:
- `NOVASphere.tsx:140` — `new THREE.Vector3(...position)` inside useFrame. Move to ref.
- `NOVASphere.tsx:142` — `new THREE.Vector3()` for closestPoint. Move to module-level temp.

**Pass criteria**: Zero `new` calls inside any useFrame callback.

### 3. Particle Data Initialization (Unit Test)

**What**: Verify `initParticles()` produces valid data within spec constraints.

**Tests**:
- All orbit radii within [1.2, 3.8]
- All angular velocities > 0
- All phase offsets within [0, 2PI]
- All base sizes within [0.02, 0.08]
- All colorT values within [0, 1]
- Color gradient: particles with smaller orbit radius have lower colorT (more amber)
- Array lengths match PARTICLE_COUNT

**Type**: Unit test (Vitest, no DOM/WebGL needed)
**File**: `src/components/three/__tests__/NOVASphere.test.ts`

### 4. Scene Visibility (Integration Test)

**What**: DepthGrid hides during boot/gauntlet, shows during hub/showcases.

**Tests**:
- Set store to `boot` → `uVisibility` lerps to 0 → mesh.visible = false
- Set store to `hub` → `uVisibility` lerps to 1 → mesh.visible = true
- Set store to `gauntlet` → grid invisible
- Transition from `gauntlet` to `hub` → smooth fade-in (not instant)

**Type**: Integration test (requires Zustand store mock + useFrame simulation)

### 5. Breathing Animation Ranges (Unit Test)

**What**: Core light intensity and distance stay within spec bounds.

**Tests**:
- At t=0: intensity = 2.5, distance = 12
- At t=BREATHE_PERIOD/4: intensity at max (2.5 + 0.4 = 2.9)
- At t=3*BREATHE_PERIOD/4: intensity at min (2.5 - 0.4 = 2.1)
- Intensity always within [2.1, 2.9]
- Distance always within [11.5, 12.5]

**Type**: Unit test (math validation)

### 6. Hover Attraction Physics (Unit Test)

**What**: Inverse-square force produces correct behavior.

**Tests**:
- At distance 0.1 from attractor: force clamped to 0.4 (not infinity)
- At distance 1.0: force = 1/(1+0.5) = 0.67, clamped to 0.4
- At distance 5.0: force = 1/(25+0.5) ≈ 0.039 — negligible
- Force always multiplied by ATTRACTION_LERP (0.07) — displacement is small

**Type**: Unit test (math validation)

### 7. Visual Regression (Manual Checklist)

Run dev server, open in Chrome at 1920x1080. Check:

- [ ] **DepthGrid**: Three grid tiers visible (minor faint, major clear, section bold)
- [ ] **DepthGrid**: Grid fades to transparent at horizon (no hard edge)
- [ ] **DepthGrid**: Edge softness visible (vignette on grid plane)
- [ ] **DepthGrid**: Moving cursor shifts grid position (parallax)
- [ ] **DepthGrid**: Intersection dots pulse at varied rates
- [ ] **DepthGrid**: Grid hidden during boot/gauntlet scenes
- [ ] **DepthGrid**: No bloom glow on grid lines (compare with bloom on/off)
- [ ] **NOVASphere**: Particles form a 3D sphere shape, not a flat ring
- [ ] **NOVASphere**: Amber glow at center with bloom halo
- [ ] **NOVASphere**: Particles orbit smoothly (no jitter or stutter)
- [ ] **NOVASphere**: Core breathes visibly (4s cycle)
- [ ] **NOVASphere**: Hover over sphere → particles pull toward cursor
- [ ] **NOVASphere**: Color gradient: amber center → cyan edges
- [ ] **NOVASphere**: Particle sizes vary (larger near core, smaller at edges)
- [ ] **Combined**: Both render simultaneously at 60fps
- [ ] **Combined**: Bloom only on NOVA core, not on grid

### 8. Shader Compilation Smoke Test

**What**: DepthGrid shader compiles without errors on target browser.

**How**: Check browser console for `THREE.WebGLProgram: Shader Error` messages on page load.

**Pass criteria**: No shader compilation errors. `gl.getShaderInfoLog()` returns empty string.

---

## Implementation Priority

1. **Fix GC allocations** (item 2) — known bugs, fix before measuring perf
2. **PerfMonitor component** (item 1) — establishes baseline
3. **Unit tests for particle init + physics** (items 3, 5, 6) — pure math, fast to write
4. **Visual regression checklist** (item 7) — manual, run once per milestone
5. **Scene visibility integration test** (item 4) — after Vitest is set up
6. **Shader smoke test** (item 8) — automated via dev server startup check
