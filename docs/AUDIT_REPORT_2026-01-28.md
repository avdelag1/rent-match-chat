# 🔥 RENT-MATCH APP AUDIT REPORT

**Date:** 2026-01-28
**Auditor:** Senior Backend + Frontend Architect
**Status:** BLOCKED - Critical Schema Mismatch Detected

---

## 1️⃣ ROUTE → TABLE MAP

### Client Routes (Role: `client`)

| Route | Data Source | Tables Used |
|-------|-------------|-------------|
| `/client/dashboard` | Swipe listings | `listings`, `likes`, `dislikes`, `client_filter_preferences`, `swipe_dismissals` |
| `/client/profile` | Edit own profile | `profiles`, `user_roles` |
| `/client/settings` | User settings | `user_security_settings` |
| `/client/liked-properties` | View liked listings | `likes`, `listings` |
| `/client/who-liked-you` | Owners who liked | `owner_likes`, `profiles` |
| `/client/saved-searches` | Saved filters | `saved_searches`, `saved_filters` |
| `/client/filters` | Filter preferences | `client_filter_preferences` |
| `/client/services` | Browse services | `listings` (category='worker') |
| `/client/contracts` | Contracts | `digital_contracts` |

### Owner Routes (Role: `owner`)

| Route | Data Source | Tables Used |
|-------|-------------|-------------|
| `/owner/dashboard` | Swipe clients | `profiles`, `owner_likes`, `dislikes`, `swipe_dismissals` |
| `/owner/profile` | Edit own profile | `profiles`, `user_roles` |
| `/owner/properties` | Own listings | `listings` |
| `/owner/listings/new` | Create listing | `listings` |
| `/owner/liked-clients` | Liked clients | `owner_likes`, `profiles` |
| `/owner/interested-clients` | Clients who liked listings | `likes`, `listings`, `profiles` |
| `/owner/filters` | Filter preferences | `owner_client_preferences` |

### Shared Routes

| Route | Tables Used |
|-------|-------------|
| `/messages` | `conversations`, `conversation_messages`, `profiles`, `matches` |
| `/notifications` | `notifications` |

---

## 2️⃣ SCHEMA ASSESSMENT

### **CRITICAL: Schema Deviation Detected**

The current schema **DOES NOT** match the canonical model specified.

#### Current `likes` Table (from types.ts):
```sql
likes (
  id UUID,
  user_id UUID,        -- liker
  target_id UUID,      -- liked listing (WRONG NAME per migration)
  direction TEXT,      -- 'left' | 'right'
  created_at TIMESTAMPTZ
)
```

#### Current `owner_likes` Table:
```sql
owner_likes (
  id UUID,
  owner_id UUID,
  client_id UUID,
  listing_id UUID NULL, -- optional context
  is_super_like BOOLEAN,
  direction TEXT,
  created_at TIMESTAMPTZ
)
```

### **BLOCKED: Schema Mismatch Between Migrations & TypeScript**

**Migration 20260120000000** renames `target_id` → `target_listing_id`, but:
- TypeScript types still show `target_id`
- Some hooks use `target_id` (useSwipeWithMatch.tsx:246)
- Other hooks use `target_listing_id` (useSwipe.tsx:56)

### Required Canonical Schema

```sql
-- OPTION 1: Keep separate tables (RECOMMENDED - minimal migration)

-- likes table (client → listing)
likes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,         -- client who liked
  target_listing_id UUID NOT NULL, -- listing liked
  created_at TIMESTAMPTZ,
  UNIQUE(user_id, target_listing_id)
)

-- owner_likes table (owner → client)
owner_likes (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL,
  client_id UUID NOT NULL,
  listing_id UUID NULL,          -- optional context
  is_super_like BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  UNIQUE(owner_id, client_id) WHERE listing_id IS NULL,
  UNIQUE(owner_id, client_id, listing_id) WHERE listing_id IS NOT NULL
)

-- matches table
matches (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  listing_id UUID NULL,
  is_mutual BOOLEAN DEFAULT true,
  client_liked_at TIMESTAMPTZ,
  owner_liked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'accepted',
  created_at TIMESTAMPTZ,
  UNIQUE(client_id, owner_id, listing_id)
)
```

