# Design Review: Gauntlet Corridor — "Government Building" Visual Read
**Date**: 2026-04-11
**Component**: `src/components/three/GauntletGeometry.tsx`
**Aesthetic target**: Reads as "government building corridor" within 2 seconds

## Overall Impression

The procedural corridor system establishes the institutional read through geometry choices (4m×3m corridor proportions, drop-ceiling ribs, closed numbered doors, fluorescent strips) and strict grayscale enforcement. The key signals that say "government building" are present: numbered doors with no sequence, flat overhead lighting, concrete surfaces, and wrong-angle branches that create Escher-like disorientation.

## Aesthetic Audit: "Government Building" vs "Sci-Fi Bunker"

| Signal | Government Building | Sci-Fi Bunker | Current Implementation |
|--------|-------------------|---------------|----------------------|
| **Proportions** | 8-10ft ceiling, standard width | Tall vaults, cavernous | 3m ceiling, 4m width — CORRECT |
| **Ceiling** | Drop-ceiling grid, acoustic tile / concrete | Exposed pipes, industrial | Concrete grid ribs, fluorescent strips — CORRECT |
| **Lighting** | Flat fluorescent, no drama | Colored gels, volumetric | #C8C8C8 emissive strips, low intensity — CORRECT |
| **Doors** | Numbered, institutional, closed | Blast doors, airlocks, hatches | Numbered panels, embossed text — CORRECT |
| **Surfaces** | Concrete, paint, institutional materials | Metal, grating, rivets | MeshStandardMaterial roughness 0.9 — CORRECT |
| **Color** | Grayscale, beige, institutional green | Blue-tinted, neon accents | Pure grayscale, zero color — CORRECT |
| **Geometry** | Rectangular, right angles (with Escher twist) | Organic curves, hexagons | Box corridor with angled branches — CORRECT |
| **Atmosphere** | Still, stale, oppressive | Dynamic, threatening | Static geometry, no particles — CORRECT |

## Findings

### Medium

- **Branch corridors may read too abstract** — The angled branch stubs (30°/70°/110°) are positioned using rotation transforms, which could make them look like geometric protrusions rather than actual corridors. The branch should feel like a real hallway that goes somewhere, even if it dead-ends. Current implementation has floor/ceiling/far wall/side wall — good geometry, but the visual will need testing at camera distance to confirm it reads as "a corridor branching off" rather than "a box attached at a weird angle."
  - **Mitigation**: Test in browser. If needed, add a second fluorescent strip in the branch and a door at the far end to sell the "corridor" read.

- **No ambient occlusion** — Real government corridors have dirty corners, accumulated grime where wall meets floor. Without SSAO or baked AO, the corridors may look too clean — more like a 3D model than a building. This makes them feel "CG" rather than "institutional."
  - **Mitigation**: Consider adding SSAO to the postprocessing pipeline during Phase 5 polish. For now, the concrete material roughness (0.9) and flat lighting provide adequate institutional feel.

- **Wire-glass windows could be more legible** — The current window material is a small transparent plane (0.35×0.25) with very low emissive (0.05). At camera distance during the scroll drift, these may be invisible. They're important environmental storytelling: "resources exist behind those doors."
  - **Mitigation**: Increase window emissive to 0.08-0.1, or add a thin bright border (door frame highlight) around the window.

### Low

- **Door numbers may not be readable at drift speed** — Text at fontSize 0.12 with 50% fillOpacity during a camera drift may be too small/faint to register. The numbers don't need to be read individually — they just need to signal "numbered doors" as a pattern.
  - **Mitigation**: Increase fontSize to 0.15 and fillOpacity to 0.65 if they don't register visually.

- **Segment recycling is not visually dynamic yet** — The recycling logic runs in useFrame but the segments are rendered as static React components with a key index. Since `segments.current` is mutated in useFrame, React won't re-render the segments. The recycling will need to either force re-renders or use imperative Three.js positioning.
  - **Fix needed**: This is a functional issue, not just aesthetic. The recycling needs to work for the "infinite corridor" effect. Options: (a) use `useState` and trigger re-renders on recycle, or (b) use refs on segment groups and position them imperatively.

## What Looks Good

- **Grayscale enforcement is airtight** — zero color tokens used. All materials use #6B6B6B, #5A5A5A, #3A3A3A, #C8C8C8. No ambient light color bleed.
- **Fluorescent light strips** — emissive boxes at low intensity (0.3) create the right "working hard but illuminating nothing" feel
- **Door numbering system** — nonsensical numbers (1143, 207B, 4) immediately signal bureaucratic confusion
- **Corridor proportions** — 4m×3m matches real government building scale
- **Performance** — well under 50K triangle budget (~3,800 tris)

## Top 3 Fixes

1. **Fix segment recycling** — segments.current mutation in useFrame doesn't trigger React re-render. Convert to imperative group positioning using refs, or use a state counter to force re-renders on recycle.
2. **Test branch corridor visual read** — verify at camera distance that angled branches look like corridors, not abstract geometry. Add details if needed.
3. **Boost wire-glass window visibility** — increase emissive to 0.08-0.1 so the "light from another corridor" is perceptible during camera drift.
