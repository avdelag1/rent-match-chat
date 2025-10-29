# Supabase Migrations Documentation

## Overview

This directory contains all SQL migrations for the Tinderent application. Migrations are applied automatically by Supabase when pushed to the platform via Lovable or manually via the Supabase CLI.

## Migration System

### File Naming Convention
Migrations follow this pattern:
```
YYYYMMDDHHMMSS_uuid.sql
```
- **Timestamp**: Ensures migrations run in chronological order
- **UUID**: Unique identifier to prevent conflicts
- **Extension**: `.sql` for SQL migration files

### How Migrations Work

1. **Automatic Application**: When you push changes through Lovable, migrations are automatically applied to your Supabase project
2. **Version Control**: All migrations are tracked in git and cannot be modified once applied
3. **Order**: Migrations run in chronological order based on the timestamp in the filename
4. **Idempotency**: Use `IF NOT EXISTS` and `IF EXISTS` clauses to make migrations safely re-runnable

## Current Migration Status

### Core Database Setup (October 25, 2025)

**Core Tables Migration** - `20251025000000_create_core_tables.sql`
- Created foundational tables: profiles, user_roles, listings, matches, conversations
- Set up Row Level Security (RLS) policies
- Established primary authentication and authorization structure

**Profile Fields Enhancement** - `20251025000001_add_comprehensive_profile_fields.sql`
- Added extended profile fields for both clients and owners
- Includes social media links, verification status, and enhanced bio fields

**Reviews System** - `20251025000002_create_reviews_system.sql`
- Implemented rating and review system
- Supports both property and user reviews
- Includes rating categories and helpful vote tracking

**Vehicle Listings** - `20251025000003_add_vehicle_listing_fields.sql`
- Extended listings table for vehicle rentals
- Added make, model, year, mileage, VIN, fuel type, transmission, etc.

**Notifications System** - `20251025000004_create_notifications_system.sql`
- Created comprehensive notification system
- Supports in-app and push notifications
- Includes notification preferences and read/unread tracking

**Messaging Enhancements** - `20251025000005_enhance_messaging_system.sql`
- Enhanced conversation and message tracking
- Added message attachments support
- Implemented typing indicators and read receipts

**Calendar System** - `20251025000006_create_calendar_system.sql`
- Created showing/tour scheduling system
- Supports availability slots and booking management
- Includes reminder and notification integration

**Owner Filters** - `20251025000007_add_comprehensive_owner_filters.sql`
- Added detailed filtering capabilities for owner searches
- Includes demographic, lifestyle, and preference filters

**Storage Buckets** - `20251025000008_setup_storage_buckets.sql`
- Configured Supabase Storage buckets for images and documents
- Set up security policies for file uploads
- Organized buckets by content type (profile-images, listing-images, etc.)

**Onboarding Tracking** - `20251025000009_add_onboarding_tracking.sql`
- Implemented user onboarding progress tracking
- Tracks completion of profile setup steps
- Enables personalized onboarding experience

**Saved Searches** - `20251025000010_create_saved_searches.sql`
- Created saved search functionality
- Allows users to save filter preferences
- Includes automatic match notifications

**Saved Search RLS Fix** - `20251025000011_fix_saved_search_matches_rls.sql`
- Fixed Row Level Security policies for saved searches
- Resolved permission issues with match notifications

**Detailed Listing Attributes** - `20251025000012_add_detailed_listing_attributes.sql`
- Added comprehensive property attributes
- Includes amenities, parking, utilities, pet policies, accessibility features
- Enhanced search and filtering capabilities

### Profile System Updates (October 26, 2025)

**Profiles Public View Fix** - `20251026000000_fix_profiles_public_view.sql`
- Fixed public profile view permissions
- Resolved RLS policy issues for profile visibility

### Client Profile Enhancements (October 29, 2025)

**Client Profile Fields** - `20251029000000_add_client_profile_fields.sql`
- Added demographic fields: nationality, languages, relationship_status, has_children
- Added lifestyle habits: smoking_habit, drinking_habit, cleanliness_level, noise_tolerance, work_schedule
- Added cultural/personality fields: dietary_preferences, personality_traits, interest_categories
- All fields properly documented with SQL comments

