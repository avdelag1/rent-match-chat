-- Create reviews and messaging enhancement tables

-- 1. Create reviews table for rating system
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id uuid NOT NULL,
  reviewed_user_id uuid NULL,
  listing_id uuid NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  review_type text NOT NULL CHECK (review_type IN ('property', 'user_as_tenant', 'user_as_owner')),
  is_verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT review_target_check CHECK (
    (reviewed_user_id IS NOT NULL AND listing_id IS NULL) OR 
    (reviewed_user_id IS NULL AND listing_id IS NOT NULL)
  )
);

-- Enable RLS on reviews table
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reviews
CREATE POLICY "Users can view all reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE 
  USING (auth.uid() = reviewer_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE 
  USING (auth.uid() = reviewer_id);

-- 2. Create message attachments table for enhanced messaging
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  attachment_type text NOT NULL CHECK (attachment_type IN ('image', 'document', 'video')),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on message attachments
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for message attachments
CREATE POLICY "Users can view attachments in their conversations" ON public.message_attachments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversation_messages cm
      JOIN conversations c ON cm.conversation_id = c.id
      WHERE cm.id = message_attachments.message_id 
      AND (c.client_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can create attachments for their messages" ON public.message_attachments FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversation_messages cm
      JOIN conversations c ON cm.conversation_id = c.id
      WHERE cm.id = message_attachments.message_id 
      AND cm.sender_id = auth.uid()
      AND (c.client_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );

-- 3. Create storage buckets for attachments if they don't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message-attachments', 'message-attachments', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Create storage policies for message attachments
CREATE POLICY "Users can upload attachments" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view attachments in their conversations" ON storage.objects FOR SELECT 
  USING (bucket_id = 'message-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Create storage policies for review images
CREATE POLICY "Anyone can view review images" ON storage.objects FOR SELECT 
  USING (bucket_id = 'review-images');

CREATE POLICY "Authenticated users can upload review images" ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();