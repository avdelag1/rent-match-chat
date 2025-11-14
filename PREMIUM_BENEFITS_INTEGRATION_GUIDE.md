# Premium Benefits Integration Guide

This guide explains how to use and enforce the premium benefits system in your application.

## Overview

When users purchase premium packages, the following benefits are now activated:
- **Monthly message limits** - Control how many messages users can send per month
- **Visibility ranking** - Premium users appear higher in search/browse results
- **Profile badges** - Display premium tier badges on profiles
- **Feature access control** - Restrict features based on subscription tier

---

## Key Hooks

### 1. `useMonthlySubscriptionBenefits()`

Returns all subscription benefits for the current user.

```tsx
import { useMonthlySubscriptionBenefits } from '@/hooks/useMonthlySubscriptionBenefits';

function MyComponent() {
  const benefits = useMonthlySubscriptionBenefits();

  return (
    <div>
      <p>Plan: {benefits.planName}</p>
      <p>Tier: {benefits.tier}</p>
      <p>Messages remaining: {benefits.messagesRemainingThisMonth}</p>
      <p>Visibility: {benefits.visibilityPercentage}%</p>
      <p>Can send message: {benefits.canSendMessage}</p>
      <p>Can see likes: {benefits.canSeeLikes}</p>
      <p>Max properties: {benefits.maxProperties}</p>
    </div>
  );
}
```

**Available benefits:**
- `planName` - The subscription plan name
- `tier` - Subscription tier (free, basic, premium, premium_plus, unlimited)
- `isMonthly` - Whether subscription is monthly
- `isActive` - Whether subscription is currently active
- `messageLimit` - Maximum messages per month
- `messagesUsedThisMonth` - Messages used so far
- `messagesRemainingThisMonth` - Messages remaining
- `canSendMessage` - Whether user can send a message now
- `visibilityPercentage` - How visible profile is (0-100%)
- `isVisible` - Whether profile is visible to others
- `isPremium` - Is premium or higher
- `isVIP` - Is unlimited tier
- `canSeeLikes` - Can see who liked them
- `hasAdvancedFilters` - Access to advanced filters
- `hasSuperLikes` - Can send super likes
- `hasPropertyBoost` - Can boost properties
- `maxProperties` - Max property listings (for owners)

---

### 2. `useMonthlyMessageLimits()`

Returns only message limit enforcement data.

```tsx
import { useMonthlyMessageLimits } from '@/hooks/useMonthlyMessageLimits';

function MessagingComponent() {
  const { canSendMessage, messagesRemaining, isAtLimit, limitPercentage } = useMonthlyMessageLimits();

  if (!canSendMessage && isAtLimit) {
    return <div>You've reached your monthly message limit</div>;
  }

  return (
    <div>
      <progress value={limitPercentage} max="100" />
      <p>{messagesRemaining} messages remaining</p>
    </div>
  );
}
```

---

### 3. `useVisibilityRanking()`

Returns visibility scoring and ranking utilities.

```tsx
import { useVisibilityRanking } from '@/hooks/useVisibilityRanking';

function SearchResults() {
  const { sortByVisibility, isVisible, getVisibilityConfig } = useVisibilityRanking();

  // Sort results by visibility
  const sortedResults = sortByVisibility(users);

  // Filter visible users only
  const visibleUsers = users.filter(u => isVisible(u.tier));

  // Get visibility info
  const config = getVisibilityConfig('premium');
  // config = { rank: 3, percentage: 50 }

  return <div>Results sorted by visibility</div>;
}
```

---

## UI Components

### 1. `PremiumProfileBadge`

Display premium tier badge on profiles.

```tsx
import { PremiumProfileBadge } from '@/components/PremiumProfileBadge';

function ProfileCard({ userTier }) {
  return (
    <div>
      <h2>User Name</h2>
      <PremiumProfileBadge tier={userTier} />
    </div>
  );
}
```

**Props:**
- `tier` - Subscription tier
- `showText` - Show badge text (default: true)
- `size` - Badge size: 'sm' | 'md' | 'lg' (default: 'md')

---

### 2. `MonthlyMessageLimitIndicator`

Show message limit progress bar in dashboards.

```tsx
import { MonthlyMessageLimitIndicator } from '@/components/MonthlyMessageLimitIndicator';

function Dashboard() {
  return (
    <div>
      <MonthlyMessageLimitIndicator />
    </div>
  );
}
```

**Props:**
- `showIfNoLimit` - Show even if no limit (default: false)

---

## Integration Examples

### Example 1: Restrict Message Sending

```tsx
import { useMonthlyMessageLimits } from '@/hooks/useMonthlyMessageLimits';

function MessageInput() {
  const { canSendMessage, isAtLimit } = useMonthlyMessageLimits();

  return (
    <div>
      <textarea placeholder="Type message..." disabled={!canSendMessage} />
      <button disabled={!canSendMessage}>Send</button>

      {isAtLimit && (
        <p className="text-red-500">Monthly limit reached. Upgrade to send more.</p>
      )}
    </div>
  );
}
```

### Example 2: Show Different Features by Tier

```tsx
import { useMonthlySubscriptionBenefits } from '@/hooks/useMonthlySubscriptionBenefits';

function AdvancedFilters() {
  const { hasAdvancedFilters } = useMonthlySubscriptionBenefits();

  if (!hasAdvancedFilters) {
    return <div>Upgrade to Premium to access advanced filters</div>;
  }

  return <FiltersComponent />;
}
```

