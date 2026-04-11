import { create } from 'zustand';

type SceneName = 'boot' | 'gauntlet' | 'hub' | 'maps' | 'kit' | 'base' | 'scout' | 'impact' | 'closing';

interface PortalState {
  currentScene: SceneName;
  previousScene: SceneName | null;
  scrollProgress: number;
  transitionProgress: number;
  isTransitioning: boolean;
  activeCarouselIndex: number;
  audioMuted: boolean;
  idleTimer: number;
  setScene: (scene: SceneName) => void;
  setScrollProgress: (progress: number) => void;
  startTransition: (from: SceneName, to: SceneName) => void;
  completeTransition: () => void;
  resetToIdle: () => void;
  registerInteraction: () => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  currentScene: 'boot',
  previousScene: null,
  scrollProgress: 0,
  transitionProgress: 0,
  isTransitioning: false,
  activeCarouselIndex: 0,
  audioMuted: false,
  idleTimer: 0,
  setScene: (scene) => set((state) => ({ previousScene: state.currentScene, currentScene: scene })),
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
  startTransition: (from, to) => set({ isTransitioning: true, transitionProgress: 0, previousScene: from, currentScene: to }),
  completeTransition: () => set({ isTransitioning: false, transitionProgress: 1 }),
  resetToIdle: () => set({ currentScene: 'boot', previousScene: null, scrollProgress: 0, transitionProgress: 0, isTransitioning: false, activeCarouselIndex: 0, idleTimer: 0 }),
  registerInteraction: () => set({ idleTimer: 0 }),
}));
