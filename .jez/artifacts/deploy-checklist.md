# Deploy Checklist: Azimuth Mission Mentor — VCU Demo Day 2026

**Target event:** VCU Demo Day 2026
**Deployment format:** Static export to kiosk booth
**Deployer:** Justin Morales

---

## Build Verification

- [x] `next.config.mjs` has `output: 'export'` + `images: { unoptimized: true }` + `trailingSlash: true`
- [x] `npm run build` succeeds without errors
- [x] Static export produces `out/` directory (~2.4MB verified)
- [x] `out/index.html` exists and contains the app shell
- [x] `out/_next/` contains all hashed JS/CSS chunks
- [x] Fonts bundled via next/font (no runtime Google Fonts requests)
- [x] No API routes, middleware, or server-side features used
- [x] `npx tsc --noEmit` — zero TypeScript errors
- [x] `npm test` — 18 Vitest unit tests passing

## Kiosk CSS Hardening

- [x] `user-select: none` + `-webkit-user-select: none` — no text selection
- [x] `-webkit-touch-callout: none` — no iOS long-press callout
- [x] `-webkit-tap-highlight-color: transparent` — no blue tap flash
- [x] `overscroll-behavior: none` — no pull-to-refresh
- [x] `touch-action: manipulation` — no double-tap zoom
- [x] Scrollbars hidden on all browsers (Firefox, WebKit, IE/Edge)
- [x] `body.kiosk { cursor: none }` — applied after first interaction
- [x] `prefers-reduced-motion` rule disables animations

## Meta Tags & Viewport

- [x] `viewport: maximumScale: 1, userScalable: false` — prevents pinch-zoom
- [x] `viewportFit: 'cover'` — iPad safe area coverage
- [x] `themeColor: '#0A0E1A'` — matches dark background on load
- [x] `apple-mobile-web-app-capable: yes` — iOS fullscreen PWA
- [x] `apple-mobile-web-app-status-bar-style: black-translucent`
- [x] `format-detection: telephone=no, date=no, address=no, email=no`
- [x] `mobile-web-app-capable: yes` — Android fullscreen

## Runtime Kiosk Behaviors

- [x] `useKioskMode()` hook wired in page.tsx
- [x] Fullscreen API requested on first touch (touchstart, pointerdown, mousedown, keydown)
- [x] `document.body.classList.add('kiosk')` — hides cursor after first interaction
- [x] `usePortalStore.markAudioResumed()` — flag set for future AudioEngine
- [x] Kiosk mode enabled via `NEXT_PUBLIC_KIOSK_MODE=1` env var OR `?kiosk=1` URL param
- [x] Dev mode stays fully interactive by default (no accidental fullscreen)

## Idle Reset (P5.3)

- [x] `useIdleTimeout()` hook wired in page.tsx
- [x] 60s inactivity → fade to black (2s) → reset to boot scene
- [x] Listens to 8 interaction event types
- [x] Timer resets on any interaction
- [x] `IdleOverlay` component renders CSS-only black fade

## Pre-Event Sanity Checks (Manual — day of event)

- [ ] Boot sequence plays cleanly on first load
- [ ] Scroll through all scenes end-to-end without errors
- [ ] All 4 showcase carousels swipe correctly on touch
- [ ] NOVA Hub renders with bloom, compass rings rotating
- [ ] Gauntlet corridors visible with fluorescent lighting
- [ ] Gauntlet→Hub dissolve transition visible
- [ ] Impact Wall metric counters fire sequentially
- [ ] Closing CTA buttons tappable
- [ ] Idle timeout triggers after 60s → full reset
- [ ] ScrollProgress indicator visible and navigates correctly
- [ ] Screen is fullscreen (no browser chrome visible)
- [ ] No cursor visible after first touch
- [ ] No zoom on pinch gesture
- [ ] No pull-to-refresh at top

## Deployment Options

### Option A: USB Static (Recommended for booth)

```bash
npm run build
# Copy `out/` directory to USB drive
# On kiosk machine:
#   - Open Chrome in kiosk mode: chrome --kiosk file:///path/to/out/index.html
#   - OR serve via local static server: npx serve out
# Append ?kiosk=1 to URL to enable kiosk mode behaviors
```

**Pros:**
- Zero network dependency
- Works if venue WiFi fails
- Fastest load (local files)

**Cons:**
- Requires manual updates

### Option B: Vercel Deployment

```bash
# Already wired — push to master branch
git push origin master
# Vercel auto-deploys the static export
# Access via: https://[project].vercel.app?kiosk=1
```

**Pros:**
- Remote updates possible up until event
- HTTPS by default (required for some browser APIs)

**Cons:**
- Depends on venue network

### Recommended: Both

Deploy to Vercel for staging and remote updates. Keep a USB backup with the final static export. At the booth, use USB as primary with Vercel as fallback if needed.

## Rollback Plan

| Issue | Action |
|-------|--------|
| Demo won't load at all | Switch to USB static version |
| Crashes on specific scene | Note scroll position, restart kiosk, scroll past |
| Audio glitches | Audio isn't wired yet — N/A |
| Frame rate drops | Close other apps, ensure GPU acceleration enabled |
| Touchscreen unresponsive | Reboot kiosk machine, reload URL with `?kiosk=1` |

## Performance Budget (from implementation-plan.md §5)

| Metric | Target | Status |
|--------|--------|--------|
| FPS | 60fps sustained | Verified in dev, kiosk verification pending |
| First Contentful Paint | <2s | ~1.2s static export |
| Bundle size (initial) | <2MB | 142KB First Load JS ✓ |
| Bundle size (total with assets) | <5MB | 2.4MB ✓ |
| Triangle count | <500K | ~3.8K (Gauntlet) + 15K particles (NOVA) ✓ |

## Known Limitations

1. **Audio engine not wired** — AudioEngine.ts is a placeholder. `markAudioResumed()` sets the flag but no audio plays yet. Not required for Demo Day.
2. **No analytics** — Static export has no telemetry. Consider adding client-side analytics (Plausible, Umami) if needed.
3. **No offline service worker** — For truly zero-network, consider a service worker that caches everything. Not needed for USB deployment.

---

*Checklist generated 2026-04-12 per P5.6. All items marked with `[x]` verified programmatically or implemented in code. Items marked `[ ]` require manual verification at the venue.*
