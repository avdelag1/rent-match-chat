# Database Architecture Analysis & Consolidation Plan

## Executive Summary

The current database has **105+ tables** with significant duplication and fragmentation across core domains. This causes:
- Dashboard re-render loops (multiple queries to redundant tables)
- Slow initial loads (N+1 queries across split profile tables)
- Flickering swipe cards (inconsistent data sources)
- Inconsistent user identity (profile data scattered across 5+ tables)

---

## 1. CURRENT TABLE INVENTORY BY CATEGORY

### Core Identity (FRAGMENTED)
| Table | Purpose | Status |
|-------|---------|--------|
| `auth.users` | Supabase auth (email, password) | KEEP |
| `profiles` | Main profile (~150 columns, bloated) | KEEP (refactor) |
| `user_profiles` | Duplicate profile data | DEPRECATE |
| `client_profiles` | Client-specific data | MERGE into profiles |
| `owner_profiles` | Owner/vendor business info | MERGE into profiles |
| `tenant_profiles` | Legacy tenant data | DEPRECATE |
| `profile_photos` | Separate photo storage | KEEP |
| `profile_views` | Profile view tracking | KEEP |
| `profile_update_logs` | Audit trail | KEEP (read-only) |

### Role / Permissions (REDUNDANT)
| Table | Purpose | Status |
|-------|---------|--------|
| `user_roles` | Role assignment table | DEPRECATE |
| `profiles.role` | Role column in profiles | KEEP (single source) |
| `admin_users` | Separate admin accounts | KEEP (security isolation) |

### Listings / Properties (DUPLICATED)
| Table | Purpose | Status |
|-------|---------|--------|
| `listings` | Main listings (~130 columns) | KEEP |
| `properties` | Legacy property table (integer ID) | DEPRECATE |
| `owner_properties` | Duplicate property data | DEPRECATE |
| `property_features` | Listing features | MERGE into listings.amenities |
| `property_images` | Listing images | MERGE into listings.images |
| `property_comments` | Listing comments | KEEP |
| `property_ratings` | Listing ratings | MERGE with reviews |
| `property_availability` | Availability (uses properties.id) | DEPRECATE |
| `availability_slots` | Calendar slots | KEEP |
| `listing_views` | View counts | KEEP |

### Swipes / Likes / Matches (FRAGMENTED)
| Table | Purpose | Status |
|-------|---------|--------|
| `swipes` | Main swipe tracking | KEEP |
| `likes` | Generic likes | DEPRECATE |
| `user_likes` | User-to-user likes | DEPRECATE |
| `owner_likes` | Owner likes on clients | MERGE into swipes |
| `dislikes` | Dislike with cooldown | KEEP |
| `matches` | Main match table | KEEP |
| `property_matches` | Legacy matches (uses properties.id) | DEPRECATE |
| `property_swipes` | Legacy swipes (uses properties.id) | DEPRECATE |
| `owner_client_matches` | CRM-style matches | MERGE into matches |
| `property_interactions` | Legacy interactions | DEPRECATE |
| `user_interactions` | User interaction tracking | DEPRECATE |

### Favorites / Saved (DUPLICATED)
| Table | Purpose | Status |
|-------|---------|--------|
| `favorites` | Generic favorites | KEEP |
| `property_favorites` | Duplicate favorites | DEPRECATE |
| `saved_filters` | Saved filter configs | KEEP |
| `saved_searches` | Saved search alerts | KEEP |

### Messaging (FRAGMENTED)
| Table | Purpose | Status |
|-------|---------|--------|
| `conversations` | Main conversation table | KEEP |
| `conversation_messages` | Messages in conversations | KEEP |
| `messages` | Legacy standalone messages | DEPRECATE |
| `match_conversations` | Legacy match messages | DEPRECATE |
| `property_match_messages` | Legacy property messages | DEPRECATE |
| `message_attachments` | Attachments | KEEP |
| `typing_indicators` | Real-time typing | KEEP |
| `conversation_starters` | Weekly message quotas | KEEP |

