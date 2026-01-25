# Supabase Backend Activation Guide

This guide walks you through activating all backend features after running the verification audit.

## Prerequisites

1. Run `SUPABASE_COMPREHENSIVE_AUDIT.sql` in Supabase SQL Editor
2. Review all ❌ items and fix them before proceeding

---

## Step 1: Verify Current State

Run in Supabase SQL Editor:
```sql
-- Check if rating system is deployed
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'ratings'
) as ratings_deployed;
```

---

## Step 2: Deploy Rating System (if not deployed)

If the rating system shows ❌ NOT DEPLOYED in the audit:

1. Go to Supabase Dashboard → SQL Editor
2. Open `supabase/migrations/20260124_comprehensive_rating_system.sql`
3. Run the entire script

**After deployment**, regenerate TypeScript types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

---

## Step 3: Enable Rating Hooks in Code

After confirming the rating tables exist, update the hooks:

### File: `src/hooks/useRatingSystem.tsx`

Find all instances of:
```typescript
enabled: false, // Disabled until tables exist
```

Change to:
```typescript
enabled: true,
```

And update the queryFn implementations to actually query the database.

**Important**: The hooks file has been designed with placeholder implementations. Once tables exist, the actual implementation should be:

```typescript
// Example for useRatingCategories
export function useRatingCategories() {
  return useQuery({
    queryKey: ['rating-categories'],
    queryFn: async (): Promise<RatingCategory[]> => {
      const { data, error } = await supabase
        .from('rating_categories')
        .select('*');

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    enabled: true, // NOW ENABLED
  });
}
```

---

## Step 4: Apply Performance Indexes

Run in SQL Editor:
```sql
-- Verify and create missing indexes
-- These improve swipe/search performance significantly

-- Listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_category
ON listings(category) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_listings_status
ON listings(status);

CREATE INDEX IF NOT EXISTS idx_listings_location
ON listings USING gist (
  ll_to_earth(
    CAST(location->>'latitude' AS DOUBLE PRECISION),
    CAST(location->>'longitude' AS DOUBLE PRECISION)
  )
);

-- Price index for filtering
CREATE INDEX IF NOT EXISTS idx_listings_price
ON listings(price) WHERE status = 'active';
```

---

## Step 5: Verify RLS Policies Are Complete

Every table should have SELECT, INSERT, UPDATE policies at minimum.

Run the audit script Section 2 to verify coverage:
- `profiles` - SELECT, INSERT, UPDATE
- `listings` - SELECT, INSERT, UPDATE, DELETE
- `conversations` - SELECT, INSERT, UPDATE
- `conversation_messages` - SELECT, INSERT
- `swipes` - SELECT, INSERT, UPDATE
- `matches` - SELECT, INSERT, UPDATE
- `likes` - SELECT, INSERT, UPDATE, DELETE
- `notifications` - SELECT, INSERT, UPDATE

---

## Step 6: Test Realtime Subscriptions

After the code fixes are deployed, verify realtime works:

1. Open browser DevTools → Network → WS tab
2. Look for a single WebSocket connection to Supabase
3. Send a test message in the app
4. Verify only ONE WebSocket message per event (not multiple duplicates)

---

## Troubleshooting

### "Rating system is pending database migration" error
- Run the rating system migration from Step 2
- Regenerate TypeScript types

### UI still flickering after fixes
- Clear browser cache
- Check DevTools console for duplicate subscription warnings
- Verify NotificationSystem component is NOT rendered in DashboardLayout

### RLS blocking legitimate access
- Check Supabase Dashboard → Authentication → Users
- Verify user has correct role in `user_roles` table
- Check policy conditions in `pg_policies`

---

## What Was Fixed

### Realtime Subscription Issues
1. **Created centralized manager**: `src/lib/realtimeManager.ts`
2. **Removed duplicate NotificationSystem** from DashboardLayout
3. **Fixed cleanup methods**: Changed `.removeChannel()` to `.unsubscribe()` in:
   - `src/components/NotificationSystem.tsx`
   - `src/hooks/useMarkMessagesAsRead.tsx`

### Files Modified
- `src/components/DashboardLayout.tsx` - Removed duplicate NotificationSystem
- `src/components/NotificationSystem.tsx` - Fixed cleanup
- `src/hooks/useMarkMessagesAsRead.tsx` - Fixed cleanup
- `src/lib/realtimeManager.ts` - New centralized manager (optional use)

### Files Created
- `SUPABASE_COMPREHENSIVE_AUDIT.sql` - Full backend audit script
- `SUPABASE_ACTIVATION_GUIDE.md` - This guide

---

## Architecture Notes

### Current Notification Flow (After Fix)
```
App.tsx
  └── NotificationWrapper (useNotifications hook)
        └── Single global channel for conversation_messages INSERT
        └── Toast + Browser notifications

DashboardLayout.tsx
  └── NO notification subscriptions (removed duplicate)
```

### Rating System Architecture (Once Deployed)
```
rating_categories (static)
  └── Defines questions per category

ratings (user-submitted)
  └── Individual reviews with category scores
  └── Temporal decay calculated on write

rating_aggregates (pre-calculated)
  └── Auto-updated by trigger
  └── Shown on swipe cards
  └── Confidence-weighted rating
```

---

## Next Steps After Activation

1. **Move sensitive logic to Edge Functions**:
   - Create review (prevents rating without interaction)
   - Close deal (state transitions)
   - Dispute resolution

2. **Add rate limiting**:
   - Max ratings per user per day
   - API call throttling

3. **Add message encryption** (optional):
   - End-to-end encryption for DMs
   - Key exchange via realtime
