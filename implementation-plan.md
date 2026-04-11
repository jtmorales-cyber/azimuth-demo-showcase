# Azimuth Mission Mentor — Implementation Plan
**Version:** 2.0 — Grounded Revision  
**Date:** April 10, 2026  
**Target Event:** VCU Demo Day 2026  
**Stack:** Next.js + React Three Fiber + Three.js + GSAP + Motion 12.x + Howler.js  
**Deployment:** Kiosk booth (dedicated GPU, 1920×1080 or 2560×1440)

---

## 1. Architecture Overview

### 1.1 Tech Stack (Locked)

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 14.x | Routing, SSR/SSG, React foundation |
| 3D Engine | React Three Fiber (R3F) | 8.x | Declarative Three.js scene composition |
| 3D Helpers | @react-three/drei | 9.x | Pre-built R3F components (Environment, Float, etc.) |
| Postprocessing | @react-three/postprocessing | 2.x | Bloom, chromatic aberration, vignette |
| Animation | GSAP + ScrollTrigger | 3.12+ | Scroll-driven 3D camera + timeline animation |
| UI Motion | motion (Motion 12.x) | 12.x | Spring-based glass panel transitions |
| State | Zustand | 4.x | Portal state: active scene, transition progress, audio |
| Audio | Howler.js | 2.x | Spatial audio, crossfades, preloading |
| Styling | Tailwind CSS | 3.4+ | Utility-first CSS for glass-morphic UI |
| Types | TypeScript | 5.x | Type safety throughout |

### 1.2 Repository Structure

```
azimuth-demo-showcase/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, font loading, global styles
│   │   └── page.tsx                # Single-page scrollytelling entry
│   ├── scenes/
│   │   ├── BootSequence.tsx        # S0: Logo resolve + amber ignition
│   │   ├── Gauntlet.tsx            # S1: Brutalist corridor labyrinth
│   │   ├── GauntletTransition.tsx  # S2: Dissolution shader + camera flight
│   │   ├── NOVAHub.tsx             # S3: Command center assembly
│   │   ├── LifecycleOverview.tsx   # S4: Timeline arrangement
│   │   ├── MAPSShowcase.tsx        # S5: Pre-enlistment carousel
│   │   ├── KITShowcase.tsx         # S6: Active duty carousel
│   │   ├── BASEShowcase.tsx        # S7: Wellness carousel
│   │   ├── SCOUTShowcase.tsx       # S8: Claims carousel
│   │   ├── ImpactWall.tsx          # S9: Aggregate metrics
│   │   └── ClosingCTA.tsx          # S10: Partnership ask
│   ├── components/
│   │   ├── three/                  # 3D components
│   │   │   ├── NOVASphere.tsx      # Particle sphere with physics + cymatic states
│   │   │   ├── CompassRing.tsx     # Azimuth compass with degree markings
│   │   │   ├── ToolNode.tsx        # Brand geometry (parameterized)
│   │   │   ├── DepthGrid.tsx       # Perspective grid surface with parallax
│   │   │   ├── GauntletGeometry.tsx # Procedural corridor generator
│   │   │   └── BrandGeometry.tsx   # Dodeca/Cube/Sphere/Octa mesh generators
│   │   ├── ui/                     # Glass-morphic overlay components
│   │   │   ├── GlassPanel.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── FeatureRow.tsx
│   │   │   ├── NOVANarration.tsx
│   │   │   ├── SwipeCarousel.tsx
│   │   │   ├── CTAButton.tsx
│   │   │   ├── SceneBadge.tsx
│   │   │   ├── ScrollProgress.tsx
│   │   │   └── ReturnButton.tsx
│   │   └── layout/
│   │       ├── ScrollScene.tsx     # 100vh section container + ScrollTrigger
│   │       ├── ShowcaseLayout.tsx  # 3D bg + glass overlay wrapper
│   │       └── SplitView.tsx       # Left 3D / Right glass content
│   ├── shaders/
│   │   ├── dissolve.glsl           # Gauntlet → Hub transition
│   │   ├── crystalline.glsl        # Translucent material + caustics
│   │   ├── cymatic.glsl            # NOVA processing state
│   │   └── bloom-custom.glsl       # Enhanced bloom for NOVA core
│   ├── audio/
│   │   ├── AudioEngine.ts          # Howler.js wrapper
│   │   ├── audioMap.ts             # Scene-to-audio mapping
│   │   └── assets/                 # .mp3/.ogg audio files
│   ├── state/
│   │   └── portalStore.ts          # Zustand: scene, node, transition, audio state
│   ├── camera/
│   │   ├── CameraController.tsx    # GSAP-driven camera flight manager
│   │   └── flightPaths.ts          # Per-scene camera positions + timelines
│   ├── hooks/
│   │   ├── useScrollProgress.ts    # Tracks normalized scroll position
│   │   ├── useIdleTimeout.ts       # 60s idle → reset to Boot
│   │   ├── useAudio.ts             # Audio playback + crossfade hooks
│   │   └── useTouchGestures.ts     # Swipe detection for carousels
│   ├── utils/
│   │   ├── constants.ts            # Design tokens (colors, timing, easing)
│   │   ├── geometries.ts           # Brand geometry mesh generators
│   │   └── animations.ts           # Reusable GSAP timeline factories
│   └── styles/
│       └── globals.css             # Tailwind + CSS custom properties
├── public/
│   ├── fonts/                      # Satoshi, Inter, Space Grotesk
│   ├── textures/                   # Normal maps, environment maps
│   ├── audio/                      # Preloaded audio assets
│   └── brand/                      # Logo SVG, "A" monogram
├── docs/
│   ├── design-system.md            # → This file
│   ├── storyboard.md               # Scene-by-scene narrative
│   ├── implementation-plan.md      # → This file
│   └── prompt-library.md           # Build prompts per component
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── postcss.config.mjs
```

