
# Fix Plan: New Signups, Swipe Actions, Filters, and Likes System

## Summary of Root Issues Found

After deep exploration, I've identified **five major issues** blocking functionality:

### Issue 1: Database Schema Mismatch for Listings
The `listings` table in the live database is **missing 55+ columns** required for non-property categories (motorcycles, bicycles, workers). The migration file defines 80+ columns, but the actual table only has 25 columns.

- **Missing columns include**: `vehicle_brand`, `vehicle_model`, `mileage`, `engine_cc`, `motorcycle_type`, `bicycle_type`, `frame_size`, `service_category`, `experience_years`, `worker_skills`, `is_active`, `mode`, `currency`, and many more.
- **Impact**: Users cannot create listings for motorcycles, bicycles, or workers because the frontend attempts to write to non-existent columns.

### Issue 2: Direction Value Mismatch in Likes Table
The database has a `CHECK` constraint requiring `direction IN ('left', 'right')`, but **parts of the code inconsistently use `'like'` or `'dismiss'`**:

- **What's in DB now**: All 18 like records use `direction: 'right'`
- **Query Mismatches**:
  - `useLikedProperties.tsx:38` queries `direction = 'right'` ✅
  - `LikedClients.tsx:135` queries `direction = 'like'` ❌ (will return 0 rows)
  - `useOwnerInterestedClients.tsx:71` queries `direction = 'like'` ❌
  - `SwipeQueue.ts:197` inserts `'like'`/`'dismiss'` ❌ (constraint violation)
  - `offlineSwipeQueue.ts:119` inserts `'like'`/`'dismiss'` ❌
  - `useSwipeWithMatch.tsx:129` inserts `'like'` ❌
  - `useSwipe.tsx:39` inserts `'left'`/`'right'` directly ✅

### Issue 3: No Test Data (Zero Listings, One Profile)
Based on your answers and database queries:
- **Profiles**: 1 user (client role)
- **Listings**: 0 rows
- **Likes**: 18 rows (16 pointing to non-existent profiles, 2 to non-existent listings)

Without at least one owner account with listings and one client account, the swipe and likes systems cannot be tested.

### Issue 4: Undo Button Not Working
The `recordSwipe` function is **never called** in swipe containers:
- `TinderentSwipeContainer.tsx:812-839` - handles swipes but doesn't call `recordSwipe`
- `ClientSwipeContainer.tsx:388-410` - same issue
- Result: `canUndo` is always `false`

Additionally, `useSwipeUndo.tsx:103` hardcodes `'property'` category instead of using the dynamic category.

### Issue 5: Orphaned Like Records
18 like records exist but point to profiles/listings that don't exist:
- 16 profile likes → non-existent profiles
- 2 listing likes → non-existent listings

---

## Implementation Plan

### Phase 1: Database Schema Migration
Create migration to add all missing columns to `listings` table.

**File**: New migration `supabase/migrations/20260131_add_missing_listing_columns.sql`

```text
Add columns:
- Vehicle: vehicle_brand, vehicle_model, vehicle_condition, year, mileage, 
  engine_cc, fuel_type, transmission_type, color, motorcycle_type, vehicle_type
- Bicycle: bicycle_type, frame_size, frame_material, number_of_gears, 
  suspension_type, brake_type, wheel_size, electric_assist, battery_range,
  includes_lock, includes_lights, includes_basket, includes_pump
- Motorcycle features: has_abs, has_traction_control, has_heated_grips,
  has_luggage_rack, includes_helmet, includes_gear, license_required
- Worker: service_category, custom_service_name, work_type, schedule_type,
  days_available, time_slots_available, experience_level, experience_years,
  worker_skills, certifications, tools_equipment, minimum_booking_hours,
  offers_emergency_service, background_check_verified, insurance_verified
- Core: is_active, mode, currency, rental_rates, rental_duration_type,
  pricing_unit, state, country, location_type, service_radius_km
```

### Phase 2: Fix Direction Value Consistency
Standardize all code to use `'left'`/`'right'` (matching the database constraint).

**Files to modify**:

1. `src/components/LikedClients.tsx` (line 135)
   - Change: `.eq('direction', 'like')` → `.eq('direction', 'right')`