### Notifications (OVERLAPPING)
| Table | Purpose | Status |
|-------|---------|--------|
| `notifications` | Main notifications | KEEP |
| `notification_preferences` | Notification settings | KEEP |
| `user_notification_preferences` | Duplicate prefs | DEPRECATE |
| `best_deal_notifications` | Quota tracking | KEEP |
| `device_tokens` | Push tokens | KEEP |
| `push_outbox` | Push queue | KEEP |
| `user_push_subscriptions` | Web push subs | KEEP |

### Preferences / Filters (FRAGMENTED)
| Table | Purpose | Status |
|-------|---------|--------|
| `client_filter_preferences` | Extensive filters (~65 columns) | KEEP |
| `client_category_preferences` | Category filters | MERGE into client_filter_preferences |
| `client_preferences_detailed` | More detailed prefs | DEPRECATE |
| `owner_client_preferences` | Owner's ideal client | KEEP |
| `user_preferences` | Generic preferences | DEPRECATE |
| `user_search_preferences` | Search preferences | DEPRECATE |

### User Settings (FRAGMENTED)
| Table | Purpose | Status |
|-------|---------|--------|
| `user_settings` | General settings | KEEP |
| `user_privacy_settings` | Privacy settings | MERGE into user_settings |
| `user_security_settings` | Security settings | KEEP (separate for security) |

### Reviews & Ratings (OVERLAPPING)
| Table | Purpose | Status |
|-------|---------|--------|
| `reviews` | Main reviews | KEEP |
| `property_ratings` | Separate ratings | MERGE into reviews |
| `review_helpful_votes` | Vote tracking | KEEP |

### Activity / Analytics (DUPLICATED)
| Table | Purpose | Status |
|-------|---------|--------|
| `user_activity_log` | Activity log | DEPRECATE |
| `user_activity_tracking` | Duplicate tracking | DEPRECATE |
| `swipe_analytics` | Swipe metrics | KEEP |

### Blocking / Reporting (DUPLICATED)
| Table | Purpose | Status |
|-------|---------|--------|
| `user_blocks` | Block with reason | KEEP |
| `user_block_list` | Duplicate block list | DEPRECATE |
| `user_reports` | User reports | KEEP |
| `property_reports` | Listing reports | KEEP |
| `user_complaints` | Detailed complaints | KEEP |
| `dispute_reports` | Contract disputes | KEEP |

### Payments / Subscriptions (OVERLAPPING)
| Table | Purpose | Status |
|-------|---------|--------|
| `subscription_packages` | Package definitions | KEEP |
| `subscriptions` | User subscription state | KEEP |
| `user_subscriptions` | Duplicate sub tracking | DEPRECATE |
| `package_usage` | Usage tracking | KEEP |
| `message_activations` | Message quota | KEEP |
| `payment_activations` | Payment-based activations | KEEP |
| `payment_transactions` | Transactions | KEEP |
| `payment_providers` | Provider config | KEEP |
| `paypal_credentials` | PayPal config | KEEP |
| `paypal_transactions` | PayPal transactions | MERGE into payment_transactions |
| `user_payment_methods` | Saved payment methods | KEEP |

### Admin / Logs (MOSTLY KEEP)
| Table | Purpose | Status |
|-------|---------|--------|
| `admin_users` | Admin accounts | KEEP |
| `admin_sessions` | Admin sessions | KEEP |
| `admin_actions_log` | Admin audit | KEEP |
| `admin_activity_logs` | Duplicate audit | DEPRECATE |
| `admin_dashboard_settings` | Admin UI prefs | KEEP |
| `audit_logs` | General audit | KEEP |
| `security_audit_log` | Security audit | KEEP |
| `security_event_logs` | Security events | KEEP |
| `data_access_logs` | Data access audit | KEEP |
| `performance_logs` | Performance metrics | KEEP |
| `rate_limit_log` | Rate limiting | KEEP |
| `rate_limits` | Rate limit config | KEEP |

### Legal / Contracts (KEEP ALL)
| Table | Purpose | Status |
|-------|---------|--------|
| `legal_documents` | Legal docs | KEEP |
| `legal_document_quota` | Doc quotas | KEEP |
| `digital_contracts` | Contracts | KEEP |
| `contract_signatures` | Signatures | KEEP |
| `deal_status_tracking` | Deal tracking | KEEP |
| `user_documents` | User docs | KEEP |

