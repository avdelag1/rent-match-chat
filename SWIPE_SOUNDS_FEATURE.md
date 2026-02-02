# Swipe Sounds Feature

## Overview

This feature adds customizable sound effects for swipe interactions throughout the rent-match-chat app. Users can choose from different sound themes that play when swiping left or right on properties and profiles.

## Features

### Sound Themes

1. **None** (Default) - Silent mode, no sounds play
2. **Book Pages** - Satisfying page turning sounds
3. **Water Drop** - Calming water droplets and splashes
4. **Funny** - Playful and humorous sound effects
5. **Calm Bells** - Peaceful meditation bells
6. **Random Zen** - Randomly plays different zen sounds (bells, gongs, chimes)

### User Settings

- Settings accessible via: Settings → Preferences → Swipe Sound Theme
- Available for both Client and Owner user roles
- Preference saved to Supabase profiles table
- Persists across sessions

## Technical Implementation

### Files Created

1. **`/src/utils/sounds.ts`** - Sound management utilities
   - Type definitions for SwipeTheme
   - Sound file mappings
   - Audio creation and playback functions
   - Random zen sound selector

2. **`/src/hooks/useSwipeSounds.ts`** - React hook for sound management
   - Loads user's sound theme preference from Supabase
   - Preloads audio files for better performance
   - Provides `playSwipeSound()` function

3. **`/src/components/SwipeSoundSettings.tsx`** - Settings UI component
   - Dropdown selector for sound themes
   - Real-time preference updates
   - Visual feedback with volume icons

4. **`/supabase/migrations/20260202_add_swipe_sound_theme.sql`** - Database migration
   - Adds `swipe_sound_theme` column to profiles table
   - Includes CHECK constraint for valid theme values
   - Default value: 'none'

5. **`/public/sounds/README.md`** - Documentation for sound files
   - Lists required sound files
   - Provides guidance on file sources and sizing

### Files Modified

1. **`/src/pages/ClientSettingsNew.tsx`**
   - Added "Preferences" menu item
   - Integrated SwipeSoundSettings component

2. **`/src/pages/OwnerSettingsNew.tsx`**
   - Added "Preferences" menu item
   - Integrated SwipeSoundSettings component

3. **`/src/components/ClientSwipeContainer.tsx`**
   - Imported and initialized useSwipeSounds hook
   - Added sound playback in handleSwipe function

4. **`/src/components/TinderentSwipeContainer.tsx`**
   - Imported and initialized useSwipeSounds hook
   - Added sound playback in handleSwipe function

## Sound File Requirements

Place the following MP3 files in `/public/sounds/`:

### Book Theme
- `page-turned-84574.mp3`
- `book-closing-466850.mp3`
- `turnpage-99756.mp3` (alternative)

### Water Theme
- `water-splash-46402.mp3`
- `water-droplet-sfx-417690.mp3`

### Funny Theme
- `funny-short-comedy-fart-sound-effect-318912.mp3`
- `ding-sfx-472366.mp3`
- `achievement-unlocked-463070.mp3` (alternative)

### Calm/Meditation Theme
- `deep-meditation-bell-hit-heart-chakra-4-186970.mp3`
- `deep-meditation-bell-hit-third-eye-chakra-6-186972.mp3`
- `bells-2-31725.mp3`
- `bell-a-99888.mp3`
- `large-gong-2-232438.mp3`

**Note:** Sound files are NOT included in this commit. They need to be added separately.

## Usage

### For Users

1. Navigate to Settings
2. Click on "Preferences"
3. Select your preferred sound theme from the dropdown
4. Swipe on properties/profiles to hear the sounds

### For Developers

The sound system is automatic once configured:

```typescript
// The hook handles everything automatically
const { playSwipeSound } = useSwipeSounds();

// Just call it when swiping
const handleSwipe = (direction: 'left' | 'right') => {
  playSwipeSound(direction);
  // ... rest of swipe logic
};
```

## Performance Considerations

- **Audio Preloading**: Sound files are preloaded when the theme changes to minimize latency
- **Mobile Compatibility**: Uses native Audio API for broad compatibility
- **Error Handling**: Gracefully handles missing sound files or playback failures
- **Volume**: Set to 50% (0.5) for fixed themes, 45% (0.45) for random zen
- **No Dependencies**: Uses native browser Audio API, no external libraries required

## Database Schema

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS swipe_sound_theme TEXT DEFAULT 'none'
CHECK (swipe_sound_theme IN ('none', 'book', 'water', 'funny', 'calm', 'randomZen'));
```

## Future Enhancements

Potential improvements for future iterations:

1. **Volume Control**: Add user-adjustable volume slider
2. **Custom Sounds**: Allow users to upload their own sound effects
3. **Theme Previews**: Play sample sounds before selecting a theme
4. **Sound Packs**: Bundle multiple related themes together
5. **Accessibility**: Add option to use sounds as accessibility aids for visually impaired users
6. **Analytics**: Track which themes are most popular

## Browser Compatibility

- **Desktop**: All modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile**: iOS Safari 11+, Android Chrome 53+
- **Fallback**: Gracefully degrades if audio playback is blocked or fails

## Testing Checklist

- [ ] Settings UI displays correctly for both Client and Owner roles
- [ ] Theme selection saves to database
- [ ] Sounds play on swipe (left and right)
- [ ] Different themes play different sounds
- [ ] Random Zen plays varied sounds
- [ ] No errors in console
- [ ] Works on mobile devices
- [ ] Preference persists across sessions
- [ ] TypeScript compilation succeeds

## Credits

Sound effects should be sourced from royalty-free sound libraries such as:
- Freesound.org
- Zapsplat.com
- Pixabay Sound Effects
- Free Music Archive

Ensure all sound files are properly licensed for use in this application.
