# Azimuth Mission Mentor — Build Prompt Library
**Version:** 2.0 — Grounded Revision  
**Date:** April 10, 2026  
**Purpose:** Copy-paste prompts for building each component, scene, and interaction in the demo showcase.  
**Usage:** Each prompt is self-contained. Feed it to Claude (or your preferred AI coding assistant) along with the design-system.md and any referenced files for full context.

---

## How to Use This Library

Each prompt follows this structure:
1. **Context block** — what files/specs to reference
2. **Task** — exactly what to build
3. **Constraints** — technology, performance, and design requirements
4. **Acceptance criteria** — how to verify it's done correctly

Feed each prompt alongside the `design-system.md` file for color tokens, timing, and easing values.

---

## Phase 1: Foundation

### P1.1 — Project Scaffold

```
CONTEXT: Read implementation-plan.md Section 1.2 (Repository Structure) and design-system.md Section 1 (Color Architecture).

TASK: Create a Next.js 14 project (App Router) with:
- React Three Fiber (@react-three/fiber, @react-three/drei, @react-three/postprocessing)
- GSAP with ScrollTrigger plugin
- motion (Motion 12.x — import from "motion/react")
- Zustand for state management
- Howler.js for audio
- Tailwind CSS 3.4+
- TypeScript strict mode

Configure tailwind.config.ts with ALL color tokens from design-system.md Section 1.1. Include the font families (Satoshi, Inter, Space Grotesk). Set up CSS custom properties in globals.css matching the --deep-navy, --midnight, --cyan-struct, --slate-blue, --amber-core, --sage-muted, --gauntlet-gray, --scout-blue, --silver, --calm-purple, --peak-light tokens.

Add prefers-reduced-motion media query that disables all animations.

CONSTRAINTS:
- Next.js App Router (not Pages Router)
- All 3D rendering in a single <Canvas> component that spans the full viewport
- Tailwind for all UI styling (no separate CSS files except globals.css)

ACCEPTANCE: `npm run dev` starts without errors. Tailwind classes using brand colors compile correctly. R3F Canvas renders a dark background with deep-navy color.
```

### P1.2 — Zustand Portal Store

```
CONTEXT: Read implementation-plan.md Section 1.2 (state/portalStore.ts) and design-system.md Section 11 (Navigation State Machine).

TASK: Create a Zustand store at src/state/portalStore.ts that manages:

interface PortalState {
  currentScene: 'boot' | 'gauntlet' | 'hub' | 'maps' | 'kit' | 'base' | 'scout' | 'impact' | 'closing';
  previousScene: string | null;
  scrollProgress: number;           // 0-1 normalized
  transitionProgress: number;       // 0-1 for active transition
  isTransitioning: boolean;
  activeCarouselIndex: number;      // Which card in current showcase
  audioMuted: boolean;
  idleTimer: number;                // Seconds since last interaction
  // Actions
  setScene: (scene: string) => void;
  setScrollProgress: (progress: number) => void;
  startTransition: (from: string, to: string) => void;
  completeTransition: () => void;
  resetToIdle: () => void;          // 60s timeout → back to boot
  registerInteraction: () => void;  // Resets idle timer
}

CONSTRAINTS: Use Zustand 4.x with immer middleware for nested state updates.

ACCEPTANCE: Store subscribable from any component. Scene transitions update correctly. Idle timer counts up when no interaction registered.
```

### P1.3 — ScrollScene Container

```
CONTEXT: Read design-system.md Section 4.3 (Scroll-Driven Animation Model) and storyboard.md for scene scroll positions.

TASK: Create a <ScrollScene> component at src/components/layout/ScrollScene.tsx that:

1. Renders a 100vh section container
2. Registers with GSAP ScrollTrigger as a pinned section
3. Reports its scroll progress (0-1) to a callback prop
4. Updates the Zustand store's scrollProgress and currentScene
5. Supports `id` prop for scroll-to navigation
6. Uses CSS scroll-snap-type: y mandatory for crisp section boundaries

Props:
- id: string (scene identifier)
- children: ReactNode
- onProgress?: (progress: number) => void
- pin?: boolean (default true)
- className?: string

The main page.tsx should render 11 ScrollScene components matching the storyboard sections S0-S10.

CONSTRAINTS:
- GSAP ScrollTrigger scrub mode (scroll position = timeline position)
- Must work with R3F Canvas overlay
- Touch-friendly (no scroll hijacking that breaks touch momentum)

ACCEPTANCE: Page has 11 scrollable sections. Each section pins for 100vh of scroll. Progress value 0-1 is accurate. Scene name updates in Zustand store as user scrolls.
```

