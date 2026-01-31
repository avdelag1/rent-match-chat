-- Migration: 1 - Core Tables (Updated for app compatibility)
-- Date: 2026-01-28
-- Purpose: Fresh start for rent-match rebuild with all app columns

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends auth.users) - matches live DB schema
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT CHECK (role IN ('owner', 'worker', 'client')),
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    -- Additional fields from live DB
    age INTEGER,
    gender TEXT,
    city TEXT,
    country TEXT,
    neighborhood TEXT,
    nationality TEXT,
    languages_spoken TEXT[],
    interests TEXT[],
    lifestyle_tags TEXT[],
    images TEXT[],
    profile_photo_url TEXT,
    has_pets BOOLEAN,
    smoking BOOLEAN,
    party_friendly BOOLEAN,
    work_schedule TEXT,
    budget_min NUMERIC,
    budget_max NUMERIC,
    active_mode TEXT,
    package TEXT,
    verified BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    is_blocked BOOLEAN DEFAULT FALSE,
    is_suspended BOOLEAN DEFAULT FALSE,
    average_rating NUMERIC,
    total_reviews INTEGER DEFAULT 0,
    broker_verified BOOLEAN DEFAULT FALSE,
    broker_tier TEXT,
    theme_preference TEXT,
    cache_version INTEGER DEFAULT 1,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- LISTINGS TABLE (properties from owners)
-- ============================================
CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Core fields
    category TEXT NOT NULL CHECK (category IN ('property', 'motorcycle', 'bicycle', 'worker')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'sold', 'rented')),
    is_active BOOLEAN DEFAULT TRUE,
    listing_type TEXT CHECK (listing_type IN ('rent', 'buy', 'service')),
    mode TEXT CHECK (mode IN ('rent', 'sale', 'both')),
    
    -- Pricing
    price DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    rental_rates JSONB,
    rental_duration_type TEXT,
    pricing_unit TEXT,
    
    -- Location
    country TEXT,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_type TEXT,
    service_radius_km INTEGER,
    
    -- Property specific
    property_type TEXT CHECK (property_type IN ('apartment', 'house', 'room', 'studio', 'commercial', 'land')),
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    square_meters INTEGER,
    square_footage INTEGER,
    furnished BOOLEAN DEFAULT FALSE,
    pet_friendly BOOLEAN DEFAULT FALSE,
    amenities TEXT[],
    services_included TEXT[],
    house_rules TEXT,
    
    -- Vehicle/Motorcycle specific
    vehicle_brand TEXT,
    vehicle_model TEXT,
    vehicle_condition TEXT CHECK (vehicle_condition IN ('new', 'excellent', 'good', 'fair', 'poor')),
    year INTEGER,
    mileage INTEGER,
    engine_cc INTEGER,
    fuel_type TEXT,
    transmission_type TEXT,
    color TEXT,
    motorcycle_type TEXT,
    vehicle_type TEXT,
    
    -- Bicycle specific
    bicycle_type TEXT,
    frame_size TEXT,
    frame_material TEXT,
    number_of_gears INTEGER,
    suspension_type TEXT,
    brake_type TEXT,
    wheel_size DECIMAL(5, 2),
    electric_assist BOOLEAN DEFAULT FALSE,
    battery_range INTEGER,
    includes_lock BOOLEAN DEFAULT FALSE,
    includes_lights BOOLEAN DEFAULT FALSE,
    includes_basket BOOLEAN DEFAULT FALSE,
    includes_pump BOOLEAN DEFAULT FALSE,
    
    -- Motorcycle features
    has_abs BOOLEAN DEFAULT FALSE,
    has_traction_control BOOLEAN DEFAULT FALSE,
    has_heated_grips BOOLEAN DEFAULT FALSE,
    has_luggage_rack BOOLEAN DEFAULT FALSE,
    includes_helmet BOOLEAN DEFAULT FALSE,
    includes_gear BOOLEAN DEFAULT FALSE,
    license_required TEXT,
    
    -- Worker specific
    service_category TEXT,
    custom_service_name TEXT,
    work_type TEXT,
    schedule_type TEXT,
    days_available TEXT[],
    time_slots_available TEXT[],
    experience_level TEXT,
    experience_years INTEGER,
    worker_skills TEXT[],
    certifications TEXT[],
    tools_equipment TEXT[],
    minimum_booking_hours INTEGER,
    offers_emergency_service BOOLEAN DEFAULT FALSE,
    background_check_verified BOOLEAN DEFAULT FALSE,
    insurance_verified BOOLEAN DEFAULT FALSE,
    languages TEXT[],
    
    -- Media
    images TEXT[],
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    available_from DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LISTINGS RLS POLICIES
-- ============================================
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active listings are viewable"
    ON public.listings FOR SELECT USING (is_active = true);

