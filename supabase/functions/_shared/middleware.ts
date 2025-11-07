// Simplified middleware for Deno edge functions
// Express-style middleware not supported in Deno runtime

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
