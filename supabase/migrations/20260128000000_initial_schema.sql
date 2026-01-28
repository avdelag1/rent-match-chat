-- Migration: 1 - Core Tables
-- Date: 2026-01-28
-- Purpose: Fresh start for rent-match rebuild

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('owner', 'worker', 'client')),
    avatar_url TEXT,
    bio TEXT,
    phone TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROFILES RLS POLICIES
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view all profiles
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- LISTINGS TABLE (properties from owners)
-- ============================================
CREATE TABLE public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT CHECK (property_type IN ('apartment', 'house', 'room', 'studio', 'commercial')),
    price DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    square_meters INTEGER,
    amenities TEXT[], -- Array of amenities
    available_from DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LISTINGS RLS POLICIES
-- ============================================
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active listings
CREATE POLICY "Active listings are viewable"
    ON public.listings FOR SELECT
    USING (is_active = true);

-- Owners can insert their own listings
CREATE POLICY "Owners can insert listings"
    ON public.listings FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own listings
CREATE POLICY "Owners can update own listings"
    ON public.listings FOR UPDATE
    USING (auth.uid() = owner_id);

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
    ON public.listings_photos FOR SELECT
    USING (true);

CREATE POLICY "Owners can manage photos"
    ON public.listings_photos FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.listings
            WHERE id = listing_id AND owner_id = auth.uid()
        )
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
    ON public.saved_listings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save listings"
    ON public.saved_listings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave listings"
    ON public.saved_listings FOR DELETE
    USING (auth.uid() = user_id);

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
    ON public.swipes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can swipe on listings"
    ON public.swipes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

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
    ON public.matches FOR SELECT
    USING (auth.uid() = client_id OR auth.uid() = owner_id);

CREATE POLICY "System can create matches"
    ON public.matches FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update own matches"
    ON public.matches FOR UPDATE
    USING (auth.uid() = client_id OR auth.uid() = owner_id);

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
    participant_one UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    participant_two UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
    ON public.conversations FOR SELECT
    USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can create conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id 
            AND (participant_one = auth.uid() OR participant_two = auth.uid())
        )
    );

CREATE POLICY "Users can send messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
    ON public.messages FOR UPDATE
    USING (auth.uid() = sender_id OR 
        EXISTS (
            SELECT 1 FROM public.conversations
            WHERE id = conversation_id 
            AND (participant_one = auth.uid() OR participant_two = auth.uid())
        ));

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
    ON public.subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscription"
    ON public.subscriptions FOR ALL
    USING (auth.uid() = user_id);

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
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (true);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_listings_location ON public.listings(state, city);
CREATE INDEX idx_listings_active ON public.listings(is_active) WHERE is_active = true;
CREATE INDEX idx_swipes_user ON public.swipes(user_id);
CREATE INDEX idx_matches_participants ON public.matches(client_id, owner_id);
CREATE INDEX idx_conversations_participants ON public.conversations(participant_one, participant_two);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
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
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
    BEFORE UPDATE ON public.listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
