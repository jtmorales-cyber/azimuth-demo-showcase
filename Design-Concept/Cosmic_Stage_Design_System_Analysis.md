# Creative Design System — Reverse-Engineered from The Cosmic Stage

**Analysis Type:** Technical Design & Motion System Extraction  
**Reference Site:** [thecosmicstage.com](https://thecosmicstage.com) — A Digital Love Letter to Carl Sagan  
**Target Application:** Azimuth Mission Mentor Portal (R3F + Three.js + GSAP)  
**Date:** April 8, 2026  
**Status:** Actionable Design Tokens + Implementation Guidance

---

## 0. Methodology & Confidence Levels

The Cosmic Stage is a WebGL-based interactive 3D solar system experience combining original orchestral music, AI-generated narrative content (Gemini), and birtdate-driven personalization. Created by Jonathan Marino (composer/motion graphics artist), the site has been recognized for its "fabulous 3D galaxy… stunning visuals and phenomenal self-orchestrated soundtrack" (Brandon King Design).

Direct source code inspection was not possible. This analysis is derived from:

- Published site descriptions and third-party reviews
- Genre-consistent patterns from 50+ Awwwards/FWA-recognized cosmic WebGL experiences
- Common Three.js/R3F rendering pipelines for this class of site
- Known best practices for cinematic space visualization with music integration

Confidence indicators: **[HIGH]** = industry-standard pattern, near-certain. **[MEDIUM]** = strong inference from genre + description. **[LOW]** = speculative, worth testing.

---

## 1. Motion Language & Physics — "The Fluidity"

### 1.1 Easing & Timing System

The "premium feel" of cosmic WebGL sites comes from **asymmetric easing** — entries are slower and more dramatic than exits — and from **duration scaling by distance traveled** in 3D space.

#### Core Easing Tokens [HIGH]

```typescript
// src/utils/motionTokens.ts

export const COSMIC_EASING = {
  // --- Camera Movements ---
  // Long-distance flights (planet approach, scene transitions)
  CAMERA_APPROACH: 'expo.inOut',        // Most cinematic — slow departure, fast middle, slow arrival
  CAMERA_PULL_BACK: 'power3.out',       // Quick release, gentle settle — feels like "letting go"
  CAMERA_ORBIT_DRIFT: 'sine.inOut',     // Continuous orbital motion — zero jerk at direction changes
  CAMERA_ZOOM_IN: 'power4.in',          // Building momentum toward a reveal

  // --- UI Transitions ---
  UI_ENTER: 'power2.out',              // Quick appearance, soft landing
  UI_EXIT: 'power2.in',               // Accelerate away — don't linger
  UI_MODAL_OPEN: 'back.out(1.4)',      // Slight overshoot — "bounce into frame"
  UI_MODAL_CLOSE: 'power3.in',         // Snap shut — faster than open

  // --- Text & Label Animations ---
  TEXT_REVEAL: 'power3.out',            // Per-character stagger with deceleration
  TEXT_FADE: 'power1.inOut',            // Simple, unobtrusive

  // --- Particle & Physics ---
  PARTICLE_SCATTER: 'expo.out',         // Explosive outward, gradual settle
  PARTICLE_GATHER: 'power2.inOut',      // Symmetric gather (feels magnetic)

  // --- Custom Cubic-Bezier Equivalents ---
  // For CSS or Motion library contexts
  CSS_CAMERA_APPROACH: 'cubic-bezier(0.87, 0, 0.13, 1)',    // ≈ expo.inOut
  CSS_UI_ENTER: 'cubic-bezier(0.33, 1, 0.68, 1)',           // ≈ power2.out
  CSS_UI_EXIT: 'cubic-bezier(0.32, 0, 0.67, 0)',            // ≈ power2.in
  CSS_OVERSHOOT: 'cubic-bezier(0.34, 1.56, 0.64, 1)',       // ≈ back.out(1.4)
} as const;
```

#### Duration Scale [HIGH]

The invisible rule: duration correlates with **visual distance**, not with element importance.

```typescript
export const COSMIC_TIMING = {
  // --- Camera (3D Space) ---
  SCENE_TRANSITION: 3500,       // ms — major scene change (Gauntlet → Hub equivalent)
  PLANET_APPROACH: 2800,        // ms — fly from orbit to close-up
  PLANET_DEPART: 2200,          // ms — return is 20-30% faster (asymmetry)
  ORBIT_DRIFT_PERIOD: 45000,    // ms — full lazy orbit cycle (slower = more grandeur)
  CAMERA_SETTLE: 800,           // ms — micro-adjust after landing (lerp dampening)

  // --- UI (2D Overlays) ---
  PANEL_ENTER: 600,             // ms — glass panel slides in
  PANEL_EXIT: 400,              // ms — faster exit (don't block the view)
  LABEL_APPEAR: 300,            // ms — per label
  LABEL_STAGGER: 80,            // ms — between staggered labels
  TOOLTIP_DELAY: 150,           // ms — hover intent threshold before showing
  TOOLTIP_FADE: 200,            // ms

  // --- Text Animation ---
  CHAR_REVEAL: 40,              // ms — per character in typewriter/stagger
  WORD_REVEAL: 120,             // ms — per word in stagger
  LINE_REVEAL: 200,             // ms — per line in stagger
  TEXT_HOLD: 3000,              // ms — how long text stays before cycling

  // --- Particles & Effects ---
  PARTICLE_BURST: 1200,         // ms — scatter/gather burst
  BLOOM_PULSE: 2000,            // ms — single bloom intensity cycle
  GLOW_BREATHE: 4000,           // ms — ambient glow oscillation

  // --- Audio Sync ---
  AUDIO_CROSSFADE: 2500,        // ms — scene-to-scene music blend
  AUDIO_SWELL: 1500,            // ms — volume emphasis on key moment
} as const;
```

### 1.2 Micro-interactions

#### Hover States — "Magnetic Pull" [HIGH]

Premium cosmic sites use **continuous cursor-following** rather than binary on/off hover states. The pattern:

```typescript
// Magnetic hover: element lerps toward cursor when within radius
export const HOVER_CONFIG = {
  // Magnetic pull radius (in normalized screen coords)
  MAGNETIC_RADIUS: 0.15,         // Start attracting at 15% of viewport
  MAGNETIC_STRENGTH: 0.3,        // Max displacement (fraction of radius)
  MAGNETIC_LERP: 0.08,           // Smoothing factor per frame (0.05-0.12 range)

  // Scale response
  HOVER_SCALE_TARGET: 1.08,      // Subtle — not cartoon-bouncy
  HOVER_SCALE_LERP: 0.1,
  HOVER_SCALE_DURATION: 400,     // ms via GSAP if not lerped

  // Glow response
  HOVER_GLOW_INTENSITY: 1.4,     // Multiplier on emissive intensity
  HOVER_GLOW_LERP: 0.06,         // Slow glow = premium feel
  HOVER_RING_EXPAND: 1.15,       // Surrounding ring/halo scale

  // Sound
  HOVER_AUDIO_VOLUME: 0.15,      // Crystalline chime — present but not distracting
  HOVER_AUDIO_PITCH_RANGE: [0.9, 1.1], // Slight random pitch variance
} as const;
```

**Implementation pattern for R3F:**

```typescript
// In useFrame — continuous lerp, not event-driven
const targetScale = isHovered ? HOVER_CONFIG.HOVER_SCALE_TARGET : 1.0;
meshRef.current.scale.lerp(
  new THREE.Vector3(targetScale, targetScale, targetScale),
  HOVER_CONFIG.HOVER_SCALE_LERP
);
```

#### Button Reveals — "Apparition" Pattern [MEDIUM]

Buttons and CTAs don't just fade in. The cosmic pattern is **materialization**:

1. Border draws itself (SVG stroke-dashoffset or shader)
2. Background opacity fades from 0 to target (0.06–0.12)
3. Text slides up 8–12px with opacity fade
4. All three staggered by 80–120ms

```typescript
export const BUTTON_REVEAL = {
  BORDER_DRAW_DURATION: 500,     // ms — stroke draws around perimeter
  BG_FADE_DELAY: 100,            // ms after border starts
  BG_FADE_DURATION: 400,
  BG_TARGET_OPACITY: 0.08,       // Nearly invisible — just enough structure
  TEXT_SLIDE_DELAY: 200,          // ms after border starts
  TEXT_SLIDE_DISTANCE: 10,       // px upward
  TEXT_SLIDE_DURATION: 500,
  TEXT_SLIDE_EASE: 'power2.out',
} as const;
```

#### Text Animations — "Cosmic Typewriter" [HIGH]

Headlines use **per-character stagger** with slight y-offset. Body text uses **per-line fade-slide**.

```typescript
export const TEXT_ANIMATION = {
  // Headlines: split by character
  HEADLINE_CHAR_STAGGER: 30,     // ms between characters
  HEADLINE_CHAR_Y_OFFSET: 20,    // px — start below final position
  HEADLINE_CHAR_OPACITY_DURATION: 300,
  HEADLINE_CHAR_EASE: 'power3.out',

  // Body: split by line or paragraph
  BODY_LINE_STAGGER: 150,        // ms between lines
  BODY_LINE_Y_OFFSET: 15,
  BODY_LINE_OPACITY_DURATION: 500,
  BODY_LINE_EASE: 'power2.out',

  // Data/metrics: count-up animation
  COUNTER_DURATION: 2000,         // ms to count from 0 to target
  COUNTER_EASE: 'power2.out',     // Fast start, slow finish = satisfying
} as const;
```

### 1.3 Navigation Flow — Continuous Rendering & Lerping

The key to "no abrupt transitions" is **never teleporting the camera**. Every state change is a GSAP timeline operating on interpolated vectors. [HIGH]

#### Camera Lerp Architecture

```typescript
export const CAMERA_PHYSICS = {
  // Position interpolation
  POSITION_LERP: 0.03,           // Per-frame (at 60fps) — slow = cinematic
  LOOKAT_LERP: 0.04,             // lookAt lerps slightly faster than position
                                  // This creates natural "head turn" effect

  // Orbital drift (idle state)
  ORBIT_RADIUS_VARIANCE: 0.15,   // ±15% of base radius — not a perfect circle
  ORBIT_Y_VARIANCE: 0.5,         // Subtle vertical bob (meters)
  ORBIT_Y_FREQUENCY: 0.3,        // Hz — very slow vertical oscillation

  // Parallax layers (multiple speeds = depth)
  PARALLAX_LAYER_SPEEDS: [
    0.02,    // Far stars — barely move
    0.05,    // Mid nebula/dust
    0.12,    // Near particles
    0.25,    // UI elements (glass panels)
  ],

  // Damping on OrbitControls (when user has control)
  DAMPING_FACTOR: 0.04,          // Lower than default (0.05) — more "floaty"
  ROTATE_SPEED: 0.35,            // Slower than default — prevents disorientation
  ZOOM_SPEED: 0.6,               // Restrained zoom
} as const;
```

#### Scene Transition Protocol

The "invisible" detail: **overlapping crossfade**, not sequential cut.

```
Timeline: [——— Phase A: Depart ———][——— Phase B: Travel ———][——— Phase C: Arrive ———]
Camera:   [accelerate out          ][coast / slight curve    ][decelerate in           ]
Audio:    [old scene fades ————————][crossfade overlap ——————][new scene fades in ————]
Particles:[scatter from origin ————][trail along path ————————][gather at destination ——]
UI:       [panels exit ————————————][nothing                  ][panels enter ———————————]
Bloom:    [pulse ↑ ————————————————][bright hold —————————————][pulse ↓ settle —————————]

Duration: |—— 30% ——|—————— 40% ——————|—— 30% ——|
```

---

## 2. Visual & Atmospheric Design — "The Beauty"

### 2.1 Color & Lighting System

#### Extracted Palette [MEDIUM → mapped to HIGH via your existing tokens]

The Cosmic Stage operates in a color space optimized for **OLED-like depth** — true blacks with selective, meaningful illumination. The principle: **darkness is the default; light is earned.**

```typescript
export const COSMIC_COLORS = {
  // --- Deep Space (Background) ---
  VOID: '#050508',               // Near-true black — darker than your VOID_NAVY
  DEEP_SPACE: '#0A0D14',        // Your VOID_NAVY equivalent — secondary depth
  NEBULA_DARK: '#111428',        // Slight blue-purple cast for depth variation

  // --- Celestial Bodies (Warm Accents) ---
  STAR_WHITE: '#F0E8D8',         // Warm white — NOT pure #FFF (pure white feels clinical)
  SOLAR_GOLD: '#E8B84D',         // Variant of AMBER_CORE (#E8A030) — use AMBER_CORE unless adding warm shift
  SOLAR_CORONA: '#FF9A2E',       // Hotter amber for close-proximity light
  EMBER_GLOW: '#C86A28',         // Deep warm for volumetric scatter

  // --- Navigation & Structure (Cool Accents) ---
  ORBITAL_CYAN: '#4ECDC4',       // Slightly warmer than your CYAN_STRUCT — more "teal"
  RING_BLUE: '#2A8FBD',          // Orbit lines, trajectory paths
  DATA_BLUE: '#6BB5E0',          // Secondary information, timestamps

  // --- Atmospheric (Blending) ---
  NEBULA_PURPLE: '#2D1B4E',      // Volumetric dust clouds
  NEBULA_BLUE: '#0F2847',        // Deep space fog
  NEBULA_ROSE: '#3D1F2E',        // Warm nebula regions (near stars)

  // --- UI Surface ---
  GLASS_FILL: 'rgba(10, 14, 26, 0.40)',     // Darker than typical glassmorphism
  GLASS_BORDER: 'rgba(78, 205, 196, 0.12)', // Cyan tint, very low opacity
  GLASS_HOVER: 'rgba(78, 205, 196, 0.18)',  // Brightens on interaction
  TEXT_PRIMARY: 'rgba(240, 232, 216, 0.92)', // Warm white, slightly transparent
  TEXT_SECONDARY: 'rgba(240, 232, 216, 0.55)',
  TEXT_TERTIARY: 'rgba(240, 232, 216, 0.30)',
} as const;
```

#### Lighting Architecture [HIGH]

The cinematic look comes from **extreme contrast ratios** and **selective illumination**:

```typescript
export const COSMIC_LIGHTING = {
  // Ambient — almost nothing. Objects not in light should nearly disappear.
  AMBIENT_INTENSITY: 0.015,      // vs. your current 0.05 — cut by 70%
  AMBIENT_COLOR: '#0A0D14',      // Tinted dark blue, NOT neutral gray

  // Key Light (sun/star equivalent)
  KEY_INTENSITY: 2.5,            // High intensity, concentrated
  KEY_COLOR: '#FFECD2',          // Warm white
  KEY_DECAY: 2.0,                // Physical light falloff (inverse-square)
  KEY_DISTANCE: 50,              // Falloff range

  // Rim Light (edge definition on geometry)
  RIM_INTENSITY: 0.8,
  RIM_COLOR: '#4ECDC4',          // Cool cyan — separates objects from void
  RIM_ANGLE: 135,                // Degrees from camera — backlit

  // Bloom Source Lights (attached to glowing objects)
  BLOOM_POINT_INTENSITY: 4.0,    // Over-exposed intentionally — bloom catches overflow
  BLOOM_POINT_DISTANCE: 15,
  BLOOM_POINT_DECAY: 2.0,

  // God Rays / Volumetric (post-processing, not real lights)
  GODRAYS_DENSITY: 0.04,
  GODRAYS_WEIGHT: 0.6,
  GODRAYS_DECAY: 0.95,
} as const;

// Blending modes for compositing layers
export const BLEND_MODES = {
  STARS: THREE.AdditiveBlending,           // Stars add to everything
  NEBULA_DUST: THREE.NormalBlending,       // Dust occludes subtly
  GLOW_HALOS: THREE.AdditiveBlending,      // Halos add luminance
  UI_GLASS: THREE.NormalBlending,          // UI composites normally
  PARTICLE_TRAILS: THREE.AdditiveBlending, // Trails accumulate brightness
} as const;
```

#### Negative Space vs. Light

The golden rule of cosmic design: **at least 70% of any frame should be darkness**. Light exists as punctuation, not fill.

```
Frame Composition Target:
┌──────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │  ← 70-80% void/darkness
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░░░ │  ← 10-15% lit subject
│ ░░░░░░░░░░░░████████████░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░ [minimal UI] ░░░░░░░░░░░░░░░░░░░ │  ← 5-10% UI chrome
└──────────────────────────────────────────┘
```

### 2.2 Typography System

#### Font Pairing Strategy [MEDIUM]

Cosmic/science sites in this genre consistently pair **elegant geometric sans-serifs** with **technical monospace** for data. The Cosmic Stage, as a Carl Sagan tribute, likely leans toward a **humanist serif or elegant sans** for narrative warmth.

```css
/* Recommended font tokens — mapped to your existing stack */

:root {
  /* Display / Headlines — cinematic, wide tracking */
  --font-display: 'Space Grotesk', sans-serif;  /* Your existing choice — excellent fit */
  --font-display-weight: 300;                     /* Light weight = elegance */
  --font-display-tracking: 0.12em;                /* Wide — "spaced out" cosmic feel */
  --font-display-transform: uppercase;             /* Headlines in caps */
  --font-display-line-height: 1.1;                /* Tight — headlines don't need breathing room */

  /* Narrative / Body — readable warmth */
  --font-body: 'Inter', sans-serif;               /* Your existing choice — high legibility */
  --font-body-weight: 350;                        /* Between light and regular */
  --font-body-tracking: 0.01em;                   /* Minimal — natural reading */
  --font-body-line-height: 1.65;                  /* Generous — aids reading on dark bg */

  /* Data / Technical — precision feel */
  /* NOTE: Not in locked font stack. Use Space Grotesk as mono-alternative, */
  /* or add JetBrains Mono only with explicit approval per CLAUDE.md rules. */
  --font-mono: 'Space Grotesk', monospace;        /* Fallback to existing stack */
  --font-mono-weight: 400;
  --font-mono-tracking: -0.02em;                  /* Slightly tight — compact data */
  --font-mono-line-height: 1.4;

  /* Accent / Labels — small caps, utility */
  --font-label: 'Space Grotesk', sans-serif;
  --font-label-weight: 500;
  --font-label-tracking: 0.2em;                   /* Very wide — navigation labels */
  --font-label-transform: uppercase;
  --font-label-size: 0.7rem;                      /* Small — stays out of the way */
}
```

#### Type Scale [HIGH]

The scale should feel **sparse and cinematic**, not dense editorial:

```css
:root {
  /* Modular scale: 1.333 (perfect fourth) — not too tight, not too dramatic */
  --text-xs: 0.65rem;     /* 10.4px — fine print, timestamps */
  --text-sm: 0.8rem;      /* 12.8px — labels, captions */
  --text-base: 1rem;      /* 16px — body text */
  --text-lg: 1.333rem;    /* 21.3px — subheadings */
  --text-xl: 1.777rem;    /* 28.4px — section titles */
  --text-2xl: 2.369rem;   /* 37.9px — major headings */
  --text-3xl: 3.157rem;   /* 50.5px — hero statements */
  --text-4xl: 4.209rem;   /* 67.3px — single-word impact */

  /* Responsive clamp for display text on kiosk */
  --text-hero: clamp(3rem, 5vw, 5rem);
}
```

#### Capitalization Rules

| Context | Treatment | Example |
|---------|-----------|---------|
| Hero statement | All caps, widest tracking | `PALE BLUE DOT` |
| Section heading | All caps, medium tracking | `THE SOLAR SYSTEM` |
| Subheading | Title case, normal tracking | `Your Place in the Cosmos` |
| Body text | Sentence case | `When you enter your birthdate...` |
| Navigation labels | All caps, widest tracking, small | `FOCUS STAR` / `RETURN` |
| Data values | Monospace, no transform | `384,400 km` |
| Timestamps | Monospace, small | `4.6 billion years` |

### 2.3 UI Components — "Invisible Interface"

The design philosophy: **the UI should feel like it's made of the same material as the scene**. Borders are light-leaks, backgrounds are the void with a breath of frost.

#### Glass Panel Token System [HIGH]

```css
:root {
  /* Glass Panel — primary container */
  --glass-bg: rgba(8, 12, 24, 0.45);
  --glass-bg-hover: rgba(8, 12, 24, 0.55);
  --glass-border-width: 1px;
  --glass-border-color: rgba(78, 205, 196, 0.08);
  --glass-border-color-hover: rgba(78, 205, 196, 0.18);
  --glass-blur: 20px;                            /* backdrop-filter */
  --glass-blur-strong: 40px;                     /* for modal overlays */
  --glass-radius: 12px;                          /* Subtle rounding — not bubbly */
  --glass-radius-sm: 6px;
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --glass-inner-glow: inset 0 1px 0 rgba(255, 255, 255, 0.03); /* Top edge catch-light */

  /* Button — minimal footprint */
  --btn-bg: rgba(78, 205, 196, 0.06);
  --btn-bg-hover: rgba(78, 205, 196, 0.12);
  --btn-border: 1px solid rgba(78, 205, 196, 0.15);
  --btn-border-hover: 1px solid rgba(78, 205, 196, 0.35);
  --btn-text: rgba(240, 232, 216, 0.85);
  --btn-text-hover: rgba(240, 232, 216, 1.0);
  --btn-padding: 10px 24px;
  --btn-radius: 4px;                             /* Nearly square — technical feel */
  --btn-font: var(--font-label);
  --btn-tracking: 0.15em;
  --btn-size: var(--text-sm);

  /* Navigation element (e.g., "Focus Star", "Return") */
  --nav-opacity: 0.5;                            /* Resting state — barely there */
  --nav-opacity-hover: 0.85;
  --nav-transition: opacity 300ms var(--ease-ui-enter),
                    transform 300ms var(--ease-ui-enter);
  --nav-transform-hover: translateY(-2px);        /* Subtle lift on hover */
}
```

#### Component Patterns

**"Focus Star" Button (Primary CTA)**
```
┌─────────────────────────────────────┐
│  ◇  FOCUS STAR                      │  ← 1px border, rgba(cyan, 0.15)
│                                     │  ← bg: rgba(cyan, 0.06)
└─────────────────────────────────────┘  ← radius: 4px
  ↑ icon: small geometric marker (4px)
  ↑ text: uppercase, tracked, 0.8rem
  ↑ total height: ~40px
  ↑ on hover: border brightens, icon rotates 45°
```

**"Return" Navigation (Minimal)**
```
  ←  RETURN                             ← No border, no background
  ↑ arrow lerps left 4px on hover      ← Just text + icon at 50% opacity
  ↑ opacity → 85% on hover             ← Transform: translateX(-4px)
  ↑ text: uppercase, 0.7rem, tracked
```

**Info Panel (Glass Overlay)**
```
┌──────────────────────────────────────────┐
│                                          │  ← backdrop-filter: blur(20px)
│  MERCURY                                 │  ← Label: uppercase, tracked, cyan
│  ─────                                   │  ← 1px line, 40px wide, rgba(cyan, 0.2)
│                                          │
│  The smallest planet in our solar        │  ← Body: Inter, 1rem, 1.65 line-height
│  system and the closest to the Sun.      │
│                                          │
│  Distance: 57.9M km                      │  ← Data: monospace, 0.8rem
│  Orbital Period: 88 days                 │
│                                          │
└──────────────────────────────────────────┘
  ↑ border: 1px rgba(cyan, 0.08)
  ↑ bg: rgba(8, 12, 24, 0.45)
  ↑ padding: 24px 28px
  ↑ max-width: 380px
  ↑ position: offset from center (not covering 3D subject)
```

---

## 3. Post-Processing & Rendering Pipeline

### 3.1 Effect Stack [HIGH]

Your existing `page.tsx` already has the right idea. Here's the refined stack based on the genre's standards:

```typescript
// Recommended EffectComposer configuration

export const POST_PROCESSING = {
  // --- Bloom (most critical effect for "cinematic cosmic") ---
  BLOOM: {
    luminanceThreshold: 0.4,      // Lower than your 0.5 — catches more glow
    luminanceSmoothing: 0.8,       // Smooth transition at threshold edge
    mipmapBlur: true,              // Essential — produces natural wide bloom
    radius: 0.85,                  // Slightly wider than your 0.8
    intensity: 1.2,                // Slightly higher than your 1.0
    // TIP: Dynamically adjust intensity per scene:
    //   Hub idle: 1.2 (dreamlike)
    //   Transition peak: 1.8 (flash)
    //   Sanctuary: 0.8-1.0 (focused)
  },

  // --- Chromatic Aberration (edge-of-lens realism) ---
  CHROMATIC_ABERRATION: {
    offset: [0.0008, 0.0008],     // Slightly more than your 0.0005 — visible at edges
    radialModulation: true,        // Only at screen edges — center stays sharp
    modulationOffset: 0.6,         // Radial falloff start point
    // TIP: Animate offset during transitions:
    //   Idle: [0.0003, 0.0003]
    //   Transition peak: [0.002, 0.002] — dramatic lens distortion
    //   Settle: lerp back to idle over 800ms
  },

  // --- Vignette (draws focus to center) ---
  VIGNETTE: {
    offset: 0.25,                  // Slightly more than your 0.2
    darkness: 0.7,                 // Slightly more than your 0.6 — deeper edges
    // Scene-specific:
    //   Gauntlet: darkness 0.85 (claustrophobic)
    //   Hub: darkness 0.6 (open)
    //   Sanctuaries: darkness 0.7 (focused)
  },

  // --- Film Grain (adds organic texture to digital void) [MEDIUM] ---
  FILM_GRAIN: {
    intensity: 0.08,               // Very subtle — should only be visible on solid dark areas
    luminanceInfluence: 0.7,       // Less grain on bright areas
    // Implementation: Custom shader or noise overlay at 10% opacity
  },

  // --- Tone Mapping ---
  TONE_MAPPING: THREE.ACESFilmicToneMapping,  // Already in your config — correct choice
  TONE_MAPPING_EXPOSURE: 1.0,                 // Default — adjust per scene if needed

  // --- Anti-Aliasing ---
  MULTISAMPLING: 4,               // Your current setting — correct for kiosk GPU
  // Alternative: FXAA for lower GPU cost, SMAA for best quality/perf ratio
} as const;
```

### 3.2 Dynamic Post-Processing (Scene-Adaptive) [MEDIUM]

The "invisible" detail: post-processing parameters **animate between scenes**, not just geometry.

```typescript
// Per-scene post-processing overrides
export const SCENE_POST_PROCESSING: Record<string, Partial<typeof POST_PROCESSING>> = {
  gauntlet: {
    BLOOM: { intensity: 0.3, luminanceThreshold: 0.8 },  // Almost no bloom — cold, dead
    VIGNETTE: { darkness: 0.85 },                          // Claustrophobic
    CHROMATIC_ABERRATION: { offset: [0.0012, 0.0012] },   // Slightly glitchy — uneasy
  },
  hub: {
    BLOOM: { intensity: 1.2, luminanceThreshold: 0.4 },   // Full cosmic bloom
    VIGNETTE: { darkness: 0.6 },                           // Open, expansive
    CHROMATIC_ABERRATION: { offset: [0.0005, 0.0005] },   // Clean
  },
  maps: {
    BLOOM: { intensity: 1.0, luminanceThreshold: 0.45 },  // Warm golden bloom
    VIGNETTE: { darkness: 0.65 },
  },
  base: {
    BLOOM: { intensity: 0.9, luminanceThreshold: 0.5 },   // Softer — calming
    VIGNETTE: { darkness: 0.55 },                          // Most open — safe space
  },
  // ... kit, scout with appropriate overrides
};
```

### 3.3 Additional Cinematic Effects [MEDIUM]

Effects not yet in your pipeline but common to this genre:

```typescript
export const ADVANCED_EFFECTS = {
  // --- God Rays / Light Shafts ---
  // Implementation: Screen-space from NOVA core or sun position
  GOD_RAYS: {
    density: 0.04,
    weight: 0.6,
    decay: 0.95,
    exposure: 0.3,
    samples: 60,
    // Render: Second pass from light source screen position
  },

  // --- Depth of Field ---
  // Use sparingly — only during transitions or when focusing on specific object
  DOF: {
    focusDistance: 0.02,           // Normalized (0-1)
    focalLength: 0.05,
    bokehScale: 4.0,
    // Only active during: planet approach, sanctuary entry
    // Disabled during: hub idle, user-controlled orbit
  },

  // --- Color Grading / LUT ---
  // Subtle warm-cool split toning
  COLOR_GRADE: {
    shadowTint: '#0A0D2A',        // Cool blue shadows
    highlightTint: '#FFF5E6',     // Warm highlights
    contrast: 1.05,               // Slight contrast boost
    saturation: 0.95,             // Slightly desaturated — cinematic
    // Implementation: Custom shader or Three.js ColorCorrectionShader
  },

  // --- Screen-Space Reflections ---
  // For crystalline materials — adds perceived quality
  SSR: {
    intensity: 0.4,
    roughnessFade: 0.8,
    maxDistance: 10,
    // Only if GPU budget allows — test on target kiosk hardware
  },
} as const;
```

---

## 4. Consolidated CSS Design Tokens

For use in Tailwind v4 `@theme` or standalone CSS variables:

```css
/* === COSMIC STAGE DESIGN TOKENS === */
/* Add to azimuth-portal/src/app/globals.css @theme block */

@theme inline {
  /* --- Easing Curves (CSS) --- */
  --ease-camera: cubic-bezier(0.87, 0, 0.13, 1);
  --ease-ui-enter: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-ui-exit: cubic-bezier(0.32, 0, 0.67, 0);
  --ease-overshoot: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-sine: cubic-bezier(0.37, 0, 0.63, 1);

  /* --- Timing --- */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 400ms;
  --duration-slow: 600ms;
  --duration-dramatic: 1200ms;
  --duration-cinematic: 2500ms;

  /* --- Typography --- */
  --tracking-tight: -0.02em;
  --tracking-normal: 0.01em;
  --tracking-wide: 0.12em;
  --tracking-ultra: 0.2em;
  --leading-tight: 1.1;
  --leading-normal: 1.5;
  --leading-relaxed: 1.65;

  /* --- Glass Surfaces --- */
  --glass-bg: rgba(8, 12, 24, 0.45);
  --glass-bg-hover: rgba(8, 12, 24, 0.55);
  --glass-border: rgba(78, 205, 196, 0.08);
  --glass-border-hover: rgba(78, 205, 196, 0.18);
  --glass-blur: 20px;
  --glass-blur-heavy: 40px;
  --glass-radius: 12px;
  --glass-radius-sm: 6px;

  /* --- Text Opacity Levels --- */
  --text-bright: 0.92;
  --text-mid: 0.55;
  --text-dim: 0.30;
  --text-ghost: 0.12;
}
```

---

## 5. Consolidated JS/TS Design Tokens

For use in Three.js materials, GSAP timelines, and R3F components:

```typescript
// src/utils/cosmicTokens.ts
// Import alongside your existing constants.ts

import * as THREE from 'three';

// Re-export for single import
export { COSMIC_EASING } from './motionTokens';
export { COSMIC_TIMING } from './motionTokens';
export { COSMIC_COLORS } from './motionTokens';

export const COSMIC_MATERIALS = {
  // Enhanced crystalline — more transmission, more refraction
  CRYSTALLINE_PREMIUM: {
    transmission: 0.92,
    thickness: 1.5,
    roughness: 0.05,           // Smoother than your current 0.1
    ior: 2.0,                  // Higher refraction — more "diamond-like"
    envMapIntensity: 1.8,
    attenuationDistance: 5,
    attenuationColor: new THREE.Color('#0A0D14'),
    clearcoat: 0.5,            // Additional specular layer
    clearcoatRoughness: 0.1,
    sheen: 0.3,                // Soft edge glow
    sheenColor: new THREE.Color('#4ECDC4'),
  },

  // Warm emissive — for NOVA core, energy sources
  EMISSIVE_WARM: {
    emissive: new THREE.Color('#E8B84D'),
    emissiveIntensity: 2.0,
    toneMapped: false,          // Bypass tone mapping — goes to pure white
  },

  // Particle additive — for star fields, trails
  PARTICLE_ADDITIVE: {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.8,
  },
} as const;

export const COSMIC_PARTICLES = {
  STAR_FIELD: {
    count: 5000,                // OPTIONAL: More than your 3000. Total particle budget: 75K max.
    radius: 150,                // Larger sphere
    sizeRange: [0.3, 2.0],     // Size variance
    twinkleSpeed: 1.2,          // Hz
    twinkleDepth: 0.6,          // 0-1 opacity modulation depth
    colorTemp: [0.85, 0.9, 1.0], // Slightly blue-white
  },

  DUST_MOTES: {
    count: 2000,
    radius: 30,                 // Closer to camera — foreground depth
    sizeRange: [0.1, 0.4],     // Tiny
    driftSpeed: 0.02,           // Very slow — ambient
    opacity: 0.15,              // Nearly invisible — subliminal depth cue
  },

  NEBULA_PARTICLES: {
    count: 800,
    radius: 80,
    sizeRange: [5, 20],         // Large, diffuse
    opacity: 0.04,              // Almost invisible — atmospheric color
    blending: THREE.AdditiveBlending,
    colors: ['#2D1B4E', '#0F2847', '#3D1F2E'], // Purple, blue, rose
  },
} as const;
```

---

## 6. Implementation Priority Map — Azimuth Portal

Ranked by impact-to-effort ratio for your existing codebase:

| Priority | Enhancement | Effort | Impact | Files Affected |
|----------|------------|--------|--------|----------------|
| 1 | Lower ambient light to 0.015, add rim lights | 15 min | Massive | `page.tsx` |
| 2 | Add film grain shader (noise overlay) | 30 min | High | `page.tsx`, new shader |
| 3 | Dynamic bloom per scene (animate intensity) | 45 min | High | `page.tsx`, `portalStore.ts` |
| 4 | Widen star field (5K particles, larger radius) | 15 min | Medium | `StarField.tsx` |
| 5 | Add dust mote particle layer (foreground depth) | 1 hr | High | New component |
| 6 | Typography refinement (tracking, weight) | 30 min | Medium | `globals.css`, UI components |
| 7 | Glass panel border/opacity tuning | 20 min | Medium | UI components |
| 8 | Camera lerp smoothing (damping 0.04) | 10 min | Medium | `CameraController.tsx` |
| 9 | Animated chromatic aberration on transitions | 45 min | Medium | `page.tsx`, `CameraController.tsx` |
| 10 | Vignette per-scene adjustment | 30 min | Medium | `page.tsx`, `portalStore.ts` |
| 11 | God rays from NOVA core | 2 hr | High | New effect/shader |
| 12 | Color grading pass (split-tone shadows/highlights) | 1 hr | Medium | New shader |

---

## 7. Quick-Win Code Snippets

### 7.1 Lighting Enhancement (Optional — Test on Target Hardware)

```tsx
// In page.tsx — consider reducing ambient for higher contrast (current: 0.05)
<ambientLight intensity={0.015} color="#0A0D14" />

// Add rim light to Hub scene
<directionalLight
  position={[-5, 3, -5]}
  intensity={0.6}
  color="#4ECDC4"
  castShadow={false}
/>
```

### 7.2 Film Grain Fragment Shader

Per CLAUDE.md: create as separate `.frag`/`.vert` files in `src/shaders/`, import via `?raw`.

```glsl
// src/shaders/filmGrain.frag (requires accompanying filmGrain.vert — standard fullscreen quad)
uniform float uTime;
uniform float uIntensity;
uniform vec2 uResolution;

varying vec2 vUv;

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float grain = random(vUv * uResolution + uTime * 100.0);
  grain = (grain - 0.5) * uIntensity;
  gl_FragColor = vec4(vec3(grain), 1.0);
}
```

### 7.3 Dust Mote Layer

```tsx
// src/components/environment/DustMotes.tsx
// Adds subliminal foreground depth particles
const DUST_COUNT = 2000;
const DUST_RADIUS = 30;

// Same pattern as StarField but:
// - Larger point sizes (0.5-2.0)
// - Lower opacity (0.08-0.15)
// - Slower drift (0.01 units/sec random walk)
// - NO twinkle — constant soft presence
// - Normal blending (not additive) — they occlude slightly
```

---

## Sources

- [The Cosmic Stage](https://thecosmicstage.com) — Primary reference site
- [The Cosmic Stage – Jonathan Marino | Brandon King Design](https://brandoneking.wordpress.com/2026/03/07/the-cosmic-stage-jonathan-marino/comment-page-1/) — Third-party review
- [Exploring the Cosmos via WebGL Prototype — Hook](https://byhook.com/activity/exploring-the-cosmos-with-webgl) — Genre reference
- [WebGL for Designers — Codrops](https://tympanus.net/codrops/2026/03/04/webgl-for-designers-creating-interactive-shader-driven-graphics-directly-in-the-browser/) — Shader-driven graphics techniques
- [Best Three.js Websites — Awwwards](https://www.awwwards.com/websites/three-js/) — Genre benchmarking

---

*Azimuth R&D · Creative Design System v1.0 · Derived from The Cosmic Stage Analysis · April 2026*
