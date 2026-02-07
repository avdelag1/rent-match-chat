# Swipe System Unification Plan

**Document Version:** 1.0  
**Date:** February 6, 2026  
**Status:** Audit Complete - Implementation Planning

---

## 1. Current State Summary

### 1.1 Duplicate Components Identified

| Component | Location | Purpose | Duplication Level |
|-----------|----------|---------|-------------------|
| `SimpleSwipeCard.tsx` | `/src/components/` | Client-side property/listing cards | HIGH |
| `SimpleOwnerSwipeCard.tsx` | `/src/components/` | Owner-side client profile cards | HIGH |
| `ClientSwipeContainer.tsx` | `/src/components/` | Owner swipe deck management | HIGH |
| `TinderentSwipeContainer.tsx` | `/src/components/` | Client swipe deck management | HIGH |
| `ClientProfileDialog.tsx` | `/src/components/` | Client comprehensive profile | MEDIUM |
| `OwnerProfileDialog.tsx` | `/src/components/` | Owner business profile | MEDIUM |

### 1.2 Shared Components Already in Use

| Component | Usage | Notes |
|-----------|-------|-------|
| `SwipeActionButtonBar.tsx` | Both swipe containers | ✅ Good candidate for other shared patterns |
| `SwipeInsightsModal.tsx` | Both views | Already handles `isClientProfile` flag |
| `PhotoUploadManager` | Both profile dialogs | ✅ Already unified |
| `useSwipe.tsx` | Both containers | ✅ Shared hook |
| `useSwipeUndo.tsx` | Both containers | ✅ Shared hook |
| `useSwipeDismissal.tsx` | Both containers | ✅ Shared hook |
| `SwipeDeckStore.tsx` | Both decks | ✅ Shared zustand store |
| `CardImage.tsx` | Both cards | Extracted inline in both |

### 1.3 Permission Gaps Identified

| Gap | Description | Severity |
|-----|-------------|----------|
| No unified role-aware query filter | Different hooks for client vs owner matching | HIGH |
| Permission hooks scattered | `useCanAccessMessaging`, `useProfileSetup` separate | MEDIUM |
| No unified permission context | Role checks done ad-hoc in components | MEDIUM |
| Inconsistent RBAC enforcement | Some routes protected, others not | LOW |

---

## 2. Target Architecture

### 2.1 ASCII Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UNIFIED APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐      ┌─────────────────────┐                       │
│   │   Unified Swipe    │      │   Unified Profile  │                       │
│   │     Container      │◄────►│      System        │                       │
│   │                     │      │                     │                       │
│   │ • Role-aware props │      │ • Role variants     │                       │
│   │ • Single deck logic│      │ • Shared sections   │                       │
│   │ • Unified hooks    │      │ • Photo upload      │                       │
│   └─────────────────────┘      └─────────────────────┘                       │
│              │                           │                                   │
│              ▼                           ▼                                   │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    PERMISSION LAYER (New)                          │   │
│   │                                                                      │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐     │   │
│   │  │ useUserRole  │  │ usePermissions│  │ PermissionGuard     │     │   │
│   │  │    (hook)    │  │    (hook)    │  │   (component)       │     │   │
│   │  └──────────────┘  └──────────────┘  └──────────────────────┘     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│              │                           │                                   │
│              ▼                           ▼                                   │
│   ┌─────────────────────┐      ┌─────────────────────┐                       │
│   │   Unified Playlist  │      │     Data Layer      │                       │
│   │       System        │      │                     │                       │
│   │                     │      │ • useSwipeMatching  │                       │
│   │ • Owner create/edit│      │ • useProfileData   │                       │
│   │ • Client save/like │      │ • usePlaylists     │                       │
│   │ • Publish workflow │      └─────────────────────┘                       │
│   └─────────────────────┘                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Unified Components Specification

#### SwipeCard.tsx (New Unified Component)

```typescript
interface SwipeCardProps {
  // Data - union type for listings or profiles
  data: Listing | ClientProfile;
  
  // Role-aware display
  role: 'client' | 'owner';
  
  // Callbacks
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onInsights?: () => void;
  
  // Visibility/permissions
  showActions?: boolean;
  canUndo?: boolean;
  
  // Card positioning
  isTop?: boolean;
}
```

#### SwipeContainer.tsx (New Unified Container)

