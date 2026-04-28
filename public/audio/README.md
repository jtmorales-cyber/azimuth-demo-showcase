# Audio Assets

The AudioEngine (`src/audio/AudioEngine.ts`) is fully wired via
`useAudioOrchestrator` — every scene transition fires `engine.play(scene)` and
every interaction fires `engine.playInteraction(scene)`. The only thing missing
is the MP3 files themselves.

The engine has graceful fallback: missing files only `console.warn`, never
crash. So you can drop assets in piece-by-piece and test as you go.

## Shopping list — 13 CC0 MP3s

Drop into this directory with these exact filenames. Source from
**Pixabay Music** (`pixabay.com/music/`) or **Freesound**
(`freesound.org` — filter to "Creative Commons 0").

| File | Length | Loop | Mood / Character | Search query |
|------|--------|------|------------------|--------------|
| `boot-tone.mp3` | 1–2s | no | UI startup sting, sub-bass + soft tech bell | "ui startup tone" / "boot stinger" |
| `gauntlet-ambient.mp3` | 30–60s | yes | Industrial/bureaucratic drone, low energy, fluorescent-hum feel | "industrial ambient drone" |
| `bass-drop.mp3` | 2–3s | no | Sub-bass impact for transitions, single hit | "bass drop transition impact" |
| `hub-pad.mp3` | 30–60s | yes | Calm cinematic ambient pad, peaceful & mysterious | "ambient pad cinematic peaceful" |
| `chime.mp3` | 0.3–0.5s | no | Soft UI chime / hover ping | "soft ui chime" |
| `maps-harmonics.mp3` | 30–60s | yes | Discovery/wonder, airy harmonic textures | "ambient discovery harmonics" |
| `confirmation.mp3` | 0.2–0.4s | no | UI tap success, gentle positive blip | "ui confirmation tap" |
| `kit-pulse.mp3` | 30–60s | yes | Tech HUD pulse, structured rhythm, command-center feel | "tech pulse loop hud" |
| `click-tap.mp3` | 0.1–0.2s | no | UI click for swipe advance, very short | "ui click button tap" |
| `base-delta.mp3` | 30–60s | yes | Wellness, slow delta-wave warm pad, calming | "delta wave wellness pad meditation" |
| `breathing-ambient.mp3` | 1–2s | no | Soft breath/exhale accent, very subtle | "soft breath ambient exhale" |
| `scout-hum.mp3` | 30–60s | yes | Analytical/precise mid-frequency hum | "analytical drone precise" |
| `resolve-tone.mp3` | 0.3–0.6s | no | Completion bell / success bowl tone | "completion bell success" |

`hub-pad.mp3` is reused by the `lifecycle` scene (audio continuity — same
camera, same logo). Only one file is needed.

## Notes for sourcing

- **Format**: MP3 only. Engine's `audioMap.ts` no longer references `.ogg`
  fallbacks. The kiosk runs Chromium which plays MP3 natively.
- **Loop seamlessness**: matters for the seven 30–60s loops (gauntlet, hub,
  maps, kit, base, scout). Pixabay's "loop" tag pre-filters.
- **Volume normalization**: the engine's per-scene `baseVolume` (0.4–0.7 in
  `audioMap.ts`) gives headroom, so don't worry about LUFS targeting.
  If anything is hot/clipping, tweak `baseVolume` for that scene rather
  than re-rendering the file.
- **Total payload**: target < 5 MB combined for kiosk perf. Pixabay's "short"
  filter helps for one-shots; for loops, a 30s file at 128 kbps is ~480 KB.

## Verification once dropped

1. `npm run dev` → `localhost:3000`
2. DevTools Network → confirm 13 `/audio/*.mp3` requests, all 200
3. Tap "TAP TO BEGIN" — boot tone plays once, crossfades to hub-pad
4. Tap a tool node — chime plays, scene crossfades to that drone
5. Swipe within a sanctuary — that scene's interaction one-shot fires
6. Tap Azimuth logo — chime, hub-pad continues during lifecycle
