# Location-Themed Radio Player Feature

## Overview

A comprehensive radio player feature for the rent-match-chat app that lets users listen to curated radio stations from different cities while swiping through matches. The player features three switchable UI skins (iPhone modern, Vinyl retro, iPod classic) and supports swipe gestures for intuitive station and city switching.

## Features

### 🎵 **8 City-Themed Station Collections**
- **New York**: Z100, Q104.3, Power 105.1, KTU, WFAN
- **Miami**: Y100, Tu 94.9, Power 96, Hits 97.3, BIG 105.9
- **Ibiza**: Ibiza Global, Ibiza Live, Ibiza Sonica, Café del Mar, Absolute Chillout
- **Tulum/Playa del Carmen**: Ibiza Organica, Cadena Dance, Turquesa FM, Muy Romantica, Son Sonidero
- **California**: KROQ, KIIS-FM, KUSC, KCRW, KPCC
- **Texas**: KXT, KISS Country, The Ticket, KUT, Radio Free Texas
- **French**: France Inter, NRJ, RTL, FIP, Skyrock
- **Podcasts**: Joe Rogan, Call Her Daddy, The Daily, Crime Junkie, SmartLess

### 🎨 **Three Switchable Skins**

#### 1. **iPhone Modern** (Fully Implemented ✅)
- Clean, minimal design with gradient backgrounds
- Large circular frequency dial with arc visualization
- Centered album art card with smooth animations
- Bottom control bar with play/pause, previous/next
- Three theme variations: Light, Dark, Vibrant (city-themed)
- Top icons for shuffle, favorites, and city switching

#### 2. **Vinyl Retro** (Placeholder - Ready to Implement)
- Warm wood/vinyl background aesthetic
- Spinning vinyl record animation when playing
- Retro tonearm graphic for progress indication
- Embossed buttons with vintage feel
- 60s/70s/80s color schemes

#### 3. **iPod Classic** (Placeholder - Ready to Implement)
- Gray/white iPod device border
- Click-wheel interface for frequency/volume control
- Small square album art at top
- Menu button navigation feel
- Nostalgic iPod UI elements

### 🎮 **Gesture Controls**
- **Swipe Left/Right**: Change station within current city
- **Swipe Up/Down**: Switch to different city
- **Tap Play/Pause**: Toggle playback
- **Tap Icons**: Toggle shuffle, favorites, city selector

### ⚙️ **User Preferences (Saved to Supabase)**
- Selected skin (iPhone/Vinyl/iPod)
- Current city and station
- Volume level
- Shuffle mode on/off
- Favorite stations list
- Theme preference (light/dark/vibrant)

## Implementation Status

### ✅ Completed
- [x] Radio station data structure with 40+ stations
- [x] 8 city themes with custom color schemes
- [x] Supabase schema for preferences and playlists
- [x] Custom hook for radio player state management
- [x] Frequency dial component with arc visualization
- [x] Player controls component
- [x] iPhone skin (fully functional with 3 theme variations)
- [x] Swipe gesture integration
- [x] Routing integration (`/radio`)
- [x] Audio streaming with HTML5 Audio API
- [x] Favorites system
- [x] Shuffle mode

### 🚧 To Be Implemented
- [ ] Vinyl retro skin (component structure ready)
- [ ] iPod Classic skin (component structure ready)
- [ ] Custom playlists UI
- [ ] Playlist creation and management
- [ ] Now playing metadata fetching
- [ ] Podcast RSS feed integration
- [ ] Volume slider UI
- [ ] Audio equalizer visualization

## File Structure

```
src/
├── types/
│   └── radio.ts                    # Type definitions
├── data/
│   └── radioStations.ts            # Station data and city themes
├── hooks/
│   └── useRadioPlayer.ts           # Radio player state management
├── components/
│   └── radio/
│       ├── FrequencyDial.tsx       # Frequency arc visualization
│       ├── PlayerControls.tsx      # Play/pause/next/prev controls
│       └── skins/
│           ├── IPhoneSkin.tsx      # iPhone modern skin ✅
│           ├── VinylSkin.tsx       # Vinyl retro skin (to add)
│           └── IPodSkin.tsx        # iPod classic skin (to add)
├── pages/
│   └── RadioPlayer.tsx             # Main radio player page
└── supabase/
    └── migrations/
        └── 20260202_add_radio_features.sql

## Database Schema

### profiles Table (Extended)
```sql
ALTER TABLE profiles ADD COLUMN:
- radio_skin TEXT DEFAULT 'iphone'
- radio_current_city TEXT DEFAULT 'tulum'
- radio_current_station_id TEXT
- radio_volume DECIMAL(3, 2) DEFAULT 0.7
- radio_shuffle_mode BOOLEAN DEFAULT FALSE
- radio_favorite_stations TEXT[]
```

### user_radio_playlists Table (New)
```sql
CREATE TABLE user_radio_playlists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT NOT NULL,
  station_ids TEXT[],
  description TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