### P1.4 — Camera Controller

```
CONTEXT: Read design-system.md Section 4.1-4.2 (GSAP Easing + Duration Tokens) and the Portal Architecture Spec Section 5.3 (Camera Flight Specifications).

TASK: Create a <CameraController> R3F component at src/camera/CameraController.tsx that:

1. Reads scrollProgress from Zustand store
2. Maps scroll progress ranges to camera positions/rotations using flightPaths.ts
3. Uses GSAP timeline scrubbing (not useFrame direct manipulation)
4. Supports these transitions:
   - Boot (origin) → Gauntlet (tight corridor view, dutch angle 2-3°)
   - Gauntlet → Hub (accelerate forward, settle into orbital position)
   - Hub → Showcases (fly through tool node geometry)
   - Return to Hub (reverse flight, 20% faster per timing spec)
   - Hub idle: gentle orbital drift, sine.inOut easing, 45s period

Create flightPaths.ts with camera position/lookAt/fov keyframes for each scene transition.

CONSTRAINTS:
- All easing values from design-system.md EASING tokens
- All durations from TIMING tokens
- Camera must be smooth — no jank between scroll-driven positions
- Use THREE.CatmullRomCurve3 for flight paths (smooth interpolation)

ACCEPTANCE: Scrolling smoothly flies the camera through all scenes. No abrupt jumps. Gauntlet has dutch angle. Hub has orbital drift. Transition durations match spec.
```

### P1.5 — Depth Grid Background

```
CONTEXT: Read design-system.md Section 5.1 (<DepthGrid> component spec).

TASK: Create a <DepthGrid> R3F component that renders a perspective grid surface:

1. A large plane grid (200×200 units) positioned below the camera at Y=-5
2. Grid lines rendered using LineSegments or custom ShaderMaterial
3. Lines fade with distance (opacity 0.4 near camera → 0.0 at horizon)
4. Subtle depth-of-field blur at edges (via fragment shader or postprocessing)
5. Parallax response to cursor/touch position (grid shifts 2-5px per 100px movement)
6. Grid color: cyan-struct (#00CED1) at 15-25% opacity — reads as strategic planning surface
7. Intersection points have subtle pulse at random intervals (data node feel)
8. Only visible in Hub and Showcase scenes (hidden in Gauntlet)

The grid should read as a "strategic planning table" or "command surface" — NOT as a star field, space theme, or cosmic background. Think: war room floor projection, not planetarium.

CONSTRAINTS:
- Performance: must render at 60fps alongside other scene content
- Use custom ShaderMaterial for distance-based opacity falloff
- Grid spacing: 2 unit intervals (major lines), 0.5 unit intervals (minor lines at 10% opacity)
- No bloom on grid lines (bloom reserved for NOVA core)
- Perspective vanishing point creates natural depth

ACCEPTANCE: Grid visible below Hub scene. Reads as "strategic surface" within 2 seconds. Subtle parallax on touch. Professional, not sci-fi. No performance impact measurable in Stats panel.
```

---

## Phase 2: NOVA Hub

### P2.1 — NOVA Particle Sphere

```
CONTEXT: Read design-system.md Section 5.1 (<NOVASphere> spec), Section 8 (Brand Geometry — NOVA = Cuboctahedron), and the Portal Architecture Spec Section 4.2 (NOVA Sphere Behavior). Also read Crystalline_Bearing_Philosophy.md for the algorithmic personality.

TASK: Create a <NOVASphere> R3F component that:

1. Renders 10,000-25,000 particles orbiting a central point using InstancedMesh
2. Particles follow a physics simulation — orbital paths with slight randomness
3. Central amber core glow (point light, #E8A030, with bloom)
4. Three states:
   a. IDLE: particles orbit gently, amber glow breathes (4s cycle)
   b. HOVER: particles pull toward cursor/touch position (inverse-square falloff)
   c. PROCESSING: particles form cymatic wave patterns (reserved for future use)
5. Particle colors: gradient from amber-core (#E8A030) at center to cyan-struct (#00CED1) at edges
6. Each particle has unique: orbit radius, angular velocity, phase offset, size (0.02-0.08 units)

CONSTRAINTS:
- Must maintain 60fps (use GPU instancing)
- Glow uses postprocessing bloom (threshold 0.6, not emissive hack)
- Breathing animation: opacity 0.85-1.0, scale 0.98-1.02 on the core light
- Particle attraction lerp: 0.06-0.08 per frame (slow = premium feel)

ACCEPTANCE: Sphere is visually compelling at arm's length (tablet distance). Particles orbit smoothly. Touch causes subtle attraction. Amber core glows with bloom halo. Performance stays above 55fps with all other Hub elements active.
```

