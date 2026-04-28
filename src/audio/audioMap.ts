/**
 * Audio asset map — design-system.md §7.1 Scene Audio Map
 *
 * Each scene has a base layer (ambient loop) and optional interaction layer
 * (one-shot triggered by tap/swipe). Crossfade durations vary per scene —
 * BASE uses the longest (3.0s) to reinforce calm.
 *
 * File paths are relative to /public. MP3-only — Chromium kiosk target plays
 * MP3 natively, so we drop the OGG fallback to halve asset count.
 */

import type { SceneName } from '@/state/portalStore';

// Audio key = current scenes + 'transition' (used by camera transition controller).
// 'gauntlet' is kept as a legacy key in case the scene returns; preloaded but
// never triggered by the current state machine.
export type SceneAudioKey = SceneName | 'gauntlet' | 'transition';

export interface SceneAudioConfig {
  /** Ambient loop file (played on scene entry) */
  base: string[];
  /** Optional one-shot interaction sound */
  interaction?: string[];
  /** Crossfade duration in ms when entering this scene */
  crossfadeMs: number;
  /** Base layer volume (0–1) */
  baseVolume: number;
  /** Should the base layer loop */
  loop: boolean;
}

export const AUDIO_MAP: Record<SceneAudioKey, SceneAudioConfig> = {
  boot: {
    base: ['/audio/boot-tone.mp3'],
    crossfadeMs: 0,
    baseVolume: 0.6,
    loop: false,
  },

  gauntlet: {
    base: ['/audio/gauntlet-ambient.mp3'],
    crossfadeMs: 0,
    baseVolume: 0.5,
    loop: true,
  },

  transition: {
    base: ['/audio/bass-drop.mp3'],
    crossfadeMs: 1500,
    baseVolume: 0.7,
    loop: false,
  },

  hub: {
    base: ['/audio/hub-pad.mp3'],
    interaction: ['/audio/chime.mp3'],
    crossfadeMs: 2500,
    baseVolume: 0.45,
    loop: true,
  },

  maps: {
    base: ['/audio/maps-harmonics.mp3'],
    interaction: ['/audio/confirmation.mp3'],
    crossfadeMs: 2500,
    baseVolume: 0.5,
    loop: true,
  },

  kit: {
    base: ['/audio/kit-pulse.mp3'],
    interaction: ['/audio/click-tap.mp3'],
    crossfadeMs: 2500,
    baseVolume: 0.5,
    loop: true,
  },

  base: {
    base: ['/audio/base-delta.mp3'],
    // Reuses MAPS's confirmation tap — breathing-ambient was an untrimmed
    // 87s source clip that bled into the next scene on every swipe.
    interaction: ['/audio/confirmation.mp3'],
    crossfadeMs: 3000, // slowest = calmest
    baseVolume: 0.4,
    loop: true,
  },

  scout: {
    base: ['/audio/scout-hum.mp3'],
    interaction: ['/audio/resolve-tone.mp3'],
    crossfadeMs: 2500,
    baseVolume: 0.5,
    loop: true,
  },

  lifecycle: {
    // Reuse hub-pad for audio continuity — same camera, same logo, just nodes rearranged
    base: ['/audio/hub-pad.mp3'],
    interaction: ['/audio/chime.mp3'],
    crossfadeMs: 0, // No crossfade — same source file as hub
    baseVolume: 0.45,
    loop: true,
  },
} as const;
