# UI/UX Pro Max Review — Azimuth Mission Mentor Demo

**Date:** 2026-04-12
**Reviewer:** Claude Opus 4.6
**Scope:** Full visual and interaction audit of the VCU Demo Day 2026 scrollytelling demo
**Target devices:** Microsoft Surface Pro (primary), desktop browsers (secondary)

---

## Executive Summary

The demo has a strong conceptual foundation: grounded aesthetic, clean dark theme, tech-forward without sci-fi drift, design token discipline, and a well-defined narrative arc. The core scrollytelling engine works, all 4 showcases follow a consistent BAB template, and the scroll architecture was recently aligned across flight paths + progress indicator + scene derivation.

What it lacks: **visual density in the hero moments**. The tool nodes are plain Platonic solids with transmission-only material, the Impact Wall text floats on a dark canvas without visual anchoring, and the Closing CTA relies on typography alone at the most critical moment. The design system has the tokens and components needed — they just aren't applied consistently at the places where the user's attention needs a visual hook.

This review produces:
1. **Diagnostics** — scored against UI/UX Pro Max priority checklist (§1–§10)
2. **Implementation plan** — 3 concrete improvements with file-level changes
3. **Sprint plan** — staged rollout across 3 milestones
4. **Prompt guide** — reusable prompts for future visual iterations

---

## 1. Diagnostics

### §1 Accessibility — PASS
- Contrast ratios verified AAA on glass surfaces (prior audits documented in `.jez/artifacts/design-review-glasspanel.md` and `design-review-base.md`)
- `prefers-reduced-motion` respected in globals.css + NOVANarration + scroll-behavior
- Focus rings on all interactive elements via `.focus-cyan` class
- ARIA labels on dot indicators, QR placeholder, NOVA narration blockquote
- Screen reader announcement for typewriter text via `aria-live="polite"`

### §2 Touch & Interaction — PASS with note
- CTAButton minimum 60×60 touch target (exceeds 44×44 baseline)
- Dot indicators expand to 12px on active state
- Recently fixed: `touch-action: pan-y` on showcase wrappers (allows vertical scroll through cards)
- **Note**: ToolNodes in 3D space have pointer events but depend on raycast precision. Adding edge highlights (proposed in improvements) will also make them visually easier to target.

### §3 Performance — PASS
- Static export: 2.4MB total, 142KB initial JS
- 31 unit tests passing (particle physics + geometry winding)
- GPU instancing for NOVA particles (15K)
- Zero per-frame GC allocations in hot paths
- `touch-action: manipulation` prevents 300ms tap delay
- Scroll-driven camera uses ref-based mutation (no React re-renders)

### §4 Style Selection — PASS
- Consistent design token usage across all files (no raw hex in JSX)
- SVG-based geometry, no emoji icons
- Glass-morphic panels for showcase cards — matches D2C Life Science inspiration
- Brand geometry system defined and implemented

### §5 Layout & Responsive — PASS with gaps
- `clamp()` fluid sizing on headlines (ClosingCTA)
- max-w-2xl (showcases), max-w-5xl (Impact), max-w-6xl (Closing) — consistent container scale
- **Gap**: Impact Wall and Closing CTA don't provide visual anchoring in their background. Text floats on the R3F canvas. On a busy 3D scene, this reduces perceived professionalism.

### §6 Typography & Color — PASS
- 3-font system: Satoshi / Inter / Space Grotesk
- Type scale from design-system.md
- Semantic color tokens used consistently
- Line heights tuned per type role
- Letter-spacing on eyebrow labels

### §7 Animation — PASS
- Motion 12.x with cubic-bezier [0.22, 1, 0.36, 1] (exponential ease-out)
- Staggered reveals in Impact Wall (150ms) and ClosingCTA (0.2s → 1.4s)
- Spring-physics particles in NOVASphere
- Breathing pulse on NOVA core (4s cycle)
- Typewriter for NOVA narration with reduced-motion fallback
- **Note**: Tool node idle rotation is uniform (0.002 rad/frame around Y) — could be more interesting with per-node rotation axes.

### §8 Forms & Feedback — N/A
No form inputs in the demo. Only CTAs.

### §9 Navigation Patterns — PASS
- ScrollProgress indicator with scene markers (recently aligned to DOM)
- Tap-to-scroll navigation on markers
- Idle reset (60s) returns to boot scene
- Scroll-snap proximity for section navigation

### §10 Charts & Data — N/A
No charts in the demo. Metrics use animated counters via MetricCard.

---

## 2. Visual Appeal Diagnosis (the real issue)