---

## 2. Build Phases

### Phase 1: Foundation & Core Loop (Week 1)

**Goal:** Scrollable page with scene containers, basic 3D canvas, and camera responding to scroll position.

| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| Next.js + R3F + Drei + GSAP scaffold | P0 | 2h | None |
| Tailwind config with design tokens (colors, fonts, spacing) | P0 | 1h | None |
| Zustand store: scene state, scroll position, active node | P0 | 1h | None |
| `<ScrollScene>` component: 100vh sections + ScrollTrigger pins | P0 | 3h | GSAP |
| `<CameraController>`: GSAP-driven camera position tied to scroll | P0 | 4h | ScrollScene, Zustand |
| Depth grid background (perspective grid surface) | P1 | 2h | R3F canvas |
| Scroll progress indicator (fixed sidebar) | P1 | 1h | ScrollScene |
| Font loading (Satoshi, Inter, Space Grotesk) | P1 | 0.5h | None |

**Deliverable:** Scrollable page with 11 pinned sections. Camera moves through empty 3D space as user scrolls. Depth grid visible. Progress bar works.

### Phase 2: NOVA Hub (Week 2)

**Goal:** The emotional center of the demo — NOVA sphere, compass rings, tool nodes, hover interactions.

| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| `<NOVASphere>`: 10K+ particles, physics sim, amber core glow | P0 | 8h | R3F, Phase 1 |
| `<CompassRing>`: Azimuth degree markings, rotation animation | P0 | 4h | R3F |
| `<ToolNode>`: Parameterized brand geometry (4 forms) | P0 | 6h | R3F, geometries.ts |
| Crystalline material (MeshPhysicalMaterial transmission) | P0 | 3h | ToolNode |
| Hub assembly animation (scroll-triggered, nodes drift in) | P0 | 4h | CameraController |
| Hover: scale, glow, label reveal, chime audio | P1 | 3h | ToolNode, AudioEngine |
| NOVA narration typewriter component | P1 | 2h | Motion |
| Postprocessing: bloom, vignette, tone mapping | P1 | 3h | R3F postprocessing |
| Hub audio layer (warm ambient pad + interaction chimes) | P2 | 2h | Howler.js |

**Deliverable:** Fully functional NOVA Hub scene. Scrolling reveals the hub. Nodes are hoverable. NOVA sphere responds to touch. Narration text types in.

### Phase 3: Gauntlet + Transition (Week 3)

**Goal:** The "before" state and the most powerful moment in the demo — the dissolution transition.

| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| `<GauntletGeometry>`: Procedural corridor with branching | P0 | 8h | R3F |
| Gauntlet materials: concrete MeshStandardMaterial + normal map | P0 | 2h | GauntletGeometry |
| Fluorescent lighting: RectAreaLight strips, cold white | P0 | 2h | GauntletGeometry |
| Camera drift: slow forward movement, dutch angle | P0 | 2h | CameraController |
| "Find Your Bearing" CTA with amber glow | P0 | 1h | UI components |
| Dissolve shader (GLSL): concrete → cyan particles | P0 | 8h | Shaders |
| Camera acceleration through dissolving geometry | P0 | 4h | CameraController, GSAP |
| Gauntlet text overlay (statistics, scroll-triggered) | P1 | 2h | GlassPanel |
| Gauntlet audio (murmur + HVAC + paper shuffle) | P1 | 3h | Howler.js |
| Bass drop transition audio | P1 | 1h | Howler.js |
| Boot sequence: "A" monogram resolve animation | P2 | 4h | R3F, GSAP |

**Deliverable:** Complete entry experience. Boot → Gauntlet → dissolution → Hub. The emotional arc from oppression to liberation is functional.