2. `src/hooks/useOwnerInterestedClients.tsx` (line 71)
   - Change: `.eq('direction', 'like')` → `.eq('direction', 'right')`

3. `src/lib/swipe/SwipeQueue.ts` (line 197)
   - Change: `const dbDirection = swipe.direction === 'right' ? 'like' : 'dismiss';`
   - To: `const dbDirection = swipe.direction;` (pass through directly)

4. `src/utils/offlineSwipeQueue.ts` (line 119)
   - Same fix as SwipeQueue.ts

5. `src/hooks/useSwipeWithMatch.tsx` (lines 129, 221, 244)
   - Change: `direction: 'like'` → `direction: 'right'`
   - Change: `direction: 'dismiss'` → `direction: 'left'`

6. `src/hooks/useSwipeDismissal.tsx` (lines 43, 81)
   - Change: `.eq('direction', 'dismiss')` → `.eq('direction', 'left')`
   - Change: `direction: 'dismiss'` → `direction: 'left'`

### Phase 3: Fix Undo Functionality

**Files to modify**:

1. `src/components/TinderentSwipeContainer.tsx`
   - In `handleSwipe` (around line 820): Add `recordSwipe(listing.id, 'listing', direction);` after haptic feedback

2. `src/components/ClientSwipeContainer.tsx`
   - In `handleSwipe` (around line 525): Add `recordSwipe(profile.user_id, 'profile', direction, category);` after haptic feedback

3. `src/hooks/useSwipeUndo.tsx` (line 103)
   - Change: `undoOwnerSwipe('property');`
   - To: `undoOwnerSwipe(swiped.category || 'default');`

### Phase 4: Clean Up Orphaned Likes
Run a one-time data cleanup to remove likes pointing to non-existent targets.

**SQL** (via insert tool):
```sql
DELETE FROM public.likes 
WHERE (target_type = 'profile' AND target_id NOT IN (SELECT id FROM public.profiles))
   OR (target_type = 'listing' AND target_id NOT IN (SELECT id FROM public.listings));
```

---

## Technical Details

### Database CHECK Constraint
```sql
-- Current constraint on likes.direction:
CHECK ((direction = ANY (ARRAY['left'::text, 'right'::text])))
```
Any insert with `'like'` or `'dismiss'` will fail silently or throw constraint errors.

### Filter System Status
The filter system (`filterStore.ts`, `ClientFilters.tsx`, `OwnerFilters.tsx`) is correctly implemented. It updates Zustand state and invalidates React Query caches. No changes needed—filters will work once there's data to filter.

### Auth/Signup Flow Status
The signup flow is correctly implemented:
- `useAuth.tsx` calls `supabase.auth.signUp`
- `useProfileSetup.tsx` creates profile and role via `upsert_user_role` RPC
- Database triggers (`handle_new_user`, `hook_create_profile_on_signup`) exist as fallbacks
- Profiles are created with `onboarding_completed: true` and `is_active: true`

No changes needed to signup flow.

---

## Testing Requirements

After implementation:
1. Create a new owner account and verify redirect to owner dashboard
2. Create a listing in each category (property, motorcycle, bicycle, worker)
3. Create a new client account
4. Swipe right on listings as client → verify appears in Client Liked Properties
5. Swipe right on client profile as owner → verify appears in Owner Liked Clients
6. Test undo button after left swipe → verify card returns
7. Apply filters and verify deck updates

---

## Files Changed Summary

| File | Change Type |
|------|-------------|
| `supabase/migrations/20260131_*.sql` | New migration |
| `src/components/LikedClients.tsx` | Fix direction query |
| `src/hooks/useOwnerInterestedClients.tsx` | Fix direction query |
| `src/lib/swipe/SwipeQueue.ts` | Fix direction mapping |
| `src/utils/offlineSwipeQueue.ts` | Fix direction mapping |
| `src/hooks/useSwipeWithMatch.tsx` | Fix direction inserts |
| `src/hooks/useSwipeDismissal.tsx` | Fix direction query & insert |
| `src/components/TinderentSwipeContainer.tsx` | Add recordSwipe call |
| `src/components/ClientSwipeContainer.tsx` | Add recordSwipe call |
| `src/hooks/useSwipeUndo.tsx` | Fix hardcoded category |