```typescript
interface SwipeContainerProps {
  // Data type to fetch
  dataType: 'listing' | 'client_profile';
  
  // Role for display
  role: 'client' | 'owner';
  
  // Callbacks
  onItemTap?: (itemId: string) => void;
  onInsights?: (itemId: string) => void;
  
  // Filters (unified)
  filters?: ListingFilters | ClientFilters;
  
  // Persistence key
  persistenceKey?: string;
}
```

#### ProfileDialog.tsx (Unified with Role Variants)

```typescript
interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role: 'client' | 'owner';
  
  // Optional: pre-load specific section
  initialSection?: 'photos' | 'basics' | 'preferences' | 'contact';
}
```

---

## 3. Implementation Steps (Prioritized)

### Phase 1: Unify Swipe Card Components
**Priority: HIGHEST**  
**Estimated Effort: 3-4 days**

#### Tasks:

1. **Extract CardImage as Shared Component** (Day 1)
   - Move inline `CardImage` from both files to `/src/components/ui/SwipeCardImage.tsx`
   - Add prop for placeholder content (text vs gradient)
   - Add cache warming for both listing and profile images

2. **Create Unified SwipeCard.tsx** (Day 2)
   - Create `/src/components/SwipeCard.tsx`
   - Add discriminated union type for `data` prop
   - Implement role-aware content rendering:
     - `role === 'client'`: PropertyCardInfo, VehicleCardInfo, ServiceCardInfo
     - `role === 'owner'`: Client profile info (name, age, budget, interests)
   - Preserve existing physics and animations

3. **Create useSwipeMatching Hook** (Day 2-3)
   - Merge `useSmartListingMatching` and `useSmartClientMatching`
   - Add `dataType` parameter
   - Implement unified query with role-based filters
   - Add proper TypeScript discriminated unions

4. **Refactor Containers** (Day 3-4)
   - Create `SwipeContainer.tsx` using unified `SwipeCard`
   - Parameterize `dataType`, `role`, `persistenceKey`
   - Update `ClientSwipeContainer` to use new unified component
   - Update `TinderentSwipeContainer` to use new unified component
   - Delete duplicate files after testing

#### Success Criteria:
- [ ] Single SwipeCard component handles both data types
- [ ] Both container variants render identically
- [ ] No regression in swipe physics or performance
- [ ] TypeScript strictly enforces role/data combinations

---

### Phase 2: Unify Profile System
**Priority: HIGH**  
**Estimated Effort: 2-3 days**

#### Tasks:

1. **Extract Shared Profile Sections** (Day 1)
   - Create `/src/components/profile/PhotoSection.tsx` (extracted from both dialogs)
   - Create `/src/components/profile/LocationSection.tsx` (common location picker)
   - Create `/src/components/profile/BasicInfoSection.tsx` (name, age, gender)

2. **Create Unified ProfileDialog** (Day 2)
   - Create `/src/components/ProfileDialog.tsx`
   - Add `role` prop controlling:
     - Form fields displayed
     - Validation rules
     - Submit handler (client vs owner save mutations)
   - Use extracted shared sections

3. **Consolidate Photo Upload** (Day 1-2)
   - `PhotoUploadManager` already shared ✅
   - Add role-specific max photos (client: 5, owner: 1)

4. **Delete Duplicate Components** (Day 3)
   - Remove `ClientProfileDialog.tsx`
   - Remove `OwnerProfileDialog.tsx`
   - Update imports in all consuming components

#### Success Criteria:
- [ ] Single ProfileDialog component
- [ ] All existing fields preserved
- [ ] No duplicate form logic
- [ ] Photo upload works for both roles

---

### Phase 3: Enhance Playlist System
**Priority: MEDIUM**  
**Estimated Effort: 2-3 days**

#### Tasks:

1. **Extend useRadioPlaylists for Owners** (Day 1)
   - Add `publish` boolean field to playlist schema
   - Add `owner_id` for published playlists
   - Implement publish/unpublish mutations

2. **Create Playlist CRUD Hook** (Day 1-2)
   - `usePlaylist` hook with full CRUD:
     - `createPlaylist(name, description, isPublic?)`
     - `updatePlaylist(id, updates)`
     - `deletePlaylist(id)`
     - `publishPlaylist(id)`
     - `unpublishPlaylist(id)`

