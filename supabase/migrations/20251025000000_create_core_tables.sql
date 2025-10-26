-- Migration: Create core missing tables (listings, conversations, conversation_messages)
-- These tables are required by the frontend but were missing from migrations

-- Create listings table (properties/motorcycles/bicycles/yachts)
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'property' CHECK (category IN ('property', 'motorcycle', 'bicycle', 'yacht')),
  listing_type TEXT NOT NULL DEFAULT 'rent' CHECK (listing_type IN ('rent', 'sale', 'both')),

  -- Pricing
  price NUMERIC(10, 2),
  currency TEXT DEFAULT 'USD',

  -- Location
  location TEXT,
  city TEXT,
  country TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),

  -- Media
  images TEXT[] DEFAULT '{}',
  video_url TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),
  is_active BOOLEAN DEFAULT TRUE,

  -- Property specific
  bedrooms TEXT,
  bathrooms TEXT,
  square_feet INTEGER,
  property_type TEXT,
  amenities TEXT[] DEFAULT '{}',
  furnished BOOLEAN DEFAULT FALSE,

  -- Vehicle specific
  vehicle_type TEXT,
  vehicle_year INTEGER,
  vehicle_condition TEXT,
  vehicle_features TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Analytics
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0
);

-- Create indexes for listings
CREATE INDEX IF NOT EXISTS idx_listings_owner ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_listings_active ON public.listings(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_city ON public.listings(city);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_created ON public.listings(created_at DESC);

-- GIN indexes for array fields
CREATE INDEX IF NOT EXISTS idx_listings_images ON public.listings USING GIN(images);
CREATE INDEX IF NOT EXISTS idx_listings_amenities ON public.listings USING GIN(amenities);

-- Location index for map search
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings USING gist (
  ll_to_earth(latitude::float8, longitude::float8)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listings
CREATE POLICY "Authenticated users can view active listings"
  ON public.listings
  FOR SELECT
  TO authenticated
  USING (is_active = TRUE AND status = 'active');

CREATE POLICY "Owners can manage their own listings"
  ON public.listings
  FOR ALL
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Last message info
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  last_message_sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure unique conversations (no duplicates)
  CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id),
  CHECK (participant_1_id != participant_2_id)
);

-- Create indexes for conversations
CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_active ON public.conversations(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON public.conversations
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

CREATE POLICY "Users can create conversations"
  ON public.conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

CREATE POLICY "Users can update their own conversations"
  ON public.conversations
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  )
  WITH CHECK (
    auth.uid() = participant_1_id OR auth.uid() = participant_2_id
  );

-- Create conversation_messages table
CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Message content
  content TEXT NOT NULL,

  -- Attachments
  has_attachment BOOLEAN DEFAULT FALSE,
  attachment_url TEXT,
  attachment_type TEXT,

  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  is_delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for conversation_messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.conversation_messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.conversation_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.conversation_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON public.conversation_messages(receiver_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.conversation_messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversation_messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.conversation_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages in their conversations"
  ON public.conversation_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
        AND (participant_1_id = auth.uid() OR participant_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON public.conversation_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create trigger to update conversation last_message
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.conversations
  SET
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    last_message_sender_id = NEW.sender_id,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_conversation_last_message ON public.conversation_messages;
CREATE TRIGGER trg_update_conversation_last_message
  AFTER INSERT ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.listings;
CREATE TRIGGER trg_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_messages_updated_at ON public.conversation_messages;
CREATE TRIGGER trg_messages_updated_at
  BEFORE UPDATE ON public.conversation_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add tables to realtime
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.listings;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.conversations;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.conversation_messages;

ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_messages;

COMMENT ON TABLE public.listings IS 'Property, motorcycle, bicycle, and yacht listings';
COMMENT ON TABLE public.conversations IS 'One-on-one conversations between users';
COMMENT ON TABLE public.conversation_messages IS 'Messages within conversations';
