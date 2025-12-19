# Tinderent Codebase Audit Report

**Date:** December 19, 2025
**Project:** Tinderent (Rental Matching Platform)
**Framework:** React 18.3.1 + Vite 5.4.21 + Supabase

---

## Executive Summary

This audit identified **72+ issues** across pages, routes, Supabase queries, and TypeScript/linting. The codebase builds successfully but contains critical bugs affecting navigation and data consistency.

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Pages & Components | 5 | 6 | 3 | - |
| Routes & Navigation | 1 | 2 | 2 | 3 |
| Supabase & Database | 3 | 9 | 4 | 4 |
| TypeScript/Linting | - | - | 405 | - |
| Dependencies | - | 2 | - | - |

---

## Critical Issues (Must Fix Immediately)

### 1. Wrong Navigation Path in Notifications
**File:** `src/hooks/useNotificationSystem.tsx` (lines 157, 202, 236)
**Issue:** Routes to `/messaging` but actual route is `/messages`
**Impact:** Notification clicks lead to 404 page
```typescript
// Current (BROKEN):
actionUrl: '/messaging'
navigate(`/messaging?conversation=${notification.conversationId}`);

// Should be:
actionUrl: '/messages'
navigate(`/messages?conversationId=${notification.conversationId}`);
```

### 2. Wrong Category in Vehicle Client Discovery
**File:** `src/pages/OwnerVehicleClientDiscovery.tsx` (line 18)
**Issue:** Uses `'property'` instead of `'vehicle'` category
```typescript
// Current (WRONG):
const { data: clients = [] } = useSmartClientMatching('property');

// Should be:
const { data: clients = [] } = useSmartClientMatching('vehicle');
```

### 3. Race Conditions in Match Creation
**Files:**
- `src/hooks/useSwipe.tsx` (lines 79-135)
- `src/hooks/useLikeNotificationActions.tsx` (lines 42-78)
- `src/hooks/useConversations.tsx` (lines 218-290)

**Issue:** TOCTOU (Time-of-Check-Time-of-Use) race conditions. Multiple concurrent requests can both check that a match doesn't exist, then both attempt to insert.
**Impact:** Duplicate matches, duplicate conversations, database constraint violations

### 4. Non-Atomic Multi-Step Mutations
**Files:**
- `src/hooks/useConversations.tsx` (lines 275-334)
- `src/hooks/useContracts.tsx` (lines 104-234)
- `src/hooks/useProfileSetup.tsx` (lines 72-128)

**Issue:** Multiple database operations performed without transactions. If one fails mid-way, data becomes inconsistent.

### 5. Bypassed Messaging Quota Check
**File:** `src/pages/ClientLikedProperties.tsx` (lines 52, 59)
**Issue:** Always allows messaging without checking quota
```typescript
// Current (BYPASSES QUOTA):
canStartNewConversation: true // Always allow

// Should properly check useMessagingQuota hook
```

---

## High Priority Issues

### 6. Dead Imports (5 files)
| File | Import |
|------|--------|
| `OwnerYachtClientDiscovery.tsx` | `PageTransition` unused |
| `OwnerContracts.tsx` | `PageTransition` unused |
| `OwnerPropertyClientDiscovery.tsx` | `PageTransition` unused |
| `ClientDashboard.tsx` | `useClientProfile` unused |
| `OwnerBicycleClientDiscovery.tsx` | `PageTransition` unused |

### 7. Wrong Icon for Motorcycle
**File:** `src/pages/OwnerViewClientProfile.tsx` (line 232)
**Issue:** Uses `Car` icon for "Motorcycle Preferences"
```typescript
// Current (WRONG):
<Car className="h-5 w-5 text-primary" />

// Should use motorcycle icon
```

### 8. Inconsistent Toast Imports
Three different import patterns used across the app:
```typescript
import { toast } from 'sonner';                    // PaymentSuccess.tsx
import { toast } from "@/hooks/use-toast";         // SubscriptionPackagesPage.tsx
import { toast } from "@/components/ui/use-toast"; // ClientLikedProperties.tsx
```

### 9. Missing Real-time Subscription Cleanup
**File:** `src/pages/NotificationsPage.tsx` (lines 167-212)
**Issue:** Potential memory leak - subscription cleanup may not execute properly

### 10. Unsafe Type Casting
**File:** `src/pages/NotificationsPage.tsx` (lines 122, 154-156)
**Issue:** Using `as any` casting defeats TypeScript safety

### 11. N+1 Query Problems
**Files:**
- `src/hooks/useSwipe.tsx` (lines 52-86)
- `src/hooks/useNotificationSystem.tsx` (lines 80-90)

**Issue:** Multiple sequential queries when joins would suffice

### 12. Unprotected Payment Routes
**File:** `src/App.tsx` (lines 381-382)
**Issue:** `/payment/success` and `/payment/cancel` not wrapped in `<ProtectedRoute>`

### 13. Hash Navigation Not Implemented
**File:** `src/components/TinderentSwipeContainer.tsx`
**Issue:** Navigates to `/client/settings#subscription` but ClientSettings.tsx doesn't implement hash scrolling