---

## 2. IDENTIFIED DUPLICATES

### Profile Tables (5 tables -> 1)
```
profiles           <- KEEP (refactor)
user_profiles      <- DUPLICATE concept
client_profiles    <- Subset of profiles
owner_profiles     <- Subset of profiles
tenant_profiles    <- Legacy
```

### Listing Tables (3 tables -> 1)
```
listings           <- KEEP
properties         <- Legacy (integer ID, different schema)
owner_properties   <- Duplicate
```

### Matches Tables (4 tables -> 1)
```
matches            <- KEEP
property_matches   <- Legacy (uses properties.id)
owner_client_matches <- CRM features, merge into matches
property_interactions <- Legacy
```

### Messaging Tables (5 tables -> 2)
```
conversations           <- KEEP
conversation_messages   <- KEEP
messages               <- Legacy standalone
match_conversations    <- Legacy
property_match_messages <- Legacy
```

### Likes/Swipes Tables (6 tables -> 2)
```
swipes       <- KEEP (unified)
dislikes     <- KEEP (cooldown feature)
likes        <- Generic, deprecate
user_likes   <- Deprecate
owner_likes  <- Merge into swipes
property_swipes <- Legacy
```

### Favorites Tables (2 tables -> 1)
```
favorites          <- KEEP
property_favorites <- Duplicate
```

### Activity Tables (2 tables -> 0)
```
user_activity_log      <- Deprecate
user_activity_tracking <- Deprecate
(use swipe_analytics + audit_logs instead)
```

### Block Tables (2 tables -> 1)
```
user_blocks     <- KEEP (has reason field)
user_block_list <- Duplicate
```

---

## 3. PROPOSED CLEAN TARGET ARCHITECTURE

### Core Schema Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CORE IDENTITY                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  auth.users (Supabase)                                              │
│       │                                                              │
│       │ 1:1                                                          │
│       ▼                                                              │
│  ┌─────────────────────────────────────────┐                        │
│  │              profiles                    │                        │
│  │  - id (UUID, FK to auth.users)          │                        │
│  │  - role ENUM('client','owner','broker') │  ◄── Single source     │
│  │  - full_name, email, phone              │       of truth         │
│  │  - avatar_url, bio                      │                        │
│  │  - location, latitude, longitude        │                        │
│  │  - is_active, is_banned, verified       │                        │
│  │  - onboarding_completed                 │                        │
│  │  - package (subscription tier)          │                        │
│  │  - owner_* fields (JSONB or flat)       │                        │
│  │  - client_* fields (JSONB or flat)      │                        │
│  └─────────────────────────────────────────┘                        │
│       │                                                              │
│       │ 1:N                                                          │
│       ▼                                                              │
│  profile_photos                                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                          LISTINGS                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────┐                        │
│  │              listings                    │                        │
│  │  - id (UUID)                            │                        │
│  │  - owner_id (FK profiles)               │                        │
│  │  - category ENUM                        │                        │
│  │  - listing_type, status                 │                        │
│  │  - title, description, price            │                        │
│  │  - images[], amenities[]                │                        │
│  │  - latitude, longitude, city            │                        │
│  │  - [category-specific JSONB fields]     │                        │
│  └─────────────────────────────────────────┘                        │
│       │                                                              │
│       │ 1:N                                                          │
│       ▼                                                              │
│  reviews, availability_slots, listing_views                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     SWIPES / MATCHES                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────┐                        │
│  │               swipes                     │                        │
│  │  - id (UUID)                            │                        │
│  │  - user_id (FK profiles)                │  ◄── Who swiped        │
│  │  - target_id (UUID)                     │  ◄── Listing or Profile │
│  │  - target_type ENUM('listing','profile')│                        │
│  │  - action ENUM('like','pass','superlike')│                       │
│  │  - created_at                           │                        │
│  └─────────────────────────────────────────┘                        │
│                                                                      │
│  ┌─────────────────────────────────────────┐                        │
│  │              dislikes                    │                        │
│  │  - id, user_id, target_id, target_type  │                        │
│  │  - cooldown_until (3-day cooldown)      │                        │
│  └─────────────────────────────────────────┘                        │
│                                                                      │
│  ┌─────────────────────────────────────────┐                        │
│  │               matches                    │                        │
│  │  - id (UUID)                            │                        │
│  │  - client_id (FK profiles)              │                        │
│  │  - owner_id (FK profiles)               │                        │
│  │  - listing_id (FK listings, optional)   │                        │
│  │  - is_mutual, match_score               │                        │
│  │  - status, free_messaging               │                        │
│  └─────────────────────────────────────────┘                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        MESSAGING                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────┐                        │
│  │            conversations                 │                        │
│  │  - id (UUID)                            │                        │
│  │  - client_id, owner_id (FK profiles)    │                        │
│  │  - listing_id (optional)                │                        │
│  │  - match_id (optional)                  │                        │
│  │  - last_message, last_message_at        │                        │
│  │  - status, free_messaging               │                        │
│  └─────────────────────────────────────────┘                        │
│       │                                                              │
│       │ 1:N                                                          │
│       ▼                                                              │
│  ┌─────────────────────────────────────────┐                        │
│  │        conversation_messages             │                        │
│  │  - id, conversation_id, sender_id       │                        │
│  │  - message_text, message_type           │                        │
│  │  - is_read, created_at                  │                        │
│  └─────────────────────────────────────────┘                        │
│       │                                                              │
│       │ 1:N                                                          │
│       ▼                                                              │
│  message_attachments                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                       PREFERENCES                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  client_filter_preferences    ◄── Client search filters             │
│       │                                                              │
│       │  (per-user, per-category)                                   │
│                                                                      │
│  owner_client_preferences     ◄── Owner's ideal client filters      │
│       │                                                              │
│       │  (per-user, per-listing)                                    │
│                                                                      │
│  saved_filters               ◄── Named filter presets               │
│  saved_searches              ◄── Search alerts with notifications   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. KEEP / MERGE / DEPRECATE SUMMARY

