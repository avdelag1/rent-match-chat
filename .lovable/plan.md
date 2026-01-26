
## Goal
Make filters “always work” (client + owner) and make TopBar/BottomNavigation hide-on-scroll work permanently (never “stops after a while”).

This will be done by removing duplicated filter state, fixing category naming mismatches, ensuring filter preference rows actually exist in Supabase, and making the scroll listener re-bind reliably even if the scroll container changes.

---

## What I found (root causes)

### A) Quick filter “not working” is mostly a data-flow + naming problem
1) **Two different filter sources exist**:
- `DashboardLayout` maintains **local** `quickFilters` state and passes it to `TopBar` → `QuickFilterDropdown`.
- Separately, the app has a **global** Zustand filter store (`src/state/filterStore.ts`) and DB persistence (`useFilterPersistence`), but **DashboardLayout’s quick filters are not using the store**.

Result: filters can appear to “randomly” not apply after navigations / mode switches / restores, because the UI is changing one state while the swipe queries use another.

2) **Category naming mismatch** (critical bug):
- The unified app type says **motorcycle** (never “moto”) (`src/types/filters.ts`).
- `ClientFilters.tsx` uses local category id `'moto'` and then does:
  `setStoreCategory(activeCategory as QuickFilterCategory)`
  which means it can write invalid category values into the store.

This can break downstream logic and make quick category switching look broken.

3) **Owner category filtering is logically inconsistent with DB fields**
- Owner quick category switching relies on checking `profile.preferred_listing_type?.includes('moto')` etc.
- In your DB, `profiles.preferred_listing_type` is **text**, and current data shows it’s mostly `'rent'`, not `'moto'`/`'bicycle'`.
So even if the UI changes category, the filtering logic can’t match.

### B) Your “client/owner advanced filters” tables exist, but have no rows
In Test DB right now:
- `client_filter_preferences`: 0 rows
- `owner_client_preferences`: 0 rows
So “filters” can’t persist and matching logic that expects these preferences will behave like “no preferences set”.

`saved_filters` has 2 rows, but that’s mostly “preset storage”, not the detailed per-category preferences you want.

### C) Hide-on-scroll stops working because the listener may be attached to the wrong scroll container over time
`useScrollDirection` attaches to a target once (with limited retries). If your active scrolling ends up happening in a different container later (nested scroll areas, dialogs, pages with their own scroll regions), the bars won’t respond.

Even though you added baseline fixes, the “stop after a while” symptom strongly suggests **the listener is no longer observing the actual container that is being scrolled**.

---

## Implementation plan (what I will change)

### 1) Unify quick filters into ONE source of truth (Zustand filter store)
**Objective:** Top quick filters always immediately affect the swipe deck queries.

**Changes:**
- Update `DashboardLayout.tsx` to **stop storing its own `quickFilters` state**.
- Replace it with values read from `useFilterStore()`:
  - categories, listingType (client)
  - clientGender, clientType (owner)
- `TopBar.tsx` will no longer receive `filters`/`onFiltersChange` from local state.
  Instead, `TopBar` (and `QuickFilterDropdown`) will dispatch store actions:
  - `setCategories`, `setListingType`, `setClientGender`, `setClientType`, `reset...`

**Outcome:**
- When you tap quick filter chips/dropdown, it updates the store immediately.
- `useFilterPersistence` already listens to the store → it will persist correctly.

---

### 2) Fix category naming everywhere (eliminate “moto” in UI state)
**Objective:** No invalid category values get written anywhere.

**Changes:**
- `src/pages/ClientFilters.tsx`
  - Change the local category type from `'moto'` to `'motorcycle'`
  - Update the categories array and UI labels accordingly
  - Ensure `setStoreCategory(...)` receives a valid `QuickFilterCategory` every time
- Check owner-side “category” handling too:
  - Standardize to: `property | motorcycle | bicycle | services`
  - Ensure DB mapping is consistently applied only where needed (`services` → `worker` for listings table only)

**Outcome:**
- Quick category switching won’t silently fail due to mismatched strings.

---

### 3) Make owner-side category filtering actually work (based on real DB fields)
**Objective:** When owner switches category, it really shows clients interested in that category.

Given current DB reality:
- `profiles.preferred_listing_type` is text like `'rent'`, not category-coded.

