/**
 * AudioEngine — Howler.js wrapper for the Azimuth demo (design-system.md §7)
 *
 * Responsibilities:
 * - Preload all scene audio assets during boot
 * - Play base layer per scene with equal-power crossfade
 * - Play interaction one-shots (chimes, confirmations) with low latency
 * - Spatial stereo panning follows cursor position in Hub
 * - Respect browser autoplay policy (silent until first user interaction)
 * - Master mute/unmute for kiosk settings
 *
 * Design:
 * - Singleton via getAudioEngine() — one instance per page
 * - Graceful fallback: missing audio files do NOT throw, engine stays usable
 *   (letting the demo ship before final audio assets are produced)
 * - No React dependencies — can be called from useFrame, useEffect, anywhere
 */

import { Howl, Howler } from 'howler';
import { AUDIO_MAP, type SceneAudioKey, type SceneAudioConfig } from './audioMap';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoadedScene {
  key: SceneAudioKey;
  config: SceneAudioConfig;
  base: Howl;
  interaction?: Howl;
  /** Current playback ID for the base layer (returned by Howl.play()) */
  playId: number | null;
}

// ---------------------------------------------------------------------------
// AudioEngine class
// ---------------------------------------------------------------------------

export class AudioEngine {
  private scenes: Map<SceneAudioKey, LoadedScene> = new Map();
  private currentScene: SceneAudioKey | null = null;
  private isMuted = false;
  private isInitialized = false;
  private audioUnlocked = false;
  private masterVolume = 1.0;

  // Track pending plays that fire before audio is unlocked
  private pendingSceneOnUnlock: SceneAudioKey | null = null;

  // Track the in-progress crossfade so rapid navigation cancels it cleanly
  private crossfadeIntervalId: ReturnType<typeof setInterval> | null = null;
  private crossfadingOutScene: LoadedScene | null = null;

  /**
   * Initialize the engine and preload all scene audio assets.
   * Safe to call multiple times — only runs once.
   *
   * Missing files are logged but do NOT throw. This allows the demo to
   * ship and run visually before final audio assets are produced.
   */
  init(): void {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Howler auto-unlocks on first user input; we still track it explicitly
    // so we can queue pending scene plays correctly.
    Howler.autoUnlock = true;

    // Preload each scene
    for (const [key, config] of Object.entries(AUDIO_MAP) as Array<[SceneAudioKey, SceneAudioConfig]>) {
      this.preloadScene(key, config);
    }

    // Listen for first unlock to fire any pending scene
    if (typeof window !== 'undefined') {
      const onUnlock = () => {
        this.audioUnlocked = true;
        if (this.pendingSceneOnUnlock) {
          this.play(this.pendingSceneOnUnlock);
          this.pendingSceneOnUnlock = null;
        }
      };
      // Check Howler's context periodically for the state transition
      // (Howler.ctx may not exist until first Howl is created)
      const checkInterval = setInterval(() => {
        if (Howler.ctx && Howler.ctx.state === 'running') {
          clearInterval(checkInterval);
          onUnlock();
        }
      }, 100);
      // Give up after 30s (dev mode with no interaction)
      setTimeout(() => clearInterval(checkInterval), 30000);
    }
  }

  /**
   * Preload a single scene's audio assets.
   */
  private preloadScene(key: SceneAudioKey, config: SceneAudioConfig): void {
    const base = new Howl({
      src: config.base,
      loop: config.loop,
      volume: 0, // Start silent; crossfade ramps up on play
      preload: true,
      html5: false, // Web Audio for crossfade + panning support
      onloaderror: (id, err) => {
        // eslint-disable-next-line no-console
        console.warn(`[AudioEngine] Failed to load base audio for "${key}":`, err);
      },
    });

    let interaction: Howl | undefined;
    if (config.interaction) {
      interaction = new Howl({
        src: config.interaction,
        volume: 0.6,
        preload: true,
        html5: false,
        onloaderror: (id, err) => {
          // eslint-disable-next-line no-console
          console.warn(`[AudioEngine] Failed to load interaction audio for "${key}":`, err);
        },
      });
    }

    this.scenes.set(key, {
      key,
      config,
      base,
      interaction,
      playId: null,
    });
  }

  /**
   * Play a scene's base audio layer.
   * If another scene is currently playing, crossfades from it.
   * If audio is not yet unlocked, queues the play for after unlock.
   */
  play(sceneKey: SceneAudioKey): void {
    if (!this.isInitialized) this.init();

    // If audio isn't unlocked yet, queue this play for when it is
    if (!this.audioUnlocked) {
      this.pendingSceneOnUnlock = sceneKey;
      return;
    }

    if (this.currentScene === sceneKey) return;

    const newScene = this.scenes.get(sceneKey);
    if (!newScene) {
      // eslint-disable-next-line no-console
      console.warn(`[AudioEngine] Unknown scene: ${sceneKey}`);
      return;
    }

    // Cancel any in-progress crossfade and immediately stop its fading-out scene
    if (this.crossfadeIntervalId !== null) {
      clearInterval(this.crossfadeIntervalId);
      this.crossfadeIntervalId = null;
      if (this.crossfadingOutScene) {
        this.stopScene(this.crossfadingOutScene);
        this.crossfadingOutScene = null;
      }
    }

    const oldScene = this.currentScene ? this.scenes.get(this.currentScene) : null;
    const crossfadeMs = newScene.config.crossfadeMs;

    if (oldScene && crossfadeMs > 0) {
      this.crossfade(oldScene, newScene, crossfadeMs);
    } else {
      // Instant play (boot, gauntlet — no crossfade)
      if (oldScene) this.stopScene(oldScene);
      this.startScene(newScene);
    }

    this.currentScene = sceneKey;
  }

