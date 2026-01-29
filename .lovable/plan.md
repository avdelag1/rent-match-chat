

# 🔥 CRITICAL AUDIT: Likes & Filters System — Complete Breakdown

## Executive Summary

**VERDICT: The Likes system is fundamentally broken.** The application is currently completely non-functional for its core purpose. Multiple database tables referenced in code do not exist, column names are wrong, and there's a complete mismatch between what the code expects and what the database provides.

---

## 1️⃣ LIKES SYSTEM AUDIT — CATASTROPHIC FAILURES FOUND

### A. Database Schema vs Code Mismatch (CRITICAL)

| Table | Code Expects | Database Reality |
|-------|--------------|------------------|
| `likes` | `target_listing_id` column | ❌ DOES NOT EXIST — only `target_id` exists |
| `owner_likes` | Full table for owner→client likes | ❌ TABLE DOES NOT EXIST |
| `swipe_dismissals` | Full table for left swipes | ❌ TABLE DOES NOT EXIST |
| `dislikes` | Full table for dislike tracking | ❌ TABLE DOES NOT EXIST |
| `matches` | `client_id`, `owner_id` columns | ❌ Only `user_1`, `user_2` exist |
| `notifications` | `read` column | ❌ Only `is_read` exists |
| `listings` | `is_active`, `tulum_location` columns | ❌ DO NOT EXIST |

### B. Persistence Status — BROKEN

**Current State:**
- Likes CANNOT be saved because code tries to insert into `target_listing_id` which doesn't exist
- Owner likes CANNOT be saved because `owner_likes` table doesn't exist
- Left swipes (dislikes) CANNOT be saved because `swipe_dismissals` table doesn't exist
- The `likes` table is EMPTY (0 records) — confirms no likes are persisting

**Database Errors Observed (from Postgres logs):**
```text
column likes.target_listing_id does not exist
relation "public.dislikes" does not exist
relation "public.swipe_dismissals" does not exist
column matches.client_id does not exist
column listings.is_active does not exist
column listings.tulum_location does not exist
column notifications.read does not exist
```

### C. Visibility Status — CANNOT FUNCTION

- **Client "Liked Properties" page**: Queries `likes.target_listing_id` which doesn't exist → empty/error
- **Owner "Liked Clients" page**: Queries `owner_likes` table which doesn't exist → error thrown
- Both sides are non-functional

### D. Consistency — NOT APPLICABLE

Since likes cannot be saved, there's nothing to survive page reloads or app restarts.

### E. Swipe Exclusion Logic — BROKEN

- Code queries `swipe_dismissals` for left-swiped items → table doesn't exist
- Code queries `dislikes` for excluded items → table doesn't exist
- Liked items would show `target_listing_id` → column doesn't exist
- **Result**: Previously swiped cards may reappear, or app crashes

### F. Client vs Owner Symmetry — BROKEN

- Client likes listing → tries `likes` with `target_listing_id` → FAILS
- Owner likes client → tries `owner_likes` → TABLE DOESN'T EXIST
- Match detection → tries `matches.client_id`, `owner_id` → COLUMNS DON'T EXIST

---

## 2️⃣ FILTERS SYSTEM AUDIT — PARTIAL FUNCTIONALITY

### A. Filter Architecture Status

**Zustand Store (`filterStore.ts`)**: ✅ Well-structured
- Centralized state management
- Version tracking for cache invalidation
- Category normalization (services → worker)

### B. Filters Applied to Queries — PARTIALLY BROKEN

The `useSmartMatching.tsx` hook:
- ✅ Correctly applies category, listingType, price filters
- ❌ Uses `listings.is_active` — column doesn't exist
- ❌ Uses `listings.tulum_location` — column doesn't exist
- ❌ Queries `dislikes` table — table doesn't exist
- ❌ Uses `likes.target_listing_id` — column doesn't exist

### C. Composability — APPEARS CORRECT IN CODE

Filters use AND logic via Supabase query chaining:
```typescript
query = query.eq('category', category);
query = query.eq('listing_type', listingType);
query = query.gte('price', minPrice);
```
However, query fails before filters apply due to non-existent columns.

---

## 3️⃣ ACTUAL DATABASE SCHEMA (Source of Truth)

### `likes` table (EXISTS)
```text
id           | uuid
user_id      | uuid
target_type  | text ('listing' or 'profile')
target_id    | uuid
direction    | text ('left' or 'right')
created_at   | timestamp
```
**Note**: This is a unified swipe table — both likes AND dislikes go here, differentiated by `direction`.

### `swipes` table (EXISTS but EMPTY)
Same schema as `likes` — likely a duplicate/legacy table.

### `listings` table (EXISTS)
```text
id, owner_id, title, description, address, images, video_url,
property_type, amenities, rules, price, beds, baths, square_footage,
status, views, likes (integer counter), contacts, created_at,
category, listing_type, city, neighborhood, latitude, longitude
```
**Missing from code expectations**: `is_active`, `tulum_location`, `has_verified_documents`, `furnished`, `pet_friendly`, `mileage`, `brand`, `model`, `year`

### `matches` table (EXISTS)
```text
id        | uuid
user_1    | uuid
user_2    | uuid
created_at| timestamp
```
**Missing**: `client_id`, `owner_id`, `listing_id`, `free_messaging`, `is_mutual`

---

## 4️⃣ ROOT CAUSE ANALYSIS

The codebase was developed against an **assumed database schema** that was never actually migrated to production. There are migrations in `supabase/migrations/` folder that reference:
- `20260120000000` — adds `target_listing_id` to likes
- Various fixes for `is_user_active()` function