### P2.2 — Compass Ring

```
CONTEXT: Read design-system.md Section 5.1 (<CompassRing> spec) and Portal Architecture Spec Section 4.2.

TASK: Create a <CompassRing> R3F component that:

1. Renders 2-3 concentric ring geometries (TorusGeometry, thin cross-section)
2. Outer ring has azimuth degree markings (0°, 90°, 180°, 270° with tick marks every 10°)
3. Degree markings rendered as TextGeometry or sprite labels
4. Rings rotate at different speeds (outer: 0.001 rad/frame, inner: 0.0015 rad/frame)
5. Material: MeshPhysicalMaterial, cyan-struct (#00CED1), transmission: 0.7, slight roughness
6. When a tool node is selected, outer ring rotates to align that node to forward position (GSAP, 1.5s, power2.inOut)

Props:
- activeNode?: 'maps' | 'kit' | 'base' | 'scout' | null
- radius: number (default 8)

CONSTRAINTS:
- Degree markings legible at tablet viewing distance (use SDF text or sprites, not geometry)
- Rings should catch bloom from NOVA core (slight luminance at edges)
- Rotation is continuous, never stops (except during alignment animation)

ACCEPTANCE: Rings visible orbiting NOVA. Degree markings readable. Setting activeNode causes smooth rotation to align.
```

### P2.3 — Brand Geometry Tool Nodes

```
CONTEXT: Read design-system.md Section 8 (Brand Geometry System) for forms, colors, and behaviors.

TASK: Create a parameterized <ToolNode> R3F component that:

1. Renders one of 4 Platonic solids based on `geometry` prop:
   - 'dodeca': DodecahedronGeometry (12 faces) — MAPS
   - 'cube': BoxGeometry (6 faces) — K.I.T.
   - 'sphere': SphereGeometry (high-poly) — BASE
   - 'octa': OctahedronGeometry (8 faces) — SCOUT
2. Material: MeshPhysicalMaterial with crystalline properties:
   - transmission: 0.9, thickness: 1.0, roughness: 0.1, ior: 1.8
   - color: per-node accent from design-system.md Section 8
3. Idle: slow rotation (0.002 rad/frame around Y axis), ambient glow
4. Hover: scale lerps to 1.08, emissive intensity × 1.4, label fades in
5. Selected: cyan ring pulse emanates, triggers compass ring alignment
6. Label: HTML overlay (<Html> from drei) with tool name + phase subtitle

Props:
- geometry: 'dodeca' | 'cube' | 'sphere' | 'octa'
- color: string (hex)
- label: string
- subtitle: string
- position: [x, y, z]
- onSelect: () => void
- isActive: boolean

CONSTRAINTS:
- Crystalline material must refract NOVA's amber light visibly
- Hover detection via raycasting (R3F onPointerOver/onPointerOut)
- Touch-friendly: onPointerDown for selection (not just hover)
- Scale animation uses continuous lerp in useFrame (not GSAP tween)

ACCEPTANCE: Four distinct geometric forms visible at cardinal points around NOVA. Each has unique color tint. Hovering causes smooth scale + glow. Tapping triggers onSelect. Crystalline transparency visible.
```

### P2.4 — Glass Panel UI Component

