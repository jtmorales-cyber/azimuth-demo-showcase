import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SceneName = 'boot' | 'hub' | 'maps' | 'kit' | 'base' | 'scout';
export type HoverTarget = 'maps' | 'kit' | 'base' | 'scout' | null;

export interface PortalState {
  // Scene state
  currentScene: SceneName;
  previousScene: SceneName | null;
  isTransitioning: boolean;

  // Showcase carousel
  activeCarouselIndex: number;

  // Hub interaction
  hoveredNode: HoverTarget;

  // Audio
  audioMuted: boolean;
  audioResumed: boolean;

  // Idle reset (kiosk)
  isFadingOut: boolean;

  // Actions — navigation
  goTo: (scene: SceneName) => void;
  completeTransition: () => void;

  // Actions — carousel
  setCarouselIndex: (index: number) => void;

  // Actions — hub interaction
  setHoveredNode: (node: HoverTarget) => void;

  // Actions — audio
  toggleMute: () => void;
  markAudioResumed: () => void;

  // Actions — idle
  registerInteraction: () => void;
  beginFadeOut: () => void;
  resetToHub: () => void;
}

export const IDLE_TIMEOUT_SEC = 60;
export const FADE_OUT_DURATION_SEC = 2;

export const usePortalStore = create<PortalState>()(
  subscribeWithSelector(
    immer((set) => ({
      // Initial state
      currentScene: 'boot',
      previousScene: null,
      isTransitioning: false,
      activeCarouselIndex: 0,
      hoveredNode: null,
      audioMuted: false,
      audioResumed: false,
      isFadingOut: false,

      goTo: (scene) =>
        set((state) => {
          if (state.currentScene !== scene) {
            state.previousScene = state.currentScene;
            state.currentScene = scene;
            state.isTransitioning = true;
            state.activeCarouselIndex = 0;
          }
        }),

      completeTransition: () =>
        set((state) => {
          state.isTransitioning = false;
        }),

      setCarouselIndex: (index) =>
        set((state) => {
          state.activeCarouselIndex = index;
        }),

      setHoveredNode: (node) =>
        set((state) => {
          state.hoveredNode = node;
        }),

      toggleMute: () =>
        set((state) => {
          state.audioMuted = !state.audioMuted;
        }),

      markAudioResumed: () =>
        set((state) => {
          state.audioResumed = true;
        }),

      registerInteraction: () =>
        set((state) => {
          state.isFadingOut = false;
          if (!state.audioResumed) state.audioResumed = true;
        }),

      beginFadeOut: () =>
        set((state) => {
          state.isFadingOut = true;
        }),

      resetToHub: () =>
        set((state) => {
          state.currentScene = 'hub';
          state.previousScene = null;
          state.isTransitioning = false;
          state.activeCarouselIndex = 0;
          state.hoveredNode = null;
          state.isFadingOut = false;
        }),
    }))
  )
);
