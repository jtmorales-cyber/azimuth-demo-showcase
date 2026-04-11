/** Design tokens — single source of truth from design-system.md */

export const COLORS = {
  DEEP_NAVY: '#0A0E1A',
  MIDNIGHT: '#1C2331',
  CYAN_STRUCT: '#00CED1',
  SLATE_BLUE: '#526A82',
  AMBER_CORE: '#E8A030',
  SAGE_MUTED: '#98A89D',
  GAUNTLET_GRAY: '#6B6B6B',
  SCOUT_BLUE: '#0C447C',
  SILVER: '#D8DEE9',
  CALM_PURPLE: '#7B68AE',
  PEAK_LIGHT: '#FFFFFF',
  GAUNTLET_LIGHT: '#C8C8C8',
} as const;

export const EASING = {
  CAMERA_APPROACH: 'expo.inOut',
  CAMERA_PULL_BACK: 'power3.out',
  CAMERA_ORBIT: 'sine.inOut',
  CAMERA_ZOOM: 'power4.in',
  SCENE_ENTER: 'power3.inOut',
  SCENE_EXIT: 'power2.in',
  UI_ENTER: 'power2.out',
  UI_EXIT: 'power2.in',
  UI_OVERSHOOT: 'back.out(1.4)',
  TEXT_REVEAL: 'power3.out',
  TEXT_FADE: 'power1.inOut',
  PARTICLE_SCATTER: 'expo.out',
  PARTICLE_GATHER: 'power2.inOut',
} as const;

export const TIMING = {
  SCENE_TRANSITION: 3500,
  SHOWCASE_ENTER: 2800,
  SHOWCASE_EXIT: 2200,
  ROTATION_PERIOD: 45000,
  CAMERA_SETTLE: 800,
  PANEL_ENTER: 600,
  PANEL_EXIT: 400,
  LABEL_APPEAR: 300,
  LABEL_STAGGER: 80,
  TOOLTIP_DELAY: 150,
  SCROLL_SECTION_DURATION: '100vh',
  SWIPE_SNAP: 300,
  PARALLAX_FACTOR: 0.3,
  AUDIO_CROSSFADE: 2500,
  AUDIO_SWELL: 1500,
  PARTICLE_BURST: 1200,
  BLOOM_PULSE: 2000,
  GLOW_BREATHE: 4000,
} as const;

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

export const TYPOGRAPHY = {
  FONTS: {
    headline: 'Satoshi, DM Sans, system-ui, sans-serif',
    body: 'Inter, IBM Plex Sans, system-ui, sans-serif',
    data: 'Space Grotesk, monospace',
    accent: 'Space Grotesk, monospace',
  },
  SIZES: {
    hero: '3.5rem',
    h1: '2.5rem',
    h2: '1.75rem',
    h3: '1.25rem',
    body: '1rem',
    caption: '0.8125rem',
    data: '2.25rem',
  },
} as const;

export const GEOMETRY = {
  NOVA: { form: 'cuboctahedron', faces: 14, color: COLORS.AMBER_CORE },
  MAPS: { form: 'dodecahedron', faces: 12, color: COLORS.AMBER_CORE },
  KIT: { form: 'cube', faces: 6, color: COLORS.CYAN_STRUCT },
  BASE: { form: 'sphere', faces: Infinity, color: COLORS.CALM_PURPLE },
  SCOUT: { form: 'octahedron', faces: 8, color: COLORS.SCOUT_BLUE },
} as const;

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