```
CONTEXT: Read design-system.md Section 1.4 (Glass-Morphic Panel Colors) and Section 5.2 (UI Components).

TASK: Create a <GlassPanel> component at src/components/ui/GlassPanel.tsx that:

1. Renders a frosted glass container using CSS backdrop-filter
2. Variants: sm (max-width 320px), md (max-width 480px), lg (max-width 600px), full (100% container)
3. Styling:
   - Background: rgba(28, 35, 49, 0.65) — midnight at 65%
   - Border: 1px solid rgba(0, 206, 209, 0.15) — cyan-struct at 15%
   - Backdrop-filter: blur(20px)
   - Border-radius: 16px
   - Top highlight: 1px rgba(255,255,255,0.05) inset shadow
4. Hover state: background opacity increases to 80%, border opacity to 30%
5. Optional tilt effect on touch: ±3° perspective transform following touch position
6. Entry animation: Motion (from "motion/react") — fade up + scale from 0.95

Props:
- size: 'sm' | 'md' | 'lg' | 'full'
- children: ReactNode
- tiltOnTouch?: boolean
- className?: string
- animate?: boolean (default true)

CONSTRAINTS:
- Use Tailwind utility classes where possible
- Motion 12.x for animations (import { motion } from "motion/react")
- backdrop-filter must be prefixed (-webkit-backdrop-filter for Safari)
- Tilt uses CSS perspective + rotateX/rotateY (lightweight, no 3D library)

ACCEPTANCE: Panel renders with visible frosted glass effect against dark background. Hover brightens. Touch tilt is subtle and smooth. Animation plays on mount.
```

---

## Phase 3: Gauntlet

### P3.1 — Gauntlet Corridor Geometry

```
CONTEXT: Read "The Gauntlet.md" from the Design-Concept folder for the full visual narrative. Read design-system.md Section 1.3 (Gauntlet Exception Rule) for color constraints.

TASK: Create a <GauntletGeometry> R3F component that generates a procedural brutalist corridor system:

1. Core corridor: 4m wide, 3m tall, 100m+ deep
2. Branch corridors at non-standard angles (30°, 70°, 110°) — Escher-like
3. Numbered doors on both sides (embossed text: "1143", "207B", "4") — no logical sequence
4. Drop-ceiling grid: concrete panel grid pattern on ceiling
5. Doors are all CLOSED — some have wire-glass windows showing more corridors beyond
6. Material: MeshStandardMaterial, color #6B6B6B, roughness 0.9, metalness 0.1
7. Optional: subtle concrete normal map for form lines

Camera path: slow forward drift through the main corridor. Geometry subtly reconfigures — walls shift, corridors that were ahead appear behind. This is achieved by recycling corridor segments behind the camera and repositioning them ahead with new branching angles.

Lighting: RectAreaLight strips along the ceiling grid, color #C8C8C8, low intensity. Flat, shadowless, institutional.

CONSTRAINTS:
- NO color in the Gauntlet. Grayscale only. No cyan, no amber.
- Camera drift is on rails — no user control
- Dutch angle: camera tilted 2-3° off level
- Geometry can be procedural (extruded shapes, boolean intersections)
- Performance: <50K triangles for corridor geometry

ACCEPTANCE: Visually reads as "government building corridor" within 2 seconds. Feels claustrophobic. Escher-like branching is disorienting but not nauseating. All grayscale. Fluorescent lighting is flat and joyless.
```

### P3.2 — Dissolve Transition Shader

```
CONTEXT: Read "The Gauntlet.md" transition section: "the concrete doesn't fade — it fails." Read design-system.md Section 6.3 (dissolve.glsl shader spec).

TASK: Create a custom GLSL dissolve shader at src/shaders/dissolve.glsl that:

1. Takes `uniform float progress` (0.0 to 1.0)
2. At progress 0.0: normal concrete material (gauntlet-gray)
3. At progress 0.0-0.3: hairline fractures appear along geometric edges (using UV-based noise)
4. At progress 0.3-0.6: fragments separate and lift (vertex displacement outward from surface normals)
5. At progress 0.6-0.8: fragment color shifts from gray (#6B6B6B) to luminous cyan (#00CED1)
6. At progress 0.8-1.0: fragments become particles, stream past camera, dissolve into void

The shader applies to ALL Gauntlet geometry simultaneously. Fracture patterns follow the ceiling grid lines and door frame edges (aligned to UV coordinates).

Accompany with a React component <DissolveTransition> that:
- Wraps <GauntletGeometry> with the shader
- Drives `progress` from scroll position or GSAP timeline
- Triggers camera acceleration (via CameraController) at progress 0.4

CONSTRAINTS:
- Vertex shader handles displacement (fragments lifting off)
- Fragment shader handles color transition (gray → cyan)
- Must be GPU-performant (no CPU-side geometry modification)
- The transition should feel like liberation, not destruction

ACCEPTANCE: Scrolling past 15% triggers dissolution. Fractures appear along structural lines. Fragments lift and shift to cyan. Camera accelerates through. Arrives at NOVA Hub. The most emotionally powerful moment in the demo.
```

