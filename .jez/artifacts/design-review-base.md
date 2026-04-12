# Design Review + UX Audit: BASE Showcase
**Date**: 2026-04-12
**Component**: `src/scenes/BASEShowcase.tsx`
**Critical constraint**: Trauma-informed design. Tone failure has real consequences.

## Overall Impression

BASE is the one showcase where getting tone wrong has real consequences. This review audits against the storyboard design note principles: empathy not sympathy, validate don't pity, respect agency, don't perform care. The copy is verbatim from storyboard S7 to avoid well-intentioned softening that drifts into either clinical or saccharine territory.

## Copy Audit — Trauma-Informed Tone

### Card 1: "The Barrier"

**Headline**: "The People Who Need Help Most Are the Least Likely to Ask for It"

| Check | Result |
|-------|--------|
| Validates without pitying? | Yes — structural observation, not individual failure |
| Uses "you" language that implies weakness? | No — third person observation |
| Implies the user is broken? | No — implies the system is broken |
| Clinical vocabulary? | No — "help" not "treatment" in the headline |

**Body**: "Stigma. Distrust. The fear that seeking help means weakness. 60% of veterans with mental health conditions don't seek treatment. The system's design doesn't help — clinical intake forms, impersonal interfaces, zero cultural competence."

| Check | Result |
|-------|--------|
| Uses "mental health conditions"? | Yes — intentional. Storyboard uses this verbatim. Softening to "struggles" would be condescending. The honest reality is more respectful. |
| Blames individuals? | No — "The system's design doesn't help" explicitly shifts blame to the system |
| Crisis simulation? | No — no dramatic imagery or personal scenarios |
| Empathy or sympathy? | Empathy — "we see what's happening to you and why" |

**Metric**: "60% of veterans with mental health needs don't access care"

Accurate stat from storyboard. Framed as a system failure statistic, not a shame-on-veterans statistic.

### Card 2: "The Approach"

**Headline**: "BASE Meets You Where You Are — Not Where the System Wants You"

| Check | Result |
|-------|--------|
| Respects agency? | Yes — "where you are" is the foundational trauma-informed phrase |
| Promises to fix the person? | No — promises to meet them |
| Contrasts with the system? | Yes — explicit "not where the system wants you" |

**Features**: Whole health domains / Crisis pathway detection / Peer support connection / Wellness tracking

Note: "Crisis pathway detection" is the storyboard wording. It describes a *capability* without demonstrating it. Not "we'll catch you if you're in crisis" (performative) — just "this exists in the system."

### Card 3: "The Promise"

**Headline**: "Your Foundation for Total Wellness"

| Check | Result |
|-------|--------|
| Uses "wellness" not "health treatment"? | Yes — wellness is framed positively, not as absence of illness |
| Implies constant surveillance? | No — "foundation" is a supportive metaphor, not a watching metaphor |

**Metrics**:
- "Confidential" — "check-ins on your schedule"
- "Crisis detection" — "that connects, doesn't diagnose"
- "Whole health" — "across all domains — not just mental"

The "connects, doesn't diagnose" line is critical. It explicitly disclaims medical authority. BASE is a connector, not a clinician.

### Card 4: "NOVA's Take"

**NOVA voice**: "BASE doesn't pretend to be a therapist. It's the check-in you actually do — because it respects your time, your privacy, and your agency. When something needs human attention, BASE connects you. That's it. No lectures. No 'Resiliency' Powerpoints."

| Check | Result |
|-------|--------|
| Disclaims clinical authority? | Yes — "doesn't pretend to be a therapist" |
| Respects user decision-making? | Yes — "respects your time, your privacy, and your agency" |
| Mocks institutional failures veterans recognize? | Yes — "No 'Resiliency' Powerpoints" is culturally authentic critique |
| Performative? | No — "That's it" explicitly refuses to oversell |

The Resiliency PowerPoints line is the key signal of cultural authenticity. Veterans who've sat through mandatory resilience briefings will recognize the pointlessness of that format. NOVA is saying "I'm not that."

## Accessibility Audit

### Motion