## Usage

### Accessing the Radio Player
```typescript
// Navigate to radio player
navigate('/radio');

// Or add a button in your navigation
<Button onClick={() => navigate('/radio')}>
  🎵 Radio
</Button>
```

### Using the Hook Directly
```typescript
import { useRadioPlayer } from '@/hooks/useRadioPlayer';

function MyComponent() {
  const {
    state,
    togglePlayPause,
    changeStation,
    toggleShuffle,
    setSkin
  } = useRadioPlayer();

  return (
    <div>
      <h2>{state.currentStation?.name}</h2>
      <button onClick={togglePlayPause}>
        {state.isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}
```

## Adding New Stations

1. Open `src/data/radioStations.ts`
2. Add your station to the `radioStations` array:

```typescript
{
  id: 'unique-station-id',
  name: 'Station Name',
  frequency: '101.9 FM',
  streamUrl: 'https://stream-url.com/live.mp3',
  city: 'miami',
  genre: 'Hip Hop',
  description: 'Station description'
}
```

## Implementing Additional Skins

### Creating a New Skin

1. Create a new component in `src/components/radio/skins/`:

```typescript
// VinylSkin.tsx
import { FrequencyDial } from '../FrequencyDial';
import { PlayerControls } from '../PlayerControls';

export function VinylSkin({ station, isPlaying, onPlayPause, ... }) {
  return (
    <div className="vinyl-background">
      {/* Spinning record animation */}
      <motion.div
        animate={{ rotate: isPlaying ? 360 : 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        {/* Vinyl record UI */}
      </motion.div>

      <FrequencyDial {...dialProps} />
      <PlayerControls {...controlProps} />
    </div>
  );
}
```

2. Import and add to `RadioPlayer.tsx`:

```typescript
import { VinylSkin } from '@/components/radio/skins/VinylSkin';

// In render:
{state.skin === 'vinyl' && (
  <VinylSkin {...skinProps} />
)}
```

## Testing Checklist

### Basic Functionality
- [ ] Radio player loads without errors
- [ ] Can play/pause stations
- [ ] Swipe left/right changes stations
- [ ] Swipe up/down changes cities
- [ ] Volume control works
- [ ] Favorites toggle saves correctly

### Skins & Themes
- [ ] iPhone skin displays correctly in all 3 themes (light/dark/vibrant)
- [ ] Theme colors match city themes
- [ ] Skin switcher dropdown works
- [ ] Preferences persist after reload

### Audio Streaming
- [ ] Stations play without buffering issues
- [ ] Audio continues when switching skins
- [ ] Volume changes apply immediately
- [ ] Auto-advance to next station works

### Gestures
- [ ] Swipe gestures responsive and smooth
- [ ] Swipe hints display for first-time users
- [ ] Button controls work as alternative to gestures

### Mobile & Desktop
- [ ] Responsive layout on all screen sizes
- [ ] Touch gestures work on mobile
- [ ] Mouse/trackpad gestures work on desktop
- [ ] Back button returns to previous page

## Performance Considerations

- **Audio Preloading**: Stations use HTML5 Audio API with lazy loading
- **Smooth Animations**: Framer Motion for 60fps animations
- **State Management**: Optimized with useCallback to prevent unnecessary re-renders
- **Supabase Updates**: Debounced writes to reduce database calls

## Future Enhancements

1. **Advanced Features**
   - Real-time song metadata from radio APIs
   - Audio visualizer (waveform/spectrum analyzer)
   - Sleep timer
   - Alarm/wake-up timer

2. **Social Features**
   - Share current station with friends
   - See what others are listening to
   - Collaborative playlists

3. **Customization**
   - Custom EQ settings
   - Upload custom album art
   - Create themed playlists

4. **Discovery**
   - Recommended stations based on listening history
   - Trending stations
   - Genre-based browsing

## Browser Compatibility

- **Desktop**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+, Samsung Internet 14+
- **Audio Format**: MP3 streaming (universally supported)

## Troubleshooting

### Stream Not Playing
- Check browser console for CORS errors
- Verify stream URL is accessible
- Try alternative stream URL for the station

### Preferences Not Saving
- Ensure user is authenticated
- Check Supabase connection
- Verify RLS policies are correct

### Gestures Not Working
- Check if Framer Motion is properly installed
- Verify drag event handlers are attached
- Test on different devices/browsers

## Credits

- **Station Data**: Curated from public radio directories
- **Design Inspiration**: iPhone FM Radio, Vintage Turntables, Classic iPod
- **City Themes**: Inspired by each location's unique vibe and culture

## License

Part of the rent-match-chat application.