### P3.3 — Boot Sequence

```
CONTEXT: Read Crystalline_Bearing_Philosophy.md for the logo animation concept. Read Portal Architecture Spec Section 4.0.

TASK: Create a <BootSequence> R3F component that:

1. Starts on pure black void
2. Azimuth "A" monogram resolves from darkness:
   - Crystalline shell materializes (MeshPhysicalMaterial, transmission: 0.9)
   - Internal amber core light ignites (#E8A030 point light with bloom)
   - Subtle lens flare effect (screen-space, not geometry)
3. Compass ring fades in around the logo
4. Duration: 2.5 seconds total
5. At completion: logo dissolves into particles that scatter, revealing the Gauntlet

Audio: silence → single low-frequency tone (~80Hz) rising to ~200Hz over 2.5 seconds.

The "A" form can be loaded as a .glb model or built from geometry. If building from geometry, use simple extruded "A" shape with crystalline material.

CONSTRAINTS:
- Auto-plays on page load (no user interaction required)
- Must complete before scroll is enabled
- Bloom on amber core: threshold 0.6, radius 1.2, strength 0.8
- Rotation behavior: compass settling (harmonic oscillator — fast initial spin, damped to slow drift)

ACCEPTANCE: Page loads → black → "A" materializes with amber glow → compass ring → dissolve to Gauntlet. Feels premium and intentional. 2.5 seconds exactly.
```

---

## Phase 4: Showcases

### P4.1 — Swipe Carousel

```
CONTEXT: Read design-system.md Section 5.2 (<SwipeCarousel> spec) and storyboard.md for showcase card contents.

TASK: Create a <SwipeCarousel> component at src/components/ui/SwipeCarousel.tsx that:

1. Renders N children as horizontal cards (100vw each)
2. Horizontal swipe/drag to navigate between cards
3. CSS scroll-snap-type: x mandatory for crisp snapping
4. Dot indicators at bottom: slate-blue inactive, cyan-struct active (with amber-core for current)
5. Touch gesture detection:
   - Swipe threshold: 50px horizontal movement
   - Momentum-based scrolling with deceleration
   - Boundary resistance (elastic overscroll at first/last card)
6. Reports current card index to parent via callback

Props:
- children: ReactNode[]
- onIndexChange?: (index: number) => void
- showDots?: boolean (default true)
- className?: string

CONSTRAINTS:
- Must not conflict with vertical scroll (use touch-action: pan-y on parent, pan-x on carousel)
- Snap animation: 300ms, power2.out easing
- Works with touch AND mouse drag
- No third-party carousel library — built on native scroll-snap + gesture detection

ACCEPTANCE: Horizontal swipe navigates cards. Snap is crisp. Dots update. No conflict with vertical scroll. Works on iPad touch.
```

### P4.2 — MAPS Showcase Scene

```
CONTEXT: Read storyboard.md Section S5 (MAPS Showcase) for card contents. Read design-system.md for MAPS colors (warm gold, dodecahedron). Read "MAPS — The Horizon Before the First Step.md" from Design-Concept folder for narrative depth.

TASK: Create the MAPS Showcase scene at src/scenes/MAPSShowcase.tsx that:

1. 3D Background:
   - Dodecahedron (crystalline, warm gold tint) slowly rotating at scene center
   - Warm golden-hour lighting (amber point light + warm directional)
   - Gentle particle system simulating golden atmospheric haze
   - Environment transitions from deep-navy to warm amber when this section enters

2. UI Overlay (4 glass panels in SwipeCarousel):
   - Card 1 — "The Problem": Gauntlet-gray tint, confused figure metaphor, stat (38% MOS match)
   - Card 2 — "The Solution": MAPS interface mockup, feature highlights
   - Card 3 — "The Outcome": Metrics grid, dodecahedron fully illuminated
   - Card 4 — "NOVA's Take": NOVA avatar + typewriter narration

3. Audio: ascending warm harmonics crossfading from Hub ambient pad (2.5s crossfade)

4. Entry: scroll triggers camera approach toward dodecahedron, golden light warms

5. Exit: scroll past → dodecahedron recedes, golden light cools back to deep-navy

Use `<ShowcaseLayout>` wrapper with `<SplitView>` for larger screens (3D left, cards right) collapsing to stacked on tablet portrait.

CONSTRAINTS:
- Color temperature ratio: 20% cyan / 60% amber (warmest showcase)
- All text content from storyboard.md S5
- Glass panels use <GlassPanel> component
- Metrics use <MetricCard> with animated counters
- NOVA narration uses <NOVANarration> typewriter component

ACCEPTANCE: Scrolling into MAPS section shows golden dodecahedron + 4 swipeable cards. Content matches storyboard exactly. Audio crossfade is smooth. Color temperature is distinctly warmer than Hub.
```

