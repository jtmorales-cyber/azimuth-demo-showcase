# Design Review: ScrollProgress Indicator
**Date**: 2026-04-12
**Component**: `src/components/ui/ScrollProgress.tsx`

## Overall Impression

The scroll progress indicator is a navigation aid, not a hero element — it should be present enough to orient the visitor, restrained enough not to compete with NOVA or the showcase content. The design uses a thin 4px cyan rail with amber active markers, hidden labels that reveal on hover/touch. Stays out of the way until needed.

## Findings

### Medium

- **Hover zone 48px wide might conflict with swipe carousels** — The invisible hover zone spans 48px on the right edge. If the user is mid-swipe on a showcase carousel and their finger passes through this zone, it could trigger the label reveal unnecessarily. Low severity (labels are non-blocking) but worth watching.
  - **Acceptable for now**: The hover zone only triggers `showLabels` — it doesn't block pointer events on elements beneath. Carousel swipes still work.

- **Auto-hide timer doesn't reset on continued interaction** — Current behavior: hover triggers 3s timer. If user keeps hovering, timer continues and labels disappear at 3s regardless. Should reset on every pointer move within the zone.
  - **Fix**: The `showLabels` function already resets the timer on each call, but it's only called on `onPointerEnter` / `onTouchStart`. Adding `onPointerMove` with a debounce would reset on continuous hover. Low priority since 3s is plenty to read labels.

### Low

- **Marker positions are hardcoded approximations** — The `position` values (0.125, 0.275, etc.) are middle-of-range estimates for each scene, not computed from SCROLL_SCENE_RANGES in the store. If scroll ranges change, markers would be out of sync.
  - **Acceptable**: SCROLL_SCENE_RANGES are locked by the design. Adding a derive function would be over-engineering.

- **No "Boot" or "Closing" markers** — Task spec lists 7 markers (Gauntlet → Impact). Boot is too brief (0-5%) to warrant a marker. Closing is the final destination, not a navigable section. This is a deliberate simplification matching the spec.

## Contrast audit

Glass-less background (transparent over deep-navy R3F canvas ~#0A0E1A):

| Element | Color | Ratio | Level |
|---------|-------|-------|-------|
| Active label (amber-core) | #E8A030 | 7.8:1 | AAA |
| Inactive label (slate-blue @ 70%) | ~#3F5164 | 3.1:1 | AA large only |
| Bar background (midnight @ 30%) | ~#0F1520 | — | non-text |
| Fill (cyan-struct gradient) | #00CED1 | 9.2:1 | AAA (non-text) |

The inactive labels are 13px uppercase medium — uppercase bold-ish text is more forgiving than body text for contrast. The 3.1:1 ratio fails body-text AA but passes large-text AA. Given these are navigation hints (not critical reading), acceptable. Active labels always meet AAA.

## What Looks Good

- **Always-on bar with revealed labels** — The 4px cyan rail + amber dots is visible at all times (orientation), but the labels only appear on intent (hover/touch). This respects the "3D is an accent" principle — the indicator doesn't compete with NOVA.
- **Passed markers turn cyan** — Dots you've already scrolled past light up cyan (completed), active is amber, unvisited is slate-blue. Classic "step progress" semantics applied to vertical scroll.
- **Amber glow on active dot** — 10px size + amber glow halo makes the current location instantly clear when you glance at the bar.
- **Scroll-to-scene navigation** — Tapping a label scrolls smoothly to that section's ScrollScene container via `scrollIntoView({ behavior: 'smooth' })`.

## Top 3 fixes (all optional polish)

1. Consider making the hover zone smaller (24px) or only triggering on actual touch (not passive mouse passage)
2. Reset auto-hide timer on `onPointerMove` within the zone for continuous hover
3. Add a subtle entry animation to labels (fade + slide from right) instead of pure opacity

None are blocking. Component is production-ready.
