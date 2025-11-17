# Like Notifications System

## Overview

The Like Notifications System allows users to receive and act on "likes" from other users while maintaining privacy until they accept the like. It supports both:
- **Clients** liking owner listings
- **Owners** liking client profiles

## Architecture

### Real-Time Flow

```
User A "Likes" User B (via swipe)
    ↓
useSwipe.tsx creates like record
    ↓
Notification sent to User B
    ↓
User B receives notification (real-time via Supabase)
    ↓
LikeNotificationCard displayed
    ↓
User B can Accept, Skip, or Dismiss
```

### Database Tables

**`likes`** - Individual like records
```sql
- user_id: Who liked
- target_id: Who was liked (listing_id or profile_id)
- direction: 'right' (like) or 'left' (dislike)
- created_at: When
```

**`matches`** - Mutual connection records
```sql
- client_id & owner_id: The two users
- is_mutual: true if both liked
- status: 'pending', 'accepted', 'rejected'
- listing_id: Associated property
```

**`notifications`** - Activity notifications
```sql
- user_id: Who gets the notification
- notification_type: 'new_like', 'new_match', etc.
- metadata: JSON with liker_id, target_id, target_type
- is_read: Whether user has seen it
```

## Components

### 1. **LikeNotificationCard** (Updated)
Main component that displays a like notification with:
- Header showing "Someone liked you"
- Preview of limited info about the liker
- Action buttons
- Privacy notice

**File**: `src/components/LikeNotificationCard.tsx`

**Props**:
```typescript
{
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    metadata?: {
      liker_id?: string;
      target_id?: string;
      target_type?: string;
    };
    related_user_id?: string;
    created_at: string;
    is_read: boolean;
  };
  onDismiss: (id: string) => void;
  currentUserRole?: 'client' | 'owner';
}
```

**Features**:
- Shows role (Property Owner / Interested Client) instead of full name
- Preview icon with heart
- Clean action buttons
- Privacy explanation
- Dismiss/Close button

### 2. **LikeNotificationPreview** (New)
Shows limited information about the liker based on their role:

**File**: `src/components/LikeNotificationPreview.tsx`

#### For Owners Liking Clients:
- "Property Owner" label
- Owner's location (city, country)
- Neighborhood
- Number of active listings
- Property type preview
- Listing preview image

#### For Clients Liking Properties:
- "Interested Client" label
- Client's location (city, country)
- Property type preferences
- Location zones they're interested in
- Number of zones (with +X more if >3)

**Key**: No full names, phone, or email shown until acceptance

### 3. **LikeNotificationActions** (New)
Reusable action buttons component

**File**: `src/components/LikeNotificationActions.tsx`

**Features**:
- Two layout modes: `inline` or `stacked`
- Accept button (with heart icon)
- Skip/Reject button
- Optional Chat button
- Loading states with spinners
- Accessible and responsive

**Props**:
```typescript
{
  onAccept: () => void;
  onReject: () => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
  variant?: 'inline' | 'stacked';
  showChat?: boolean;
  onChat?: () => void;
}
```

## Hooks

### **useLikeNotificationActions** (New)
Handles the acceptance/rejection of like notifications

**File**: `src/hooks/useLikeNotificationActions.tsx`

**What it does**:
1. **acceptLike()**
   - Creates/updates match record
   - Sets mutual like flag
   - Creates conversation
   - Sends reciprocal "It's a Match!" notification
   - Marks notification as read

2. **rejectLike()**
   - Archives notification
   - Marks as read
   - Removes from active list

**Returns**:
```typescript
{
  acceptLike: (params) => void,
  rejectLike: (params) => void,
  isAccepting: boolean,
  isRejecting: boolean,
  acceptingError: Error | null,
  rejectingError: Error | null,
}
```

**Usage**:
```tsx
const { acceptLike, rejectLike, isAccepting, isRejecting } = useLikeNotificationActions();

acceptLike({
  notificationId: 'notif-123',
  likerId: 'user-456',
  targetId: 'listing-789',
  targetType: 'listing'
});
```

## Privacy & Data Security

### Information Visibility

**Before Acceptance**:
- ❌ Full name not shown
- ❌ Email/phone not shown
- ✅ Role (Client/Owner)
- ✅ Location (city/country)
- ✅ Preferences (property type, location zones)
- ✅ Listing preview (for owners)

**After Acceptance (Match Created)**:
- ✅ Full profile becomes visible
- ✅ Can chat directly
- ✅ Can see full listings/details

### Notification Privacy

- Notifications marked `is_read` after acceptance
- Can be archived to remove from view
- Metadata in notifications doesn't include sensitive data

## Flow: From Like to Chat

### Scenario 1: Client Likes Owner's Property

