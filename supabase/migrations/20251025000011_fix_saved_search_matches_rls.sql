-- Fix RLS policy for saved_search_matches INSERT operation
-- The previous policy was overly permissive (WITH CHECK (true))
-- This migration restricts INSERT to only backend functions via service role

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "System can insert match records" ON public.saved_search_matches;

-- Create a more secure policy that only allows service role to insert
-- Backend triggers and functions will use service role to insert matches
CREATE POLICY "Service role can insert match records"
  ON public.saved_search_matches
  FOR INSERT
  WITH CHECK (
    -- Only service role (backend functions/triggers) can insert
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Add policy for users to view their own match records
CREATE POLICY "Users can view their own match records"
  ON public.saved_search_matches
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_searches
      WHERE saved_searches.id = saved_search_matches.saved_search_id
      AND saved_searches.user_id = auth.uid()
    )
  );

-- Add policy for users to update notification status on their matches
CREATE POLICY "Users can update their own match records"
  ON public.saved_search_matches
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.saved_searches
      WHERE saved_searches.id = saved_search_matches.saved_search_id
      AND saved_searches.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.saved_searches
      WHERE saved_searches.id = saved_search_matches.saved_search_id
      AND saved_searches.user_id = auth.uid()
    )
  );

-- Add composite index for better performance on notification queries
CREATE INDEX IF NOT EXISTS idx_saved_search_matches_search_notified
  ON public.saved_search_matches(saved_search_id, notified)
  WHERE notified = FALSE;

-- Add index for listing lookups
CREATE INDEX IF NOT EXISTS idx_saved_search_matches_listing
  ON public.saved_search_matches(listing_id);