### KEEP (47 tables)
```
Core:
- profiles (refactor to consolidate)
- profile_photos
- profile_views

Listings:
- listings
- availability_slots
- listing_views
- reviews
- review_helpful_votes

Swipes/Matches:
- swipes
- dislikes
- matches
- favorites

Messaging:
- conversations
- conversation_messages
- message_attachments
- typing_indicators
- conversation_starters

Notifications:
- notifications
- notification_preferences
- best_deal_notifications
- device_tokens
- push_outbox
- user_push_subscriptions

Preferences:
- client_filter_preferences
- owner_client_preferences
- saved_filters
- saved_searches
- saved_search_matches

Settings:
- user_settings
- user_security_settings

Subscriptions:
- subscription_packages
- subscriptions
- package_usage
- message_activations
- payment_activations
- activation_usage_log

Payments:
- payment_providers
- payment_transactions
- paypal_credentials
- user_payment_methods

Admin:
- admin_users
- admin_sessions
- admin_actions_log
- admin_dashboard_settings
- audit_logs
- security_audit_log
- security_event_logs
- data_access_logs
- performance_logs
- rate_limit_log
- rate_limits

Legal:
- legal_documents
- legal_document_quota
- digital_contracts
- contract_signatures
- deal_status_tracking
- user_documents

Safety:
- user_blocks
- user_reports
- property_reports
- user_complaints
- user_warnings
- user_restrictions
- dispute_reports

Other:
- swipe_analytics
- property_tours
- viewing_requests
- mexico_locations
- translations
- service_circuit_breaker
- mfa_methods
- user_consent_logs
- user_feedback
- support_tickets
```

### MERGE (12 tables into existing)
```
client_profiles           -> profiles (add client_ prefixed fields)
owner_profiles            -> profiles (add owner_ prefixed fields)
client_category_preferences -> client_filter_preferences
user_privacy_settings     -> user_settings
property_ratings          -> reviews
owner_likes               -> swipes (add is_owner_like flag)
paypal_transactions       -> payment_transactions
property_features         -> listings.amenities
property_images           -> listings.images
owner_client_matches      -> matches (add CRM fields)
```

