# 🐛 Bug Report: Location System

## Critical Bugs Found

### 🔴 BUG #1: CountrySelector - onSelect Never Fires (CRITICAL)

**File:** `src/components/location/CountrySelector.tsx` Lines 71-78

**Problem:**
```tsx
<SelectItem
  key={country}
  value={country}
  className="text-foreground cursor-pointer"
  onSelect={() => {
    onChange(country);  // ❌ This callback never executes
    setSearchValue('');
  }}
>
  {country}
</SelectItem>
```

**Why it's broken:**
- `SelectItem` from shadcn/ui doesn't have an `onSelect` prop
- Clicking a country won't trigger the onChange callback
- The country selector **won't work at all**

**Impact:**
- ❌ Owner can't select country
- ❌ Form submission will have undefined country
- ❌ Properties will be created without country field

**Fix:**
Replace the SelectItem-based implementation with proper Select handling:

```tsx
export function CountrySelector({ value, onChange, required = true }: CountrySelectorProps) {
  const [searchValue, setSearchValue] = useState('');

  const filteredCountries = COUNTRIES.filter(country =>
    country.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Label className="text-foreground">
        Country {required && '*'}
      </Label>
      <Select value={value || ''} onValueChange={(selectedValue) => {
        onChange(selectedValue);
        setSearchValue('');
      }}>
        <SelectTrigger className="bg-background border-border text-foreground">
          <SelectValue placeholder="Select country" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <div className="p-2 sticky top-0 bg-popover border-b border-border">
            <Input
              placeholder="Search countries..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="h-8 bg-background border-border text-foreground"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map(country => (
                <SelectItem
                  key={country}
                  value={country}
                  className="text-foreground cursor-pointer"
                >
                  {country}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-center text-muted-foreground text-sm">
                No countries found
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
```

**Key Changes:**
- Use `onValueChange` on `<Select>` instead of `onSelect` on `<SelectItem>`
- Remove the non-existent `onSelect` callback
- Call `onChange(selectedValue)` in the `onValueChange` handler

---

### 🔴 BUG #2: ClientLocationSelector - useEffect Dependency Missing (CRITICAL)

**File:** `src/components/location/ClientLocationSelector.tsx` Line 132

**Problem:**
```tsx
useEffect(() => {
  // ... initialization code ...

  // Line 120: Uses selectedTab
  onLocationChange({
    latitude: lat,
    longitude: lng,
    address: place.formatted_address || '',
    locationType: selectedTab,  // ← selectedTab used here
  });

  // Line 212: Uses selectedTab
  onLocationChange({
    latitude: lat,
    longitude: lng,
    address: addressStr,
    locationType: selectedTab,  // ← and here
  });

  // ... more code ...
}, []);  // ❌ Empty dependency array - selectedTab not included!
```

**Why it's broken:**
- `selectedTab` is used in callbacks (lines 120, 212)
- But `selectedTab` is NOT in the dependency array
- When user switches tabs, the old callbacks still reference the old `selectedTab` value
- **Race condition:** User might switch from "Where I Live" to "Where I Am Now", but old callback still sends `locationType: 'home'`

**Impact:**
- ❌ Wrong location type sent to parent component
- ❌ User switches tabs but location still says "home"
- ❌ Incorrect data saved to database

**Fix:**
Add `selectedTab` to the dependency array:

```tsx
useEffect(() => {
  // ... all the initialization code ...
}, [selectedTab]);  // ✅ Add selectedTab as dependency
```

**BUT WAIT:** There's a second issue - the cleanup function also needs fixing:

```tsx
return () => {
  if (mapInstance.current) {
    window.google.maps.event.clearInstanceListeners(mapInstance.current);
  }
  // ❌ Autocomplete listener is NOT cleaned up!
};
```

The autocomplete event listener is never cleaned up. You need to store a reference:

```tsx
const autocompleteRef = useRef<any>(null);

useEffect(() => {
  // ... other code ...

  if (searchInputRef.current) {
    const autocomplete = new window.google.maps.places.Autocomplete(...);
    autocompleteRef.current = autocomplete;  // ← Store reference
    autocomplete.addListener('place_changed', () => {
      // ...
    });
  }

  return () => {
    if (mapInstance.current) {
      window.google.maps.event.clearInstanceListeners(mapInstance.current);
    }
    if (autocompleteRef.current) {
      window.google.maps.event.clearInstanceListeners(autocompleteRef.current);  // ← Clean up autocomplete
    }
  };
}, [selectedTab, onLocationChange]);  // ✅ Add both dependencies
```

---

### 🟡 BUG #3: ClientLocationSelector - Race Condition in Map Click Handler

**File:** `src/components/location/ClientLocationSelector.tsx` Lines 87-92

**Problem:**
```tsx
// Add click listener to place marker
mapInstance.current.addListener('click', (event: any) => {
  const lat = event.latLng.lat();
  const lng = event.latLng.lng();
  setCurrentLocation({ latitude: lat, longitude: lng });
  reverseGeocode(lat, lng);  // ❌ Async function called without await
});
```