**These migrations were never applied to the live database.**

---

## 5️⃣ COMPREHENSIVE FIX PLAN

### Phase 1: Database Schema Alignment (CRITICAL)

**Option A: Align Code to Existing Schema** (Faster, Lower Risk)
1. Update all hooks to use existing `likes` table columns:
   - Change `target_listing_id` → `target_id`
   - Use `direction = 'left'` for dislikes instead of separate table
   - Use `direction = 'right'` for likes
   - Use `target_type = 'listing'` or `target_type = 'profile'`

2. Update match queries:
   - Change `client_id`/`owner_id` → `user_1`/`user_2`
   - Implement logic to determine which user is client vs owner

3. Remove references to non-existent columns:
   - `listings.is_active` → use `listings.status = 'active'`
   - `listings.tulum_location` → use `listings.neighborhood`
   - `notifications.read` → use `notifications.is_read`

**Option B: Apply Missing Migrations** (Complete, Higher Risk)
1. Create and apply migrations for:
   - Add `owner_likes` table
   - Add `swipe_dismissals` table
   - Add `target_listing_id` to likes (or alter to use existing schema)
   - Add missing columns to listings (`is_active`, `pet_friendly`, etc.)
   - Add missing columns to matches (`client_id`, `owner_id`, etc.)

### Phase 2: Code Fixes Required

**Files requiring changes (High Priority):**

| File | Issue | Fix Required |
|------|-------|--------------|
| `useSwipe.tsx` | Uses `swipe_dismissals`, wrong likes schema | Use `likes` with direction='left'/'right' |
| `useSwipeWithMatch.tsx` | Uses `swipe_dismissals`, `owner_likes`, `target_listing_id` | Complete rewrite to match schema |
| `useSmartMatching.tsx` | Uses `dislikes`, `target_listing_id`, `is_active`, `tulum_location` | Use `likes` with direction, fix column names |
| `useLikedProperties.tsx` | Uses `target_listing_id` | Change to `target_id` |
| `useListings.tsx` | Uses `target_listing_id` | Change to `target_id` |
| `useSwipeDismissal.tsx` | Uses `swipe_dismissals` | Use `likes` with direction='left' |
| `useSwipeUndo.tsx` | Uses `swipe_dismissals` | Use `likes` with direction='left' |
| `useMessagingQuota.tsx` | Uses `matches.client_id`/`owner_id` | Use `user_1`/`user_2` |
| `LikedClients.tsx` | Uses `owner_likes` | New approach needed |
| `TinderentSwipeContainer.tsx` | Uses `undoSuccess`, `resetUndoState` from useSwipeUndo | Add missing return values |
| `ClientSwipeContainer.tsx` | Uses `undoSuccess`, `resetUndoState` | Add missing return values |
| `offlineSwipeQueue.ts` | Uses `dislikes`, wrong likes schema | Fix to use `likes` table |
| `SwipeQueue.ts` | Wrong likes schema | Fix column names |

### Phase 3: Verification Checklist

After fixes, verify:
- [ ] Swipe right → record created in `likes` with `direction='right'`
- [ ] Swipe left → record created in `likes` with `direction='left'`
- [ ] Liked items appear in "Liked Properties/Clients" page
- [ ] Swiped items don't reappear in deck
- [ ] Page reload preserves liked items
- [ ] Filters narrow results (not just UI state)

---

## 6️⃣ TECHNICAL IMPLEMENTATION DETAILS

### Canonical Likes Pattern (Using Existing Schema)

```typescript
// RIGHT SWIPE (Like a listing)
await supabase.from('likes').upsert({
  user_id: userId,
  target_id: listingId,
  target_type: 'listing',
  direction: 'right'
}, { onConflict: 'user_id,target_id,target_type' });

// LEFT SWIPE (Dislike a listing)
await supabase.from('likes').upsert({
  user_id: userId,
  target_id: listingId,
  target_type: 'listing',
  direction: 'left'
}, { onConflict: 'user_id,target_id,target_type' });

// FETCH LIKED LISTINGS
const { data } = await supabase
  .from('likes')
  .select('target_id')
  .eq('user_id', userId)
  .eq('target_type', 'listing')
  .eq('direction', 'right');
```

### Owner Likes Pattern (Using Existing Schema)

```typescript
// OWNER RIGHT SWIPE (Like a client profile)
await supabase.from('likes').upsert({
  user_id: ownerId,
  target_id: clientId,
  target_type: 'profile',
  direction: 'right'
}, { onConflict: 'user_id,target_id,target_type' });

// FETCH OWNER'S LIKED CLIENTS
const { data } = await supabase
  .from('likes')
  .select('target_id')
  .eq('user_id', ownerId)
  .eq('target_type', 'profile')
  .eq('direction', 'right');
```

---

## 7️⃣ SUMMARY

| System | Status | Blocking Issues |
|--------|--------|-----------------|
| **Likes Persistence** | ❌ BROKEN | Wrong column names, missing tables |
| **Likes Visibility** | ❌ BROKEN | Queries fail due to schema mismatch |
| **Swipe Exclusion** | ❌ BROKEN | Missing dismissal tables |
| **Client/Owner Symmetry** | ❌ BROKEN | owner_likes table doesn't exist |
| **Filters Composability** | ⚠️ PARTIAL | Logic correct but queries fail |
| **Filter Persistence** | ✅ WORKS | saved_filters table exists |

**Estimated fix scope**: 15-20 files require changes
**Recommended approach**: Align code to existing schema (Option A)
**Risk if unfixed**: Application is completely non-functional for its core purpose