**Implementation approach (robust, minimal schema dependency):**
- Use `client_filter_preferences` as the source for what categories a client wants (it has booleans like `interested_in_properties`, `interested_in_motorcycles`, `interested_in_bicycles`, etc.).
- Update `useSmartClientMatching` to filter clients by:
  - join/lookup client preferences (via a second query or a view) OR
  - use existing columns in `profiles` if you already store category interests there (we’ll confirm in code and use the reliable one)

**Note:** If we need a performant single-query approach, we can add a lightweight view (security_invoker) that exposes: client_id + category_interest flags.

**Outcome:**
- Owner category quick filter becomes deterministic and based on real data.

---

### 4) Ensure preference rows exist so “filters” persist and apply
**Objective:** The first time a user uses filters, the DB will have the needed rows.

**Client side:**
- When user opens/uses client filters, do an **upsert** to `client_filter_preferences` to ensure a row exists for that user.

**Owner side:**
- When owner opens/uses owner filters, do an **upsert** to `owner_client_preferences`.

This can be done purely in application code (no schema change required).

**Outcome:**
- Your tables won’t be empty; filtering/matching logic can depend on them.

---

### 5) Make quick filter switching show a correct “empty results” state (instead of “broken”)
Right now your DB has only 2 active listings, both `category='property'`. So switching to bicycle/motorcycle/services should show 0 results.

**Changes:**
- Ensure `TinderentSwipeContainer` reset flow immediately clears cards and shows the “All caught up / No results” state.
- Add user-friendly message like:
  “No results in Bicycle yet. Try Property or create your first Bicycle listing.”

**Outcome:**
- Users won’t interpret “no results” as “quick filter not working”.

---

### 6) Make hide-on-scroll permanent (never stops)
**Objective:** TopBar + BottomNavigation always hide on scroll down and return on scroll up, forever.

**Fix strategy:**
- Change `useScrollDirection` so it:
  1) Attaches to the current scroll container
  2) Detects if the container changed later (DOM replaced, route swap, overlay, etc.)
  3) Automatically detaches + re-attaches
- Also widen the behavior so it works even when the user is scrolling inside a nested scroll container:
  - Listen in capture phase on `document` for scroll events, or
  - Use a small rebind loop that always tracks `#dashboard-scroll-container` if present.

**Outcome:**
- Even if the scrollable element changes, the bars keep working.

---

### 7) Verification checklist (what I’ll test after implementing)
1) `/client/dashboard`
   - Tap quick filter categories repeatedly: property → bicycle → motorcycle → services
   - Confirm deck resets instantly and shows correct empty states
2) `/owner/dashboard`
   - Confirm you never see yourself (even if deck restored from cache before auth was ready)
   - Switch quick filters and confirm it triggers deck reset and correct results
3) Scroll behavior
   - Scroll down inside dashboard → bars hide
   - Scroll up → bars show
   - Navigate to another dashboard page and back → still works
   - Scroll inside a nested scroll view (where applicable) → still works

---

## Files I expect to change (high level)
- `src/components/DashboardLayout.tsx` (remove local quickFilters, use store, build combinedFilters from store)
- `src/components/TopBar.tsx` (wire QuickFilterDropdown to store actions)
- `src/components/QuickFilterDropdown.tsx` (dispatch store actions; remove reliance on passed `filters` object if we fully centralize)
- `src/pages/ClientFilters.tsx` (replace `'moto'` with `'motorcycle'`, store-safe category)
- `src/hooks/useSmartMatching.tsx` (owner-side category filtering logic based on real data)
- `src/hooks/useScrollDirection.tsx` (auto rebind to scroll container / capture nested scrolls)
- Potential small updates to filter-related pages/components to ensure preference rows are created (upserts)

---

## Supabase tables/policies status (what’s already OK, what’s missing)
- RLS policies exist for `saved_filters`, `client_filter_preferences`, `owner_client_preferences`.
- The big missing piece is: **the app isn’t writing rows**, so the tables are empty and filtering can’t work “for real”.

We’ll fix that in code first (no schema changes required).

---

## If you want me to continue
Next request should be: “Continue and implement the filter + quick filter fixes and the permanent hide-on-scroll fix.”