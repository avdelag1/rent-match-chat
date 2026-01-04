# Performance Optimization - Testing Guide

This document explains how to verify the performance optimizations implemented in this project.

## Quick Testing Commands

```bash
# Install dependencies
npm ci

# Development build with hot reload
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Generate bundle analysis report (after build)
# The report is automatically generated at dist/stats.html during production build
```

## Phase 1: Bundle Size & Loading

### What was implemented:
1. **Bundle Analyzer** - `rollup-plugin-visualizer` integrated into Vite config
2. **Image Compression** - `browser-image-compression` for uploads (auto-compresses to WebP)
3. **Lazy Loading** - All heavy components use React.lazy()
4. **Suspense Fallback** - Lightweight loading spinner instead of null

### How to verify:
1. Run `npm run build` - this generates `dist/stats.html`
2. Open `dist/stats.html` in a browser to see bundle composition
3. Upload an image in the listing form and check console for compression logs (dev mode)

### Expected Results:
- Initial JS bundle < 200KB gzipped
- Images compressed by 50-80% before upload
- Routes load on-demand (check Network tab)

## Phase 2: Rendering Performance

### What was implemented:
1. **Memoized Components** - Swipe cards, message bubbles, conversation items
2. **Optimized Lists** - Custom comparison functions for React.memo
3. **Single Card Rendering** - Only current swipe card is in DOM

### How to verify:
1. Open React DevTools Profiler
2. Navigate to swipe deck and swipe cards
3. Check that only the affected component re-renders

### Expected Results:
- 60fps scrolling on conversation lists
- No layout shifts during swipe animations
- < 16ms render time per frame

## Phase 3: Supabase Realtime & Fetch Efficiency

### What was implemented:
1. **Scoped Realtime Subscriptions** - Only subscribe to active conversation
2. **Debounced Refetch** - 500ms debounce on realtime events
3. **Optimized Queries** - Explicit column selection, JOIN queries
4. **Proper Cleanup** - Unsubscribe on unmount/conversation switch

### How to verify:
1. Open Supabase Dashboard > Realtime
2. Open messaging dashboard in app
3. Watch subscriptions appear/disappear when switching conversations

### Expected Results:
- Only 1-2 active subscriptions at a time
- No duplicate messages on rapid updates
- Clean unsubscribe on navigation

## Performance Targets

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to Interactive | ≤ 2.0s | Lighthouse |
| First Contentful Paint | ≤ 1.5s | Lighthouse |
| Main bundle size | < 200KB gzip | Build output |
| FPS during scroll | 60fps | Chrome DevTools Performance |
| Navigation transitions | < 200ms | Perceived |

## Build Warnings Resolution

The following build warnings were addressed:

1. **Large CSS chunks** - CSS is code-split per route
2. **Large vendor chunks** - Heavy deps (Framer Motion, Charts) in separate chunks
3. **Unused exports** - Tree shaking enabled with `safest` preset

## Capacitor Compatibility

All optimizations are compatible with Capacitor:
- No Node.js-only APIs in browser runtime
- Service worker registration is web-only (checks `navigator.serviceWorker`)
- Lazy loading works in WebView

## Troubleshooting

### Bundle too large?
1. Check `dist/stats.html` for the largest chunks
2. Ensure heavy components are lazy-loaded
3. Check for duplicate dependencies

### Slow initial load?
1. Check Network tab for waterfall requests
2. Verify preconnect hints in HTML head
3. Ensure critical CSS is inlined

### Realtime not working?
1. Check Supabase Realtime dashboard
2. Verify user is authenticated
3. Check browser console for subscription errors

---

Last updated: 2026-01-04