  /**
   * Stop the currently-playing scene.
   */
  stop(sceneKey?: SceneAudioKey): void {
    if (this.crossfadeIntervalId !== null) {
      clearInterval(this.crossfadeIntervalId);
      this.crossfadeIntervalId = null;
      if (this.crossfadingOutScene) {
        this.stopScene(this.crossfadingOutScene);
        this.crossfadingOutScene = null;
      }
    }
    const target = sceneKey ?? this.currentScene;
    if (!target) return;
    const scene = this.scenes.get(target);
    if (scene) this.stopScene(scene);
    if (!sceneKey || sceneKey === this.currentScene) {
      this.currentScene = null;
    }
  }

  /**
   * Crossfade between two scenes with equal-power curves.
   *
   * Equal-power crossfade: at the midpoint, both tracks are at ~0.707 (sqrt(0.5))
   * instead of 0.5 — prevents the perceived "dip" in loudness that linear
   * crossfade produces with uncorrelated audio sources.
   */
  private crossfade(from: LoadedScene, to: LoadedScene, durationMs: number): void {
    this.crossfadingOutScene = from;

    const fromVolume = from.config.baseVolume * this.masterVolume * (this.isMuted ? 0 : 1);
    const toVolume = to.config.baseVolume * this.masterVolume * (this.isMuted ? 0 : 1);

    // Start the new scene at 0 volume
    this.startScene(to, 0);

    const steps = Math.max(20, Math.floor(durationMs / 25)); // ~40fps
    const stepMs = durationMs / steps;
    let currentStep = 0;

    this.crossfadeIntervalId = setInterval(() => {
      currentStep++;
      const t = currentStep / steps;

      // Equal-power curves
      const fadeOutGain = Math.cos(t * 0.5 * Math.PI); // 1 → 0
      const fadeInGain = Math.sin(t * 0.5 * Math.PI);   // 0 → 1

      if (from.playId !== null) {
        from.base.volume(fromVolume * fadeOutGain, from.playId);
      }
      if (to.playId !== null) {
        to.base.volume(toVolume * fadeInGain, to.playId);
      }

      if (currentStep >= steps) {
        clearInterval(this.crossfadeIntervalId!);
        this.crossfadeIntervalId = null;
        this.crossfadingOutScene = null;
        this.stopScene(from);
      }
    }, stepMs);
  }

  /**
   * Start playing a scene's base layer at the given volume.
   */
  private startScene(scene: LoadedScene, initialVolume?: number): void {
    if (scene.playId !== null) return; // Already playing

    const target = initialVolume ?? (scene.config.baseVolume * this.masterVolume * (this.isMuted ? 0 : 1));
    const id = scene.base.play();
    scene.base.volume(target, id);
    scene.playId = id;
  }

  /**
   * Stop a scene's base layer.
   */
  private stopScene(scene: LoadedScene): void {
    if (scene.playId === null) return;
    scene.base.stop(scene.playId);
    scene.playId = null;
  }

  /**
   * Play an interaction one-shot for the current scene.
   * Used for hover chimes, tap confirmations, etc.
   */
  playInteraction(sceneKey?: SceneAudioKey): void {
    const key = sceneKey ?? this.currentScene;
    if (!key || this.isMuted) return;
    const scene = this.scenes.get(key);
    if (!scene?.interaction) return;
    scene.interaction.play();
  }

  /**
   * Set stereo pan for the current scene's base layer.
   * @param x Horizontal position in range [-1, 1] (-1 = full left, 1 = full right)
   *
   * Used for hub parallax: panning follows cursor horizontal position.
   */
  setPan(x: number): void {
    if (!this.currentScene) return;
    const scene = this.scenes.get(this.currentScene);
    if (!scene || scene.playId === null) return;
    const clamped = Math.max(-1, Math.min(1, x));
    scene.base.stereo(clamped, scene.playId);
  }

  /**
   * Toggle master mute. Affects base layers and interaction one-shots.
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    Howler.mute(muted);
  }

  toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Set master volume (0–1). Multiplied with per-scene baseVolume.
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    Howler.volume(this.masterVolume);
  }

  /**
   * Returns true once Howler's AudioContext has been unlocked by user input.
   */
  isAudioUnlocked(): boolean {
    return this.audioUnlocked;
  }

  /**
   * Manually mark audio as unlocked — useful when the kiosk mode hook has
   * already called resume() on the AudioContext and wants the engine to
   * flush any pending scene immediately.
   */
  markUnlocked(): void {
    if (!this.audioUnlocked) {
      this.audioUnlocked = true;
      if (this.pendingSceneOnUnlock) {
        this.play(this.pendingSceneOnUnlock);
        this.pendingSceneOnUnlock = null;
      }
    }
  }

  /**
   * Clean up all loaded audio (call on page unload).
   */
  dispose(): void {
    Array.from(this.scenes.values()).forEach((scene) => {
      scene.base.unload();
      scene.interaction?.unload();
    });
    this.scenes.clear();
    this.currentScene = null;
    this.isInitialized = false;
  }
}

// ---------------------------------------------------------------------------
// Singleton accessor
// ---------------------------------------------------------------------------

let instance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!instance) {
    instance = new AudioEngine();
  }
  return instance;
}
