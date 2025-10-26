-- Migration: Create calendar and availability management system
-- Allows property owners to manage availability and clients to book viewings

-- Create availability_slots table
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Date and time
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,

  -- Pricing (can vary by date/season)
  price_override NUMERIC(10, 2),

  -- Reason for unavailability
  unavailable_reason TEXT CHECK (unavailable_reason IN ('booked', 'blocked', 'maintenance', 'personal', 'other')),
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Ensure valid date range
  CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_availability_property ON public.availability_slots(listing_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_availability_owner ON public.availability_slots(owner_id);
CREATE INDEX IF NOT EXISTS idx_availability_dates ON public.availability_slots(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_availability_available ON public.availability_slots(is_available) WHERE is_available = TRUE;

-- Enable RLS
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

-- Property owners can manage their availability
CREATE POLICY "Property owners can manage availability"
  ON public.availability_slots
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Anyone can view available slots
CREATE POLICY "Anyone can view available slots"
  ON public.availability_slots
  FOR SELECT
  USING (is_available = TRUE);

-- Create viewing_requests table for scheduling property viewings
CREATE TABLE IF NOT EXISTS public.viewing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Viewing details
  requested_date DATE NOT NULL,
  requested_time TIME,
  preferred_time_slot TEXT, -- 'morning', 'afternoon', 'evening'
  duration_minutes INTEGER DEFAULT 30,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled', 'completed')),

  -- Messages
  message_from_client TEXT,
  response_from_owner TEXT,

  -- Confirmed details
  confirmed_date DATE,
  confirmed_time TIME,

  -- Meeting details
  meeting_type TEXT CHECK (meeting_type IN ('in_person', 'virtual', 'flexible')),
  meeting_link TEXT,
  meeting_location TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_viewing_property ON public.viewing_requests(listing_id);
CREATE INDEX IF NOT EXISTS idx_viewing_requester ON public.viewing_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_viewing_owner ON public.viewing_requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_viewing_status ON public.viewing_requests(status);
CREATE INDEX IF NOT EXISTS idx_viewing_date ON public.viewing_requests(requested_date);

-- Enable RLS
ALTER TABLE public.viewing_requests ENABLE ROW LEVEL SECURITY;

-- Clients can create and view their own requests
CREATE POLICY "Clients can manage their viewing requests"
  ON public.viewing_requests
  FOR ALL
  USING (auth.uid() = requester_id)
  WITH CHECK (auth.uid() = requester_id);

-- Owners can view and respond to requests for their listings
CREATE POLICY "Owners can manage viewing requests for their listings"
  ON public.viewing_requests
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Function to check property availability for a date range
CREATE OR REPLACE FUNCTION public.check_property_availability(
  p_listing_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  is_blocked BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.availability_slots
    WHERE listing_id = p_listing_id
      AND is_available = FALSE
      AND (
        (start_date <= p_start_date AND end_date >= p_start_date)
        OR (start_date <= p_end_date AND end_date >= p_end_date)
        OR (start_date >= p_start_date AND end_date <= p_end_date)
      )
  ) INTO is_blocked;

  RETURN NOT is_blocked;
END;
$$;

-- Function to block dates
CREATE OR REPLACE FUNCTION public.block_dates(
  p_listing_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_reason TEXT DEFAULT 'blocked',
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  slot_id UUID;
  property_owner UUID;
BEGIN
  -- Verify ownership
  SELECT owner_id INTO property_owner
  FROM public.listings
  WHERE id = p_listing_id;

  IF property_owner != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You do not own this property';
  END IF;

  -- Insert blocked period
  INSERT INTO public.availability_slots (
    listing_id,
    owner_id,
    start_date,
    end_date,
    is_available,
    unavailable_reason,
    notes
  )
  VALUES (
    p_listing_id,
    auth.uid(),
    p_start_date,
    p_end_date,
    FALSE,
    p_reason,
    p_notes
  )
  RETURNING id INTO slot_id;

  RETURN slot_id;
END;
$$;

-- Function to request a viewing
CREATE OR REPLACE FUNCTION public.request_viewing(
  p_listing_id UUID,
  p_requested_date DATE,
  p_requested_time TIME DEFAULT NULL,
  p_message TEXT DEFAULT NULL,
  p_meeting_type TEXT DEFAULT 'in_person'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  viewing_id UUID;
  property_owner UUID;
  property_title TEXT;
BEGIN
  -- Get property owner
  SELECT owner_id, title INTO property_owner, property_title
  FROM public.listings
  WHERE id = p_listing_id;

  IF property_owner IS NULL THEN
    RAISE EXCEPTION 'Property not found';
  END IF;

  -- Create viewing request
  INSERT INTO public.viewing_requests (
    listing_id,
    requester_id,
    owner_id,
    requested_date,
    requested_time,
    message_from_client,
    meeting_type
  )
  VALUES (
    p_listing_id,
    auth.uid(),
    property_owner,
    p_requested_date,
    p_requested_time,
    p_message,
    p_meeting_type
  )
  RETURNING id INTO viewing_id;

  -- Send notification to property owner
  PERFORM public.send_notification(
    p_user_id := property_owner,
    p_type := 'property_inquiry'::public.notification_type,
    p_title := 'New viewing request',
    p_message := 'Someone requested to view your property: ' || property_title,
    p_link_url := '/owner/viewing-requests/' || viewing_id::text,
    p_related_user_id := auth.uid(),
    p_related_listing_id := p_listing_id
  );

  RETURN viewing_id;
END;
$$;

-- Function to confirm viewing
CREATE OR REPLACE FUNCTION public.confirm_viewing(
  p_viewing_id UUID,
  p_confirmed_date DATE,
  p_confirmed_time TIME,
  p_meeting_link TEXT DEFAULT NULL,
  p_response_message TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  viewing_owner UUID;
  requester UUID;
BEGIN
  -- Get owner and requester
  SELECT owner_id, requester_id
  INTO viewing_owner, requester
  FROM public.viewing_requests
  WHERE id = p_viewing_id;

  -- Verify ownership
  IF viewing_owner != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You cannot confirm this viewing';
  END IF;

  -- Update viewing request
  UPDATE public.viewing_requests
  SET
    status = 'confirmed',
    confirmed_date = p_confirmed_date,
    confirmed_time = p_confirmed_time,
    meeting_link = p_meeting_link,
    response_from_owner = p_response_message,
    confirmed_at = NOW()
  WHERE id = p_viewing_id;

  -- Send notification to requester
  PERFORM public.send_notification(
    p_user_id := requester,
    p_type := 'property_inquiry'::public.notification_type,
    p_title := 'Viewing confirmed!',
    p_message := 'Your viewing request has been confirmed for ' || p_confirmed_date::text,
    p_link_url := '/client/viewings/' || p_viewing_id::text
  );
END;
$$;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_availability_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_availability_updated_at ON public.availability_slots;
CREATE TRIGGER trg_availability_updated_at
  BEFORE UPDATE ON public.availability_slots
  FOR EACH ROW
  EXECUTE FUNCTION public.update_availability_updated_at();

DROP TRIGGER IF EXISTS trg_viewing_updated_at ON public.viewing_requests;
CREATE TRIGGER trg_viewing_updated_at
  BEFORE UPDATE ON public.viewing_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_availability_updated_at();

COMMENT ON TABLE public.availability_slots IS 'Property availability calendar for managing bookable dates';
COMMENT ON TABLE public.viewing_requests IS 'Viewing/tour requests from clients to property owners';
COMMENT ON FUNCTION public.check_property_availability IS 'Check if a property is available for a given date range';
