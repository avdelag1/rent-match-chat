
# Database & Filter System Fix Plan

## Overview
This plan addresses three key issues:
1. **Build Errors** - TypeScript type mismatches in `useNotificationSystem.tsx` and `useSmartMatching.tsx`
2. **Unused Tables** - Numerous database tables with zero records that may no longer be needed
3. **Filter Persistence** - Ensuring filters are properly saved and retrieved from the database

---

## Part 1: Fix Build Errors (Critical)

### Error 1: useNotificationSystem.tsx Type Mismatch

**Problem**: The `DBNotification` interface expects columns (`notification_type`, `title`, `is_read`) that don't exist in the actual `notifications` table.

**Actual table schema**:
```
id (uuid)
user_id (uuid)
type (text)      ← Not "notification_type"
message (text)
read (boolean)   ← Not "is_read"
created_at (timestamp)
```

**Fix**: Update the `DBNotification` interface and mapping logic to match the actual database schema:
- Change `notification_type` to `type`
- Change `is_read` to `read`
- Make `title` optional or derive from `type`

### Error 2: useSmartMatching.tsx Type Comparisons (Lines 1315, 1319, 1322)

**Problem**: Comparing `MatchedClientProfile.id` (type `number`) with `userId` (type `string`).

The `MatchedClientProfile` interface has:
- `id: number` (from client_profiles table)
- `user_id: string` (UUID reference)

The code incorrectly compares `p.id === userId` when it should only compare `p.user_id === userId`.

**Fix**: Remove comparisons involving `p.id` and only use `p.user_id`:
```typescript
// Line 1315: Change from
const hasOwnProfile = sortedClients.some(p => p.id === userId || p.user_id === userId);
// To
const hasOwnProfile = sortedClients.some(p => p.user_id === userId);

// Similar fixes for lines 1319 and 1322
```

---

## Part 2: Database Cleanup - Unused Tables

Based on the database analysis, the following tables have **zero rows** and appear unused. They fall into categories:

### Category A: Potentially Removable (Zero Data, No Active Usage)

| Table | Purpose | Recommendation |
|-------|---------|----------------|
| `channel_participants` | Legacy messaging | Remove (uses `conversations` now) |
| `communication_channels` | Legacy messaging | Remove |
| `mfa_methods` | Multi-factor auth | Remove (not implemented) |
| `user_authentication_methods` | Auth methods | Remove |
| `messages` | Legacy direct messages | Remove (uses `conversation_messages`) |
| `match_conversations` | Legacy matching | Remove |
| `swipes` | Old swipe system | Remove (uses `likes` table now) |
| `user_likes` | Duplicate of `likes` | Remove |
| `favorites` | Duplicate of `likes` | Consider removing |

### Category B: Keep but Monitor (Infrastructure Tables)

| Table | Purpose | Status |
|-------|---------|--------|
| `rate_limit_log` | Security | Keep - needed for rate limiting |
| `security_audit_log` | Security | Keep - audit trail |
| `security_event_logs` | Security | Keep - security monitoring |
| `notifications` | Notifications | Keep - schema needs fixing (see Part 1) |
| `admin_*` tables | Admin system | Keep - for future admin panel |

### Category C: Feature Tables (Keep, Need Data)

| Table | Purpose | Status |
|-------|---------|--------|
| `saved_filters` | User filter preferences | Keep - 2 rows, working |
| `client_filter_preferences` | Detailed client filters | Keep - needs data flow fix |
| `owner_client_preferences` | Owner filter settings | Keep - needs data flow fix |
| `saved_searches` | Saved search criteria | Keep - not being used yet |

---

## Part 3: Filter System Data Flow Fix

The current filter system has a disconnect between the UI and database persistence.

### Current Architecture
```
UI State (Zustand filterStore)
     ↓ (immediate)
Swipe Deck Display
     
saved_filters table ← Not connected to filterStore!
```

### Required Architecture
```
UI State (Zustand filterStore)
     ↓ (immediate)
Swipe Deck Display
     ↓ (background sync)
saved_filters table (persistence)
     ↑ (on mount)
Restore from DB
```

### Implementation Steps

1. **Add Database Sync to FilterStore**
   - Create a `persistFilters` action in `filterStore.ts`
   - On filter change, debounce and save to `saved_filters` table
   - On app mount, load active filter from database

2. **Fix useSavedFilters Hook**
   - Currently works but not connected to the central store
   - Add integration with `useFilterStore`

3. **Ensure Filter Tables Have Correct RLS**
   - `saved_filters`: User can only read/write their own rows
   - `client_filter_preferences`: User can only read/write their own rows
   - `owner_client_preferences`: User can only read/write their own rows

---

## Part 4: Notifications Table Schema Fix

The `notifications` table schema doesn't match what the code expects. Two options:

### Option A: Update Code (Recommended)
Modify `useNotificationSystem.tsx` to work with current schema:
- Map `type` to notification category
- Generate `title` from `type`
- Use `read` instead of `is_read`

### Option B: Update Database
Add missing columns via migration:
- Add `title` column (text, nullable)
- Add `notification_type` column (or rename `type`)
- Rename `read` to `is_read`

**Recommendation**: Option A is safer and faster.

---

## Implementation Order

1. **Fix Build Errors** (Immediate - unblocks development)
   - Fix `useNotificationSystem.tsx` interface
   - Fix `useSmartMatching.tsx` comparisons

2. **Filter Persistence** (High Priority)
   - Add database sync to filterStore
   - Connect useSavedFilters to central store
   - Test filter save/load cycle

3. **Database Cleanup** (After confirming no dependencies)
   - Create migration to drop unused tables
   - Run only after thorough testing

---

## Technical Details

### File Changes Required

| File | Changes |
|------|---------|
| `src/hooks/useNotificationSystem.tsx` | Update DBNotification interface to match DB schema |
| `src/hooks/useSmartMatching.tsx` | Fix type comparisons (3 locations) |
| `src/state/filterStore.ts` | Add persistence actions and on-mount loading |
| `src/hooks/useSavedFilters.ts` | Integrate with filterStore |

### Database Operations

**Check RLS Policies**:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('saved_filters', 'client_filter_preferences', 'owner_client_preferences');
```

**Tables to Drop** (Phase 2, after confirmation):
- `channel_participants`
- `communication_channels`
- `mfa_methods`
- `messages`
- `match_conversations`
- `swipes`
- `user_likes`
- `user_authentication_methods`

---

## Risk Assessment

| Change | Risk | Mitigation |
|--------|------|------------|
| Type fixes | Low | Straightforward interface updates |
| Filter persistence | Medium | Test with real user scenarios |
| Table drops | High | Create backup migrations, test thoroughly |

---

## Summary

This plan will:
1. Fix the 4 build errors immediately
2. Ensure filters persist to the database correctly
3. Identify 8+ unused tables for potential cleanup
4. Improve the notifications system reliability
