# Azimuth Mission Mentor Portal — Architecture & Design Specification
**Document Type:** Build Specification  
**Version:** 1.0  
**Status:** Design Phase — Visual Storytelling In Progress  
**Last Updated:** April 4, 2026  
**Authored By:** Azimuth R&D (Claude Lead Strategist + Justin Morales, CPGO)  
**Target Event:** VCU Demo Day 2026 · Pre-Launch Category  
**Deployment:** Reception Booth — Interactive Kiosk

---

## 1. Executive Summary

The Azimuth Mission Mentor Portal is a WebGL-based immersive product demonstration designed for the VCU Demo Day 2026 reception booth. It serves as the Phase 3 deliverable in Azimuth's three-phase Demo Day preparation strategy.

The portal physically manifests the Mission Mentor platform's core narrative: transforming bureaucratic chaos into guided clarity. Users experience this transformation spatially — moving from a claustrophobic grayscale labyrinth (the "Gauntlet") into a vast, starlit command center orbiting NOVA, the platform's AI navigator, and then flying into individual tool sanctuaries that demonstrate the platform's lifecycle coverage.

**Primary Objective:** Attract strategic partnerships in Defense, Workforce, Veteran Services, and Mental Health — not VC funding, not beta testers.

**Interaction Model:** Hub-and-spoke. NOVA is the persistent center. Four tool nodes (MAPS, K.I.T., BASE, SCOUT) orbit as selectable destinations. Each node is a self-contained narrative loop: enter → experience → insight → return to NOVA.

**Deployment Context:** Booth kiosk with dedicated hardware, touch/mouse input, known screen dimensions, dedicated GPU. No mobile fallbacks required.

---

## 2. Technology Stack

All technology choices are locked. Do not substitute without explicit user approval.

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Core Framework | Next.js (React) | Routing, state management, SaaS backend integration |
| 3D Engine | React Three Fiber (R3F) + Three.js | Declarative 3D scene composition |
| Visual Effects | @react-three/postprocessing | Bloom, chromatic aberration, custom GLSL shaders |
| Animation | GSAP (GreenSock) | Timeline-based camera flights between scenes |
| UI Motion | Motion 12.x (formerly Framer Motion) | Spring-based UI transitions for glass-morphic overlays (import: motion/react) |
| Audio | Howler.js or Web Audio API | Spatial audio, dynamic panning, frequency shifting |
| State | Zustand or React Context | Scene state, active node, transition progress |

### Performance Targets (Kiosk Hardware)
- 60fps minimum at 1920×1080 or 2560×1440
- Total scene polygon budget: ~500K triangles
- Particle system budget: 10K–50K particles (NOVA sphere)
- Shader compile time: <2 seconds on cold start
- Audio latency: <50ms for interaction feedback

---

## 3. Visual Design Language

### 3.1 Color Architecture

Derived from brand references (Cyberpunk Azimuth compass + Integrated "A" monogram). Three-stop system with temperature duality.

| Token | Hex | Role | Temperature |
|-------|-----|------|-------------|
| `--void-navy` | #0A0E1A | Spatial canvas, deep background | Cold |
| `--midnight` | #1C2331 | Secondary depth, Gauntlet surfaces | Cold |
| `--cyan-struct` | #00CED1 | Navigational elements, compass rings, structural lines | Cool |
| `--slate-blue` | #526A82 | Secondary interface, muted accents | Cool |
| `--amber-core` | #E8A030 | NOVA core, energy, life, warmth | Warm |
| `--peak-light` | #FFFFFF with bloom | Maximum luminance moments — core ignition, transition flash | Neutral |
| `--sage-muted` | #98A89D | Human warmth tones, emotional nuance | Warm-neutral |

**Temperature Rule:** Cool cyan = structure, navigation, precision. Warm amber = energy, life, intelligence, NOVA. The brand thesis is military precision (cool) containing human warmth (warm). Every scene expresses a ratio of these two temperatures.

**Gauntlet Exception:** The Gauntlet scene uses only grayscale — no cyan, no amber. Color is earned through the transition.

### 3.2 Material Language

All non-Gauntlet geometry uses translucent crystalline materials. Light passes through, refracts, and blooms.

```
Three.js Material Spec (Hub + Node Geometry):
- MeshPhysicalMaterial
- transmission: 0.85–0.95
- thickness: 0.5–2.0 (varies by form)
- roughness: 0.05–0.15
- ior: 1.5–2.0
- envMapIntensity: 1.0–1.5
- color: per-node accent (see Section 5)
```

