/**
 * Audio asset map — design-system.md §7.1 Scene Audio Map
 *
 * Each scene has a base layer (ambient loop) and optional interaction layer
 * (one-shot triggered by hover/tap). Crossfade durations vary per scene —
 * BASE uses the longest (3.0s) to reinforce calm.
 *
 * File paths are relative to /public. Assets should be both .mp3 and .ogg
 * for cross-browser support. Howler loads the first supported format.
 */

import type { SceneName } from '@/utils/constants';

export type SceneAudioKey = SceneName | 'transition';

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
    base: ['/audio/boot-tone.mp3', '/audio/boot-tone.ogg'],
    crossfadeMs: 0,
    baseVolume: 0.6,
    loop: false,
  },

  gauntlet: {
    base: ['/audio/gauntlet-ambient.mp3', '/audio/gauntlet-ambient.ogg'],
    crossfadeMs: 0,
    baseVolume: 0.5,
    loop: true,
  },

  transition: {
    base: ['/audio/bass-drop.mp3', '/audio/bass-drop.ogg'],
    crossfadeMs: 1500,
    baseVolume: 0.7,
    loop: false,
  },

  hub: {
    base: ['/audio/hub-pad.mp3', '/audio/hub-pad.ogg'],
    interaction: ['/audio/chime.mp3', '/audio/chime.ogg'],
    crossfadeMs: 2500,
    baseVolume: 0.45,
    loop: true,
  },

  maps: {
    base: ['/audio/maps-harmonics.mp3', '/audio/maps-harmonics.ogg'],
    interaction: ['/audio/confirmation.mp3', '/audio/confirmation.ogg'],
    crossfadeMs: 2500,
    baseVolume: 0.5,
    loop: true,
  },

  kit: {
    base: ['/audio/kit-pulse.mp3', '/audio/kit-pulse.ogg'],
    interaction: ['/audio/click-tap.mp3', '/audio/click-tap.ogg'],
    crossfadeMs: 2500,
    baseVolume: 0.5,
    loop: true,
  },

  base: {
    base: ['/audio/base-delta.mp3', '/audio/base-delta.ogg'],
    interaction: ['/audio/breathing-ambient.mp3', '/audio/breathing-ambient.ogg'],
    crossfadeMs: 3000, // slowest = calmest
    baseVolume: 0.4,
    loop: true,
  },

  scout: {
    base: ['/audio/scout-hum.mp3', '/audio/scout-hum.ogg'],
    interaction: ['/audio/resolve-tone.mp3', '/audio/resolve-tone.ogg'],
    crossfadeMs: 2500,
    baseVolume: 0.5,
    loop: true,
  },

  impact: {
    // Impact Wall returns to hub ambience
    base: ['/audio/hub-pad.mp3', '/audio/hub-pad.ogg'],
    crossfadeMs: 1500,
    baseVolume: 0.55,
    loop: true,
  },

  closing: {
    // Closing CTA — hub ambience continues
    base: ['/audio/hub-pad.mp3', '/audio/hub-pad.ogg'],
    crossfadeMs: 1500,
    baseVolume: 0.5,
    loop: true,
  },
} as const;
