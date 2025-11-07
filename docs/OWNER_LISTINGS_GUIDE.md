# Owner Listings Management Guide

Welcome to the comprehensive guide for managing your listings on TindeRent! This system allows you to create, manage, and track listings for properties, motorcycles, bicycles, and yachts.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Creating Listings](#creating-listings)
3. [Managing Your Listings](#managing-your-listings)
4. [Storage & Images](#storage--images)
5. [Advanced Features](#advanced-features)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Active owner account on TindeRent
- Verified email address
- At least one property, vehicle, or yacht to list

### Accessing the Management Dashboard

1. Log in to your account
2. Navigate to **Owner Dashboard** → **Property Management**
3. You'll see your statistics dashboard and all listings

---

## Creating Listings

### Step 1: Choose Listing Category

Click the **"Add Listing"** button and select from:

- **🏠 Property** - Apartments, houses, villas, studios
- **⛵ Yacht** - Boats, sailboats, motor yachts, catamarans
- **🏍️ Motorcycle** - Sport bikes, cruisers, scooters, touring bikes
- **🚴 Bicycle** - Road bikes, mountain bikes, e-bikes, cruisers

### Step 2: Select Listing Mode

Choose what you're offering:

- **For Rent** - Daily, weekly, or monthly rentals
- **For Sale** - Permanent ownership transfer
- **Both** - Available for rent or purchase

### Step 3: Fill in Details

#### Common Fields (All Categories)

| Field | Description | Required |
|-------|-------------|----------|
| Title | Catchy, descriptive name | ✅ Yes |
| Description | Detailed information about the listing | ✅ Yes |
| Price | Amount in USD | ✅ Yes |
| Location | Address, city, coordinates | ✅ Yes |
| Images | Photos (up to 10, 10MB each) | ✅ Yes |
| Video URL | YouTube or Vimeo link | ❌ Optional |

#### Property-Specific Fields

- **Bedrooms** - Number of bedrooms
- **Bathrooms** - Number of bathrooms (supports .5 for half bath)
- **Square Footage** - Total living space
- **Amenities** - Pool, gym, WiFi, parking, etc.
- **Furnished** - Yes/No
- **Pet Friendly** - Yes/No
- **Floor Number** - Which floor
- **Year Built** - Construction year
- **Property Type** - Apartment, house, villa, studio, condo

#### Motorcycle-Specific Fields

- **Brand & Model** - Honda CBR600, Harley Davidson Sportster, etc.
- **Year** - Manufacturing year
- **Engine Size** - In cc (cubic centimeters)
- **Motorcycle Type** - Sport, cruiser, touring, adventure, naked, scooter
- **Transmission** - Manual or automatic
- **Mileage** - Total kilometers
- **Fuel Type** - Gasoline, electric, hybrid
- **Condition** - New, like new, excellent, good, fair
- **Features** - ABS, traction control, heated grips, luggage rack
- **Includes** - Helmet, gear, lock

#### Bicycle-Specific Fields

- **Brand & Model** - Trek, Specialized, Cannondale, etc.
- **Bicycle Type** - Road, mountain, hybrid, electric, cruiser, folding, BMX
- **Frame Size** - XS, S, M, L, XL or in cm
- **Frame Material** - Carbon, aluminum, steel, titanium
- **Number of Gears** - Speed count
- **Electric Bike** - Yes/No
- **Battery Range** - In km (for e-bikes)
- **Suspension** - Front, full, rigid
- **Brake Type** - Disc, rim, hydraulic
- **Wheel Size** - 26", 27.5", 29", 700c
- **Accessories** - Lock, lights, basket, pump

#### Yacht-Specific Fields

- **Brand** - Beneteau, Jeanneau, Bavaria, etc.
- **Yacht Type** - Motor, sail, catamaran, trimaran
- **Length** - In meters
- **Year** - Manufacturing year
- **Cabins** - Number of sleeping cabins
- **Berths** - Total sleeping capacity
- **Heads** - Number of bathrooms
- **Max Capacity** - Maximum passengers
- **Engine Hours** - Total engine usage
- **Fuel Capacity** - In liters
- **Water Capacity** - In liters
- **Max Speed** - In knots
- **Features** - AC, generator, autopilot, GPS, radar
- **Includes** - Crew, captain, water toys (jet ski, kayak)
- **Hull Material** - Fiberglass, wood, aluminum, steel

### Step 4: Upload Images

1. Click **"Upload Images"** or drag and drop
2. Supported formats: JPEG, PNG, WebP, GIF
3. Maximum size: 10MB per image
4. Recommended: At least 5 high-quality photos
5. First image becomes the featured/cover photo

**Tips for Great Photos:**
- Use natural lighting
- Capture multiple angles
- Show unique features
- Include location context
- Ensure images are sharp and clear

### Step 5: Set Rental Terms

- **Minimum Rental Period** - Daily, weekly, monthly
- **Maximum Rental Period** - Optional limit
- **Deposit Amount** - Security deposit in USD
- **Insurance Required** - Yes/No
- **Cancellation Policy** - Flexible, moderate, strict

### Step 6: Add Special Features & Restrictions

- **Special Features** - Unique selling points
  - Example: "Ocean view balcony", "Recently renovated"
- **Restrictions** - Rules and limitations
  - Example: "No smoking", "No parties", "Adults only"

### Step 7: Review and Publish

1. Preview your listing
2. Check all information is correct
3. Click **"Save & Publish"** to make it active
4. Or **"Save as Draft"** to publish later

---

## Managing Your Listings

### Dashboard Overview

The statistics dashboard shows:

- **Total Listings** - All your active and inactive listings
- **Total Views** - How many times your listings were viewed
- **Average Price** - Mean price across all listings
- **Active Categories** - Number of different categories you're listing in

### Filtering & Search

**Filter by Category:**
- All
- Properties
- Yachts
- Motorcycles
- Bicycles
- Active (currently visible to clients)
- Rented (currently occupied)

**Search Listings:**
Use the search box to find listings by:
- Title
- Location
- Address
- Description

### Listing Actions

Each listing card has three actions:

1. **👁️ View** - Preview how clients see your listing
2. **✏️ Edit** - Modify listing details, images, or price
3. **🗑️ Delete** - Permanently remove the listing

### Status Badges

- **🟢 Active** - Visible to clients, accepting inquiries
- **🔵 Rented** - Currently occupied, not available
- **🟡 Maintenance** - Temporarily unavailable
- **⚪ Pending** - Awaiting approval or setup

### Quick Actions

**Activate Listing:**
```sql
SELECT activate_listing('[your-listing-id]', '[your-user-id]');
```

**Archive Listing (Soft Delete):**
```sql
SELECT archive_listing('[your-listing-id]', '[your-user-id]');
```

---

## Storage & Images

### Image Storage System

TindeRent uses **Supabase Storage** with a dedicated `listing-images` bucket.

**Technical Details:**
- **Bucket:** `listing-images` (public)
- **Path Format:** `{user_id}/{listing_id}/{filename}`
- **Size Limit:** 10MB per image
- **Allowed Types:** JPEG, JPG, PNG, WebP, GIF
- **Security:** Row-Level Security (RLS) policies

### Uploading Images

**Via UI:**
1. Open listing form
2. Click "Upload Images" section
3. Drag & drop or browse files
4. Wait for upload confirmation
5. Rearrange images if needed (first = cover photo)

**Storage URL Format:**
```
https://vplgtcguxujxwrgguxqq.supabase.co/storage/v1/object/public/listing-images/{user_id}/{listing_id}/{filename}
```

### Managing Images

- **Add Images:** Edit listing → Upload more images
- **Remove Images:** Click the X on any image thumbnail
- **Reorder:** Drag and drop to change order
- **Replace:** Delete old image, upload new one

### Image Best Practices

1. **Resolution:** 1920x1080 or higher
2. **Aspect Ratio:** 16:9 or 4:3 preferred
3. **File Size:** Optimize to 1-3MB for faster loading
4. **Quantity:** 5-10 images per listing recommended
5. **Variety:** Show exterior, interior, details, location

---

## Advanced Features

### View Tracking

Every time a client views your listing, the view count increments automatically. Track performance by:

1. Checking the dashboard stats
2. Sorting listings by views
3. Identifying popular listings

### Database Functions

**Get Your Statistics:**
```sql
SELECT * FROM get_owner_listing_stats('[your-user-id]');
```

Returns:
- Total listings
- Active listings count
- Inactive listings count
- Draft listings count
- Total views across all listings
- Count by category (properties, motorcycles, bicycles, yachts)

### Helpful Database Views

**View All Listings with Owner Info:**
```sql
SELECT * FROM listings_with_owner_info WHERE owner_id = '[your-user-id]';
```

**View Only Active Listings:**
```sql
SELECT * FROM active_listings_summary WHERE owner_id = '[your-user-id]';
```

### API Integration

If you're building custom integrations, use these Supabase queries:

**Fetch Your Listings:**
```javascript
const { data, error } = await supabase
  .from('listings')
  .select('*')
  .eq('owner_id', userId)
  .order('created_at', { ascending: false });
```

**Create New Listing:**
```javascript
const { data, error } = await supabase
  .from('listings')
  .insert({
    owner_id: userId,
    title: 'Beautiful Beachfront Villa',
    description: '3 bed, 2 bath with ocean views',
    category: 'property',
    listing_type: 'rent',
    price: 2500,
    // ... more fields
  });
```

**Update Listing:**
```javascript
const { data, error } = await supabase
  .from('listings')
  .update({ price: 2800, status: 'active' })
  .eq('id', listingId)
  .eq('owner_id', userId);
```

---

## Database Setup

### Running the Migration

If you're setting up a new environment or need to ensure the database is properly configured:

1. **Via Supabase CLI:**
```bash
supabase db push
```

2. **Via SQL Editor:**
Copy and run the contents of:
```
/supabase/migrations/20251031000000_comprehensive_listings_setup.sql
```

### What the Migration Creates

1. **Storage Bucket:**
   - `listing-images` with 10MB limit
   - Public read access
   - Authenticated write access

2. **RLS Policies:**
   - Users can upload to their own folders
   - Anyone can view listing images
   - Only owners can update/delete their images

3. **Database Views:**
   - `listings_with_owner_info` - Listings + owner details
   - `active_listings_summary` - Active listings with stats

4. **Helper Functions:**
   - `get_owner_listing_stats()` - Get statistics
   - `archive_listing()` - Soft delete
   - `activate_listing()` - Make listing active
   - `increment_listing_view_count()` - Track views

5. **Performance Indexes:**
   - Composite indexes for fast queries
   - Category-specific indexes
   - Location-based indexes

### Verifying Setup

Run these checks to ensure everything is working:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'listing-images';

-- Check if your listings table has all columns
SELECT column_name FROM information_schema.columns
WHERE table_name = 'listings';

-- Test the stats function
SELECT * FROM get_owner_listing_stats('[your-user-id]');
```

---

## Troubleshooting

### Common Issues

#### Problem: "Cannot upload images"

**Solutions:**
1. Check file size (must be < 10MB)
2. Verify file type (JPEG, PNG, WebP, GIF only)
3. Ensure you're logged in
4. Check internet connection
5. Try refreshing the page

#### Problem: "Listing not appearing to clients"

**Solutions:**
1. Verify `status` is set to "active"
2. Ensure `is_active` is TRUE
3. Check if all required fields are filled
4. Verify you have at least one image uploaded

#### Problem: "Cannot edit listing"

**Solutions:**
1. Ensure you're the owner (check `owner_id`)
2. Verify you're logged in with the correct account
3. Check RLS policies are enabled
4. Try logging out and back in

#### Problem: "Images not loading"

**Solutions:**
1. Check the image URL is correct
2. Verify the storage bucket is public
3. Ensure RLS policies allow public read access
4. Check Supabase project status

### Getting Help

If you encounter issues:

1. Check the browser console for errors
2. Review Supabase dashboard for policy issues
3. Contact support with:
   - Your user ID
   - Listing ID (if applicable)
   - Screenshot of the error
   - Steps to reproduce

---

## Best Practices

### For Maximum Visibility

1. **Complete All Fields** - More details = better matches
2. **High-Quality Photos** - Professional images attract clients
3. **Competitive Pricing** - Research similar listings
4. **Accurate Descriptions** - Be honest and detailed
5. **Quick Responses** - Reply to inquiries promptly
6. **Keep Updated** - Update availability regularly
7. **Verify Documents** - Upload legal documents for trust

### For Security

1. **Never share passwords** in listing descriptions
2. **Use secure payment methods** through the platform
3. **Meet clients in public** for initial viewings
4. **Verify client identity** before finalizing rentals
5. **Keep records** of all transactions
6. **Report suspicious activity** immediately

### For Success

1. **Respond within 24 hours** to inquiries
2. **Maintain properties well** - Happy clients = good reviews
3. **Be flexible** with viewing times
4. **Offer competitive rates** especially initially
5. **Build a portfolio** of listings
6. **Encourage reviews** from satisfied clients
7. **Update photos** seasonally for properties

---

## API Reference

### Listing Object Structure

```typescript
interface Listing {
  id: string;                    // UUID
  owner_id: string;              // Your user ID
  title: string;                 // Listing title
  description: string;           // Full description
  category: 'property' | 'motorcycle' | 'bicycle' | 'yacht';
  listing_type: 'rent' | 'sale' | 'both';
  mode: 'rent' | 'sale' | 'both';
  price: number;                 // In USD
  currency: string;              // Default: 'USD'

  // Location
  location: string;              // General location
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  neighborhood: string;

  // Media
  images: string[];              // Array of image URLs
  video_url: string;             // Optional video

  // Status
  status: 'draft' | 'active' | 'inactive' | 'archived';
  is_active: boolean;

  // Analytics
  view_count: number;
  like_count: number;

  // Timestamps
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601

  // Category-specific fields...
  // (See type definitions for complete list)
}
```

---

## Changelog

### Version 1.0 (October 2025)
- Initial release of comprehensive listings system
- Support for 4 categories: property, motorcycle, bicycle, yacht
- Storage bucket with RLS policies
- Helper functions and views
- Statistics dashboard
- Full CRUD operations

---

## Support

For technical support or questions:
- Email: support@tinderent.com
- Documentation: https://docs.tinderent.com
- Community Forum: https://community.tinderent.com

Happy listing! 🏠⛵🏍️🚴