---

## 3️⃣ SWIPE LOGIC ISSUES (CRITICAL)

### **Problem: Swiped Items Excluded in JavaScript, Not SQL**

**Location:** `src/hooks/useSmartMatching.tsx:531-541`

```typescript
// WRONG: Filtering happens AFTER fetch
filteredListings = filteredListings.filter(listing => {
  return !swipedListingIds.has(listing.id);
});
```

### **Required SQL Query (NOT Currently Implemented)**

```sql
-- This exclusion pattern is NOT in the current codebase!
SELECT * FROM listings
WHERE is_active = true
  AND status = 'active'
  AND owner_id != auth.uid()
  -- MISSING: Exclude already-liked listings at SQL level
  AND id NOT IN (
    SELECT target_listing_id
    FROM likes
    WHERE user_id = auth.uid()
  )
  -- MISSING: Exclude dismissed listings
  AND id NOT IN (
    SELECT target_id
    FROM swipe_dismissals
    WHERE user_id = auth.uid()
    AND target_type = 'listing'
  )
ORDER BY created_at DESC
LIMIT 20;
```

### **Current Behavior:**
1. Fetch ALL active listings (up to 20)
2. Fetch ALL user's likes
3. Fetch ALL user's dismissals
4. Filter in JavaScript

### **Why This Breaks:**
- Pagination returns SAME items on subsequent pages
- Race conditions cause duplicates
- Memory bloat with large datasets

---

## 4️⃣ FILTER ENFORCEMENT

### SQL-Enforced Filters ✅
- `category` (property/motorcycle/bicycle/worker)
- `listing_type` (rent/sale)
- `price_range` (gte/lte)
- `property_type` (in array)
- `beds` (gte)
- `baths` (gte)
- `pet_friendly` (eq)
- `furnished` (eq)
- `has_verified_documents` (eq)
- `owner_id != user.id` (exclude own)

### Frontend-Only Filters ❌ (VIOLATION)
- **Amenities matching** - filtered in JS after fetch
- **Premium tier filtering** - filtered in JS after fetch
- **Mock image filtering** - filtered in JS after fetch
- **Swiped exclusion** - filtered in JS after fetch

### **Fix Required:**
Move amenities filtering to SQL using `@>` (contains) operator:
```sql
WHERE amenities @> ARRAY['pool', 'gym']::text[]
```

---

## 5️⃣ DELETED DATA (GHOST FIX)

### **CRITICAL: No `deleted_at` Column Exists on Core Tables**

| Table | Has `deleted_at`? | Has `is_active`? |
|-------|-------------------|------------------|
| `profiles` | ❌ NO | ✅ YES |
| `listings` | ❌ NO | ✅ YES + `status` |
| `likes` | ❌ NO | ❌ NO |
| `owner_likes` | ❌ NO | ❌ NO |
| `conversations` | ✅ YES | ✅ YES |

### **Current Soft-Delete Patterns:**

1. **Profiles**: `is_active = false` OR `is_blocked = true` OR `is_suspended = true`
2. **Listings**: `is_active = false` OR `status != 'active'`
3. **Conversations**: `deleted_at IS NOT NULL`

### **Missing Filter in `useClientProfiles`:**
```typescript
// Current (missing is_active check)
.neq('id', user.id)
.eq('role', 'client')

// Should be
.neq('id', user.id)
.eq('role', 'client')
.or('is_active.is.null,is_active.eq.true')
```

---

## 6️⃣ RLS POLICIES

### Current Policies (Verified) ✅

**likes table:**
- Users can read their own likes: `auth.uid() = user_id`
- Users can insert likes: `auth.uid() = user_id AND is_user_active(auth.uid())`
- Users can delete their own likes
- Owners can see likes on their listings (via EXISTS join)