3. **Add Client "Save/Like" Capability** (Day 2-3)
   - Add `liked_playlists` array to user preferences
   - Implement `likePlaylist(id)`, `unlikePlaylist(id)`
   - Add to RadioContext for player integration

4. **Update Radio Context** (Day 2-3)
   - Add `publishedPlaylists` query
   - Add `likedPlaylists` state
   - Update `playPlaylist` to handle both owned and liked

#### Success Criteria:
- [ ] Owners can create, edit, publish playlists
- [ ] Clients can view published playlists
- [ ] Clients can like/save playlists
- [ ] Radio player integrates with both

---

### Phase 4: Permission Layer
**Priority: MEDIUM**  
**Estimated Effort: 2 days**

#### Tasks:

1. **Create Permission Hooks** (Day 1)
   - Create `/src/hooks/usePermissions.ts`
   - Define permission types:
     ```typescript
     type Permission = 
       | 'swipe:client'
       | 'swipe:owner'
       | 'profile:edit:client'
       | 'profile:edit:owner'
       | 'playlist:create'
       | 'playlist:publish'
       | 'playlist:like'
       | 'messaging:access';
     ```
   - Implement `useHasPermission(permission): boolean`
   - Implement `useRole(): 'client' | 'owner'`

2. **Create PermissionGuard Component** (Day 1-2)
   - Create `/src/components/PermissionGuard.tsx`
   - Props: `permission`, `children`, `fallback`
   - Redirect or render fallback when unauthorized

3. **Add Role-Based Query Filters** (Day 2)
   - Update `useSwipeMatching` to:
     - Accept optional `allowedTypes` array
     - Filter results by user role automatically
     - Throw or return empty for unauthorized queries

4. **Secure API Access** (Day 2)
   - Add RLS policies for playlist tables
   - Verify permissions server-side in Supabase
   - Add edge function for sensitive operations

#### Success Criteria:
- [ ] Role detection centralized in useRole()
- [ ] Permission checks are declarative
- [ ] Unauthorized access blocked at API level
- [ ] Clear error messages for permission denied

---

## 4. Component Mapping Table

| Current Component | Unified Component | Action |
|-------------------|-------------------|--------|
| `SimpleSwipeCard.tsx` | `SwipeCard.tsx` | Merge + enhance |
| `SimpleOwnerSwipeCard.tsx` | `SwipeCard.tsx` | Absorb into SwipeCard |
| `ClientSwipeContainer.tsx` | `SwipeContainer.tsx` | Refactor to use SwipeCard |
| `TinderentSwipeContainer.tsx` | `SwipeContainer.tsx` | Refactor to use SwipeCard |
| `ClientProfileDialog.tsx` | `ProfileDialog.tsx` | Merge + enhance |
| `OwnerProfileDialog.tsx` | `ProfileDialog.tsx` | Absorb into ProfileDialog |
| `useSmartListingMatching` | `useSwipeMatching.ts` | Merge + rename |
| `useSmartClientMatching` | `useSwipeMatching.ts` | Absorb into useSwipeMatching |
| `useRadioPlaylists.ts` | `usePlaylists.ts` | Enhance for both roles |
| (new) | `usePermissions.ts` | Create new |
| (new) | `PermissionGuard.tsx` | Create new |

---

## 5. Quick Wins (Minimal Refactoring)

### 5.1 Shared Data Hook

Create a single hook for swipe matching that both roles can use:

```typescript
// /src/hooks/useSwipeMatching.ts (quick win)

export function useSwipeMatching<T extends Listing | ClientProfile>(
  dataType: 'listing' | 'client_profile',
  filters: any,
  page: number = 0
) {
  const { role } = useUserRole();
  
  // Route to appropriate existing hook
  if (dataType === 'listing') {
    return useSmartListingMatching(/* existing params */);
  } else {
    return useSmartClientMatching(/* existing params */);
  }
}
```

**Effort:** ~1 hour  
**Benefit:** Centralizes matching logic, enables future unification

---

### 5.2 Common Prop Types

Extract shared TypeScript interfaces:

```typescript
// /src/types/swipe.ts

export interface SwipeCardProps {
  data: Listing | ClientProfile;
  onSwipe: (direction: 'left' | 'right') => void;
  onTap?: () => void;
  onInsights?: () => void;
  isTop?: boolean;
}

export interface SwipeContainerProps {
  dataType: 'listing' | 'client_profile';
  role: 'client' | 'owner';
  onItemTap?: (id: string) => void;
  filters?: any;
}
```

