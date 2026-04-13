import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SceneName =
  | 'boot'
  | 'gauntlet'
  | 'hub'
  | 'maps'
  | 'kit'
  | 'base'
  | 'scout'
  | 'impact'
  | 'closing';

export type HoverTarget = 'maps' | 'kit' | 'base' | 'scout' | null;

export interface PortalState {
  // Scene state
  currentScene: SceneName;
  previousScene: SceneName | null;

  // Scroll
  scrollProgress: number; // 0–1 normalized

  // Transitions
  transitionProgress: number; // 0–1 for active transition
  isTransitioning: boolean;

  // Showcase carousel
  activeCarouselIndex: number;

  // Hub interaction
  hoveredNode: HoverTarget;

  // Audio
  audioMuted: boolean;
  audioResumed: boolean; // true after first user interaction unlocks AudioContext

  // Idle reset (kiosk)
  idleTimer: number; // seconds since last interaction
  isFadingOut: boolean; // true during the 2s fade-to-black before reset

  // Actions — scene
  setScene: (scene: SceneName) => void;
  setScrollProgress: (progress: number) => void;

  // Actions — transitions
  startTransition: (from: SceneName, to: SceneName) => void;
  setTransitionProgress: (progress: number) => void;
  completeTransition: () => void;

  // Actions — carousel
  setCarouselIndex: (index: number) => void;

  // Actions — hub interaction
  setHoveredNode: (node: HoverTarget) => void;

  // Actions — audio
  toggleMute: () => void;
  markAudioResumed: () => void;

  // Actions — idle
  tickIdle: (deltaSec: number) => void;
  registerInteraction: () => void;
  beginFadeOut: () => void;
  resetToIdle: () => void;
}

// ---------------------------------------------------------------------------
// Scroll position → scene mapping
// ---------------------------------------------------------------------------
// The page has 11 <ScrollScene> sections, each pinned for 100vh of scroll.
// Total scroll = 11 × 100vh, each section = 1/11 ≈ 0.0909 of total scroll.
//
// The earlier hand-tuned ranges from design-system.md §4.3 did NOT match the
// actual DOM layout, causing showcase scenes and the Impact Wall to render
// at wrong scroll positions or skip entirely. Ranges below are computed from
// the actual section order in src/app/page.tsx.
//
// Section order:
//   0: boot               (0.000-0.091)
//   1: gauntlet           (0.091-0.182)
//   2: gauntlet-transition (0.182-0.273) → still reads as gauntlet scene
//   3: hub                (0.273-0.364)
//   4: lifecycle          (0.364-0.455) → still reads as hub scene
//   5: maps               (0.455-0.545)
//   6: kit                (0.545-0.636)
//   7: base               (0.636-0.727)
//   8: scout              (0.727-0.818)
//   9: impact             (0.818-0.909)
//  10: closing            (0.909-1.000)
// ---------------------------------------------------------------------------

const SECTION_SIZE = 1 / 11;

const SCROLL_SCENE_RANGES: Array<{ min: number; max: number; scene: SceneName }> = [
  { min: 0 * SECTION_SIZE,  max: 1 * SECTION_SIZE,  scene: 'boot' },
  // gauntlet section + transition section both map to 'gauntlet' scene
  { min: 1 * SECTION_SIZE,  max: 3 * SECTION_SIZE,  scene: 'gauntlet' },
  // hub section + lifecycle section both map to 'hub' scene
  { min: 3 * SECTION_SIZE,  max: 5 * SECTION_SIZE,  scene: 'hub' },
  { min: 5 * SECTION_SIZE,  max: 6 * SECTION_SIZE,  scene: 'maps' },
  { min: 6 * SECTION_SIZE,  max: 7 * SECTION_SIZE,  scene: 'kit' },
  { min: 7 * SECTION_SIZE,  max: 8 * SECTION_SIZE,  scene: 'base' },
  { min: 8 * SECTION_SIZE,  max: 9 * SECTION_SIZE,  scene: 'scout' },
  { min: 9 * SECTION_SIZE,  max: 10 * SECTION_SIZE, scene: 'impact' },
  { min: 10 * SECTION_SIZE, max: 1.0001,            scene: 'closing' },
];

export function sceneFromScroll(progress: number): SceneName {
  const clamped = Math.max(0, Math.min(1, progress));
  for (const range of SCROLL_SCENE_RANGES) {
    if (clamped >= range.min && clamped < range.max) return range.scene;
  }
  return 'closing';
}

// ---------------------------------------------------------------------------
// Idle timeout constant
// ---------------------------------------------------------------------------

export const IDLE_TIMEOUT_SEC = 60;
export const FADE_OUT_DURATION_SEC = 2;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePortalStore = create<PortalState>()(
  subscribeWithSelector(
    immer((set) => ({
      // Initial state
      currentScene: 'boot',
      previousScene: null,
      scrollProgress: 0,
      transitionProgress: 0,
      isTransitioning: false,
      activeCarouselIndex: 0,
      hoveredNode: null,
      audioMuted: false,
      audioResumed: false,
      idleTimer: 0,
      isFadingOut: false,

      // Scene
      setScene: (scene) =>
        set((state) => {
          if (state.currentScene !== scene) {
            state.previousScene = state.currentScene;
            state.currentScene = scene;
            state.activeCarouselIndex = 0; // reset carousel on scene change
          }
        }),

      setScrollProgress: (progress) =>
        set((state) => {
          state.scrollProgress = progress;
          // Derive scene from scroll unless mid-transition
          if (!state.isTransitioning) {
            const derived = sceneFromScroll(progress);
            if (derived !== state.currentScene) {
              state.previousScene = state.currentScene;
              state.currentScene = derived;
              state.activeCarouselIndex = 0;
            }
          }
        }),

      // Transitions
      startTransition: (from, to) =>
        set((state) => {
          state.isTransitioning = true;
          state.transitionProgress = 0;
          state.previousScene = from;
          state.currentScene = to;
        }),

      setTransitionProgress: (progress) =>
        set((state) => {
          state.transitionProgress = Math.max(0, Math.min(1, progress));
        }),

      completeTransition: () =>
        set((state) => {
          state.isTransitioning = false;
          state.transitionProgress = 1;
        }),

      // Carousel
      setCarouselIndex: (index) =>
        set((state) => {
          state.activeCarouselIndex = index;
        }),

      // Hub interaction
      setHoveredNode: (node) =>
        set((state) => {
          state.hoveredNode = node;
        }),

      // Audio
      toggleMute: () =>
        set((state) => {
          state.audioMuted = !state.audioMuted;
        }),

      markAudioResumed: () =>
        set((state) => {
          state.audioResumed = true;
        }),

      // Idle
      tickIdle: (deltaSec) =>
        set((state) => {
          state.idleTimer += deltaSec;
        }),

      registerInteraction: () =>
        set((state) => {
          state.idleTimer = 0;
          state.isFadingOut = false;
          if (!state.audioResumed) {
            state.audioResumed = true;
          }
        }),

      beginFadeOut: () =>
        set((state) => {
          state.isFadingOut = true;
        }),

      resetToIdle: () =>
        set((state) => {
          state.currentScene = 'boot';
          state.previousScene = null;
          state.scrollProgress = 0;
          state.transitionProgress = 0;
          state.isTransitioning = false;
          state.activeCarouselIndex = 0;
          state.hoveredNode = null;
          state.idleTimer = 0;
          state.isFadingOut = false;
        }),
    }))
  )
);
