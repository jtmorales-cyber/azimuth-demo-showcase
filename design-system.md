# Azimuth Mission Mentor — Interactive Demo Showcase Design System
**Version:** 2.0 (Grounded Revision)  
**Date:** April 11, 2026  
**Inspiration Source:** [D2C Life Science](https://www.d2c-lifescience.com/) (Awwwards SOTD, Feb 2026 — designed by Iron Velvet)  
**Existing Foundation:** Azimuth Portal Architecture Spec v1.0  
**Target:** VCU Demo Day 2026 — Tablet/Kiosk Interactive Demo Booth  
**Format:** Scrollytelling journey with horizontal swipe tool deep-dives  
**Aesthetic Direction:** Clean, professional, tech-forward — NOT cosmic/space/astrological

---

## 0. Design Philosophy

### D2C Influence — What We're Borrowing

D2C Life Science earned Awwwards SOTD with a 2-color palette (#879186 sage, #E6F7ED mint), GSAP + Three.js 3D animation, and a central metaphor (algorithmic Rubik's Cube → 6 pillars → pill morph). Their design philosophy: **one 3D metaphor carries the brand story; scroll position drives the narrative; minimal UI chrome; typography and space create hierarchy**.

### What We're Adapting

We take D2C's restraint and apply it to Azimuth's visual language. Where D2C uses 2 colors and one morphing object, we use a **temperature-driven dual palette** (cool cyan structure + warm amber intelligence) and a **hub-and-spoke brand geometry system**. The scrollytelling journey replaces D2C's page-scroll model with a guided narrative: Gauntlet → NOVA Hub → Tool Showcases.

### Aesthetic Guardrails — What This Is NOT

This demo must read as a **credible technology product** for Defense, Workforce, Veteran Services, and Mental Health partners. It is not an art installation, planetarium, or sci-fi experience.

- **No stars, galaxies, nebulae, or space motifs.** Dark backgrounds use subtle texture/grain — not voids with twinkling points.
- **No floating-in-space composition.** The Hub is grounded on a subtle surface grid — a strategic planning environment, not a star map.
- **No mystical/spiritual language** in code, comments, or docs. Shapes are "brand geometry," not "sacred geometry." Audio is "ambient soundscape," not "432Hz cosmic drone."
- **Showcases use elevated dark backgrounds** (`--midnight` #1C2331 or darker slate), not black voids. They are rooms with depth, not outer space.
- **D2C's influence means restraint** — one clean 3D element per scene, generous whitespace, typography-led hierarchy. The 3D is an accent, not the whole composition.

### Core Principles

1. **Temperature as meaning** — Cool cyan = structure, navigation, precision. Warm amber = energy, life, intelligence, NOVA. Every scene expresses a ratio of these temperatures.
2. **Color is earned** — The Gauntlet is grayscale. Color enters only when NOVA activates. Each showcase deepens its own chromatic identity.
3. **Scroll drives story** — Vertical scroll progresses the narrative. Horizontal swipe explores tool depth. No menus, no sidebars.
4. **Grounded premium** — 3D elements are refined accents within a clean UI composition, not immersive environments. Glass-morphic panels, typography, and whitespace do the heavy lifting.
5. **Motion is purposeful** — Asymmetric easing (entries slower than exits), duration scales with visual distance. Animations serve comprehension, not spectacle.

---

## 1. Color Architecture

### 1.1 Core Token System

| Token | Hex | Role | Temperature | Scene Usage |
|-------|-----|------|-------------|-------------|
| `--deep-navy` | `#0A0E1A` | Primary background canvas | Cold | All scenes except Gauntlet |
| `--midnight` | `#1C2331` | Secondary depth, panel backgrounds | Cold | Hub, Showcases |
| `--cyan-struct` | `#00CED1` | Navigation, compass rings, structural lines | Cool | Hub, transitions |
| `--slate-blue` | `#526A82` | Secondary interface, muted accents | Cool | UI labels, inactive states |
| `--amber-core` | `#E8A030` | NOVA core, energy, warmth, CTAs | Warm | Hub (NOVA), MAPS |
| `--sage-muted` | `#98A89D` | Human warmth, emotional nuance | Warm-neutral | BASE showcase |
| `--gauntlet-gray` | `#6B6B6B` | Gauntlet surfaces (grayscale only) | Neutral | Gauntlet only |
| `--scout-blue` | `#0C447C` | SCOUT analytical precision | Cold | SCOUT showcase |
| `--silver` | `#D8DEE9` | Data lattice highlights, text | Cool-neutral | SCOUT, K.I.T. |
| `--calm-purple` | `#7B68AE` | BASE wellness warmth | Cool-warm | BASE showcase |
| `--peak-light` | `#FFFFFF` | Maximum luminance + bloom | Neutral | Core ignition, transitions |

### 1.2 Temperature Ratios by Scene

| Scene | Cyan (Cool %) | Amber (Warm %) | Dominant Emotion |
|-------|--------------|----------------|-----------------|
| Boot Sequence | 0% | 30% rising | Anticipation |
| Gauntlet | 0% / 0% (grayscale) | 0% | Oppression, confusion |
| Gauntlet → Hub transition | 60% → 40% | 10% → 40% | Liberation |
| NOVA Hub | 40% | 40% | Clarity, empowerment |
| MAPS Showcase | 20% | 60% | Possibility, optimism |
| K.I.T. Showcase | 50% | 30% | Structure, readiness |
| BASE Showcase | 20% (warm purple) | 30% (sage) | Safety, calm |
| SCOUT Showcase | 50% | 20% | Precision, confidence |

### 1.3 Gauntlet Exception Rule

The Gauntlet uses ONLY these values:

| Token | Hex | Role |
|-------|-----|------|
| `--gauntlet-bg-deep` | `#0A0E1A` | Deep background (deep-navy reused) |
| `--gauntlet-bg-mid` | `#1C2331` | Gradient stop (midnight reused) |
| `--gauntlet-surface` | `#6B6B6B` | All concrete/wall surfaces, roughness 0.85–0.95 |
| `--gauntlet-light` | `#C8C8C8` | Fluorescent RectAreaLight strips, low intensity |

No cyan. No amber. No color. Color is earned through the transition.

### 1.4 Glass-Morphic Panel Colors

```css
/* Standard glass panel (Hub + Showcases) */
--glass-bg: rgba(28, 35, 49, 0.65);        /* midnight at 65% */
--glass-border: rgba(0, 206, 209, 0.15);    /* cyan-struct at 15% */
--glass-blur: 20px;
--glass-highlight: rgba(255, 255, 255, 0.05);

/* Active/hover state */
--glass-bg-active: rgba(28, 35, 49, 0.80);
--glass-border-active: rgba(0, 206, 209, 0.30);
```

---

## 2. Typography

### 2.1 Font Stack

| Usage | Font | Weight | Fallback |
|-------|------|--------|----------|
| Headlines / Scene Titles | Satoshi | 700 (Bold) | DM Sans, system-ui |
| Body / Descriptions | Inter | 400, 500 | IBM Plex Sans, system-ui |
| Data / Metrics / Labels | Space Grotesk | 500, 600 | monospace |
| Accent / NOVA Voice | Space Grotesk | 300 (Light) | monospace |

### 2.2 Type Scale

Based on D2C's restraint — fewer sizes, more whitespace. All sizes optimized for tablet viewing at arm's length (24–36 inches).

| Token | Size | Line Height | Use |
|-------|------|-------------|-----|
| `--text-hero` | 56px / 3.5rem | 1.1 | Scene titles (Gauntlet, Hub) |
| `--text-h1` | 40px / 2.5rem | 1.15 | Showcase headlines |
| `--text-h2` | 28px / 1.75rem | 1.2 | Section headers within showcases |
| `--text-h3` | 20px / 1.25rem | 1.3 | Card titles, feature names |
| `--text-body` | 16px / 1rem | 1.6 | Body copy, descriptions |
| `--text-caption` | 13px / 0.8125rem | 1.4 | Labels, metadata, compass markings |
| `--text-data` | 36px / 2.25rem | 1.0 | Impact metrics (90%, 20 min, etc.) |

### 2.3 Text Animation Patterns

Premium motion patterns (asymmetric easing, staggered reveals):

| Pattern | Timing | Easing | Use |
|---------|--------|--------|-----|
| Character stagger reveal | 40ms/char | `power3.out` | Hero headlines |
| Word stagger reveal | 120ms/word | `power3.out` | Subheadlines |
| Line reveal (fade up) | 200ms/line | `power2.out` | Body paragraphs |
| Counter animation | 1200ms total | `power2.out` | Metric numbers (90%, 20min) |
| Typewriter (NOVA voice) | 30ms/char | linear | NOVA narration text |

---

## 3. Spacing & Layout

### 3.1 Spacing Scale

8px base unit, following D2C's generous whitespace approach.

| Token | Value | Use |
|-------|-------|-----|
| `--space-xs` | 4px | Inline spacing, icon gaps |
| `--space-sm` | 8px | Tight component padding |
| `--space-md` | 16px | Standard padding |
| `--space-lg` | 24px | Section internal padding |
| `--space-xl` | 32px | Between components |
| `--space-2xl` | 48px | Between major sections |
| `--space-3xl` | 64px | Scene breathing room |
| `--space-4xl` | 96px | Top/bottom scene padding |

### 3.2 Layout Grid

Tablet-first (1024×768 minimum, 2560×1440 kiosk maximum).

```
Container: max-width 1280px, centered
Columns: 12-column grid, 24px gutter
Margins: 48px (tablet), 64px (kiosk)

Scrollytelling viewport: 100vh sections
Horizontal swipe: 100vw per card within carousel
```

### 3.3 Touch Targets

All interactive elements: minimum 60×60px hit area (per Portal Architecture Spec). Generous spacing between tap targets — 16px minimum gap.

---

## 4. Motion & Animation System

### 4.1 GSAP Easing Tokens

```typescript
export const EASING = {
  // Camera movements
  CAMERA_APPROACH: 'expo.inOut',
  CAMERA_PULL_BACK: 'power3.out',
  CAMERA_ORBIT: 'sine.inOut',
  CAMERA_ZOOM: 'power4.in',

  // Scene transitions
  SCENE_ENTER: 'power3.inOut',
  SCENE_EXIT: 'power2.in',

  // UI elements
  UI_ENTER: 'power2.out',
  UI_EXIT: 'power2.in',
  UI_OVERSHOOT: 'back.out(1.4)',

  // Text
  TEXT_REVEAL: 'power3.out',
  TEXT_FADE: 'power1.inOut',

  // Particles
  PARTICLE_SCATTER: 'expo.out',
  PARTICLE_GATHER: 'power2.inOut',
} as const;
```

### 4.2 Duration Tokens

```typescript
export const TIMING = {
  // Major transitions
  SCENE_TRANSITION: 3500,      // ms — Gauntlet → Hub
  SHOWCASE_ENTER: 2800,       // ms — Hub → Showcase
  SHOWCASE_EXIT: 2200,        // ms — Showcase → Hub (20% faster)
  ROTATION_PERIOD: 45000,      // ms — Full hub rotation cycle
  CAMERA_SETTLE: 800,          // ms — Post-flight micro-adjust

  // UI
  PANEL_ENTER: 600,
  PANEL_EXIT: 400,
  LABEL_APPEAR: 300,
  LABEL_STAGGER: 80,
  TOOLTIP_DELAY: 150,

  // Scroll-driven
  SCROLL_SECTION_DURATION: '100vh', // Each scroll section = 1 viewport
  SWIPE_SNAP: 300,                  // ms — Carousel snap animation
  PARALLAX_FACTOR: 0.3,            // Background scroll speed multiplier

  // Audio
  AUDIO_CROSSFADE: 2500,
  AUDIO_SWELL: 1500,

  // Particles
  PARTICLE_BURST: 1200,
  BLOOM_PULSE: 2000,
  GLOW_BREATHE: 4000,
} as const;
```

### 4.3 Scroll-Driven Animation Model

Adapting D2C's scroll-position-as-timeline approach:

```
Scroll Position 0%    → Boot Sequence (auto-plays on load)
Scroll Position 5%    → Gauntlet enters (camera drifts through corridors)
Scroll Position 15%   → "Find Your Bearing" CTA appears
Scroll Position 20%   → Gauntlet → Hub transition (dissolution + acceleration)
Scroll Position 30%   → NOVA Hub fully assembled (grid surface, compass, nodes)
Scroll Position 35%   → NOVA narration text reveals
Scroll Position 40%   → Tool nodes illuminate sequentially
Scroll Position 45-90% → Horizontal swipe zones for each showcase
Scroll Position 95%   → Return to Hub, CTA overlay
Scroll Position 100%  → Closing statement + contact info
```

### 4.4 Hover & Interaction States

| Element | Idle | Hover | Active/Selected |
|---------|------|-------|-----------------|
| Tool Node (3D) | Gentle rotation, ambient glow | Scale 1.08, brightness 1.4x, label appears | Cyan ring pulse, compass aligns |
| Glass Panel | 65% opacity, 15% border | 80% opacity, 30% border, subtle tilt ±3° | Full brightness, content expands |
| CTA Button | Amber core glow, breathing pulse | Scale 1.05, glow intensifies | Flash + haptic feedback |
| Carousel Dot | 8px, slate-blue | 10px, cyan-struct | 12px, amber-core |
| NOVA Sphere | Particles drift, amber glow | Particles pull toward cursor | Responsive pattern shift |

---

## 5. Component Library

### 5.1 3D Components (React Three Fiber)

| Component | Props | Description |
|-----------|-------|-------------|
| `<NOVASphere>` | `state: 'idle' \| 'hover' \| 'processing'` | Particle sphere, amber core, responsive states |
| `<CompassRing>` | `activeNode?: string, rotation: number` | Azimuth compass with degree markings, rotates to align |
| `<ToolNode>` | `geometry: 'dodeca' \| 'cube' \| 'sphere' \| 'octa', color, label` | Brand geometry node, translucent material |
| `<DepthGrid>` | `opacity: number, color: string` | Subtle perspective grid surface that grounds the Hub scene — reads as strategic planning surface, not space |
| `<GauntletCorridor>` | `segments: number, complexity: number` | Procedural brutalist labyrinth geometry |
| `<BootSequence>` | `onComplete: () => void` | "A" monogram resolve + amber ignition |
| `<DissolveTransition>` | `progress: number` | GLSL shader: concrete → cyan particle stream |

### 5.2 UI Components (Glass-Morphic Overlays)

| Component | Variants | Description |
|-----------|----------|-------------|
| `<GlassPanel>` | `size: 'sm' \| 'md' \| 'lg' \| 'full'` | Frosted glass container with cyan border |
| `<MetricCard>` | `value, label, prefix?, suffix?` | Animated counter + label (e.g., "90% Approval Rate") |
| `<FeatureRow>` | `icon, title, description` | Horizontal feature item for showcase carousels |
| `<NOVANarration>` | `text, typing: boolean` | Typewriter text with NOVA voice styling |
| `<SwipeCarousel>` | `items: ReactNode[], dots: boolean` | Horizontal swipe container with snap and dot indicators |
| `<CTAButton>` | `variant: 'primary' \| 'ghost'` | Amber-core primary / cyan-struct ghost |
| `<SceneBadge>` | `label, phase` | Small identifier for current scene/tool |
| `<ProgressBar>` | `sections: string[], active: number` | Vertical scroll progress indicator |
| `<ReturnButton>` | — | "Return to NOVA" with reverse-arrow icon |

### 5.3 Layout Components

| Component | Description |
|-----------|-------------|
| `<ScrollScene>` | 100vh section container tied to GSAP ScrollTrigger |
| `<ShowcaseLayout>` | Full-screen showcase wrapper with 3D background + glass UI overlay |
| `<SplitView>` | Left: 3D/visual. Right: Glass panels with content. For showcase detail views. |
| `<ScrollProgress>` | Fixed vertical bar showing journey progress through all scenes |

---

## 6. Materials & Shaders (Three.js)

### 6.1 Crystalline Material (Hub + Showcases)

```typescript
const crystallineMaterial = {
  type: 'MeshPhysicalMaterial',
  transmission: 0.85–0.95,
  thickness: 0.5–2.0,
  roughness: 0.05–0.15,
  ior: 1.5–2.0,
  envMapIntensity: 1.0–1.5,
  // color: per-node accent
};
```

### 6.2 Gauntlet Material (Brutalist Concrete)

```typescript
const gauntletMaterial = {
  type: 'MeshStandardMaterial',
  roughness: 0.85–0.95,
  metalness: 0.1,
  color: '#6B6B6B', // gauntlet-gray
  normalMap: 'concrete-formlines.png',
};
```

### 6.3 Custom Shaders

| Shader | Purpose | Input |
|--------|---------|-------|
| `dissolve.glsl` | Gauntlet → Hub transition | `uniform float progress` (0→1) |
| `bloom.glsl` | Volumetric bloom on NOVA core | `threshold: 0.6, radius: 1.2, strength: 0.8` |
| `crystalline.glsl` | Enhanced translucency + caustics | Per-material color tint |
| `cymatic.glsl` | NOVA processing state patterns | Audio frequency input |

### 6.4 Postprocessing Stack

```
EffectComposer
├── Bloom (threshold: 0.6, radius: 1.2, strength: 0.8)
├── ChromaticAberration (offset: [0.001, 0.001]) — subtle
├── Vignette (darkness: 0.4) — frames the viewport
└── ToneMapping (ACESFilmic) — cinematic color response
```

---

## 7. Audio Design Tokens

### 7.1 Scene Audio Map

| Scene | Base Layer | Interaction Layer | Crossfade Duration |
|-------|-----------|-------------------|--------------------|
| Boot | Silence → rising tone | None | N/A |
| Gauntlet | Muffled murmur + HVAC + paper shuffle | None | N/A |
| Transition | Bass drop → silence → ambient pad | None | 1.5s |
| Hub | Warm ambient pad, wide stereo | Clean chime tones on hover | 2.5s |
| MAPS | Ascending warm harmonics | Soft confirmation tones | 2.5s |
| K.I.T. | Structured rhythmic pulse | Click/tap feedback | 2.5s |
| BASE | Low warm ambient, calming | Breathing-sync ambient | 3.0s (slower = calmer) |
| SCOUT | Analytical precision hum | Sequential resolve tones | 2.5s |

### 7.2 Audio Engine Specs

- Library: Howler.js (cross-browser, spatial audio)
- All assets preloaded during boot
- Spatial panning follows cursor position in Hub
- Equal-power crossfade curves
- Latency target: <50ms for interaction feedback

---

## 8. Brand Geometry System

Each tool is represented by a distinct 3D form — clean, recognizable shapes that function as brand icons, not mystical symbols.

| Tool | Form | Faces | Design Rationale | Accent Color |
|------|------|-------|------------------|-------------|
| NOVA | Cuboctahedron | 14 | Multi-faceted intelligence — represents connected platform | `--amber-core` |
| MAPS | Dodecahedron | 12 | Many-pathed possibility — career path multiplicity | `--amber-core` warm gold |
| K.I.T. | Cube | 6 | Stability and structure — reliable career foundation | Cyan + military green |
| BASE | Sphere | ∞ | Completeness — whole-health coverage | `--calm-purple` + sage |
| SCOUT | Octahedron | 8 | Precision and balance — analytical optimization | `--scout-blue` + silver |

### Geometry Behavior

- **Idle:** Slow rotation (0.002 rad/frame), soft glow matching accent color
- **Hover:** Scale 1.0 → 1.08 (lerp 0.1), brightness 1.4x, label materializes
- **Selected:** Cyan ring pulse, compass ring rotates to align, camera flight initiates
- **Showcase active:** Geometry serves as visual anchor for the tool's section — camera approaches it

---

## 9. Responsive Behavior

### 9.1 Target Devices

| Device | Resolution | Priority |
|--------|-----------|----------|
| Kiosk display | 2560×1440 or 1920×1080 | Primary |
| iPad Pro 12.9" | 2048×2732 | Secondary |
| iPad Air / standard | 1640×2360 | Secondary |
| Desktop fallback | 1920×1080 | Tertiary |

### 9.2 Adaptation Rules

- **3D scene:** Scales with viewport, maintains aspect ratio via R3F `<Canvas>` responsive props
- **Glass panels:** Max-width 600px on tablet, 800px on kiosk. Padding scales with `clamp()`
- **Typography:** Uses `clamp()` fluid scaling between tablet and kiosk breakpoints
- **Touch targets:** Always 60×60px minimum. Increase to 72px on smaller tablets
- **Scroll snap:** CSS `scroll-snap-type: y mandatory` for scene sections, `x mandatory` for carousels

---

## 10. Accessibility

### 10.1 Core Requirements

- `prefers-reduced-motion`: Disable all GSAP animations, 3D rotation, particle systems. Show static fallback with all content visible.
- `prefers-color-scheme`: N/A (dark mode is the only mode — deep navy background)
- Focus indicators: Cyan ring (3px solid `--cyan-struct`) on all interactive elements
- ARIA labels on all 3D interactive nodes
- Screen reader alternative: Full text transcript of all narration, hidden but accessible

### 10.2 Color Contrast

| Pair | Ratio | Passes |
|------|-------|--------|
| Peak light on deep-navy | 18.5:1 | AAA |
| Silver on deep-navy | 12.1:1 | AAA |
| Amber-core on deep-navy | 7.8:1 | AAA |
| Cyan-struct on deep-navy | 9.2:1 | AAA |
| Slate-blue on deep-navy | 3.8:1 | AA (large text only) |

---

## 11. Navigation State Machine

```
[Boot] ──auto──▶ [Gauntlet] ──tap──▶ [Hub]
                                       │
                              scroll to section
                                       │
                    ┌──────────┬────────┼────────┬──────────┐
                    ▼          ▼        ▼        ▼          ▼
                 [MAPS]    [K.I.T.]  [BASE]  [SCOUT]    [Closing]
                 swipe←→   swipe←→   swipe←→  swipe←→
                    │          │        │        │
                    └──────────┴────────┴────────┴──▶ scroll continues
                                                      
Idle timeout (60s): Any scene → fade to black → restart at Boot
```

### Navigation Controls

- **Vertical scroll:** Progresses through scenes (main narrative)
- **Horizontal swipe:** Explores tool feature cards within each showcase section
- **Tap:** "Find Your Bearing" CTA in Gauntlet; tool nodes in Hub; feature cards in showcases
- **Swipe back:** Return gesture from expanded view
- **Auto-reset:** 60-second idle returns to Boot for next visitor

---

*This design system synthesizes D2C Life Science's Awwwards-winning minimal aesthetic with Azimuth's Portal Architecture and brand geometry system. It is the single source of truth for the interactive demo showcase build. Aesthetic direction: clean, professional, tech-forward — grounded, not cosmic.*