### P4.3 — K.I.T. Showcase Scene

```
CONTEXT: Read storyboard.md Section S6 (K.I.T. Showcase). K.I.T. = Cube/Hexahedron, cyan-dominant data streams, military green core.

TASK: Create the K.I.T. Showcase scene at src/scenes/KITShowcase.tsx following the same pattern as MAPS but with:

1. 3D Background:
   - Cube (hexahedron), crystalline with cyan edges
   - Data stream particles flowing along cube edges (like digital circuitry)
   - Structured geometric lattice extending from cube faces
   - Color: cyan-struct dominant, military green accents (#3A5A40 tint)

2. UI Overlay (4 cards per storyboard S6)

3. Audio: structured rhythmic pulse, data-processing hum

4. Color temperature: 50% cyan / 30% amber (structured, cool)

Differentiation from MAPS: Where MAPS feels like golden hour on a horizon, K.I.T. feels like the inside of a command center — precise, structured, data-driven. Lighting is cooler, geometry is more angular.

ACCEPTANCE: Distinct visual identity from MAPS. Data streams animate along cube edges. Content matches storyboard S6.
```

### P4.4 — BASE Showcase Scene

```
CONTEXT: Read storyboard.md Section S7 (BASE Showcase). Read design-system.md for BASE (sphere, warm gradient blend, delta waves). This is the trauma-informed showcase — read the design note about empathy vs. sympathy.

TASK: Create the BASE Showcase scene at src/scenes/BASEShowcase.tsx:

1. 3D Background:
   - Sphere (high-poly, smooth), crystalline with warm gradient color shifts
   - Interior is warm (amber glow, sage-muted), exterior shield is cool cyan
   - Warm gradient color animation: soft shifting between calm-purple (#7B68AE), sage-muted (#98A89D), and cool blue
   - Protective enclosure feeling — geometry suggests confidentiality and safety
   - Slowest particle system of any showcase (delta wave rhythm)

2. UI Overlay (4 cards per storyboard S7)
   - NO clinical language or medical imagery
   - Warm, non-threatening text
   - Crisis detection mentioned as capability, not demonstrated live

3. Audio: Delta wave (2Hz binaural), warm low-frequency, LONGEST crossfade (3.0s — slower = calmer)

4. Color temperature: 20% cyan / 30% amber with calm purple accent

CRITICAL DESIGN CONSTRAINT: This showcase communicates safety without performing it. No dramatic imagery. No crisis simulation. No clinical aesthetics. The design itself is the message: "this is a safe space."

ACCEPTANCE: Visually the calmest, most protective-feeling showcase. Warm gradient colors shift gently. Audio is noticeably calmer than other scenes. Content avoids clinical language. Feels like a showcase, not a hospital.
```

### P4.5 — SCOUT Showcase Scene

```
CONTEXT: Read storyboard.md Section S8 (SCOUT Showcase). This is the highest-pain use case and the strongest demo tool. SCOUT = Octahedron, deep blue, analytical precision.

TASK: Create the SCOUT Showcase scene at src/scenes/SCOUTShowcase.tsx:

1. 3D Background:
   - Octahedron, crystalline with deep blue tint (#0C447C)
   - Each face illuminates sequentially as the analytical engine "activates" on entry
   - Precision data lattice extending from octahedron — silver (#D8DEE9) grid lines
   - Structured, methodical, illuminated
   - Sequential confirmation particle effects (small silver sparks resolve along lattice)

2. UI Overlay (4 cards per storyboard S8)
   - Card 1 has the strongest emotional hook: "You Served. Then You Waited 125 Days."
   - Card 3 has the strongest metric: "From 33% to 90%. In 20 Minutes."
   - NOVA's take is the longest narration — SCOUT is the flagship demo

3. Audio: precision hum, systematic processing tones, confirmation chimes on face illumination

4. Color temperature: 50% cyan / 20% amber (coolest, most analytical showcase)

ACCEPTANCE: Feels like entering a precision instrument. Octahedron face-by-face illumination is visually striking. Strongest emotional content of any showcase. Metrics animate with impact.
```

