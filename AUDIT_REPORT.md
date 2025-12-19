# Tinderent Codebase Audit Report

**Date:** December 19, 2025
**Project:** Tinderent (Rental Matching Platform)
**Framework:** React 18.3.1 + Vite 5.4.21 + Supabase

---

## Executive Summary

This comprehensive audit identified **200+ issues** across security, pages, routes, Supabase queries, error handling, performance, accessibility, and edge cases. The codebase builds successfully but contains critical bugs affecting navigation, security, and data consistency.

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Security | 2 | 4 | 5 | 3 |
| Pages & Components | 5 | 6 | 3 | - |
| Routes & Navigation | 1 | 2 | 2 | 3 |
| Supabase & Database | 3 | 9 | 4 | 4 |
| Error Handling | - | 7 | 6 | 5 |
| Performance | - | 2 | 6 | 1 |
| Accessibility | - | 3 | 4 | 3 |
| Edge Cases/Bugs | 3 | 5 | 4 | 3 |
| TypeScript/Linting | - | - | 405 | - |
| Location System | 2 | 1 | 2 | - |

---

## 🔴 CRITICAL SECURITY ISSUES

### 1. Open Redirect Vulnerability
**File:** `src/hooks/useNativePushNotifications.tsx` (line 165)
**Issue:** User-controlled data from push notification used directly in redirect
```typescript
// DANGEROUS - No validation
window.location.href = data.link_url;
```
**Risk:** Attackers can redirect users to phishing/malware sites

### 2. Exposed Credentials in .env
**File:** `.env` (lines 1-3)
**Issue:** Supabase credentials committed to repository
```
VITE_SUPABASE_PROJECT_ID="vplgtcguxujxwrgguxqq"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1N..."
```
**Action:** Rotate credentials immediately, remove from git history

---

## 🔴 CRITICAL FUNCTIONAL BUGS

### 3. Wrong Navigation Path in Notifications
**File:** `src/hooks/useNotificationSystem.tsx` (lines 157, 202, 236)
**Issue:** Routes to `/messaging` but actual route is `/messages`
**Impact:** Notification clicks lead to 404 page

### 4. CountrySelector onSelect Never Fires
**File:** `src/components/location/CountrySelector.tsx` (lines 71-78)
**Issue:** `SelectItem` doesn't have `onSelect` prop - country selection is completely broken
```typescript
// BROKEN - onSelect is not a valid prop
<SelectItem onSelect={() => onChange(country)}>
```
**Impact:** Owners cannot select country, forms will have undefined country

### 5. Wrong Category in Vehicle Client Discovery
**File:** `src/pages/OwnerVehicleClientDiscovery.tsx` (line 18)
**Issue:** Uses `'property'` instead of `'vehicle'` category
```typescript
const { data: clients = [] } = useSmartClientMatching('property'); // WRONG
```

### 6. Race Conditions in Match Creation
**Files:** `useSwipe.tsx`, `useLikeNotificationActions.tsx`, `useConversations.tsx`
**Issue:** TOCTOU race conditions can create duplicate matches/conversations

### 7. Bypassed Messaging Quota Check
**File:** `src/pages/ClientLikedProperties.tsx` (lines 52, 59)
**Issue:** Always allows messaging without checking quota
```typescript
canStartNewConversation: true // Always allow - bypasses quota
```

---

## 🟠 HIGH SECURITY ISSUES

### 8. Sensitive Data in LocalStorage
**Files:** `AuthDialog.tsx`, `SubscriptionPackagesPage.tsx`, `useSwipeAnalytics.tsx`
**Issue:** Email, tokens, and user data stored in localStorage (XSS vulnerable)

### 9. CORS Wildcard Origin
**Files:** `supabase/functions/delete-user/index.ts`, `send-push-notification/index.ts`
**Issue:** `'Access-Control-Allow-Origin': '*'` allows any website to make requests

### 10. XSS via dangerouslySetInnerHTML
**File:** `src/components/ui/chart.tsx` (lines 86-106)
**Issue:** Uses dangerouslySetInnerHTML for CSS injection

### 11. JSON.parse Without Try-Catch
**Files:** `PaymentSuccess.tsx`, `useSwipeUndo.tsx`, `useSwipeAnalytics.tsx`
**Issue:** Parsing localStorage without error handling can crash the app