### Phase 4: Showcase Carousels (Weeks 4–5)

**Goal:** Four tool deep-dives, each a horizontal swipe carousel with 4 cards.

| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| `<SwipeCarousel>`: horizontal snap scrolling, dot indicators | P0 | 6h | Touch gestures |
| `<ShowcaseLayout>`: 3D background + glass overlay pattern | P0 | 4h | R3F, GlassPanel |
| `<GlassPanel>` component: frosted glass with cyan border | P0 | 3h | Tailwind |
| `<MetricCard>`: animated counter + label | P0 | 2h | Motion |
| `<FeatureRow>`: icon + title + description | P0 | 1h | Tailwind |
| `<NOVANarration>`: typewriter with NOVA avatar | P0 | 2h | Motion |
| MAPS showcase: 4 carousel cards + dodecahedron bg | P0 | 4h | All above |
| K.I.T. showcase: 4 carousel cards + cube bg | P0 | 4h | All above |
| BASE showcase: 4 carousel cards + sphere bg | P0 | 4h | All above |
| SCOUT showcase: 4 carousel cards + octahedron bg | P0 | 4h | All above |
| Per-showcase camera flights (enter/exit through geometry) | P1 | 6h | CameraController |
| Per-showcase audio signatures | P1 | 4h | Howler.js |
| Per-showcase color temperature shifts | P1 | 2h | CSS custom properties |
| Carousel touch gesture refinement (snap, momentum, bounds) | P1 | 3h | useTouchGestures |

**Deliverable:** All four showcases functional with carousel navigation, glass panels, metrics, NOVA narration. Each has distinct 3D background and color temperature.

### Phase 5: Impact Wall + Closing + Polish (Week 6)

**Goal:** Aggregate proof section, CTA, idle reset, and full polish pass.

| Task | Priority | Estimate | Dependencies |
|------|----------|----------|--------------|
| Impact Wall: animated counters, hub view return | P0 | 4h | MetricCard, Hub |
| Closing CTA: partnership buttons, QR code, footer | P0 | 2h | CTAButton |
| Idle timeout: 60s → fade to black → restart at Boot | P0 | 2h | useIdleTimeout |
| `<ScrollProgress>` polish: scene labels, active indicator | P1 | 2h | Zustand |
| Chromatic aberration during transitions | P1 | 1h | Postprocessing |
| NOVA particle attraction toward touch position | P1 | 2h | NOVASphere |
| Glass panel tilt on touch (±3° perspective) | P1 | 1h | GlassPanel |
| Performance optimization: LOD, instancing, texture compression | P0 | 4h | All scenes |
| 60fps validation at 1920×1080 and 2560×1440 | P0 | 2h | All scenes |
| Kiosk configuration: fullscreen, cursor hiding, audio autoplay | P0 | 2h | Next.js config |
| Reduced motion fallback: static content, no 3D | P1 | 4h | All scenes |
| Touch target audit (60px minimum) | P1 | 1h | All interactive elements |
| Cross-browser testing (Chrome, Safari for iPad) | P1 | 2h | All |

**Deliverable:** Production-ready demo. Full journey from Boot to CTA. 60fps on target hardware. Auto-resets for booth traffic.

---

## 3. Dependency Graph

```
Phase 1 (Foundation)
├── ScrollScene
├── CameraController
├── Zustand Store
├── DepthGrid
└── Design Tokens
    │
    ▼
Phase 2 (NOVA Hub) ←── Phase 3 (Gauntlet)
├── NOVASphere         ├── GauntletGeometry
├── CompassRing        ├── Dissolve Shader
├── ToolNode           ├── Camera Acceleration
├── Crystalline Mat    └── Boot Sequence
├── Postprocessing
└── AudioEngine
    │
    ▼
Phase 4 (Tool Showcases)
├── SwipeCarousel
├── ShowcaseLayout
├── GlassPanel system
├── 4× Showcase scenes
└── Per-scene audio/color
    │
    ▼
Phase 5 (Polish)
├── Impact Wall
├── Closing CTA
├── Idle Reset
├── Performance Opt
└── Kiosk Config
```

---

## 4. Critical Path Items

These items are highest-risk and should be prototyped early:

| Item | Risk | Mitigation |
|------|------|------------|
| GLSL dissolve shader (Gauntlet→Hub) | Complex custom shader, hard to debug | Prototype in isolated CodeSandbox first. Have CSS fallback (opacity + scale transition) |
| NOVASphere particle performance | 10K–50K particles at 60fps | Use InstancedMesh, not individual meshes. Test on target hardware early |
| ScrollTrigger + R3F camera sync | GSAP ScrollTrigger and R3F's useFrame can conflict | Use GSAP's `scrub` mode, drive camera via Zustand state, not direct manipulation |
| Horizontal swipe within vertical scroll | Gesture conflict between scroll and swipe | Use `touch-action: pan-y` on scroll sections, `pan-x` on carousel. Debounce direction detection |
| Audio autoplay on kiosk | Browsers block autoplay without user interaction | First touch in Gauntlet CTA triggers AudioContext.resume(). All subsequent audio works |
| MeshPhysicalMaterial transmission | GPU-intensive, can tank fps on mobile | Kiosk-only target makes this safe. For iPad fallback, reduce transmission quality |

---

## 5. Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| FPS | 60fps sustained | Chrome DevTools Performance tab |
| First Contentful Paint | <2s | Lighthouse |
| Total scene polygons | <500K triangles | R3F `<Stats>` component |
| Particle count (NOVA) | 10K–50K | Zustand state + performance toggle |
| Shader compile | <2s cold start | Performance.mark() |
| Audio latency | <50ms interaction | Web Audio API timing |
| Bundle size | <2MB initial, <5MB total with assets | Next.js build analyzer |
| Texture memory | <256MB GPU | Chrome GPU internals |

---

## 6. Asset Requirements

### Audio Assets (to be produced/sourced)

| Asset | Format | Duration | Source |
|-------|--------|----------|--------|
| Rising boot tone | .mp3 + .ogg | 2.5s | Synthesized |
| Gauntlet murmur layer | .mp3 + .ogg | 30s loop | Foley / stock |
| HVAC drone | .mp3 + .ogg | 30s loop | Synthesized |
| Paper shuffle | .mp3 + .ogg | 15s loop | Foley / stock |
| Bass drop hit | .mp3 + .ogg | 1s | Synthesized |
| Warm ambient pad | .mp3 + .ogg | 60s loop | Synthesized |
| Crystalline chime set | .mp3 + .ogg | 0.5s × 4 variants | Synthesized |
| MAPS ascending harmonics | .mp3 + .ogg | 60s loop | Synthesized |
| K.I.T. rhythmic pulse | .mp3 + .ogg | 60s loop | Synthesized |
| BASE delta wave | .mp3 + .ogg | 60s loop | Synthesized (2Hz binaural) |
| SCOUT analytical hum | .mp3 + .ogg | 60s loop | Synthesized |

### Texture Assets

| Asset | Format | Resolution | Source |
|-------|--------|-----------|--------|
| Concrete normal map | .png | 1024×1024 | Procedural or stock |
| Environment map (HDR) | .hdr | 1024×512 | Studio lighting HDRI |
| Noise texture (particles) | .png | 256×256 | Procedural |
| Azimuth "A" monogram | .svg + .glb | Vector / 3D | Brand assets |

### Font Files

| Font | Weights | Format | Source |
|------|---------|--------|--------|
| Satoshi | 700 | .woff2 | fontshare.com |
| Inter | 400, 500 | .woff2 | Google Fonts / rsms |
| Space Grotesk | 300, 500, 600 | .woff2 | Google Fonts |

---

## 7. Testing Strategy

| Test Type | Tool | Scope |
|-----------|------|-------|
| Component rendering | Vitest + React Testing Library | UI components |
| 3D scene loading | Manual + R3F Stats | All scenes render without errors |
| Scroll-camera sync | Manual QA | Scroll positions match storyboard spec |
| Touch gestures | Physical device testing | iPad Pro + kiosk touchscreen |
| Performance profiling | Chrome DevTools | 60fps on target hardware |
| Audio playback | Manual QA | All crossfades, no pops/clicks |
| Idle reset | Automated timer test | 60s idle → Boot |
| Accessibility | axe-core + manual | Reduced motion, focus indicators |

---

## 8. Deployment

### Kiosk Mode Configuration

```javascript
// next.config.ts additions
{
  output: 'export',           // Static export for kiosk
  images: { unoptimized: true },
}
```

```css
/* Kiosk-specific styles */
body {
  cursor: none;              /* Hide cursor on kiosk */
  overflow: hidden;          /* Prevent browser scroll UI */
  user-select: none;         /* No text selection */
  -webkit-user-select: none;
}
```

### Deployment Options

| Option | Pros | Cons |
|--------|------|------|
| Local static files (USB) | Zero network dependency, fastest load | No hot updates |
| Local dev server | Hot reload during event setup | Requires Node.js on kiosk |
| Vercel deployment + local cache | Remote updates possible | Network dependency risk |

**Recommendation:** Static export to USB drive. Pre-cache all assets. No network dependency at the booth.

---

*This implementation plan is structured for a 6-week build timeline targeting VCU Demo Day 2026. All technology choices are locked per the Portal Architecture Spec. The phased approach ensures a working demo at each milestone.*