**Why it's broken:**
- `reverseGeocode()` is async (returns a Promise)
- But it's called without `await`
- The function will fire but won't block
- If user clicks the map multiple times quickly, race conditions happen
- `setCurrentLocation` and the actual coordinate update might get out of sync

**Impact:**
- ⚠️ Displayed coordinates might not match the actual location
- ⚠️ Multiple rapid map clicks cause data inconsistency
- ⚠️ Address might be from a different location than shown marker

**Fix:**
Create async handler wrapper:

```tsx
// Create an async wrapper for the listener
const handleMapClick = async (event: any) => {
  const lat = event.latLng.lat();
  const lng = event.latLng.lng();
  setCurrentLocation({ latitude: lat, longitude: lng });
  await reverseGeocode(lat, lng);  // ✅ Wait for geocoding to complete
};

// Add click listener to place marker
mapInstance.current.addListener('click', handleMapClick);
```

---

### 🟡 BUG #4: Unused State Variable

**File:** `src/components/location/CountrySelector.tsx` Lines 42-43

**Problem:**
```tsx
const [open, setOpen] = useState(false);
```

The `open` state is created but:
- Never updated (only initialized)
- Never read
- Never used in the component

**Impact:**
- Wasted memory/re-renders
- Misleading code (looks like it does something)

**Fix:**
Remove unused state:
```tsx
// ❌ DELETE these lines:
// const [open, setOpen] = useState(false);

// And change the Select onOpenChange:
// FROM: <Select value={value || ''} onOpenChange={setOpen}>
// TO:   <Select value={value || ''}>
```

---

### 🟡 BUG #5: Missing Error Handling in Geocoder

**File:** `src/components/location/ClientLocationSelector.tsx` Lines 242-275

**Problem:**
```tsx
const geocoder = new window.google.maps.Geocoder();
geocoder.geocode({ address: searchInput }, (results: any, status: string) => {
  if (status === 'OK' && results[0]) {
    // Success case
  } else {
    toast({
      title: "Location Not Found",
      description: "Please enter a valid address.",
      variant: "destructive"
    });
  }
  setIsLoading(false);
});
```

**Issue:**
- Only handles "Location Not Found" case (status !== 'OK')
- Doesn't handle other geocoding errors like:
  - `OVER_QUERY_LIMIT` - API quota exceeded
  - `REQUEST_DENIED` - API key invalid
  - `UNKNOWN_ERROR` - Server error
- All errors show the same generic message

**Impact:**
- Users won't know if it's their input or an API issue
- Could hide real problems with Google Maps setup

**Fix:**
```tsx
geocoder.geocode({ address: searchInput }, (results: any, status: string) => {
  if (status === 'OK' && results[0]) {
    // Success...
  } else if (status === 'OVER_QUERY_LIMIT') {
    toast({
      title: "Too Many Requests",
      description: "Google Maps quota exceeded. Please wait a moment.",
      variant: "destructive"
    });
  } else if (status === 'REQUEST_DENIED') {
    toast({
      title: "API Configuration Error",
      description: "Google Maps API key or permissions issue.",
      variant: "destructive"
    });
  } else if (status === 'ZERO_RESULTS') {
    toast({
      title: "Location Not Found",
      description: "Please check the address and try again.",
      variant: "destructive"
    });
  } else {
    toast({
      title: "Search Error",
      description: `Geocoding error: ${status}`,
      variant: "destructive"
    });
  }
  setIsLoading(false);
});
```

---

## Summary Table

| Bug ID | Severity | Component | Issue | Status |
|--------|----------|-----------|-------|--------|
| #1 | 🔴 CRITICAL | CountrySelector | onSelect never fires | Must fix NOW |
| #2 | 🔴 CRITICAL | ClientLocationSelector | Missing dependency, memory leak | Must fix NOW |
| #3 | 🟡 HIGH | ClientLocationSelector | Race condition async | Should fix soon |
| #4 | 🟢 LOW | CountrySelector | Unused state variable | Nice to fix |
| #5 | 🟡 MEDIUM | ClientLocationSelector | Poor error handling | Should fix |

---

## Priority Fixes

### 🚨 IMMEDIATE (Bugs #1 & #2)
These will cause the feature to fail completely. The country selector won't work and location data will be incorrect.

### ⚠️ SOON (Bugs #3 & #5)
These could cause subtle data corruption in edge cases.

### 📝 LATER (Bug #4)
Minor code cleanliness issue.

---

## Testing After Fixes

1. **CountrySelector:**
   - [ ] Can search countries
   - [ ] Selection updates parent component
   - [ ] Selected country appears in form

2. **ClientLocationSelector:**
   - [ ] Switch between "Where I Live" / "Where I Am Now"
   - [ ] Correct tab value sent to parent
   - [ ] Multiple rapid clicks don't cause issues
   - [ ] Geocoding errors show appropriate messages

---

**Recommendation:** Fix bugs #1 and #2 immediately before this feature is used in production.