---

## 🟠 HIGH PRIORITY BUGS

### 12. ClientLocationSelector Missing Dependency
**File:** `src/components/location/ClientLocationSelector.tsx` (line 132)
**Issue:** `selectedTab` used but not in dependency array - causes stale closures
**Impact:** Wrong location type sent when user switches tabs

### 13. Dead Imports (5 files)
| File | Import |
|------|--------|
| `OwnerYachtClientDiscovery.tsx` | `PageTransition` unused |
| `OwnerContracts.tsx` | `PageTransition` unused |
| `OwnerPropertyClientDiscovery.tsx` | `PageTransition` unused |
| `ClientDashboard.tsx` | `useClientProfile` unused |
| `OwnerBicycleClientDiscovery.tsx` | `PageTransition` unused |

### 14. Wrong Icon for Motorcycle
**File:** `src/pages/OwnerViewClientProfile.tsx` (line 232)
**Issue:** Uses `Car` icon for "Motorcycle Preferences"

### 15. Missing Real-time Subscription Cleanup
**File:** `src/pages/NotificationsPage.tsx` (lines 167-212)
**Issue:** Memory leak - subscription cleanup may not execute properly

### 16. Unprotected Payment Routes
**File:** `src/App.tsx` (lines 381-382)
**Issue:** `/payment/success` and `/payment/cancel` not wrapped in `<ProtectedRoute>`

---

## 🟡 ERROR HANDLING ISSUES

### 17. Swallowed Errors (7 instances)
| File | Issue |
|------|-------|
| `NotificationSystem.tsx` | Notification save failures silently ignored |
| `PropertyImageGallery.tsx` | Image preload errors silently caught |
| `usePrefetchImages.tsx` | Image decode errors ignored |
| `ClientPropertyPreview.tsx` | Share API errors silently caught |
| `useSwipe.tsx` | Match creation errors not logged |

### 18. Missing Error Boundaries
Camera pages (`ClientSelfieCamera.tsx`, `OwnerListingCamera.tsx`, `OwnerProfileCamera.tsx`) lack error boundaries for camera functionality

### 19. Console.log Instead of Proper Logging
**Count:** 40+ instances across 10+ files using `console.error` instead of proper error reporting

### 20. Missing User-Facing Error Messages
Notification save failures, listing query errors, and message fetch errors are logged but not shown to users

---

## 🟡 PERFORMANCE ISSUES

### 21. 421 Inline Event Handlers
**Impact:** Causes unnecessary re-renders on every parent render
```typescript
// Anti-pattern used throughout:
onClick={() => handleClick(item.id)}
```

### 22. Missing Debounce on Search (7 pages)
**Files:** All Owner*ClientDiscovery pages, PropertySearch.tsx, MessagingDashboard.tsx
**Issue:** Search inputs trigger state updates on every keystroke

### 23. No List Virtualization
**Issue:** Large lists (notifications, properties, clients) render all items in DOM
**Impact:** Poor scrolling performance, high memory usage

### 24. 9+ Components Without React.memo
`CategorySelectionCard`, `OwnerSettingsDialog`, `PropertyDetails`, `LikeNotificationCard`, `ServiceProviderCard`, etc.

### 25. Expensive Computations in Render
`PropertySearch.tsx`, `PropertyManagement.tsx` compute filtered lists without useMemo

---

## 🟡 EDGE CASES & POTENTIAL BUGS

### 26. Division by Zero Risks
| File | Issue |
|------|-------|
| `profileSimilarity.ts` (line 97) | `budgetRange` can be 0 |
| `useMonthlyMessageLimits.ts` (line 68) | `benefits.messageLimit` can be 0 |
| `ClientProfile.tsx` (line 44) | `total` can be 0 in percentage calculation |

### 27. Array Index Out of Bounds
| File | Issue |
|------|-------|
| `fileValidation.ts` (lines 71, 103) | `lastIndexOf('.')` returns -1 if no extension |
| `useCamera.tsx` (line 366) | `split('/')[1]` undefined if no slash |