### Example 3: Sort Search Results by Visibility

```tsx
import { useVisibilityRanking } from '@/hooks/useVisibilityRanking';
import { useQuery } from '@tanstack/react-query';

function SearchProfiles() {
  const { sortByVisibility } = useVisibilityRanking();

  const { data: users = [] } = useQuery({
    queryKey: ['search-profiles'],
    queryFn: async () => {
      // Fetch users from database
      const { data } = await supabase
        .from('profiles')
        .select(`*, user_subscriptions(*, subscription_packages(*))`)
        .order('created_at', { ascending: false });
      return data;
    },
  });

  const sortedUsers = sortByVisibility(
    users.map(u => ({
      ...u,
      tier: u.user_subscriptions?.[0]?.subscription_packages?.tier,
    }))
  );

  return (
    <div>
      {sortedUsers.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Example 4: Display Profile Visibility Indicator

```tsx
import { useMonthlySubscriptionBenefits } from '@/hooks/useMonthlySubscriptionBenefits';
import { PremiumProfileBadge } from '@/components/PremiumProfileBadge';

function ProfileHeader({ userTier, visibilityPercentage }) {
  const { tier } = useMonthlySubscriptionBenefits();

  return (
    <div>
      <PremiumProfileBadge tier={userTier} size="lg" />
      <p>Your profile is visible to {visibilityPercentage}% of users</p>
      {visibilityPercentage === 0 && (
        <button onClick={() => navigate('/premium')}>Upgrade for visibility</button>
      )}
    </div>
  );
}
```

### Example 5: Property Listing Limits (for Owners)

```tsx
import { useMonthlySubscriptionBenefits } from '@/hooks/useMonthlySubscriptionBenefits';

function PropertyManager() {
  const { maxProperties, activeProperties } = useMonthlySubscriptionBenefits();
  const canAddMore = activeProperties < maxProperties;

  return (
    <div>
      <p>Properties: {activeProperties}/{maxProperties}</p>

      {!canAddMore && (
        <div>You've reached your property limit. Upgrade to add more.</div>
      )}

      <button disabled={!canAddMore}>+ Add Property</button>
    </div>
  );
}
```

---

## Database Schema

When a user purchases a premium package:

1. **`user_subscriptions`** record is created:
   ```
   - user_id: User ID
   - subscription_package_id: Package ID
   - payment_status: 'paid'
   - is_active: true
   ```

2. **`message_activations`** record is created:
   ```
   - user_id: User ID
   - activation_type: 'monthly_subscription'
   - total_activations: Number based on tier
   - remaining_activations: Same as total initially
   - reset_date: 1st of next month
   ```

3. **`legal_document_quota`** is updated (if applicable):
   ```
   - monthly_limit: Based on package
   - used_this_month: 0
   - reset_date: 1st of next month
   ```

---

## Tier Benefits Summary

| Tier | Messages/Mo | Visibility | Sees Likes | Super Likes | Filters | Properties |
|------|-------------|------------|-----------|-----------|---------|-----------|
| Free | 0 | 0% | ❌ | ❌ | ❌ | 0-3 |
| Basic | 6-8 | 25% | ✓ | ✓ | ❌ | 2-5 |
| Premium | 12-15 | 50% | ✓ | ✓ | ✓ | 5-10 |
| Premium+ | 20 | 80% | ✓ | ✓ | ✓ | 10+ |
| Unlimited | 30+ | 100% | ✓ | ✓ | ✓ | ∞ |

---

## Payment Flow

1. User clicks "Buy Now" on a package
2. System stores selection to localStorage
3. User is redirected to PayPal
4. After payment, user lands on `/payment-success`
5. PaymentSuccess component:
   - Fetches the stored purchase data
   - Creates `user_subscriptions` record
   - Creates `message_activations` record
   - Shows confirmation with benefits
   - Redirects to dashboard

---

## Testing Checklist

- [ ] User can see message limit indicator
- [ ] User cannot send message when at limit
- [ ] Payment success shows benefits correctly
- [ ] Premium profiles appear first in search
- [ ] Premium badges display on profiles
- [ ] Advanced filters only show for premium users
- [ ] Message limit resets on 1st of month
- [ ] Property limit enforced for owners
- [ ] Visibility percentage is accurate

---

## Troubleshooting

**User can't see benefits after purchase:**
- Check `user_subscriptions` table - `is_active` should be true
- Check `message_activations` table - record should exist
- Clear browser cache and refresh

**Message limit not enforcing:**
- Verify `conversation_messages` table has correct sender_id
- Check `useMonthlyMessageLimits()` is enabled
- Ensure dates are in same month

**Premium profiles not showing first:**
- Implement sorting in your search component using `useVisibilityRanking()`
- Add `user_subscriptions` to your profile query

---

## Next Steps

1. **Add to Messaging Component** - Use `useMonthlyMessageLimits()` to prevent sending
2. **Add to Search Results** - Use `useVisibilityRanking()` to sort profiles
3. **Add to User Profiles** - Use `PremiumProfileBadge` to show tier
4. **Add to Dashboards** - Use `MonthlyMessageLimitIndicator` to show usage
5. **Monitor Usage** - Track feature adoption and success rates