**owner_likes table:**
- Owners can read their own likes: `auth.uid() = owner_id`
- Owners can insert likes: `auth.uid() = owner_id AND is_user_active(auth.uid())`
- Clients can see who liked them: `auth.uid() = client_id`

**listings table:**
- Authenticated users can view active listings: `is_active = true AND status = 'active'`
- Owners can manage their own listings: `auth.uid() = owner_id`

### **Missing RLS Policies:**

```sql
-- 1. Enforce is_active on profile reads (MISSING)
CREATE POLICY "only_active_profiles_visible"
ON profiles FOR SELECT
USING (
  auth.uid() = id  -- Always see own profile
  OR (
    COALESCE(is_active, true) = true
    AND COALESCE(is_suspended, false) = false
    AND COALESCE(is_blocked, false) = false
  )
);

-- 2. Prevent reading deleted conversations (SHOULD EXIST)
CREATE POLICY "exclude_deleted_conversations"
ON conversations FOR SELECT
USING (
  deleted_at IS NULL
  AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
);
```

---

## 7️⃣ PERFORMANCE / CACHE / EGRESS

### Egress Analysis

**NOT a major issue.** Image handling is well-optimized:

| Component | Implementation | Risk |
|-----------|---------------|------|
| `AmbientSwipeBackground` | Uses local SVG placeholders | ✅ LOW |
| Image preloading | `requestIdleCallback`, priority tiers | ✅ LOW |
| Listing images | Paginated (20 per page), lazy-loaded | ✅ LOW |
| Profile images | Paginated, cached | ✅ LOW |

### **Recommendations:**

1. Add pagination to `useLikedProperties`:
```typescript
.range(0, 50) // Add limit
```

2. Ensure image URLs use Supabase CDN transform parameters:
```typescript
`${url}?width=400&quality=80`
```

---

## 8️⃣ REQUIRED FIXES

### SCHEMA FIX (Priority 1)

```sql
-- Verify current schema:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'likes';

-- If target_id exists, rename it:
ALTER TABLE likes RENAME COLUMN target_id TO target_listing_id;

-- Update constraint:
ALTER TABLE likes DROP CONSTRAINT IF EXISTS likes_user_id_target_id_key;
ALTER TABLE likes ADD CONSTRAINT likes_user_listing_unique UNIQUE (user_id, target_listing_id);

-- Regenerate TypeScript types
-- Run: npx supabase gen types typescript > src/integrations/supabase/types.ts
```

### CODE FIXES (Priority 2)

1. **`useSwipeWithMatch.tsx`** - Change `target_id` to `target_listing_id`
2. **`useClientProfiles.tsx`** - Add `is_active` filter
3. **`useSmartMatching.tsx`** - Move swipe exclusion to SQL

### RLS FIXES (Priority 3)

```sql
-- Add profile visibility policy
CREATE POLICY "only_active_profiles_visible"
ON profiles FOR SELECT
USING (
  auth.uid() = id
  OR (
    COALESCE(is_active, true) = true
    AND COALESCE(is_suspended, false) = false
    AND COALESCE(is_blocked, false) = false
  )
);
```

---

## ✅ SUCCESS CRITERIA STATUS

| Criteria | Status |
|----------|--------|
| Likes persist | ⚠️ PARTIAL - Schema mismatch causes failures |
| Swiped items never return | ❌ FAILS - Filtered in JS, not SQL |
| Filters always work | ⚠️ PARTIAL - Some are JS-only |
| Deleted users never appear | ⚠️ PARTIAL - Missing `is_active` checks |
| Owner/client data isolated | ✅ PASS - RLS properly configured |
| Supabase egress drops | ✅ PASS - No major issues found |

---

## ANTI-PATTERNS FOUND

| Anti-Pattern | Location | Fix |
|--------------|----------|-----|
| JS filtering after fetch | useSmartMatching:531-541 | Move to SQL |
| Mixed column names | useSwipeWithMatch vs useSwipe | Standardize on `target_listing_id` |
| Missing is_active check | useClientProfiles | Add filter |
| No pagination on likes | useLikedProperties | Add .range() |
| Stale TypeScript types | types.ts | Regenerate |