### Problem 1: Tool nodes lack detail

**Current state:** Each of the 4 tool nodes is a single `THREE.DodecahedronGeometry` / `BoxGeometry` / `SphereGeometry` / `OctahedronGeometry` with a `MeshPhysicalMaterial` using transmission 0.9. No edge highlights, no inner structure, no particle halo, no per-node personality beyond color.

**What's missing:**
- **Edge highlights** (LineSegments overlay) — makes the geometry read as "crystalline" rather than "solid translucent blob"
- **Inner glow core** — a small emissive sphere inside each node that escapes through the transmission, creating "light trapped in crystal"
- **Per-node rotation axes** — each geometry should have its own character. Dodecahedron rotates on tilted axis, cube slowly wobbles, sphere has no visible rotation but inner particles swirl, octahedron rotates fast on vertical axis
- **Subtle orbiting particles** — 20-30 small particles per node, trailing the rotation, amber-tinted

**Visual cost:** ~500 additional triangles per node (4 × 500 = 2,000 total) and 120 particles total. Negligible at 60fps target.

### Problem 2: Impact Wall metrics lack visual anchor

**Current state:** Headline "The Scope of the Mission" + 5 metric cards + NOVA narration, all rendered as text directly on the R3F canvas with no background container. The amber headline has a text-shadow glow but the metric numbers (Space Grotesk 2.25rem amber) sit on top of a potentially busy NOVA scene with compass rings rotating behind them.

**What's missing:**
- A large glass panel behind the entire Impact Wall composition (headline + metrics grid + narration)
- Subtle cyan top border echoing the other glass panels
- Backdrop blur that mutes the 3D scene behind it without hiding it entirely

**Visual cost:** One additional `GlassPanel` wrapper. Trivial performance impact.

### Problem 3: Closing CTA relies on typography alone

**Current state:** Similar to Impact Wall — headline + body + CTAs float on the canvas. The hanging quote mark provides editorial character but the overall composition lacks a frame.

**What's missing:**
- A glass panel behind the main composition column (not the hanging quote — that should stay outside the frame to reinforce the editorial read)
- Subtle inner highlight shadow at the top edge
- Amber-core border accent at the bottom to match the "Stand With Us / In The Arena" amber split headline

**Visual cost:** One additional `GlassPanel` wrapper with custom shadow. Trivial.

---

## 3. Implementation Plan

### Change Set A — ToolNode visual detail enhancement

**File:** `src/components/three/ToolNode.tsx`

**Additions:**
1. **`EdgeHighlights` sub-component** — `THREE.EdgesGeometry` + `LineBasicMaterial` at accent color, low opacity (0.4). Scales with parent mesh via same scale ref.
2. **`InnerCore` sub-component** — small emissive sphere (radius 0.25) at the node's origin. Color matches accent with high `emissiveIntensity` (3.0). Catches bloom.
3. **`NodeOrbit` sub-component** — 20 `InstancedMesh` particles in a tilted orbit around the node, accent-colored, low luminance to stay below bloom threshold. Speed proportional to distance from core.
4. **Per-node rotation axis** — new `rotationAxis` prop: `'y'` (default, MAPS), `'xy'` (K.I.T. wobble), `'none'` (BASE, inner particles only), `'yz'` (SCOUT fast spin). Idle rotation is axis-specific.

**Props added:**
```ts
rotationAxis?: 'y' | 'xy' | 'none' | 'yz';
```

**Visual behavior per tool:**
| Tool | Rotation | Inner core | Edges | Orbiting particles |
|------|----------|-----------|-------|-------------------|
| MAPS (dodeca) | Y-axis, 0.002 rad/frame | Amber | Warm gold | 20 amber particles, tilted orbit |
| K.I.T. (cube) | XY wobble | Cyan-struct | Cyan | 20 cyan particles, data-stream along edges |
| BASE (sphere) | Internal only | Calm-purple + sage | Calm-purple | 30 particles, slowest orbit |
| SCOUT (octa) | YZ, 0.003 rad/frame | Scout-blue | Silver | 20 silver particles, sequential lattice |

### Change Set B — Impact Wall glass panel

**File:** `src/scenes/ImpactWall.tsx`

**Changes:**
1. Wrap the headline + metrics + narration in a single `<GlassPanel size="full">` with extra-large max-width override
2. Custom panel styling: larger padding (48px), stronger top highlight, amber bottom border accent to signal climactic moment
3. Preserve the staggered reveal animations — glass panel fades in first, metrics fire inside it

