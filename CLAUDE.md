# Azimuth Mission Mentor — Interactive Demo Showcase

## What This Is

A WebGL scrollytelling kiosk demo for **VCU Demo Day 2026**. Showcases the Azimuth Mission Mentor platform — an AI-powered veteran career lifecycle tool. The demo tells the story: bureaucratic chaos (Gauntlet) → guided clarity (NOVA Hub) → lifecycle empowerment (Tool Showcases).

**Target audience:** Defense, Workforce, Veteran Services, and Mental Health partners. Not VC, not consumers.

**Deployment:** Static export to kiosk booth, dedicated GPU, 1920×1080 or 2560×1440. Touch input.

## Aesthetic Direction

**Clean, professional, tech-forward. NOT cosmic/space/astrological.**

- No stars, galaxies, nebulae, aurora effects
- Background uses DepthGrid (perspective grid surface), not StarField
- Dark backgrounds use `--midnight` (#1C2331), not black voids
- 3D elements are refined accents, not immersive environments
- Typography and whitespace do the heavy lifting

Read `design-system.md` Section 0 "Aesthetic Guardrails" before building any visual component.

## Tech Stack (Locked)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.x |
| 3D | React Three Fiber + drei + postprocessing | 8.x / 9.x / 2.x |
| Animation | GSAP + ScrollTrigger | 3.12+ |
| UI Motion | motion (import from "motion/react") | 12.x |
| State | Zustand + immer middleware | 4.x |
| Audio | Howler.js | 2.x |
| Styling | Tailwind CSS | 3.4+ |
| Types | TypeScript (strict) | 5.x |
| Tests | Vitest | 4.x |

## Key Architecture Decisions

- **Single R3F Canvas** (`src/components/three/Scene.tsx`) — fixed full-viewport, all 3D renders here
- **Scroll overlay** (`src/app/page.tsx`) — 11 `<ScrollScene>` sections overlaid at z-10
- **Zustand store** (`src/state/portalStore.ts`) — `scrollProgress` (0–1) drives scene derivation, camera position, and UI state
- **Camera** (`src/camera/CameraController.tsx`) — CatmullRomCurve3 flight paths scrubbed by scroll progress. Hub has idle orbital drift.
- **DepthGrid** — custom ShaderMaterial (not drei Grid). Lines stay below bloom threshold. Parallax on pointer. Hidden during Gauntlet.
- **NOVASphere** — 15K InstancedMesh particles. Physics extracted to `novaParticles.ts` for testability. Zero per-frame GC allocations.

## Design Token Sources

- **Colors, typography, spacing, easing, timing**: `design-system.md` → implemented in `src/utils/constants.ts` and `tailwind.config.ts`
- **Glass panel colors**: CSS custom properties in `src/app/globals.css`
- **WCAG contrast**: Glass panels have effective bg ~#131B28. Slate-blue (#526A82) fails AA for body text on glass. Use Silver (#D8DEE9) minimum. Full audit in `.jez/artifacts/design-review-glasspanel.md`.

## Build Phase Status

| Phase | Status | Key Commits |
|-------|--------|-------------|
| P1: Foundation | ✅ Complete | `66a96a5` scaffold, `f71be93` store+scroll+camera+grid |
| P2: NOVA Hub | ✅ Complete | `f71be93` NOVASphere, `1f093f3` CompassRing+ToolNodes, `abf354e` GlassPanel |
| P3: Gauntlet + Transition | 🔲 Not started | — |
| P4: Showcase Carousels | 🔲 Not started | — |
| P5: Impact Wall + Polish | 🔲 Not started | — |

## Commands

```bash
npm run dev        # Dev server (localhost:3000)
npm run build      # Production build
npm test           # Vitest (18 tests — particle init, physics, breathing)
npx tsc --noEmit   # Type check
```

## File Conventions

- **Scenes**: `src/scenes/*.tsx` — one per storyboard section (S0–S10)
- **3D components**: `src/components/three/*.tsx` — R3F components inside Canvas
- **UI components**: `src/components/ui/*.tsx` — HTML/CSS overlay components
- **Shaders**: `src/shaders/*.glsl` — imported as strings via webpack asset/source
- **Tests**: `src/components/three/__tests__/*.test.ts`

## Doc Sources

- `design-system.md` — single source of truth for all visual tokens
- `implementation-plan.md` — build phases, dependency graph, performance budget
- `prompt-library.md` — per-component build prompts (P1.1–P5.6 + utilities)
- `storyboard.md` — scene-by-scene narrative content (S0–S10)
- `Design-Concept/` — original design concept docs, SVGs, logo assets
