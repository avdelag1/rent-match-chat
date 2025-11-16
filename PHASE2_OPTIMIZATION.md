# PHASE 2: FINISH BUNDLE TO <200KB

## Current State (After Phase 1)
```
Total JS: ~215KB gzipped
Target:   <200KB gzipped
Gap:      -15KB needed
```

## Remaining Opportunities

### 1. ✅ ClientPreferencesDialog - ALREADY LAZY
- Status: Already lazy-loaded (line 18 DashboardLayout.tsx)
- Size: 33KB lazy chunk (correct)
- Impact: Already captured in Phase 1

### 2. Unused Radix UI Components
Let me analyze what's used vs unused...

### 3. date-fns Optimization
Current: Using formatDistanceToNow with all locales
Better: Use Intl.RelativeTimeFormat or reduce locales
Potential: -5KB

## Action Items

### Option A: Aggressive (Remove ~20KB)
1. Find unused Radix UI components
2. Remove from package.json
3. Rebuild

### Option B: Surgical (Remove ~15KB)
1. Optimize date-fns imports only
2. Rebuild

### Option C: Strategic (Remove ~10KB)
1. Reduce CSS bundle (unused Tailwind classes)
2. Tree-shake UI components
3. Rebuild

## Next Step
Choose your preferred approach and I'll implement it.