**Gauntlet materials:** `MeshStandardMaterial` with roughness: 0.9, metalness: 0.1, color: grayscale. Opaque, heavy, brutalist.

### 3.3 Lighting Model

- Point-source radial lighting from NOVA's core (amber/gold)
- Ambient fill: very low intensity, deep blue (#0A0E1A at 0.05 intensity)
- Rim lighting on crystalline geometry: cyan (#00CED1)
- Volumetric bloom via postprocessing: threshold 0.6, radius 1.2, strength 0.8
- Selective lens flare on NOVA core (screen-space effect, not geometry)

### 3.4 Typography

Per Brand Design Guide — used only in glass-morphic UI overlays, not in the 3D scene.

| Usage | Font | Notes |
|-------|------|-------|
| Headlines | Satoshi or DM Sans | Modern, structured, open |
| Body | Inter or IBM Plex Sans | High legibility on glass panels |
| Accent/Data | Space Grotesk | Tech-forward, used sparingly for metrics |

### 3.5 Iconography

Sacred geometric forms per Brand Design Guide, rendered as 3D crystalline objects:

| Tool | Geometric Form | Brand Reference |
|------|---------------|-----------------|
| MAPS | Dodecahedron | Possibility, life path exploration |
| K.I.T. | Cube (Hexahedron) | Stability, foundation, structured growth |
| BASE | Sphere | Wholeness, healing, emotional safety |
| SCOUT | Octahedron | Balance, analytical precision |
| NOVA (hub) | Vector Equilibrium (Cuboctahedron) | Universal harmony, navigation mastery |

---

## 4. Scene Architecture

The portal is a single continuous 3D scene. No page loads, no routing transitions. All navigation is accomplished through camera position changes driven by GSAP timelines.

### 4.0 Boot Sequence
- Duration: 2–3 seconds
- Visual: Azimuth "A" monogram resolves from darkness — crystalline shell materializes, amber core light ignites with lens flare
- Audio: Silent → single low-frequency tone rising to ambient drone
- Transition: "A" monogram dissolves into particles that scatter, revealing the Gauntlet

### 4.1 Scene 0 — The Gauntlet (Entry)
- **Purpose:** Establish the "before" state — bureaucratic chaos
- **Duration:** 8–12 seconds of idle animation, then user-triggered exit
- **Environment:** Dense, claustrophobic 3D labyrinth of grayscale geometry. Angular, brutalist forms. No curves, no warmth, no translucency.
- **Camera:** Tight, slightly dutch-angled, slow drift through narrow corridors
- **Audio:** Dense, muffled collage of overlapping radio chatter, low-frequency static, bureaucratic noise
- **Interaction:** Single hotspot/CTA in center of frame: "Find Your Bearing. Enter Mission Mentor."
- **Exit Transition:** Custom GLSL dissolve shader — grayscale geometry fractures into particles, particles shift from gray to cyan, camera accelerates forward through the dissolving labyrinth into void. Bass drop clears the audio. Duration: 3–4 seconds.

### 4.2 Scene 1 — NOVA Command Center (Hub)
- **Purpose:** The "after" state — clarity, orientation, guided intelligence. Persistent hub for all navigation.
- **Environment:** Vast, dark void with subtle star field. NOVA particle sphere at world origin. Concentric compass rings with azimuth degree markings orbit NOVA. Four tool nodes positioned at cardinal/ordinal points on the outer ring as translucent sacred geometry forms.
- **Camera:** Arrives via forward acceleration from Gauntlet transition. Settles at a medium distance from NOVA with gentle orbital drift.
- **NOVA Sphere Behavior:**
  - Idle: Particles orbit central mass with gentle physics simulation, amber/gold core glow
  - Hover response: Particles pull subtly toward cursor/touch position
  - Processing state: Sphere geometry shifts into rhythmic cymatic patterns
  - Node selection: Compass ring rotates to align selected node to forward position, NOVA pulses acknowledgment
- **Audio:** 432Hz ambient electronic drone (wide, expansive). Crystalline harmonic chimes on hover. Subtle heartbeat-like rhythm as base pulse.
- **UI Overlay:** Minimal — tool labels appear on hover near each node. Azimuth wordmark anchored bottom-center.

### 4.3 Scene 2A — MAPS Sanctuary (Pre-Enlistment)
- **Sacred Geometry:** Dodecahedron
- **Color Temperature:** Warm gold dominant, cyan structural accents
- **Environment:** Expansive horizon vista — suggests possibility and open futures. Golden-hour lighting. Warm atmospheric haze.
- **Personality:** Optimistic, future-focused, data-grounded
- **Glass-Morphic UI:** Career pathway visualization, ASVAB aptitude alignment preview, branch/MOS recommendation simulation
- **Audio:** Uplifting ambient — ascending tones, bright harmonic intervals
- **Entry:** GSAP camera flies through dodecahedron node into warm golden environment
- **Return:** Reverse camera flight, golden particles trail back toward NOVA hub

### 4.4 Scene 2B — K.I.T. Sanctuary (Active Duty)
- **Sacred Geometry:** Cube (Hexahedron)
- **Color Temperature:** Military green core, cyan data streams along edges
- **Environment:** Structured data grid — suggests order, tracking, career acceleration. Clean geometric lattice.
- **Personality:** Directive, mission-ready, senior-NCO energy
- **Glass-Morphic UI:** Career dashboard mockup, promotion tracker, certification timeline, policy alert feed
- **Audio:** Steady rhythmic pulse — structured, metronomic, data-processing hum
- **Entry:** GSAP camera flies through cube node, environment assembles from data streams
- **Return:** Data streams retract, camera reverses through cube frame

### 4.5 Scene 2C — BASE Sanctuary (Wellness)
- **Sacred Geometry:** Sphere
- **Color Temperature:** Aurora blend (soft blues, greens, purples) with warm amber safe-space glow
- **Environment:** Protective shielded sanctuary — glowing geometric enclosure suggesting confidentiality and safety. Interior is warm, exterior shield is cool cyan.
- **Personality:** Compassionate, confidential, guardian energy
- **Glass-Morphic UI:** Whole health check-in interface, wellness domain selector (mental/physical/spiritual), crisis support pathway indicator
- **Audio:** Delta wave crossfade from hub drone. Warm, low-frequency, breathing-synchronized. Most calming audio in the portal.
- **Entry:** GSAP camera flies into sphere — environment transitions from void to warm, enclosed sanctuary
- **Return:** Shield gently opens, camera withdraws, Delta waves crossfade back to 432Hz

### 4.6 Scene 2D — SCOUT Sanctuary (Claims)
- **Sacred Geometry:** Octahedron
- **Color Temperature:** Deep blue dominant, silver/platinum analytical accents, cyan structural
- **Environment:** Precision data lattice — analytical space suggesting systematic review and claim optimization. Structured, methodical, illuminated one face at a time.
- **Personality:** Analytical, precise, regulation-aware, supportive
- **Glass-Morphic UI:** Claim readiness score gauge, evidence strength meter, suggested actions feed, optimization preview
- **Audio:** Precision hum — clean, methodical, systematic processing sounds. Subtle confirmation tones as claim elements resolve.
- **Entry:** GSAP camera flies into octahedron — each face illuminates sequentially as the analytical engine "activates"
- **Return:** Faces dim in reverse sequence, camera withdraws through lattice

---

## 5. Interaction Design

### 5.1 Input Model
- Primary: Mouse cursor (kiosk setup)
- Secondary: Touch (if touchscreen kiosk)
- No keyboard input required for demo flow
- Hit targets: minimum 60×60px equivalent in screen space for touch accessibility

### 5.2 Navigation State Machine

```
[Boot] → [Gauntlet] → [Hub]
                         ↕
              [MAPS] [K.I.T.] [BASE] [SCOUT]
```

- All transitions are reversible except Boot → Gauntlet (one-way)
- Hub is the resting state — 60-second idle timeout returns to Gauntlet for next booth visitor
- Each node sanctuary has a visible "Return to NOVA" control
- No deep linking between nodes — all paths go through Hub

### 5.3 Camera Flight Specifications

| Transition | Duration | Easing | Description |
|-----------|----------|--------|-------------|
| Gauntlet → Hub | 3–4s | power3.inOut | Accelerate through dissolving labyrinth into void |
| Hub → Any Node | 2–3s | power2.inOut | Compass ring aligns, camera flies through node geometry |
| Any Node → Hub | 2–3s | power2.inOut | Reverse flight, node geometry recedes |
| Hub idle orbit | Continuous | sine.inOut | Gentle orbital drift around NOVA, ~30-second period |
| Idle timeout → Gauntlet | 2s | power1.in | Fade to black, reset to Gauntlet |

### 5.4 Mouse/Touch Parallax
- Hub scene: Subtle parallax on star field (2–5px shift per 100px cursor movement)
- NOVA sphere: Particle attraction toward cursor position (inverse-square falloff)
- Node sanctuaries: Glass-morphic panels respond to cursor with subtle tilt (max ±3°)
- Gauntlet: No parallax — claustrophobic, locked perspective reinforces discomfort

### 5.5 Hover & Selection Feedback
- Node hover: Sacred geometry form brightens, subtle scale pulse (1.0 → 1.05), label appears
- Node selection: Cyan ring pulse emanates from selected node, compass ring begins rotation
- Hub elements: Crystalline chime audio on hover, 150ms fade-in for labels
- Sanctuary UI: Glass-morphic panels brighten on hover, subtle border glow

---

## 6. Audio Architecture

### 6.1 Audio Engine
- Howler.js for cross-browser compatibility and spatial audio
- Alternative: Web Audio API for more granular frequency control
- All audio assets preloaded during boot sequence
- Master volume control accessible via kiosk settings (not in demo UI)

### 6.2 Audio Map

| Scene | Base Layer | Interaction Layer | Transition |
|-------|-----------|-------------------|------------|
| Boot | Silence → single rising tone | None | Rising tone crescendos into... |
| Gauntlet | Muffled radio chatter, low static, bureaucratic murmur | None | Bass drop clears noise |
| Hub | 432Hz ambient drone, wide stereo | Crystalline chimes on hover, heartbeat pulse | Crossfade from Gauntlet bass drop |
| MAPS | Ascending warm harmonics, golden-hour ambience | Soft confirmation tones on UI interaction | Crossfade from 432Hz drone |
| K.I.T. | Structured rhythmic pulse, data processing hum | Click/tap feedback tones, notification sounds | Crossfade from 432Hz drone |
| BASE | Delta wave (0.5–4Hz binaural), warm low-frequency | Breathing-synchronized ambient shifts | Slow crossfade from 432Hz drone |
| SCOUT | Analytical precision hum, systematic tones | Sequential confirmation tones as elements resolve | Crossfade from 432Hz drone |

### 6.3 Spatial Audio Rules
- NOVA core: Centered audio source, slight reverb
- Tool nodes: Positional audio — approach a node and its audio signature grows
- Cursor-driven panning: Subtle stereo shift following cursor position in Hub scene
- All crossfades: 1.5–2.5 second duration, equal-power curve

---

## 7. Repository Structure

```
azimuth-portal/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── layout.tsx
│   │   └── page.tsx            # Single-page portal entry
│   ├── scenes/
│   │   ├── Gauntlet.tsx        # Scene 0
│   │   ├── Hub.tsx             # Scene 1 — NOVA command center
│   │   ├── MAPSSanctuary.tsx   # Scene 2A
│   │   ├── KITSanctuary.tsx    # Scene 2B
│   │   ├── BASESanctuary.tsx   # Scene 2C
│   │   └── SCOUTSanctuary.tsx  # Scene 2D
│   ├── components/
│   │   ├── NOVASphere.tsx      # Particle physics sphere with cymatic states
│   │   ├── CompassRing.tsx     # Azimuth compass with degree markings
│   │   ├── ToolNode.tsx        # Sacred geometry node (parameterized)
│   │   ├── GlassPanel.tsx      # Glass-morphic UI overlay component
│   │   ├── StarField.tsx       # Background particle star field
│   │   └── BootSequence.tsx    # "A" monogram resolve animation
│   ├── shaders/
│   │   ├── dissolve.glsl       # Gauntlet → Hub transition shader
│   │   ├── bloom.glsl          # Custom bloom postprocessing
│   │   ├── crystalline.glsl    # Translucent material shader
│   │   └── cymatic.glsl        # NOVA processing state shader
│   ├── audio/
│   │   ├── AudioEngine.ts      # Howler.js wrapper with spatial config
│   │   ├── audioMap.ts         # Scene-to-audio mapping
│   │   └── assets/             # Audio files (mp3/ogg)
│   ├── camera/
│   │   ├── CameraController.tsx # GSAP camera flight manager
│   │   └── flightPaths.ts     # Per-scene camera path definitions
│   ├── state/
│   │   └── portalStore.ts      # Zustand store — scene, node, transition state
│   └── utils/
│       ├── geometries.ts       # Sacred geometry mesh generators
│       └── constants.ts        # Color tokens, timing constants
├── public/
│   └── assets/
│       ├── textures/           # Environment maps, noise textures
│       ├── audio/              # Preloaded audio files
│       └── brand/              # Logo assets, "A" monogram
├── docs/
│   ├── architecture.md         # This document
│   ├── visual-storytelling.md  # Scene-by-scene visual narrative (from chat)
│   └── brand-references/       # Source images from Mixboard
├── .mcp.json                   # MCP server configs (Google Drive, etc.)
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## 8. Build Phases

### Phase A — Scaffolding & Core Loop (Week 1)
- Next.js + R3F + Drei setup
- Basic scene switching (Gauntlet → Hub → placeholder nodes)
- GSAP camera controller with one flight path
- Zustand state store
- Star field background

### Phase B — NOVA Hub (Week 2)
- Particle sphere with physics simulation
- Compass ring geometry with degree markings
- Four sacred geometry nodes (dodecahedron, cube, sphere, octahedron)
- Hover/selection interaction
- Hub audio layer (432Hz drone + chimes)

### Phase C — Gauntlet + Transition (Week 3)
- Grayscale labyrinth geometry
- GLSL dissolve shader
- Gauntlet audio (radio chatter + static)
- Bass drop transition
- Boot sequence ("A" monogram)

### Phase D — Sanctuaries (Weeks 4–5)
- Four sanctuary environments (one per tool)
- Glass-morphic UI overlays with simulated tool interfaces
- Per-sanctuary audio signatures
- GSAP camera flights in and out
- Return-to-hub interaction

### Phase E — Polish & Kiosk Config (Week 6)
- Postprocessing pass (bloom, chromatic aberration, lens flare)
- Mouse parallax across all scenes
- Idle timeout → Gauntlet reset
- Performance optimization for target hardware
- Kiosk mode configuration (cursor hiding, fullscreen, audio autoplay)

---

## 9. Design Decisions Log

| Decision | Rationale | Status |
|----------|-----------|--------|
| Four nodes: MAPS, K.I.T., BASE, SCOUT | Shows full career arc from pre-enlistment to claims — demonstrates lifecycle CLV | Locked |
| Hub-and-spoke (not linear) | Booth visitors self-select into relevant node; no presenter required | Locked |
| Booth kiosk deployment | Dedicated GPU enables full shader complexity; no mobile fallbacks | Locked |
| Translucent crystalline materials | Matches brand references; distinguishes from Gauntlet's opaque brutalism | Locked |
| Cool/warm temperature duality | Brand thesis: military precision (cyan) containing human warmth (amber) | Locked |
| Sacred geometry per tool | From Brand Design Guide; each form carries symbolic meaning | Locked |
| 60-second idle timeout | Resets portal for next booth visitor without manual intervention | Proposed |

---

## 10. Open Items

- [ ] Exact kiosk hardware specs (GPU, screen resolution, touch capability)
- [ ] Final audio asset production (ambient drones, chimes, radio chatter)
- [ ] Glass-morphic UI content for each sanctuary (simulated tool interfaces)
- [ ] Mixboard visual references — additional imagery for sanctuary environments
- [ ] Logo animation (.mp4) timing analysis for boot sequence spec
- [ ] Demo Day booth layout — screen positioning, viewing distance, ambient lighting

---

## 11. Reference Documents

| Document | Location | Purpose |
|----------|----------|---------|
| claude.md | Project root | Phase continuity, editorial decisions, skill stack |
| Azimuth_knowledge_base_updated.md | Project root | Full product/tool specifications |
| Azimuth_Brand_Alignment_Guide.docx | Project root | Brand architecture, voice/tone guardrails |
| Brand_Design_Guide.docx | Project root | Color palette, typography, sacred geometry, NOVA identity |
| Azimuth_HyperZine.md | Uploaded | Original portal concept (HyperZine → code transition) |
| KIT_impact_scenarios.md | Project root | K.I.T. user stories for sanctuary UI content |
| azimuth_60sec_pitch_script_FINAL.html | Project root | Phase 1 script — narrative voice reference |

---

*Azimuth · Phase 3 Portal Architecture Spec v1.0 · VCU Demo Day 2026*