```
1. Client swipes right on listing
   ↓
2. Like created in database
3. Owner receives notification:
   - "An interested client liked you"
   - Preview: client's location, preferences
   - No full name shown
   ↓
4. Owner clicks "Accept & Connect"
   ↓
5. Match created (is_mutual = true)
6. Conversation auto-created
7. Both users get notifications
8. Chat enabled between them
   ↓
9. Owner can now see client's full profile
10. Client can see owner's details
```

### Scenario 2: Owner Likes Client

```
1. Owner discovers interesting client
2. Owner clicks like on client profile
   ↓
3. Client receives notification:
   - "An owner liked you"
   - Preview: owner's listings, location
   - No full name shown
   ↓
4. Client clicks "Accept & Connect"
   ↓
5. Match created
6. Conversation created
7. Both notified
8. Chat opens
   ↓
9. Full profiles now visible
```

## Integration Points

### With useSwipe Hook
The existing `useSwipe.tsx` hook:
```typescript
// Sends notification when direction === 'right'
await supabase.from('notifications').insert([{
  user_id: recipientId,
  notification_type: 'new_like',
  title: '💚 Someone liked you!',
  message: 'You have a new like. Swipe to see if it\'s a match!',
  metadata: { liker_id: user.id, target_id: targetId, target_type: targetType }
}]);
```

### With Notification System
Integrates with existing `useNotificationSystem.tsx`:
- Real-time subscription to new notifications
- Auto-display of like notifications
- Integration with existing notification UI

### With Matches System
Creates match records that:
- Track mutual likes
- Enable conversations
- Trigger "It's a Match!" notifications
- Set chat access permissions

## User Experience

### Notification Badge
- Shows "New" badge until read
- Heart icon with gradient
- Pink/rose color scheme
- Clear call-to-action

### Accept/Reject Decision
- Two prominent buttons
- Clear consequences explained
- Can dismiss without accepting
- Dismissed notifications can be viewed in Activity

### Match Creation
- Instant match creation on acceptance
- Toast notification confirms
- Automatic chat channel creation
- Can start chatting immediately

## Configuration & Features

### Customizable Elements
- Notification colors (currently pink/rose)
- Icon styles
- Button text
- Preview information types
- Privacy messages

### Extensibility
- Hook structure allows easy modifications
- Component composition allows customization
- Supports additional user types easily
- Metadata can store additional information

## Troubleshooting

### No Notifications Appearing
1. Check `useNotificationSystem` is subscribed
2. Verify notification records in database
3. Check browser permissions for notifications
4. Check network tab for real-time subscription

### Like Not Creating Match
1. Verify both `likes` records exist
2. Check conversation creation code
3. Verify match table permissions
4. Check for database errors in logs

### Preview Not Loading
1. Check client/owner data exists in database
2. Verify profiles table has data
3. Check client_preferences table
4. Look for RLS policy blocks

## Testing

### Manual Testing Checklist
- [ ] Client receives notification when owner likes
- [ ] Owner receives notification when client likes
- [ ] Preview shows correct information
- [ ] Accept button creates match
- [ ] Skip button dismisses notification
- [ ] Match enables chat
- [ ] Full profile visible after match
- [ ] Rejected likes don't create match
- [ ] Notification marked as read after action

### Database Verification
```sql
-- Check notifications
SELECT * FROM notifications WHERE notification_type = 'new_like' ORDER BY created_at DESC LIMIT 5;

-- Check matches created
SELECT * FROM matches WHERE is_mutual = true ORDER BY created_at DESC LIMIT 5;

-- Check likes
SELECT * FROM likes WHERE direction = 'right' ORDER BY created_at DESC LIMIT 10;
```

## Future Enhancements

1. **Notification Preferences**
   - User can opt-out of like notifications
   - Email digests of likes
   - Push notifications

2. **Like Counter**
   - Show "3 people liked you" badge
   - Premium feature to see who

3. **Timed Notifications**
   - Show notifications gradually (not all at once)
   - Peak hour delivery

4. **Advanced Matching**
   - Percentage match shown in preview
   - Reason for match
   - Mutual interests highlight

5. **Like History**
   - See who liked you over time
   - Accept/reject history
   - Re-engage old likes

## Files Summary

| File | Purpose |
|------|---------|
| `src/components/LikeNotificationCard.tsx` | Main notification display |
| `src/components/LikeNotificationPreview.tsx` | Limited info preview |
| `src/components/LikeNotificationActions.tsx` | Action buttons |
| `src/hooks/useLikeNotificationActions.tsx` | Accept/reject logic |
| `src/hooks/useSwipe.tsx` | Sends notification on like |
| `src/hooks/useNotificationSystem.tsx` | Real-time notification subscription |

---

**Last Updated**: 2025-11-17
**Status**: ✅ Ready for Production
