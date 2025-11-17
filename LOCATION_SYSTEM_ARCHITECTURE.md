# Location System Architecture

## System Overview

The Tinderent location system has two distinct approaches based on user role:

```
┌─────────────────────────────────────────────────────────────┐
│                    TINDERENT LOCATION SYSTEM                │
├─────────────────────────────┬───────────────────────────────┤
│          OWNER SIDE          │        CLIENT SIDE             │
├─────────────────────────────┼───────────────────────────────┤
│                             │                               │
│  🔒 Privacy First           │  📍 Exact Location Sharing    │
│  - Country (Dropdown)       │  - Google Maps               │
│  - City (Text Input)        │  - Address Search            │
│  - Neighborhood (Optional)  │  - Real-time Detection       │
│  - NO Exact Location        │  - Precise Coordinates       │
│  - NO Descriptions          │  - Shared with Matches Only  │
│                             │                               │
│  Database Fields:           │  Database Fields:             │
│  ✓ country                  │  ✓ country                   │
│  ✓ city                     │  ✓ city                      │
│  ✓ neighborhood             │  ✓ latitude (6 decimals)    │
│  ✗ latitude                 │  ✓ longitude (6 decimals)   │
│  ✗ longitude                │  ✓ address                  │
│  ✗ description              │  ✓ location_type            │
│                             │  ✓ has_specific_location    │
└─────────────────────────────┴───────────────────────────────┘
```

## Component Architecture

### Owner Location Components

#### `CountrySelector.tsx`
- Comprehensive list of 195+ countries
- Searchable dropdown
- Autocomplete support

#### `OwnerLocationSelector.tsx`
- Uses `CountrySelector` component
- Text inputs for city and neighborhood
- Privacy notice box
- NO map display

### Client Location Components

#### `ClientLocationSelector.tsx`
- Interactive Google Maps display
- Address search with autocomplete
- Real-time geolocation
- Tab system: "Where I Live" vs "Where I Am Now"
- Reverse geocoding
- Latitude/Longitude display

## Data Flow

### Owner Creating a Property Listing

```
1. Click "New Listing" → Property Category
2. Fill Form
   ├─ Basic Info: Title, Price, Type, Beds/Baths
   ├─ Location (NEW):
   │  ├─ Country (Dropdown)
   │  ├─ City (Text)
   │  └─ Neighborhood (Text)
   ├─ Amenities & Services
   └─ Upload 3+ Photos
3. Submit Listing
4. Database Entry:
   {
     country: "Mexico",
     city: "Tulum",
     neighborhood: "Aldea Zama",
     latitude: NULL,
     longitude: NULL,
     address: NULL
   }
5. Property visible to clients with location info only
```

### Client Setting Their Location

```
1. Go to Profile/Preferences
2. ClientLocationSelector opens
3. Choose Location Method:
   ├─ Search by Address
   │  ├─ Type address
   │  └─ Select from autocomplete
   └─ Use Current Location
      └─ Allow browser geolocation
4. Confirm Location on Map
5. Database Entry:
   {
     country: "USA",
     city: "New York",
     latitude: 40.712776,
     longitude: -74.005974,
     address: "123 Main St, New York, NY 10001",
     location_type: "home" or "current"
   }
6. Only matched owners can see exact coordinates
```

## Database Schema

### Listings Table (Properties Only)

```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  owner_id UUID,
  category TEXT, -- 'property'

  -- Location Fields (PRIVACY-FOCUSED)
  country TEXT,           -- "Mexico"
  city TEXT,             -- "Tulum"
  neighborhood TEXT,     -- "Aldea Zama"
  latitude NUMERIC,      -- NULL (not used for properties)
  longitude NUMERIC,     -- NULL (not used for properties)
  address TEXT,          -- NULL until after activation

  -- Other Fields
  title TEXT,
  price NUMERIC,
  images TEXT[],
  created_at TIMESTAMPTZ
);
```