**Effort:** ~30 minutes  
**Benefit:** TypeScript safety, shared understanding of interfaces

---

### 5.3 Role-Aware Utility Functions

Create shared utilities for role-based decisions:

```typescript
// /src/utils/roleUtils.ts

export function getDefaultFiltersForRole(role: 'client' | 'owner'): any {
  if (role === 'client') {
    return { categories: ['property'], listingType: 'rent' };
  } else {
    return { categories: ['property'], clientType: 'seeker' };
  }
}

export function canAccessMessaging(role: 'client' | 'owner'): boolean {
  // Check subscription status, etc.
  return true; // Simplified for example
}

export function getSwipeLabel(role: 'client' | 'owner'): string {
  return role === 'client' ? 'Discover Properties' : 'Find Clients';
}
```

**Effort:** ~1 hour  
**Benefit:** DRY principle, easier role-specific customization

---

### 5.4 Shared Loading States

Unify loading skeletons:

```typescript
// /src/components/ui/SwipeLoadingSkeleton.tsx

export function SwipeLoadingSkeleton({ role }: { role: 'client' | 'owner' }) {
  return (
    <div className="relative w-full h-full flex-1 max-w-lg mx-auto flex flex-col px-3">
      <div className="relative flex-1 w-full">
        <Skeleton className="w-full h-full rounded-3xl" />
      </div>
      <div className="flex-shrink-0 flex justify-center items-center py-3 px-4">
        {/* Both roles use same button skeleton */}
        <Skeleton className="w-14 h-14 rounded-full" />
        <Skeleton className="w-11 h-11 rounded-full" />
        <Skeleton className="w-11 h-11 rounded-full" />
        <Skeleton className="w-14 h-14 rounded-full" />
      </div>
    </div>
  );
}
```

**Effort:** ~30 minutes  
**Benefit:** Consistent loading UX, reduced duplication

---

### 5.5 Extract CardImage Component

Extract the inline CardImage from both swipe cards:

```typescript
// /src/components/ui/SwipeCardImage.tsx

interface SwipeCardImageProps {
  src: string;
  alt: string;
  name?: string | null; // For owner profile placeholders
  isTop?: boolean;
}

export function SwipeCardImage({ src, alt, name, isTop }: SwipeCardImageProps) {
  // Move existing CardImage logic here
  // Add prop for placeholder content
}
```

**Effort:** ~1 hour  
**Benefit:** DRY, single place for image optimization logic

---

## 6. Rollout Plan

### Recommended Order:

1. **Week 1:** Quick Wins
   - Extract types and utilities
   - Create role-aware hooks
   - Extract CardImage component

2. **Week 2-3:** Phase 1 (Swipe Unification)
   - Create unified SwipeCard
   - Refactor containers
   - Delete duplicates

3. **Week 4:** Phase 2 (Profile Unification)
   - Extract shared sections
   - Create unified ProfileDialog
   - Delete duplicates

4. **Week 5:** Phase 3 (Playlist Enhancement)
   - Add owner capabilities
   - Add client liking
   - Update Radio context

5. **Week 6:** Phase 4 (Permission Layer)
   - Create permission hooks
   - Add PermissionGuard
   - Secure APIs

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Regression in swipe feel | HIGH | Extensive QA, A/B test with small user group |
| TypeScript complexity | MEDIUM | Use discriminated unions carefully |
| Breaking changes | HIGH | Maintain backward-compatible exports during transition |
| Performance regression | MEDIUM | Monitor metrics, implement lazy loading |
| Feature parity loss | MEDIUM | Document all features, cross-reference during refactor |

---

## 8. Success Metrics

- **Code Reduction:** ~30% fewer lines in swipe/profile components
- **Bug Reduction:** 50% fewer role-related bugs
- **Feature Velocity:** 2x faster to add new swipe card features
- **Bundle Size:** Reduced by ~15kb (gzipped)
- **Developer Experience:** Single source of truth for each feature

---

**Document Prepared By:** Subagent Audit Team  
**Next Actions:** 
1. Review and approve implementation plan
2. Begin Week 1 quick wins
3. Schedule Phase 1 kickoff