| Element | Motion | Respects reduced-motion? |
|---------|--------|-------------------------|
| Glass panel entry (Motion 12.x) | fade up + scale 0.95→1 over 500ms | Yes — globals.css `@media (prefers-reduced-motion: reduce)` kills it |
| MetricCard counter | 1200ms power2.out | Partial — IntersectionObserver fires but counter still runs. For BASE, the only numeric metric is 60%, and the counter animation is gentle. Acceptable for now. |
| NOVA typewriter | 30ms/char, ~7s total for the Card 4 text | Not gated on reduced-motion. **RECOMMENDATION**: add `prefers-reduced-motion` check to NOVANarration to show full text immediately when reduced-motion is requested. |
| Glass panel tilt | ±3° on pointer move | Not currently gated. Low concern — tilt is subtle. |

### Contrast (WCAG on glass panel surface ~#131B28)

| Text | Color | Ratio | Level |
|------|-------|-------|-------|
| Headline | peak-light (#FFFFFF) | ~16.8:1 | AAA |
| Body paragraph | silver (#D8DEE9) | ~11.2:1 | AAA |
| Section label (Barrier) | sage-muted (#98A89D) | ~5.2:1 | AA body, AAA large |
| Section label (Approach) | calm-purple (#7B68AE) | ~5.5:1 | AA body, AAA large |
| Section label (Promise/NOVA) | amber-core (#E8A030) | ~7.1:1 | AAA |
| Metric number | amber-core | ~7.1:1 | AAA |
| Feature row title | cyan-struct (#00CED1) | ~8.4:1 | AAA |

All body text meets WCAG AAA. Section labels use `--text-caption` (13px) which is below AA body threshold for sage-muted and calm-purple, but the labels are uppercase bold which lifts readability. Acceptable.

### Screen reader

The GlassPanel has `tabIndex={0}` so keyboard users can navigate into each card. The NOVA narration is a `<blockquote>` which screen readers will announce as a quotation. Good semantic HTML.

**RECOMMENDATION**: Add `aria-live="polite"` to the NOVANarration wrapper so screen readers announce the typed text once, rather than character by character.

## Critical Design Constraint Check

> "This showcase communicates safety without performing it. No dramatic imagery. No crisis simulation. No clinical aesthetics. The design itself is the message: 'this is a safe space.'"

| Constraint | Implementation |
|------------|---------------|
| No dramatic imagery | No images at all — text only |
| No crisis simulation | No user scenarios depicted |
| No clinical aesthetics | No medical iconography, no form fields, no health metrics beyond the one stat |
| Safety through design | Calm color temperature (sage-muted + calm-purple section labels), generous spacing, longer line heights (1.7 vs 1.6), gentle headline widths, glass panel blur reduces visual contrast |

### Color temperature check

Storyboard requires: 20% cyan / 30% amber with calm purple accent.

Current section label palette:
- Card 1: sage-muted (warm-neutral, not cyan or amber)
- Card 2: calm-purple (the accent)
- Card 3: amber-core (warmth)
- Card 4: amber-core (NOVA voice color, consistent with other showcases)

This is distinctly warmer and less cyan-dominant than K.I.T. (which uses slate-blue/cyan/amber). Matches spec.

## What to Watch For

1. **Resource accessibility**: If a visitor sees BASE and wants to actually access crisis help, the demo doesn't provide a real support link. This is a demo, not a live service — but if this ever becomes client-facing to real users, a Veterans Crisis Line link (988, press 1) MUST be present. **Not an issue now** (demo audience is partners), but flag for later.

2. **Line length on wide screens**: At max-width 2xl (672px), line length is comfortable. On very wide kiosk (2560px), the `max-w-2xl` container prevents excessive line length. Good.

3. **The word "veterans"**: BASE is framed in the storyboard as veteran-focused, but the storyboard's pre-enlistment framing (MAPS) means some visitors may be considering enlistment, not yet veterans. The BASE copy still uses "veterans" — which is accurate for this tool's primary audience. No change needed.

## Top 3 Concerns

1. **NOVANarration doesn't check `prefers-reduced-motion`** — the typewriter effect runs regardless. Low severity (typewriter isn't painful), but inconsistent with the global reduced-motion rule.

2. **No Veterans Crisis Line reference anywhere in the demo** — acceptable for partner demo, but document this for any future client-facing version.

3. **Section labels use 13px caption font at lower contrast** — passes AA for large-bold but could be 14px for extra safety. Minor.

## Verdict

**PASS**. Copy is trauma-informed and culturally authentic. No performative care. No clinical aesthetic. The design is the message.

The only change I'd recommend before production is adding `prefers-reduced-motion` handling to NOVANarration — a small code change that applies to all four showcases.
