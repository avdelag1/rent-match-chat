# Migration Status Tracker

This document tracks the status of all database migrations and their purpose.

## Quick Reference

| Status | Migration | Date Applied | Description |
|--------|-----------|--------------|-------------|
| ✅ | Core Tables | Oct 25, 2025 | Initial database schema |
| ✅ | Profile Fields | Oct 25, 2025 | Extended user profiles |
| ✅ | Reviews System | Oct 25, 2025 | Rating and review functionality |
| ✅ | Vehicle Listings | Oct 25, 2025 | Vehicle rental support |
| ✅ | Notifications | Oct 25, 2025 | Notification system |
| ✅ | Messaging | Oct 25, 2025 | Enhanced messaging features |
| ✅ | Calendar | Oct 25, 2025 | Scheduling system |
| ✅ | Owner Filters | Oct 25, 2025 | Advanced filtering |
| ✅ | Storage | Oct 25, 2025 | File storage buckets |
| ✅ | Onboarding | Oct 25, 2025 | Onboarding tracking |
| ✅ | Saved Searches | Oct 25, 2025 | Search preferences |
| ✅ | Listing Attributes | Oct 25, 2025 | Detailed property info |
| ✅ | Profile View Fix | Oct 26, 2025 | RLS policy fix |
| ✅ | Client Profile Fields | Oct 29, 2025 | Demographics & lifestyle |
| ✅ | Database Health Check | Oct 29, 2025 | Validation & optimization |

## Database Schema Summary

### Core Tables

**profiles**
- Main user profile table
- Used by both clients and owners
- Includes basic info: name, email, avatar, bio
- Extended with: social media, verification status, images array

**user_roles**
- Defines user role (client or owner)
- Critical for authentication and authorization
- One-to-one relationship with profiles

**client_profiles**
- Extended client-specific data
- Demographics: age, gender, nationality, languages, relationship status
- Lifestyle: smoking, drinking, cleanliness, noise tolerance, work schedule
- Preferences: dietary, personality traits, interests, activities
- Profile images array

**listings**
- Property and vehicle listings created by owners
- Core fields: title, description, price, location, category
- Property fields: bedrooms, bathrooms, square footage, amenities
- Vehicle fields: make, model, year, mileage, VIN, fuel type
- Status tracking: active, pending, rented

**matches**
- Tracks mutual likes between clients and owners
- Links client profiles to listings
- Status: pending, matched, rejected
- Timestamps for tracking

**conversations**
- Chat conversations between matched users
- Links to matches (optional - can have direct messaging)
- Tracks last message and participant info

**conversation_messages**
- Individual messages in conversations
- Supports text, images, and attachments
- Read receipts and timestamps

### Supporting Tables

**reviews**: Rating and review system
**notifications**: In-app and push notifications
**calendar_events**: Showing/tour scheduling
**saved_searches**: Saved filter preferences
**storage_buckets**: File upload organization

### Views

**user_debug_info**: Comprehensive user data for troubleshooting
- Shows profile, role, activity counts
- Useful for debugging user issues

## Current Schema State

### Indexes Created
- Foreign key indexes on all relationships
- Performance indexes on: category, city, price, status
- User activity indexes for quick lookups

### RLS Enabled
All user-facing tables have Row Level Security enabled:
- ✅ profiles
- ✅ client_profiles
- ✅ listings
- ✅ matches
- ✅ conversations
- ✅ conversation_messages
- ✅ user_roles
- ✅ reviews
- ✅ notifications

### Triggers Active
- **updated_at triggers**: Auto-update timestamps on:
  - listings
  - profiles
  - client_profiles

## Known Issues

### Resolved Issues
- ✅ Missing client_profile fields (fixed in 20251029000000)
- ✅ RLS policy conflicts (fixed in multiple migrations)
- ✅ Missing indexes (fixed in 20251029000001)
- ✅ Foreign key relationships (verified in 20251029000001)

### Open Issues
- None currently identified

## Pending Migrations

### **⚠️ REQUIRED: Clear Mock Client Photos (Jan 2026)**

**Migration File**: `20260118000000_clear_client_mock_photos.sql`

**Purpose**: Removes fake/mock photos from client profiles that appear on owner swipe cards

**Status**: Migration file exists but needs to be applied to production/staging database

**Impact**:
- Clears profile_images from client_profiles table where images contain mock/placeholder URLs
- Clears images, avatar_url, and profile_photo_url from profiles table for clients
- Clients without real photos will show "Waiting for client to upload photos :)" placeholder

**Action Required**: Apply this migration using Supabase CLI or dashboard:
```bash
supabase db push
# OR manually run the migration via Supabase Dashboard
```

**Code Changes**:
- ✅ Client-side cache version bumped to v5 (forces cache clear)
- ✅ Added code-level filtering to exclude profiles with mock images
- ✅ Fallback to placeholder when no images present

## Next Steps

### Potential Future Migrations

1. **Payment Integration**
   - Stripe customer IDs
   - Payment history table
   - Subscription management

2. **Analytics Enhancement**
   - User behavior tracking
   - Swipe analytics (already in code, may need DB tables)
   - Match success metrics

3. **Advanced Features**
   - Video uploads for listings
   - Virtual tour integration
   - Document verification system
   - Background check integration

4. **Performance Optimization**
   - Materialized views for complex queries
   - Partitioning for large tables
   - Additional caching strategies

## Migration Guidelines

### Before Creating a Migration

1. Review existing schema in Supabase Dashboard
2. Check for naming conflicts
3. Plan for rollback if needed
4. Consider data migration if altering existing tables

### After Applying a Migration

1. Update TypeScript types in `src/integrations/supabase/types.ts`
2. Test affected features in the application
3. Update this status document
4. Document any breaking changes
5. Update API documentation if endpoints affected

## Type Sync Status

**Last Type Generation**: Current with migrations through Oct 29, 2025

TypeScript types include all fields from recent migrations:
- ✅ client_profiles: All demographic and lifestyle fields
- ✅ listings: All property and vehicle fields
- ✅ profiles: Images array and verification fields
- ✅ All relationship tables properly typed

## Database Statistics

**Total Tables**: 15+ core tables
**Total Migrations**: 99+
**Schema Size**: Comprehensive (production-ready)
**RLS Coverage**: 100% on user-facing tables

## Health Check Results

Last health check run: Migration `20251029000001_database_health_check.sql`

Results:
- ✅ All foreign key relationships valid
- ✅ All indexes created successfully
- ✅ RLS enabled on all required tables
- ✅ Triggers functioning properly
- ✅ No orphaned records detected
- ✅ Type consistency verified

## Useful Queries

### Check Migration History
```sql
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 20;
```

### Verify RLS Status
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Check Table Sizes
```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### List All Indexes
```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

**Document Version**: 1.0
**Last Updated**: October 29, 2025
**Maintained By**: Development Team