### 28. Date/Timezone Issues
| File | Issue |
|------|-------|
| `useLegalDocumentQuota.ts` (line 30) | Month 12 (December) edge case not handled |
| `PaymentSuccess.tsx` (lines 83-84) | Month overflow doesn't increment year |
| `useMonthlyMessageLimits.ts` (line 33) | Query key missing year - cache issues at year boundary |

### 29. Locale Inconsistency
- `timeFormatter.ts` uses hardcoded 'en-US'
- `subscriptionPricing.ts` uses 'es-MX'
- App serves Mexican market but dates formatted in US locale

---

## 🟡 ACCESSIBILITY ISSUES

### 30. Non-Keyboard Accessible Elements
**Files:** `TinderSwipeCard.tsx`, `EnhancedPropertyCard.tsx`, `ClientProfileCard.tsx`
**Issue:** Image navigation zones are `<div>` with onClick but no tabindex or keyboard handlers

### 31. Missing ARIA Labels
**Files:** `EnhancedPropertyCard.tsx`, `ClientProfileCard.tsx`, `PropertyImageGallery.tsx`
**Issue:** Clickable elements without accessible names

### 32. Color Contrast Issues
**Files:** `SwipeActionButtons.tsx`, `AuthDialog.tsx`
**Issue:** Disabled states and gradients may not meet WCAG standards

### 33. Non-Semantic HTML
Multiple files use `<div onClick>` instead of `<button>` for interactive elements

---

## 🔵 DATABASE SCHEMA ISSUES

### 34. Tables in Types but NOT in Migrations (20 tables missing)
`client_filter_preferences`, `messages`, `user_preferences`, `user_privacy_settings`, `user_profiles`, `user_search_preferences`, `client_preferences_detailed`, `property_matches`, `property_comments`, `property_favorites`, `property_features`, `property_images`, `property_interactions`, `property_match_messages`, `property_ratings`, `property_recommendations`, `property_reports`, `property_swipes`, `property_tours`

### 35. Column Type Mismatches
| Table | Column | Migration | TypeScript |
|-------|--------|-----------|------------|
| `listings` | `beds` | TEXT | number |
| `listings` | `baths` | TEXT | number |

---

## 📊 LINTING SUMMARY

**Total Warnings:** 405

| Category | Count |
|----------|-------|
| `@typescript-eslint/no-explicit-any` | 370 |
| `react-hooks/exhaustive-deps` | 16 |
| `react-refresh/only-export-components` | 12 |
| Other | 7 |

---

## 🔧 RECOMMENDATIONS BY PRIORITY

### 🚨 Immediate (Security Critical)
1. Rotate exposed Supabase credentials
2. Fix open redirect vulnerability in push notifications
3. Fix CountrySelector onSelect (feature completely broken)
4. Fix `/messaging` → `/messages` navigation path
5. Add CORS origin restrictions to edge functions

### 🔴 This Week (Critical Bugs)
1. Fix vehicle category in OwnerVehicleClientDiscovery
2. Fix ClientLocationSelector dependency array
3. Implement proper messaging quota checks
4. Protect payment routes with ProtectedRoute
5. Fix race conditions with database transactions

### 🟠 Next Sprint (High Priority)
1. Add error boundaries to camera pages
2. Replace console.error with proper error reporting
3. Add debounce to all search inputs
4. Standardize toast import pattern
5. Clean up dead imports
6. Fix useEffect cleanup in NotificationsPage

### 🟡 Technical Debt
1. Create missing database migrations for 20 tables
2. Replace 370 `any` types with proper interfaces
3. Add React.memo to pure components
4. Implement list virtualization
5. Add keyboard navigation to card components
6. Fix division by zero possibilities
7. Handle date edge cases properly

---

## 📈 BUILD STATUS

```
Build: SUCCESS (15.63s)
TypeScript: PASS (no blocking errors)
ESLint: 405 warnings
npm audit: 2 moderate vulnerabilities (esbuild/vite)
```

---

## 📁 FILES AFFECTED

| Area | Count |
|------|-------|
| Pages | 36 |
| Hooks | 80+ |
| Components | 150+ |
| Migrations | 39 |
| Routes | 61 |
| **Total Issues** | **200+** |

---

*Generated by Claude Code Audit - December 19, 2025*
