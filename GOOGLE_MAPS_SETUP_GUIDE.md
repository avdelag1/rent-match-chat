# Google Maps Setup Guide

This guide explains how to set up Google Maps API for the Tinderent location selection features.

## Overview

The app uses Google Maps in two main scenarios:

**1. Client Side:**
- Interactive map for selecting exact location
- Search by address
- Real-time location detection
- Privacy-focused (exact coordinates only shared with matches)

**2. Owner Side:**
- Simple country/city/neighborhood dropdowns (NO map, NO exact location)
- Privacy-first approach for property listings

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project**
3. Name it `tinderent-maps` (or your preference)
4. Click **Create**

## Step 2: Enable Required APIs

In the Google Cloud Console:

1. Go to **APIs & Services** > **Library**

2. **Search for and enable these APIs:**
   - Google Maps JavaScript API
   - Maps JavaScript API
   - Geocoding API
   - Places API

3. For each API:
   - Click on it
   - Click **Enable**

## Step 3: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy your API Key (you'll need this in Step 5)
4. Click **Restrict Key** to secure it

### Restrict Your API Key:

1. Under **API restrictions**, select:
   - Maps JavaScript API
   - Geocoding API
   - Places API

2. Under **Application restrictions**, select **HTTP referrers (web sites)**

3. Add your domain(s):
   ```
   http://localhost:3000/*
   http://localhost:5173/*
   https://yourdomain.com/*
   https://www.yourdomain.com/*
   ```

4. Click **Save**

## Step 4: Load Google Maps in HTML

The Google Maps API should be loaded in your `index.html` or main layout.

**File:** `/home/user/rent-match-chat/index.html`

Add this before the closing `</head>` tag:

```html
<!-- Google Maps API -->
<script async defer src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry&callback=initMap"></script>
```

**Replace `YOUR_API_KEY` with your actual API Key from Step 3**

### Better Approach (Recommended):

Store the API key in environment variables instead:

**File:** `.env`

```env
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

Then load it dynamically in your app.

## Step 5: Integration Points

### For Clients (with Google Maps):

The `ClientLocationSelector` component automatically handles:
- Map display
- Address search
- Real-time location detection
- Reverse geocoding

**Usage:**
```tsx
import { ClientLocationSelector } from '@/components/location/ClientLocationSelector';

<ClientLocationSelector
  latitude={userLat}
  longitude={userLng}
  address={userAddress}
  locationType="home"
  onLocationChange={(data) => {
    console.log('Location:', data.latitude, data.longitude);
  }}
/>
```

### For Owners (NO Google Maps):

The `OwnerLocationSelector` component provides:
- Country dropdown (searchable)
- City input field
- Neighborhood input field

**NO map, NO exact coordinates, NO descriptions**

**Usage:**
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

## Step 6: Environment Variable Setup

Create a `.env` file in the project root:

```env
# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE

# Optional: Feature flags
VITE_ENABLE_CLIENT_MAPS=true
VITE_ENABLE_OWNER_MAPS=false  # Owners use simple dropdowns
```

Make sure to add `.env` to `.gitignore` so you don't commit API keys!

```
.env
.env.local
.env.*.local
```

## Step 7: Load Maps in App

The app needs to load Google Maps script globally. Update your main app initialization:

**In your main.tsx or app initialization:**

```typescript
// Load Google Maps
const script = document.createElement('script');
script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
script.async = true;
script.defer = true;
document.head.appendChild(script);
```

Or add it directly to `index.html`:

```html
<head>
  <!-- ... existing head content ... -->
  <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry">
  </script>
</head>
```

## Step 8: Test the Integration

1. Start your app: `npm run dev`
2. Navigate to client location settings
3. You should see:
   - An interactive map
   - Address search input
   - "Use My Current Location" button
   - Latitude/Longitude display

## Troubleshooting

### "Google Maps not loaded" error

**Solution:**
1. Verify API key is correct
2. Check that Maps JavaScript API is enabled in Google Cloud Console
3. Check that your domain is in the API key restrictions
4. Wait 5-10 minutes for restrictions to take effect

### Map not showing

**Solution:**
1. Check browser console (F12) for errors
2. Verify `Libraries=places` is in the API script URL
3. Check that you have the correct API key

### "Places autocomplete not working"

**Solution:**
1. Verify **Places API** is enabled
2. Verify API key restrictions include Places API
3. Check that your API key has billing enabled

### "Too many requests" errors

**Solution:**
1. Check Google Cloud Console > Billing
2. Set up billing alerts to prevent quota issues
3. May need to increase API quota limits

## Cost Considerations

Google Maps APIs use pay-as-you-go pricing:

- **Maps JavaScript API**: $7 per 1000 loads (first 28,000 free/month)
- **Geocoding API**: $5 per 1000 requests (first 5,000 free/month)
- **Places API**: $1-$17 per 1000 requests (varies by feature)

**Tip:** Use caching and lazy loading to minimize API calls.

## Privacy & Security

### For Clients:
- Exact location only shared with matched owners
- Location stored in Supabase with proper encryption
- Privacy notice displayed in the UI

### For Owners:
- NO exact location ever collected
- Only country/city/neighborhood visible to clients
- Maximum privacy protection

## Database Updates

If you need to add Google Maps support to existing profiles:

```sql
-- Update profiles table if needed
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location_type TEXT DEFAULT 'home';
-- Values: 'home' or 'current'

-- Create index for location queries
CREATE INDEX idx_profiles_coordinates
ON profiles(latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
```

## Production Deployment

When deploying to production:

1. Get a production API key in Google Cloud Console
2. Restrict it to your production domain only
3. Update environment variables on your hosting platform
4. Set up API monitoring and alerts
5. Monitor quota usage

**Example Production .env:**
```env
VITE_GOOGLE_MAPS_API_KEY=prod_key_here_xxxxx
VITE_APP_ENV=production
```

## Support

If you encounter issues:

1. Check [Google Maps API Documentation](https://developers.google.com/maps/documentation)
2. Enable **Maps API Debugger** in Google Cloud Console
3. Review browser console for errors (F12)
4. Check Google Cloud Console logs for quota/billing issues

---

**Note:** The owner-side location system (country/city/neighborhood) does NOT require Google Maps. It uses simple dropdowns and is completely private.