### Profiles Table (Clients)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID,

  -- Location Fields (FULL)
  country TEXT,           -- "USA"
  city TEXT,             -- "New York"
  latitude NUMERIC,      -- 40.712776
  longitude NUMERIC,     -- -74.005974
  address TEXT,          -- "123 Main St, New York, NY 10001"
  location_type TEXT,    -- "home" or "current"

  -- Other Fields
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
);
```

## API Integration

### Google Maps APIs Used

1. **Maps JavaScript API**
   - Interactive map rendering
   - Marker placement
   - Map controls

2. **Geocoding API**
   - Reverse geocoding (coordinates → address)
   - Forward geocoding (address → coordinates)

3. **Places API**
   - Address autocomplete
   - Place predictions
   - Place details

### No API Calls from Owner Side

Owner location selection is 100% client-side:
- Country dropdown (hardcoded array)
- City text input (no API calls)
- Neighborhood text input (no API calls)

## Privacy & Security Model

### Owner Data (Public)
```
Visible to ALL clients:
✓ Country
✓ City
✓ Neighborhood
✓ Property photos
✓ Amenities
✓ Price range
```

### Owner Data (Private)
```
Hidden from clients:
✗ Exact address
✗ Exact GPS coordinates
✗ Full contact info
✗ Description/reviews
```

### Client Data (Private)
```
Visible to NO ONE initially:
✗ Exact location
✗ Coordinates
✗ Home address

After match with owner:
✓ Exact location (only to matched owner)
✓ Address (only to matched owner)
```

## File Locations

```
src/components/
├── location/
│   ├── CountrySelector.tsx           # Reusable country dropdown
│   ├── OwnerLocationSelector.tsx      # Owner location form (no map)
│   └── ClientLocationSelector.tsx     # Client location with Google Maps
└── PropertyListingForm.tsx            # Updated to use OwnerLocationSelector

.env                                   # Google Maps API key here
GOOGLE_MAPS_SETUP_GUIDE.md            # Setup instructions
LOCATION_SYSTEM_ARCHITECTURE.md       # This file
```

## Features Summary

### ✅ Implemented

- Owner location: Country dropdown + City + Neighborhood
- No exact location for owners
- Database support with country field
- UnifiedListingForm updated to handle country
- PropertyListingForm uses OwnerLocationSelector
- CountrySelector component (195+ countries)
- ClientLocationSelector with Google Maps

### ⏳ Next Steps (Optional)

- Integrate ClientLocationSelector into client profile page
- Update client preferences to use real-time location
- Add distance-based search for properties
- Implement location privacy toggle
- Add location update notifications

## Usage Examples

### For Owners

```tsx
import { OwnerLocationSelector } from '@/components/location/OwnerLocationSelector';

<OwnerLocationSelector
  country={country}
  city={city}
  neighborhood={neighborhood}
  onCountryChange={setCountry}
  onCityChange={setCity}
  onNeighborhoodChange={setNeighborhood}
/>
```

### For Clients

```tsx
import { ClientLocationSelector } from '@/components/location/ClientLocationSelector';

<ClientLocationSelector
  latitude={latitude}
  longitude={longitude}
  address={address}
  locationType="home"
  onLocationChange={(data) => {
    setLatitude(data.latitude);
    setLongitude(data.longitude);
    setAddress(data.address);
  }}
/>
```

## Testing Checklist

- [ ] Owner can select country from dropdown
- [ ] Owner can enter city name
- [ ] Owner can enter neighborhood
- [ ] Property saved without exact coordinates
- [ ] Client can search address in map
- [ ] Client can detect current location
- [ ] Client coordinates saved to database
- [ ] Map displays correctly
- [ ] Autocomplete works for addresses
- [ ] Privacy notices display correctly

## Performance Notes

- Country list is static (195 entries) - minimal impact
- Google Maps API lazy-loaded only when ClientLocationSelector is visible
- Reverse geocoding cached in component state
- No polling or continuous location tracking (only on-demand)

## Future Enhancements

1. **Location-based Recommendations**
   - Show properties near client's location
   - Distance filtering

2. **Privacy Settings**
   - Allow clients to hide exact location until match
   - Fuzzy location (radius instead of exact point)

3. **Mobile Support**
   - Better geolocation for mobile browsers
   - Location tracking for ride-along features

4. **Caching**
   - Cache reverse geocoding results
   - Cache frequently searched locations

---

**Last Updated:** 2025-11-17
**Status:** ✅ Complete and Ready for Integration