---

## Phase 5: Polish

### P5.1 — Impact Wall

```
CONTEXT: Read storyboard.md Section S9 (Impact Wall).

TASK: Create the Impact Wall scene at src/scenes/ImpactWall.tsx:

1. Visual: return to Hub view — NOVA sphere at full brightness, all four nodes orbiting, fully illuminated
2. Five <MetricCard> components arranged in a row, each firing its counter animation sequentially (stagger 150ms):
   - 90%+ | VA claims optimization
   - 20 min | Claim preparation
   - 7 tools | Lifecycle coverage
   - 89% | Veteran satisfaction
   - 5-14x | LTV:CAC ratio
3. NOVA narration below: "One platform. Complete coverage. AI that serves those who served."
4. Visual crescendo: bloom intensity increases subtly, all brand geometry forms pulse once

CONSTRAINTS:
- Counter animation: number counts up from 0 to target, 1200ms, power2.out easing
- Only fires when scrolled into view (IntersectionObserver or ScrollTrigger)
- Space Grotesk font for metric numbers (data display font per design system)

ACCEPTANCE: Scrolling to Impact Wall triggers sequential counter animations. All metrics visible simultaneously. Feels like a climactic proof moment.
```

### P5.2 — Closing CTA

```
CONTEXT: Read storyboard.md Section S10 (Closing CTA).

TASK: Create the Closing CTA scene at src/scenes/ClosingCTA.tsx:

1. Visual: NOVA sphere at full brightness, compass rings slow to rest, depth grid gentle glow
2. Headline: "Let's Talk Partnership" — Satoshi Bold, 40px, white
3. Body text: Azimuth partnership pitch (from storyboard S10)
4. Three CTA buttons (glass-morphic):
   - "Start a Conversation" (primary — amber-core background)
   - "See the Platform" (ghost — cyan-struct border)
   - "Meet the Founder" (ghost)
5. Footer: "Azimuth, LLC · SDVOSB Certified · AI That Serves Those Who Served"
6. Optional QR code for contact (rendered as SVG)

CONSTRAINTS:
- CTAs use <CTAButton> component
- Primary button has breathing amber glow animation
- Footer is minimal, text-caption size

ACCEPTANCE: Clean, uncluttered closing. CTAs are immediately tappable. Footer provides brand anchoring. The journey feels complete.
```

### P5.3 — Idle Reset System

```
CONTEXT: Read design-system.md Section 11 (Navigation State Machine — idle timeout).

TASK: Create a useIdleTimeout hook at src/hooks/useIdleTimeout.ts that:

1. Tracks time since last user interaction (touch, scroll, mouse move)
2. After 60 seconds of inactivity: triggers fade to black (2s, power1.in)
3. After fade completes: resets Zustand store to 'boot' scene
4. Resets scroll position to top
5. Restarts boot sequence auto-play
6. Any interaction during countdown resets the timer

Integration: wrap the entire page with an idle detection layer that listens for touchstart, scroll, and mousemove events.

CONSTRAINTS:
- Timer resets on ANY interaction type
- Fade uses a CSS overlay (not 3D — simpler, more reliable)
- Audio fades to silence during 2s fade
- Must work in kiosk mode (no browser chrome to interact with)

ACCEPTANCE: Leave demo untouched for 60s → screen fades to black → boot sequence replays for next visitor. Any touch during countdown prevents reset.
```

### P5.4 — Postprocessing Pipeline

```
CONTEXT: Read design-system.md Section 6.4 (Postprocessing Stack).

TASK: Configure the R3F postprocessing pipeline in the main Canvas:

1. EffectComposer from @react-three/postprocessing
2. Effects stack:
   - Bloom: luminanceThreshold 0.6, luminanceSmoothing 0.3, intensity 0.8, radius 1.2
   - ChromaticAberration: offset [0.001, 0.001] — subtle, increases during transitions to [0.003, 0.003]
   - Vignette: darkness 0.4, offset 0.3 — frames the viewport
   - ToneMapping: ACESFilmic — cinematic color response
3. Chromatic aberration dynamically increases during scene transitions (driven by transitionProgress from Zustand)

CONSTRAINTS:
- Must not tank performance below 55fps
- Bloom should be most visible on NOVA core and brand geometry edges
- Vignette creates natural focus toward center (where NOVA lives)

ACCEPTANCE: Hub scene has visible bloom around NOVA. Transitions have subtle chromatic aberration. Edges of viewport are slightly darkened. Overall feel is cinematic, not flat.
```

