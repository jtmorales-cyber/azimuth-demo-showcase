/**
 * Design tokens — single source of truth from design-system.md
 *
 * This file mirrors the design system in TypeScript for use in JS/TSX code.
 * Tailwind theme colors are defined in tailwind.config.ts.
 * CSS custom properties are defined in src/app/globals.css.
 * Keep all three in sync when adding new tokens.
 */

// ═══════════════════════════════════════════════════════════════════════════
// 1. COLORS — Section 1.1
// ═══════════════════════════════════════════════════════════════════════════

export const COLORS = {
  // Core palette
  DEEP_NAVY: '#0A0E1A',     // Primary background canvas
  MIDNIGHT: '#1C2331',       // Secondary depth, panel backgrounds
  CYAN_STRUCT: '#00CED1',    // Navigation, compass, structural lines
  SLATE_BLUE: '#526A82',     // Secondary interface, muted accents
  AMBER_CORE: '#E8A030',     // NOVA core, energy, CTAs
  SAGE_MUTED: '#98A89D',     // Human warmth (BASE)
  GAUNTLET_GRAY: '#6B6B6B',  // Gauntlet surfaces (grayscale only)
  SCOUT_BLUE: '#0C447C',     // SCOUT analytical precision
  SILVER: '#D8DEE9',         // Data lattice, text
  CALM_PURPLE: '#7B68AE',    // BASE wellness warmth
  PEAK_LIGHT: '#FFFFFF',     // Maximum luminance, bloom peaks
  GAUNTLET_LIGHT: '#C8C8C8', // Fluorescent strips in Gauntlet only
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 1.3 Gauntlet Exception — grayscale-only palette
// ═══════════════════════════════════════════════════════════════════════════

export const GAUNTLET_COLORS = {
  BG_DEEP: COLORS.DEEP_NAVY,
  BG_MID: COLORS.MIDNIGHT,
  SURFACE: COLORS.GAUNTLET_GRAY,
  LIGHT: COLORS.GAUNTLET_LIGHT,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 1.4 Glass-Morphic Panel Colors
// ═══════════════════════════════════════════════════════════════════════════

export const GLASS = {
  BG: 'rgba(28, 35, 49, 0.65)',          // midnight at 65%
  BORDER: 'rgba(0, 206, 209, 0.15)',      // cyan-struct at 15%
  BLUR: '20px',
  HIGHLIGHT: 'rgba(255, 255, 255, 0.05)', // top inset shadow
  BG_ACTIVE: 'rgba(28, 35, 49, 0.80)',    // hover state
  BORDER_ACTIVE: 'rgba(0, 206, 209, 0.30)', // hover state
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 1.2 Temperature Ratios by Scene (cyan % / amber %)
// ═══════════════════════════════════════════════════════════════════════════

export const SCENE_TEMPERATURE = {
  boot: { cool: 0, warm: 30 },
  gauntlet: { cool: 0, warm: 0 },       // grayscale
  hub: { cool: 40, warm: 40 },
  maps: { cool: 20, warm: 60 },
  kit: { cool: 50, warm: 30 },
  base: { cool: 20, warm: 30 },          // + calm-purple accent
  scout: { cool: 50, warm: 20 },         // coolest showcase
  impact: { cool: 40, warm: 40 },        // matches hub
  closing: { cool: 40, warm: 40 },       // matches hub
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 4.1 EASING — GSAP easing strings
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// 4.2 TIMING — durations in milliseconds
// ═══════════════════════════════════════════════════════════════════════════

export const TIMING = {
  // Major transitions
  SCENE_TRANSITION: 3500,      // Gauntlet → Hub
  SHOWCASE_ENTER: 2800,         // Hub → Showcase
  SHOWCASE_EXIT: 2200,          // Showcase → Hub (20% faster)
  ROTATION_PERIOD: 45000,       // Full hub rotation cycle
  CAMERA_SETTLE: 800,           // Post-flight micro-adjust

  // UI
  PANEL_ENTER: 600,
  PANEL_EXIT: 400,
  LABEL_APPEAR: 300,
  LABEL_STAGGER: 80,
  TOOLTIP_DELAY: 150,

  // Scroll-driven
  SCROLL_SECTION_DURATION: '100vh',
  SWIPE_SNAP: 300,
  PARALLAX_FACTOR: 0.3,

  // Audio
  AUDIO_CROSSFADE: 2500,
  AUDIO_SWELL: 1500,

  // Particles
  PARTICLE_BURST: 1200,
  BLOOM_PULSE: 2000,
  GLOW_BREATHE: 4000,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 3.1 SPACING — 8px base unit
// Note: TypeScript can't start property names with a digit, so 2xl/3xl/4xl
// become XXL/XXXL/XXXXL. The raw px values match the design system.
// ═══════════════════════════════════════════════════════════════════════════

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
  XXXL: 64,
  XXXXL: 96,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 2. TYPOGRAPHY — fonts, weights, sizes, line heights
// ═══════════════════════════════════════════════════════════════════════════

export const TYPOGRAPHY = {
  FONTS: {
    headline: 'Satoshi, DM Sans, system-ui, sans-serif',
    body: 'Inter, IBM Plex Sans, system-ui, sans-serif',
    data: 'Space Grotesk, monospace',
    accent: 'Space Grotesk, monospace',
  },
  WEIGHTS: {
    satoshiBold: 700,
    interRegular: 400,
    interMedium: 500,
    spaceGroteskLight: 300,
    spaceGroteskMedium: 500,
    spaceGroteskSemibold: 600,
  },
  SIZES: {
    hero: '3.5rem',      // 56px
    h1: '2.5rem',         // 40px
    h2: '1.75rem',        // 28px
    h3: '1.25rem',        // 20px
    body: '1rem',          // 16px
    caption: '0.8125rem', // 13px
    data: '2.25rem',      // 36px
  },
  LINE_HEIGHTS: {
    hero: 1.1,
    h1: 1.15,
    h2: 1.2,
    h3: 1.3,
    body: 1.6,
    caption: 1.4,
    data: 1.0,
  },
  // Text animation timing (Section 2.3)
  ANIMATION: {
    CHAR_STAGGER_MS: 40,
    WORD_STAGGER_MS: 120,
    LINE_REVEAL_MS: 200,
    COUNTER_DURATION_MS: 1200,
    TYPEWRITER_CHAR_MS: 30,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 8. GEOMETRY — brand form per tool
// ═══════════════════════════════════════════════════════════════════════════

export const GEOMETRY = {
  NOVA: { form: 'cuboctahedron', faces: 14, color: COLORS.AMBER_CORE },
  MAPS: { form: 'dodecahedron', faces: 12, color: COLORS.AMBER_CORE },
  KIT: { form: 'cube', faces: 6, color: COLORS.CYAN_STRUCT },
  BASE: { form: 'sphere', faces: Infinity, color: COLORS.CALM_PURPLE },
  SCOUT: { form: 'octahedron', faces: 8, color: COLORS.SCOUT_BLUE },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 11. SCENES — navigation state machine
// ═══════════════════════════════════════════════════════════════════════════

export const SCENES = [
  'boot',
  'gauntlet',
  'hub',
  'maps',
  'kit',
  'base',
  'scout',
  'impact',
  'closing',
] as const;

export type SceneName = (typeof SCENES)[number];

// ═══════════════════════════════════════════════════════════════════════════
// 6.1 MATERIALS — Crystalline material spec (Hub + Showcases)
// ═══════════════════════════════════════════════════════════════════════════

export const CRYSTALLINE_MATERIAL = {
  transmission: 0.9,      // 0.85–0.95 per spec
  thickness: 1.0,          // 0.5–2.0
  roughness: 0.1,          // 0.05–0.15
  ior: 1.8,                // 1.5–2.0
  envMapIntensity: 1.2,    // 1.0–1.5
} as const;

// Gauntlet (brutalist concrete) material — Section 6.2
export const GAUNTLET_MATERIAL = {
  roughness: 0.9,          // 0.85–0.95
  metalness: 0.1,
  color: COLORS.GAUNTLET_GRAY,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// 6.4 POSTPROCESSING — EffectComposer stack
// ═══════════════════════════════════════════════════════════════════════════

export const POSTPROCESSING = {
  BLOOM: {
    luminanceThreshold: 0.6,
    luminanceSmoothing: 0.3,
    intensity: 0.8,
    radius: 1.2,
  },
  CHROMATIC_ABERRATION: {
    baseOffset: [0.001, 0.001] as [number, number],
    peakOffset: [0.003, 0.003] as [number, number],
  },
  VIGNETTE: {
    darkness: 0.4,
    offset: 0.3,
  },
} as const;