### 14. Hardcoded Colors Instead of Theme
**File:** `src/pages/MessagingDashboard.tsx` (line 297)
```typescript
// Current (hardcoded):
className="bg-[#000000]"

// Should use:
className="bg-background"
```

---

## Medium Priority Issues

### 15. Duplicate Role Storage
**Issue:** User role stored in both `profiles.role` AND `user_roles` table
**Files:** `src/hooks/useProfileSetup.tsx`
**Impact:** Two sources of truth that could become inconsistent

### 16. SQL Injection Risk Pattern
**Files:** Multiple hooks using string interpolation in `.or()` filters
```typescript
// Anti-pattern:
.or(`client_id.eq.${user.id},owner_id.eq.${user.id}`)
```

### 17. Incorrect `.single()` Usage
**Files:** `src/hooks/useContracts.tsx`, `src/hooks/useNotificationSystem.tsx`
**Issue:** Using `.single()` on queries that might return 0 results. Should use `.maybeSingle()`

### 18. Missing Required Props
**File:** `src/pages/OwnerFiltersExplore.tsx` (lines 69-101)
**Issue:** Filter components may be missing `initialFilters` prop

### 19. Unusual useState Aliasing
**File:** `src/pages/OwnerViewClientProfile.tsx` (lines 14, 19)
```typescript
// Unusual pattern:
import { useState as useReactState } from 'react';
```

---

## Database Schema Issues

### Tables in Types but NOT in Migrations (20 tables missing)
| Table | Status |
|-------|--------|
| `client_filter_preferences` | MISSING |
| `messages` (standalone) | MISSING |
| `user_preferences` | MISSING |
| `user_privacy_settings` | MISSING |
| `user_profiles` | MISSING |
| `user_search_preferences` | MISSING |
| `client_preferences_detailed` | MISSING |
| `property_matches` | MISSING |
| `property_comments` | MISSING |
| `property_favorites` | MISSING |
| `property_features` | MISSING |
| `property_images` | MISSING |
| `property_interactions` | MISSING |
| `property_match_messages` | MISSING |
| `property_ratings` | MISSING |
| `property_recommendations` | MISSING |
| `property_reports` | MISSING |
| `property_swipes` | MISSING |
| `property_tours` | MISSING |

### Column Type Mismatches
| Table | Column | Migration Type | TypeScript Type |
|-------|--------|----------------|-----------------|
| `listings` | `beds` | TEXT | number |
| `listings` | `baths` | TEXT | number |
| `message_activations` | `remaining_activations` | GENERATED (computed) | number (writable) |

---

## Linting Summary

**Total Warnings:** 405

| Category | Count |
|----------|-------|
| `@typescript-eslint/no-explicit-any` | 370 |
| `react-hooks/exhaustive-deps` | 16 |
| `react-refresh/only-export-components` | 12 |
| Other | 7 |

### Files with Most Type Safety Issues
1. `ListingPreviewCard.tsx` - 72 `any` usages
2. `ClientProfileDialog.tsx` - 12 `any` usages
3. `PropertyManagement.tsx` - 11 `any` usages
4. `SavedSearchesDialog.tsx` - 8 `any` usages
5. `NotificationsDropdown.tsx` - 6 `any` usages

---

## Dependencies

### Vulnerabilities (npm audit)
```
2 moderate severity vulnerabilities
- esbuild: <=0.24.2 (GHSA-67mh-4wv8-2f99)
- vite: 0.11.0 - 6.1.6 (depends on vulnerable esbuild)
```

### Outdated
- Browserslist data 6 months old (run `npx update-browserslist-db@latest`)

---

## Recommendations by Priority

### Immediate (This Week)
1. Fix `/messaging` to `/messages` navigation path
2. Fix vehicle category in OwnerVehicleClientDiscovery
3. Implement proper messaging quota checks
4. Change `Car` icon to motorcycle icon
5. Protect payment routes with ProtectedRoute

### High (Next Sprint)
1. Add database transactions for multi-step mutations
2. Fix race conditions with upsert/onConflict
3. Standardize toast import pattern
4. Clean up dead imports
5. Fix useEffect cleanup in NotificationsPage

### Medium (Technical Debt)
1. Create missing database migrations for 20 tables
2. Fix column type mismatches (beds/baths)
3. Replace `any` types with proper interfaces (370 instances)
4. Fix React hook dependencies (16 instances)
5. Use `.maybeSingle()` instead of `.single()` where appropriate

### Low (Maintenance)
1. Create centralized routes constants file
2. Update npm dependencies for vulnerabilities
3. Update browserslist database
4. Standardize localStorage key usage
5. Replace hardcoded colors with theme variables

---

## Build Status

```
Build: SUCCESS (15.63s)
TypeScript: PASS (no blocking errors)
ESLint: 405 warnings
npm audit: 2 moderate vulnerabilities
```

---

## Files Modified/Affected Summary

| Area | Files Affected |
|------|----------------|
| Pages | 36 |
| Hooks | 80+ |
| Components | 150+ |
| Migrations | 39 |
| Routes | 61 |

---

*Generated by Claude Code Audit - December 19, 2025*