### P5.5 — Scroll Progress Indicator

```
CONTEXT: Read design-system.md Section 5.2 (<ProgressBar> component).

TASK: Create a <ScrollProgress> component fixed to the right edge of the viewport:

1. Thin vertical bar (4px wide, full viewport height)
2. Background: midnight at 30% opacity
3. Fill: cyan-struct gradient, height matches scroll progress
4. Scene labels at the corresponding vertical positions:
   - Gauntlet, Hub, MAPS, K.I.T., BASE, SCOUT, Impact
5. Active scene label is highlighted (amber-core), others are slate-blue at 50%
6. Labels appear on touch/hover, auto-hide after 3s

CONSTRAINTS:
- Fixed position, always visible (z-index above 3D canvas)
- Does not interfere with touch gestures
- Smooth fill animation (not jumpy between sections)
- Labels use text-caption size (13px)

ACCEPTANCE: User can see their progress through the journey at a glance. Active section is clear. Tapping a label scrolls to that section.
```

### P5.6 — Kiosk Configuration

```
CONTEXT: Read implementation-plan.md Section 8 (Deployment — Kiosk Mode).

TASK: Configure the Next.js app for kiosk deployment:

1. next.config.ts: output: 'export' for static generation
2. CSS:
   - cursor: none (hide mouse cursor)
   - overflow: hidden (prevent browser scroll UI)
   - user-select: none (no text selection)
   - -webkit-touch-callout: none (no iOS callout menus)
3. Meta tags:
   - <meta name="apple-mobile-web-app-capable" content="yes">
   - <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
4. Fullscreen API: auto-request fullscreen on first touch
5. Audio context: resume on first interaction (browser autoplay policy)
6. Prevent pull-to-refresh: overscroll-behavior: none
7. Prevent zoom: touch-action: manipulation on body

CONSTRAINTS:
- Must work in Chrome kiosk mode and Safari (iPad)
- No network dependencies at runtime
- All assets bundled in static export

ACCEPTANCE: Demo runs fullscreen, no browser UI visible, no accidental zoom/refresh, audio plays after first touch, all assets load from local files.
```

---

## Utility Prompts

### U1 — Design Token Constants File

```
TASK: Create src/utils/constants.ts exporting ALL design tokens from design-system.md as TypeScript constants:
- COLORS object with all hex values
- EASING object with all GSAP easing strings
- TIMING object with all duration values (ms)
- SPACING object with all spacing values (px)
- TYPOGRAPHY object with font families and sizes
- GEOMETRY object mapping tool names to brand geometry types

All values typed with `as const` for literal type inference.
```

### U2 — Audio Engine Wrapper

```
TASK: Create src/audio/AudioEngine.ts — a Howler.js wrapper that:
- Preloads all audio assets during boot
- Exposes play(scene), stop(scene), crossfade(from, to, duration) methods
- Implements equal-power crossfade curves
- Supports spatial panning (stereo shift following touch position)
- Handles browser autoplay policy (silent until first user interaction)
- Exposes mute/unmute toggle for kiosk settings

Map all scenes to their audio layers per design-system.md Section 7.1.
```

### U3 — Brand Geometry Generator

```
TASK: Create src/utils/geometries.ts with functions that generate:
- createDodecahedron(radius) — for MAPS
- createCube(size) — for K.I.T.
- createSphere(radius, segments) — for BASE
- createOctahedron(radius) — for SCOUT
- createCuboctahedron(radius) — for NOVA

Each returns a Three.js BufferGeometry. The cuboctahedron (NOVA's form) is not a built-in Three.js geometry — generate it from vertices/faces manually (14 faces: 8 triangles + 6 squares).
```

---

*This prompt library contains 20 build prompts covering every major component, scene, and system in the demo showcase. Each prompt is self-contained and can be executed independently within its phase's dependency chain. Feed each prompt alongside design-system.md for token reference.*
