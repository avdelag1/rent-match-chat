# Notification Sounds Feature

## Overview

This feature adds meditation bell sounds for important app notifications, providing calm and pleasant audio feedback for key user interactions.

## Notification Sound Types

### 1. **Message Notifications** 🔔
- **Sound:** `bell-a-99888.mp3` (Soft meditation bell)
- **Volume:** 60%
- **Triggers when:** A new message arrives from another user
- **Location:** Plays automatically via `useUnreadMessageCount` hook

### 2. **Match Notifications** 🎉
- **Sound:** `bells-2-31725.mp3` (Celebratory bells)
- **Volume:** 70% (louder for important events)
- **Triggers when:** Two users match (mutual like)
- **Location:** Plays in `MatchCelebration` component alongside haptic feedback

### 3. **Like Notifications** ❤️
- **Sound:** `deep-meditation-bell-hit-heart-chakra-4-186970.mp3` (Heart chakra bell)
- **Volume:** 50%
- **Triggers when:** Someone likes your profile
- **Status:** Ready to implement (utility created)

### 4. **General Notifications** ℹ️
- **Sound:** `deep-meditation-bell-hit-third-eye-chakra-6-186972.mp3` (Third eye chakra bell)
- **Volume:** 50%
- **Triggers when:** Other app notifications
- **Status:** Ready to implement (utility created)

## Implementation Details

### Files Created/Modified

**New Files:**
- `src/utils/notificationSounds.ts` - Notification sound utilities and types

**Modified Files:**
- `src/hooks/useUnreadMessageCount.tsx` - Added message notification sound
- `src/components/MatchCelebration.tsx` - Added match notification sound

### Usage

```typescript
import { playNotificationSound } from '@/utils/notificationSounds';

// Play a message notification
await playNotificationSound('message');

// Play a match celebration
await playNotificationSound('match');

// Play a like notification
await playNotificationSound('like');

// Play a general notification
await playNotificationSound('general');
```

### Sound File Requirements

The following meditation bell sounds must be present in `/public/sounds/`:

- ✅ `bell-a-99888.mp3` - Soft bell for messages
- ✅ `bells-2-31725.mp3` - Celebratory bells for matches
- ✅ `deep-meditation-bell-hit-heart-chakra-4-186970.mp3` - Heart chakra for likes
- ✅ `deep-meditation-bell-hit-third-eye-chakra-6-186972.mp3` - Third eye for general

## Features

### 🔇 Silent Failure
- Sounds fail gracefully if files are missing
- No disruption to user experience
- Errors logged to console for debugging

### 🎵 Preloading (Optional)
- Call `preloadNotificationSounds()` on app initialization
- Improves playback latency
- Loads sounds in background

### 🔒 Browser Compatibility
- Uses native HTML5 Audio API
- Works on all modern browsers
- Respects autoplay policies
- Requires HTTPS (secure context)

### 📱 Mobile Friendly
- Notifications play after user interaction
- Reasonable volume levels
- Low latency with preloading

## Current Implementation Status

✅ **Completed:**
- Message notifications (incoming messages)
- Match notifications (mutual likes)
- Utility functions created
- Sound mappings defined

⏳ **Ready to Implement:**
- Like notifications (when someone likes you)
- General notifications (system alerts)

## Testing

Test notification sounds by:

1. **Messages:** Have someone send you a message
2. **Matches:** Swipe right on someone who already liked you
3. **Console:** Check for any playback errors

## Browser Requirements

- Modern browsers (Chrome, Firefox, Safari, Edge)
- HTTPS connection (required for autoplay)
- User interaction (for first sound)

## Volume Levels

| Type | Volume | Reason |
|------|--------|--------|
| Message | 60% | Slightly louder for important messages |
| Match | 70% | Loudest for celebrations |
| Like | 50% | Moderate for frequent events |
| General | 50% | Moderate for info notifications |

## Future Enhancements

- [ ] User preference to enable/disable notification sounds
- [ ] Volume control in settings
- [ ] Different sound themes for notifications
- [ ] Custom notification sounds upload
- [ ] Sound for "someone viewed your profile"
- [ ] Sound for "subscription expiring" warnings

## Why Meditation Bells?

Meditation bells provide:
- **Calm experience** - Not jarring or annoying
- **Pleasant tone** - Soothing and professional
- **Cultural neutrality** - Universally recognized as positive
- **Brand consistency** - Matches the zen/calm theme of swipe sounds
- **Attention without stress** - Gets attention gently

## Technical Notes

### Autoplay Policies

Modern browsers require user interaction before playing sounds. The notification sounds work because:
1. User already interacted by using the app
2. Sounds play in response to user actions (swiping, messaging)
3. HTTPS is used (secure context required)

### Performance

- Sounds are small (< 100KB each)
- No external dependencies
- Minimal impact on bundle size
- Async loading doesn't block UI

### Error Handling

All sound playback errors are caught and logged:
```typescript
playNotificationSound('message').catch((error) => {
  console.warn('Sound playback failed:', error);
});
```

This ensures app functionality continues even if sounds fail.