**Database Health Check** - `20251029000001_database_health_check.sql`
- Comprehensive database validation and optimization
- Enabled RLS on all critical tables
- Created performance indexes for common queries
- Added updated_at triggers for better data tracking
- Created user_debug_info view for troubleshooting
- Verified foreign key relationships
- Added table and column documentation

## Best Practices

### Writing Migrations

1. **Use IF EXISTS/IF NOT EXISTS**: Makes migrations idempotent
   ```sql
   ALTER TABLE public.profiles
   ADD COLUMN IF NOT EXISTS new_field TEXT;
   ```

2. **Add Comments**: Document your schema changes
   ```sql
   COMMENT ON COLUMN public.profiles.new_field IS 'Description of field purpose';
   ```

3. **Create Indexes**: Add indexes for foreign keys and commonly queried fields
   ```sql
   CREATE INDEX IF NOT EXISTS idx_table_column ON public.table(column);
   ```

4. **Enable RLS**: Always enable Row Level Security on user-facing tables
   ```sql
   ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;
   ```

5. **Use Transactions**: Wrap complex migrations in DO blocks for atomicity
   ```sql
   DO $$
   BEGIN
     -- Your migration logic here
   END $$;
   ```

### Testing Migrations

1. **Test Locally**: If using Supabase CLI locally, test migrations before pushing
2. **Check for Conflicts**: Ensure column names don't conflict with existing schema
3. **Verify Types**: Match TypeScript types with database schema (see next section)
4. **Test RLS Policies**: Verify security policies work as expected

## TypeScript Type Generation

After creating migrations, update TypeScript types:

### Manual Process (Current)
1. Go to Supabase Dashboard → Settings → API
2. Copy the generated TypeScript types
3. Replace content in `src/integrations/supabase/types.ts`

### Automatic Process (Recommended - requires Supabase CLI)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref vplgtcguxujxwrgguxqq

# Generate types
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## Troubleshooting

### Common Issues

**Migration Fails to Apply**
- Check for syntax errors in SQL
- Verify referenced tables/columns exist
- Check for conflicting constraints

**RLS Policy Denies Access**
- Verify user authentication state
- Check policy conditions match your use case
- Test policies in Supabase SQL Editor

**Foreign Key Violation**
- Ensure referenced records exist
- Check ON DELETE/ON UPDATE clauses
- Verify data integrity before adding constraints

**Type Mismatches**
- Regenerate TypeScript types after migrations
- Clear build cache: `rm -rf node_modules/.vite`
- Restart development server

### Debug Views

Use the `user_debug_info` view for troubleshooting user data:
```sql
SELECT * FROM public.user_debug_info WHERE email = 'user@example.com';
```

## Migration Checklist

When creating a new migration:

- [ ] Use proper file naming convention with timestamp
- [ ] Add descriptive comments explaining the migration purpose
- [ ] Use IF EXISTS/IF NOT EXISTS for idempotency
- [ ] Create necessary indexes for performance
- [ ] Enable RLS if creating new user-facing tables
- [ ] Add column/table comments for documentation
- [ ] Test migration locally if possible
- [ ] Update TypeScript types after applying
- [ ] Document migration in this README
- [ ] Test application functionality after migration

## Future Enhancements

Potential improvements to the migration system:

1. **Automated Type Generation**: Set up CI/CD to automatically regenerate types
2. **Migration Testing**: Add automated tests for migration scripts
3. **Rollback Scripts**: Create corresponding rollback migrations for complex changes
4. **Migration Documentation**: Generate schema documentation from migrations
5. **Schema Visualization**: Create entity-relationship diagrams from current schema

## Resources

- [Supabase Migrations Guide](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Policies](https://supabase.com/docs/guides/auth/row-level-security)
- [Lovable Documentation](https://docs.lovable.dev/)

## Contact

For questions about migrations or database schema:
- Check the Lovable project dashboard
- Review Supabase project logs
- Consult this documentation

---

**Last Updated**: October 29, 2025
**Total Migrations**: 99+
**Database Version**: PostgreSQL 15 (Supabase)
