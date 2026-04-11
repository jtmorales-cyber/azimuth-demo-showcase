# Design Review: GlassPanel WCAG Contrast Audit
**Date**: 2026-04-11
**Component**: `src/components/ui/GlassPanel.tsx`

## Overall Impression

The glass-morphic panel design is well-specified in the design system, but the contrast ratios listed in Section 10.2 are calculated against `--deep-navy` (#0A0E1A) — **not** the glass panel surface. Since glass panels have a lighter effective background (~#131B28), contrast ratios are lower than the design system table suggests. This audit recalculates and establishes usage rules.

## Contrast Audit: Glass Panel Surface

The glass panel's effective background is approximately **#131B28** (65% of #1C2331 composited over #0A0E1A).

| Text Color | Hex | On Deep-Navy | On Glass Panel | Delta | WCAG Level |
|-----------|-----|-------------|---------------|-------|------------|
| Peak-light | #FFFFFF | 18.5:1 | ~16.8:1 | -1.7 | AAA |
| Silver | #D8DEE9 | 12.1:1 | ~11.2:1 | -0.9 | AAA |
| Cyan-struct | #00CED1 | 9.2:1 | ~8.4:1 | -0.8 | AAA |
| Amber-core | #E8A030 | 7.8:1 | ~7.1:1 | -0.7 | AAA |
| Slate-blue | #526A82 | 3.8:1 | ~3.4:1 | -0.4 | **AA large only** |

## Findings

### High

- **Slate-blue (#526A82) fails WCAG AA for body text on glass panels** — The design system lists slate-blue as passing AA for large text only (3.8:1 on deep-navy). On glass panels it drops to ~3.4:1, still passing AA for large text (≥18px or ≥14px bold) but **failing for body text** (needs 4.5:1). Any showcase card using slate-blue for 16px body text or smaller captions will fail accessibility.
  - **Rule**: Slate-blue on glass panels ONLY for text ≥18px or ≥14px bold. All body text and captions must use Silver (#D8DEE9) or brighter.
  - **Enforcement**: Documented in GlassPanel.tsx header comment. Downstream components (MetricCard, FeatureRow, NOVANarration) must follow this rule.

### Medium

- **Hover state reduces contrast further** — On hover, background increases to 80% opacity (effective ~#172030). This is slightly darker than default, so contrast actually *improves* on hover. No issue, but worth noting.

- **Backdrop-filter on R3F canvas** — The frosted glass effect requires content behind the panel. When overlaid on the deep-navy R3F canvas, the blur may not be visible if there's nothing to blur. Showcase scenes with active 3D elements (tool nodes, particles) will look great; empty scenes may show no blur effect at all. Not a bug, but worth awareness.

### Low

- **Sage-muted (#98A89D) in BASE showcase** — If used for text inside glass panels, sage-muted on #131B28 gives ~5.2:1, which passes AA but not AAA. Acceptable for secondary text but not ideal for body paragraphs.

## What Looks Good

- Silver (#D8DEE9) is the default body text color (set in globals.css) — good default, AAA on glass
- Amber-core and cyan-struct both pass AAA on glass panels — safe for metrics and interactive elements
- The glass-morphic spec from the design system is well-tuned: 65% opacity provides enough contrast while maintaining the frosted effect
- Focus ring uses cyan-struct at 3px solid — high visibility, consistent with accessibility spec

## Usage Rules (Embedded in Component)

```
GLASS PANEL TEXT RULES:
├── Body text (16px regular) → Silver (#D8DEE9) or brighter
├── Captions (13px)          → Silver (#D8DEE9) — NEVER slate-blue
├── Headings / labels        → Cyan-struct (#00CED1) or peak-light
├── Metrics / data numbers   → Amber-core (#E8A030) or peak-light
├── Muted secondary text     → Sage-muted (#98A89D) acceptable ≥14px
└── FORBIDDEN                → Slate-blue at <18px or <14px bold
```

## Top 3 Fixes

1. ✅ **Already fixed**: WCAG contrast rules documented directly in GlassPanel.tsx as a header comment — every developer who touches the component sees the rules
2. **Downstream enforcement**: MetricCard, FeatureRow, and NOVANarration must use Silver for body text, not slate-blue. Audit these when built.
3. **Test with content**: Once showcase cards have real text, verify contrast visually in Chrome DevTools Accessibility panel