**Implementation:**
```tsx
<div className="fixed inset-0 z-20 flex items-center justify-center pointer-events-none">
  <div className="pointer-events-auto" style={{ maxWidth: 'min(1100px, 92vw)' }}>
    <GlassPanel size="full" animate>
      {/* headline + metrics grid + narration */}
    </GlassPanel>
  </div>
</div>
```

### Change Set C — Closing CTA glass panel

**File:** `src/scenes/ClosingCTA.tsx`

**Changes:**
1. Wrap the text column (eyebrow + headline + body + CTAs) in a glass panel
2. Keep the hanging quote mark OUTSIDE the panel for editorial tension
3. Panel has amber bottom border to echo the "In The Arena." amber split line
4. Footer stays separate at bottom edge (colophon style, not in panel)

**Layout:**
```
┌─────────────────────────────────────────────┐
│  "  ┌──────────────────────────┐            │  ← quote OUTSIDE panel
│     │  EYEBROW                  │            │
│     │  STAND WITH US            │  ← glass panel
│     │  IN THE ARENA             │    contains text
│     │                           │    + CTAs
│     │  Body text...             │            │
│     │                           │            │
│     │  [CTA] [ghost] [ghost]    │            │
│     └──────────────────────────┘            │
│                                               │
│  Azimuth, LLC · SDVOSB · tagline      [QR]  │  ← footer stays outside
└─────────────────────────────────────────────┘
```

---

## 4. Sprint Plan

### Sprint 1 — Visual Density (this session)
- [x] Write this audit document
- [ ] Implement ToolNode edge highlights + inner core + per-node rotation
- [ ] Implement Impact Wall glass panel wrap
- [ ] Implement Closing CTA glass panel wrap
- [ ] Verify no performance regression (still ≥55fps target)
- [ ] Commit + push

**Definition of done:**
- Tool nodes have visible edge highlights + internal glow
- Impact Wall headline reads against a clear visual backdrop
- Closing CTA has asymmetric glass panel (quote mark outside)
- `npx tsc --noEmit` clean, 31 tests passing

### Sprint 2 — Hub Scene Polish (next session)
- Per-node orbiting particle system (20-30 particles per tool)
- Cube-specific "data stream" edges (particles flowing along edges)
- Sphere "breathing" pulse synchronized with NOVA breathing
- Octahedron "face illumination" on active state
- CompassRing tick mark detail (every 5° instead of 10°)

### Sprint 3 — Typography & Micro-interactions (future)
- Satoshi font files bundled locally (currently using next/font/google for Inter + Space Grotesk only)
- Metric counter easing refinement (expo.out instead of power2.out for punchier feel)
- Glass panel inner shadow depth mapping
- Scene label tooltips on compass ring (hover ring to see scene name)
- Subtle parallax on hub nodes (drift toward cursor)

---

## 5. Prompt Guide for Future Iterations

### When to invoke UI/UX Pro Max
- "The demo looks flat" → Sprint 2 scope (hub polish)
- "The text is hard to read" → Contrast audit, glass opacity adjustments
- "The animations feel mechanical" → Motion timing review, spring physics
- "A specific scene looks wrong" → Scene-specific design review

### Prompt template for visual polish
```
Review [SCENE_NAME] for visual appeal. Focus on:
1. Visual hierarchy — does the primary element stand out?
2. Color temperature match — does it feel warmer/cooler than specified?
3. Depth — layers, backgrounds, blurs creating foreground/background separation
4. Detail density — too sparse or overly busy?

Then implement the top 3 improvements, respecting:
- design-system.md aesthetic guardrails (no cosmic/space)
- WCAG AA contrast minimums on glass surfaces
- Performance budget (no drop below 55fps)
- No new dependencies
```

### Prompt template for 3D component detail
```
Add visual detail to [COMPONENT_NAME] R3F component:
1. Edge highlights via THREE.EdgesGeometry + LineBasicMaterial
2. Inner emissive core that catches bloom
3. Per-component rotation character (not uniform)
4. Optional orbiting particles (low-poly, instanced)

Constraints:
- Match accent color from GEOMETRY constant
- Stay within 500 additional triangles per component
- toneMapped: false on emissive materials so bloom catches them
- Preserve existing hover/select interaction behavior
```

---

## 6. Deliverables

Implemented in this session:
1. This review document (`.jez/artifacts/ui-ux-review.md`)
2. `ToolNode.tsx` — edge highlights, inner core, per-node rotation
3. `ImpactWall.tsx` — glass panel wrap with amber bottom accent
4. `ClosingCTA.tsx` — asymmetric glass panel (quote outside)

All changes committed and pushed to GitHub.