CREATE POLICY "Owners can insert listings"
    ON public.listings FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own listings"
    ON public.listings FOR UPDATE USING (auth.uid() = owner_id);

-- ============================================
-- LISTINGS PHOTOS TABLE
-- ============================================
CREATE TABLE public.listings_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.listings_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos are viewable by everyone"
    ON public.listings_photos FOR SELECT USING (true);

CREATE POLICY "Owners can manage photos"
    ON public.listings_photos FOR ALL USING (
        EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND owner_id = auth.uid())
    );

-- ============================================
-- SAVED LISTINGS (for clients saving favorites)
-- ============================================
CREATE TABLE public.saved_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, listing_id)
);

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved listings"
    ON public.saved_listings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings"
    ON public.saved_listings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave listings"
    ON public.saved_listings FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- CLIENT FILTER PREFERENCES
-- ============================================
CREATE TABLE public.client_filter_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    preferred_listing_types TEXT[] DEFAULT ARRAY['rent'],
    preferred_property_types TEXT[],
    preferred_states TEXT[],
    preferred_cities TEXT[],
    price_min DECIMAL(12, 2),
    price_max DECIMAL(12, 2),
    bedrooms_min INTEGER,
    bedrooms_max INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.client_filter_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
    ON public.client_filter_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SWIPES TABLE (for matching system)
-- ============================================
CREATE TABLE public.swipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    swipe_type TEXT NOT NULL CHECK (swipe_type IN ('like', 'dislike', 'superlike')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_listing_id)
);

ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own swipes"
    ON public.swipes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can swipe on listings"
    ON public.swipes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- LIKES TABLE (matches live DB schema)
-- ============================================
CREATE TABLE public.likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('listing', 'profile')),
    direction TEXT NOT NULL DEFAULT 'right' CHECK (direction IN ('left', 'right')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, target_id, target_type)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own likes"
    ON public.likes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert likes"
    ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own likes"
    ON public.likes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
    ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- Allow owners to see who liked their listings
CREATE POLICY "Owners can see likes on their listings"
    ON public.likes FOR SELECT USING (
        target_type = 'listing' AND
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE id = target_id AND owner_id = auth.uid()
        )
    );

-- ============================================
-- MATCHES TABLE (mutual likes)
-- ============================================
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'declined', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own matches"
    ON public.matches FOR SELECT USING (auth.uid() = client_id OR auth.uid() = owner_id);

CREATE POLICY "System can create matches"
    ON public.matches FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own matches"
    ON public.matches FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = owner_id);

-- ============================================
-- CONVERSATIONS TABLE (matches live DB schema)
-- ============================================
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
    last_message TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_sender_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'active',
    free_messaging BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
    ON public.conversations FOR SELECT USING (auth.uid() = client_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create conversations"
    ON public.conversations FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = owner_id);

CREATE POLICY "Users can update own conversations"
    ON public.conversations FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = owner_id);

-- ============================================
-- CONVERSATION_MESSAGES TABLE (matches live DB schema)
-- ============================================
CREATE TABLE public.conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
    ON public.conversation_messages FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND (client_id = auth.uid() OR owner_id = auth.uid()))
    );

CREATE POLICY "Users can send messages"
    ON public.conversation_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages"
    ON public.conversation_messages FOR UPDATE USING (
        auth.uid() = sender_id OR
        EXISTS (SELECT 1 FROM public.conversations WHERE id = conversation_id AND (client_id = auth.uid() OR owner_id = auth.uid()))
    );

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_type TEXT DEFAULT 'free' CHECK (plan_type IN ('free', 'basic', 'premium', 'professional')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
    ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscription"
    ON public.subscriptions FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('match', 'message', 'like', 'view', 'system')),
    title TEXT NOT NULL,
    content TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT WITH CHECK (true);

-- ============================================
-- USER_ROLES TABLE (used by signup trigger)
-- ============================================
CREATE TABLE public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'worker', 'client')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own role"
    ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own role"
    ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own role"
    ON public.user_roles FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_listings_location ON public.listings(state, city);
CREATE INDEX idx_listings_category ON public.listings(category);
CREATE INDEX idx_listings_active ON public.listings(is_active) WHERE is_active = true;
CREATE INDEX idx_listings_owner ON public.listings(owner_id);
CREATE INDEX idx_swipes_user ON public.swipes(user_id);
CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_matches_participants ON public.matches(client_id, owner_id);
CREATE INDEX idx_conversations_participants ON public.conversations(client_id, owner_id);
CREATE INDEX idx_conversation_messages_conversation ON public.conversation_messages(conversation_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id) WHERE is_read = false;

-- ============================================
-- UPDATED AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_client_filter_updated_at BEFORE UPDATE ON public.client_filter_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