### DEPRECATE (24 tables - keep read-only, stop writes)
```
user_profiles              <- Duplicate of profiles
tenant_profiles            <- Legacy
properties                 <- Legacy (integer ID)
owner_properties           <- Duplicate
property_availability      <- Uses legacy properties.id
property_matches           <- Uses legacy properties.id
property_swipes            <- Uses legacy properties.id
property_interactions      <- Legacy
property_favorites         <- Duplicate of favorites
likes                      <- Generic, replaced by swipes
user_likes                 <- Duplicate
messages                   <- Legacy, use conversation_messages
match_conversations        <- Legacy
property_match_messages    <- Legacy
user_notification_preferences <- Duplicate
user_preferences           <- Duplicate
user_search_preferences    <- Duplicate
client_preferences_detailed <- Duplicate
user_activity_log          <- Duplicate
user_activity_tracking     <- Duplicate
user_block_list            <- Duplicate
admin_activity_logs        <- Duplicate
user_subscriptions         <- Duplicate
user_roles                 <- Redundant (role in profiles)
user_interactions          <- Legacy
```

---

## 5. MIGRATION STRATEGY

### Phase 1: Data Consolidation (No Schema Changes)
1. **Audit current data usage**
   - Query all application code for table references
   - Identify which deprecated tables have active writes
   - Map all foreign key relationships

2. **Create migration views**
   - Create views that unify deprecated tables with canonical ones
   - Example: `v_unified_profiles` joining profiles + client_profiles + owner_profiles

3. **Update application reads**
   - Point all reads to canonical tables or views
   - Test thoroughly in staging

### Phase 2: Write Migration
1. **Dual-write period**
   - Write to both old and new tables simultaneously
   - Validate data consistency

2. **Stop writes to deprecated tables**
   - Update all INSERT/UPDATE operations to canonical tables only
   - Keep deprecated tables read-only for rollback safety

3. **Data backfill**
   - Migrate any missing data from deprecated to canonical tables
   - Validate row counts and data integrity

### Phase 3: Cleanup (After 30-day stability)
1. **Drop foreign keys** referencing deprecated tables
2. **Archive deprecated tables** (rename with `_deprecated_` prefix)
3. **Update TypeScript types** via `supabase gen types`
4. **Remove deprecated table references** from application code

### Phase 4: Optimization
1. **Add missing indexes** on frequently queried columns
2. **Enable Supabase Realtime** only on necessary tables
3. **Implement row-level caching** for profiles and listings
4. **Add database functions** for common multi-table operations

---

## 6. PERFORMANCE IMPACT ANALYSIS

### Current Issues
| Problem | Cause | Impact |
|---------|-------|--------|
| Dashboard re-render loops | Multiple queries to profiles, user_profiles, client_profiles | 3-5 extra queries per render |
| Slow swipe card loading | Joins across listings + properties + property_features | ~200ms latency |
| Message flicker | Queries to messages + conversation_messages | Inconsistent read paths |
| Match notification delays | Checking matches + property_matches + owner_client_matches | N+1 query pattern |

### Expected Improvements
| Optimization | Expected Gain |
|--------------|---------------|
| Single profiles table | -60% profile query time |
| Single listings table | -40% listing query time |
| Unified swipes table | -50% match detection time |
| Unified messaging | -70% message load time |
| Removed duplicate indexes | -30% write latency |

---

## 7. RISK MITIGATION

1. **No table deletions** - All deprecated tables remain for rollback
2. **Feature flags** - Gate new query paths behind flags
3. **Shadow reads** - Read from both old and new, compare results
4. **Gradual rollout** - Migrate by user cohort (10% -> 50% -> 100%)
5. **Monitoring** - Track query latencies, error rates during migration

---

## 8. NEXT STEPS

1. [ ] Review this analysis with the team
2. [ ] Approve KEEP/MERGE/DEPRECATE list
3. [ ] Create detailed migration SQL scripts (on request)
4. [ ] Set up staging environment for testing
5. [ ] Implement Phase 1 (views and read migration)
6. [ ] Schedule Phase 2 during low-traffic window

---

*Document generated: 2026-01-12*
*Tables analyzed: 105+*
*Recommended reductions: 24 deprecated, 12 merged*
*Target active tables: ~70*
