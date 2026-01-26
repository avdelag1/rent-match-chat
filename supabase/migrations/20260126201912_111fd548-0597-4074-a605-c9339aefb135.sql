-- Drop unused legacy tables with zero records
-- These tables are no longer used by the application

DROP TABLE IF EXISTS public.communication_channels CASCADE;
DROP TABLE IF EXISTS public.channel_participants CASCADE;
DROP TABLE IF EXISTS public.user_authentication_methods CASCADE;
DROP TABLE IF EXISTS public.mfa_methods CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.match_conversations CASCADE;