# Test Strategy: SwipeCarousel Touch + Scroll Conflict

**Date**: 2026-04-11
**Component**: `src/components/ui/SwipeCarousel.tsx`
**Risk**: Horizontal swipe inside vertical scroll page — the #1 UX failure mode for carousels.

## Conflict Prevention Design

The carousel uses `touch-action: pan-x` on the scroll container. Parent `<ScrollScene>` sections use the default `touch-action: auto`. The browser's native gesture detection handles direction locking: first 10px of movement determines whether the gesture is horizontal (carousel) or vertical (page scroll).

Native CSS `scroll-snap-type: x mandatory` handles snapping — no JavaScript snap animations needed. This is the most reliable approach across browsers.

## Test Matrix

### Desktop (mouse)

| Test | Steps | Expected | Priority |
|------|-------|----------|----------|
| **Mouse wheel scroll** | Scroll wheel on carousel | Page scrolls vertically, carousel does NOT move horizontally | P0 |
| **Click + drag horizontal** | Click and drag left/right inside carousel | Card changes, snaps to next | P0 |
| **Click + drag vertical** | Click and drag up/down inside carousel | Page scrolls, carousel stays put | P0 |
| **Dot click** | Click dot indicator | Scrolls to that card, dot updates | P0 |
| **Keyboard** | Tab to dots, Enter to activate | Focus ring visible, card changes | P1 |

### Tablet (iPad Pro — primary target)

| Test | Steps | Expected | Priority |
|------|-------|----------|----------|
| **Horizontal swipe** | Swipe left/right on carousel | Card snaps to next/prev | P0 |
| **Vertical swipe** | Swipe up/down on carousel | Page scrolls, carousel stays | P0 |
| **Diagonal swipe** | Swipe at 30-45° angle | Direction locks to dominant axis within first 10px | P0 |
| **Fast flick** | Quick horizontal flick | Momentum carries, snaps to nearest card | P0 |
| **Edge bounce** | Swipe past first/last card | Elastic overscroll, bounces back | P1 |
| **Multi-touch** | Pinch zoom on carousel | No carousel movement, no zoom (kiosk) | P1 |

### Kiosk touchscreen

| Test | Steps | Expected | Priority |
|------|-------|----------|----------|
| **Single touch drag** | Drag horizontally | Cards change | P0 |
| **Rapid tap** | Tap dots quickly | Each tap registers, no double-fire | P0 |
| **60px touch target** | Tap dot indicators | Dots are tappable (min 44px hit area via padding) | P0 |

### Cross-browser

| Browser | Platform | Test focus |
|---------|----------|------------|
| Chrome 120+ | Windows, macOS | Primary — scroll-snap-type support |
| Safari 17+ | iPad, macOS | -webkit-overflow-scrolling, touch gestures |
| Chrome kiosk | Kiosk display | Fullscreen, no browser UI |

## Known Risks

1. **Safari scroll-snap + scrollTo**: Safari sometimes ignores `behavior: 'smooth'` on `scrollTo`. The native snap handles this — `scrollTo` is only used for dot clicks.
2. **touch-action: pan-x prevents page scroll**: If the user's finger starts on the carousel and tries to scroll vertically, it won't work. This is intentional — the carousel area is for horizontal swipe only. The user can scroll from any area outside the carousel.
3. **Scrollbar visibility**: Hidden via `scrollbar-width: none` and `::-webkit-scrollbar { display: none }`. Verify on all target browsers.

## Regression Prevention

- Add `data-testid="carousel-container"` for automated testing
- Monitor: if vertical scroll stops working on showcase sections, check `touch-action` inheritance
