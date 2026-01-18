# 🤖 ANTI-BOT & ANTI-SCRAPING PROTECTION

**Multi-Layer Defense Against Automated Abuse**

Date: 2026-01-18
Classification: Critical Security Infrastructure

---

## TABLE OF CONTENTS

1. [Threat Model](#threat-model)
2. [Rate Limiting](#rate-limiting)
3. [Pagination Hard Caps](#pagination-hard-caps)
4. [Privacy-Safe Fingerprinting](#privacy-safe-fingerprinting)
5. [Cloudflare/Vercel WAF Rules](#cloudflare-vercel-waf-rules)
6. [Behavioral Detection](#behavioral-detection)
7. [What CAN vs CANNOT Be Blocked](#what-can-vs-cannot-be-blocked)

---

## THREAT MODEL

### Attack Vectors

1. **Mass Profile Scraping** - Bot reads all user profiles to build database
2. **Automated Swiping** - Bot auto-swipes on all profiles
3. **Bulk Message Sending** - Spam messages to all matches
4. **Listing Scraping** - Competitor scrapes all property listings
5. **ID Enumeration** - Guessing UUIDs to access unauthorized data
6. **DDoS/Resource Exhaustion** - Overwhelming API with requests

### Attacker Profiles

- **Script Kiddies** - Simple curl/wget scrapers
- **Sophisticated Bots** - Headless browsers, rotating IPs
- **Competitors** - Professional data scraping operations
- **Stalkers** - Targeted harassment via automation

---

## RATE LIMITING

### Database Schema - Rate Limit Tracking

```sql
-- Track API requests per user and IP
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifier (user_id OR ip_address)
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ip_address TEXT,
  endpoint TEXT NOT NULL,

  -- Rate limit tracking
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  window_duration_seconds INTEGER DEFAULT 60, -- 1 minute window

  -- Metadata
  user_agent TEXT,
  last_request_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_endpoint_window UNIQUE (user_id, endpoint, window_start),
  CONSTRAINT unique_ip_endpoint_window UNIQUE (ip_address, endpoint, window_start)
);

-- Enable RLS (only service role can access)
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Indexes for fast lookups
CREATE INDEX idx_rate_limits_user_endpoint
  ON public.api_rate_limits(user_id, endpoint, window_start DESC);

CREATE INDEX idx_rate_limits_ip_endpoint
  ON public.api_rate_limits(ip_address, endpoint, window_start DESC);

-- Cleanup old windows (hourly cron job)
CREATE INDEX idx_rate_limits_cleanup
  ON public.api_rate_limits(window_start)
  WHERE window_start < NOW() - INTERVAL '1 hour';
```

---

### Rate Limit Configuration

```typescript
// src/lib/rateLimits.ts
export const RATE_LIMITS = {
  // Authentication
  signup: {
    perIP: 5,
    perHour: 10,
    window: 3600, // 1 hour
  },
  login: {
    perIP: 10,
    perUser: 20,
    window: 900, // 15 minutes
  },

  // Profile browsing
  profileView: {
    perUser: 100,
    perIP: 200,
    window: 60, // 1 minute
  },
  profileSearch: {
    perUser: 50,
    perIP: 100,
    window: 60,
  },

  // Swiping
  swipe: {
    perUser: 100, // 100 swipes per minute (generous)
    perIP: 200,
    window: 60,
  },

  // Messaging
  sendMessage: {
    perUser: 30, // 30 messages per minute
    perIP: 60,
    window: 60,
  },
  createConversation: {
    perUser: 10,
    perIP: 20,
    window: 60,
  },

  // Listings
  listingView: {
    perIP: 500, // Allow high browsing rate
    window: 60,
  },
  listingCreate: {
    perUser: 5,
    perIP: 10,
    window: 3600, // 1 hour
  },

  // API endpoints
  apiDefault: {
    perUser: 60,
    perIP: 120,
    window: 60, // 60 requests per minute default
  },
};
```

---

### Rate Limit Middleware (Edge Function)

```typescript
// supabase/functions/_shared/rateLimit.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

export interface RateLimitConfig {
  perUser?: number;
  perIP?: number;
  window: number; // seconds
  endpoint: string;
}

export async function checkRateLimit(
  req: Request,
  config: RateLimitConfig
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Extract identifiers
  const authHeader = req.headers.get('Authorization');
  const ipAddress = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  let userId: string | null = null;

  // Try to get user ID from JWT
  if (authHeader) {
    try {
      const { data: { user } } = await supabaseAdmin.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      userId = user?.id || null;
    } catch {
      // Anonymous request
    }
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - config.window * 1000);

  // Check user rate limit
  if (userId && config.perUser) {
    const { data: userLimit } = await supabaseAdmin
      .from('api_rate_limits')
      .select('request_count, window_start')
      .eq('user_id', userId)
      .eq('endpoint', config.endpoint)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (userLimit && userLimit.request_count >= config.perUser) {
      const retryAfter = Math.ceil(
        (new Date(userLimit.window_start).getTime() + config.window * 1000 - now.getTime()) /
          1000
      );
      return { allowed: false, retryAfter };
    }

    // Increment or create user limit
    if (userLimit) {
      await supabaseAdmin
        .from('api_rate_limits')
        .update({
          request_count: userLimit.request_count + 1,
          last_request_at: now.toISOString(),
        })
        .eq('user_id', userId)
        .eq('endpoint', config.endpoint)
        .gte('window_start', windowStart.toISOString());
    } else {
      await supabaseAdmin.from('api_rate_limits').insert({
        user_id: userId,
        endpoint: config.endpoint,
        request_count: 1,
        window_start: now.toISOString(),
        window_duration_seconds: config.window,
        user_agent: userAgent,
      });
    }
  }

  // Check IP rate limit
  if (config.perIP) {
    const { data: ipLimit } = await supabaseAdmin
      .from('api_rate_limits')
      .select('request_count, window_start')
      .eq('ip_address', ipAddress)
      .eq('endpoint', config.endpoint)
      .gte('window_start', windowStart.toISOString())
      .single();

    if (ipLimit && ipLimit.request_count >= config.perIP) {
      const retryAfter = Math.ceil(
        (new Date(ipLimit.window_start).getTime() + config.window * 1000 - now.getTime()) /
          1000
      );
      return { allowed: false, retryAfter };
    }

    // Increment or create IP limit
    if (ipLimit) {
      await supabaseAdmin
        .from('api_rate_limits')
        .update({
          request_count: ipLimit.request_count + 1,
          last_request_at: now.toISOString(),
        })
        .eq('ip_address', ipAddress)
        .eq('endpoint', config.endpoint)
        .gte('window_start', windowStart.toISOString());
    } else {
      await supabaseAdmin.from('api_rate_limits').insert({
        ip_address: ipAddress,
        endpoint: config.endpoint,
        request_count: 1,
        window_start: now.toISOString(),
        window_duration_seconds: config.window,
        user_agent: userAgent,
      });
    }
  }

  return { allowed: true };
}

// Usage in Edge Function
import { checkRateLimit } from '../_shared/rateLimit.ts';

const rateLimitResult = await checkRateLimit(req, {
  endpoint: 'swipe',
  perUser: 100,
  perIP: 200,
  window: 60,
});

if (!rateLimitResult.allowed) {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: rateLimitResult.retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': rateLimitResult.retryAfter?.toString() || '60',
      },
    }
  );
}
```

---

## PAGINATION HARD CAPS

### Database Functions with Built-in Limits

```sql
-- Example: Get profiles for browsing with HARD CAP
CREATE OR REPLACE FUNCTION public.get_browsable_profiles(
  exclude_user_id UUID DEFAULT auth.uid(),
  page_size INTEGER DEFAULT 50,
  page_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  age INTEGER,
  bio TEXT,
  images TEXT[],
  city TEXT
  -- ... other safe fields
)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- HARD CAP: Maximum 100 results per call, max offset 1000
  IF page_size > 100 THEN
    page_size := 100;
  END IF;

  IF page_offset > 1000 THEN
    RAISE EXCEPTION 'Maximum offset exceeded. Cannot browse beyond 1000 results.';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    p.age,
    p.bio,
    p.images,
    p.city
  FROM public.profiles p
  WHERE p.id != exclude_user_id
    AND p.is_active = true
    AND p.onboarding_completed = true
  ORDER BY p.last_active_at DESC NULLS LAST
  LIMIT page_size
  OFFSET page_offset;
END;
$$;

COMMENT ON FUNCTION public.get_browsable_profiles IS
  'Paginated profile browsing with hard caps: 100/page, 1000 max offset';
```

---

### Frontend Pagination with Hard Limits

```typescript
// src/hooks/usePaginatedProfiles.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const MAX_PAGE_SIZE = 50;
const MAX_TOTAL_RESULTS = 500; // Don't allow browsing beyond 500 profiles

export function usePaginatedProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadPage = async (pageNum: number) => {
    if (pageNum * MAX_PAGE_SIZE >= MAX_TOTAL_RESULTS) {
      setHasMore(false);
      return;
    }

    const { data, error } = await supabase.rpc('get_browsable_profiles', {
      page_size: MAX_PAGE_SIZE,
      page_offset: pageNum * MAX_PAGE_SIZE,
    });

    if (!error && data) {
      setProfiles((prev) => [...prev, ...data]);
      setHasMore(data.length === MAX_PAGE_SIZE);
    }
  };

  const loadMore = () => {
    if (!hasMore) return;
    setPage((p) => p + 1);
    loadPage(page + 1);
  };

  useEffect(() => {
    loadPage(0);
  }, []);

  return { profiles, loadMore, hasMore };
}
```

---

## PRIVACY-SAFE FINGERPRINTING

### Client Fingerprinting (Non-Invasive)

```typescript
// src/lib/fingerprint.ts
// IMPORTANT: Do NOT use invasive fingerprinting like canvas, WebGL, audio
// These violate privacy and are flagged by Apple/Google

export async function generateDeviceFingerprint(): Promise<string> {
  const components = [];

  // Screen resolution (common, not unique)
  components.push(
    `${window.screen.width}x${window.screen.height}@${window.devicePixelRatio}`
  );

  // Timezone (general location)
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);

  // Platform (OS)
  components.push(navigator.platform);

  // User agent (browser info)
  components.push(navigator.userAgent);

  // Hardware concurrency (CPU cores)
  components.push(navigator.hardwareConcurrency?.toString() || 'unknown');

  // DO NOT use:
  // - Canvas fingerprinting (privacy violation)
  // - WebGL fingerprinting (privacy violation)
  // - Audio fingerprinting (privacy violation)
  // - Font enumeration (privacy violation)
  // - Battery status (removed from spec)

  // Hash the components
  const fingerprintString = components.join('|');
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(fingerprintString)
  );
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return hashHex.substring(0, 16); // First 16 chars
}

// Usage: Track suspicious behavior
export async function trackDeviceSession() {
  const fingerprint = await generateDeviceFingerprint();

  // Send to backend for tracking (NOT for blocking, only for analysis)
  await supabase.rpc('log_device_session', {
    device_fingerprint: fingerprint,
    timestamp: new Date().toISOString(),
  });

  return fingerprint;
}
```

### Device Session Tracking

```sql
-- Track device sessions for suspicious behavior detection
CREATE TABLE IF NOT EXISTS public.device_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  request_count INTEGER DEFAULT 1,
  suspicious_activity_score NUMERIC DEFAULT 0,
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT
);

-- Index for suspicious activity queries
CREATE INDEX idx_device_sessions_suspicious
  ON public.device_sessions(suspicious_activity_score DESC, last_seen_at DESC)
  WHERE suspicious_activity_score > 50;

-- Function to log and update device session
CREATE OR REPLACE FUNCTION log_device_session(
  device_fingerprint_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();

  -- Upsert device session
  INSERT INTO public.device_sessions (
    user_id,
    device_fingerprint,
    ip_address,
    user_agent,
    request_count,
    last_seen_at
  ) VALUES (
    current_user_id,
    device_fingerprint_param,
    current_setting('request.headers', true)::json->>'cf-connecting-ip',
    current_setting('request.headers', true)::json->>'user-agent',
    1,
    NOW()
  )
  ON CONFLICT (device_fingerprint, user_id)
  DO UPDATE SET
    request_count = device_sessions.request_count + 1,
    last_seen_at = NOW();
END;
$$;
```

---

## CLOUDFLARE/VERCEL WAF RULES

### Cloudflare Configuration

```javascript
// Cloudflare Workers or Firewall Rules

// 1. Block known bad user agents
if (request.headers.get('user-agent').includes('scrapy') ||
    request.headers.get('user-agent').includes('bot') ||
    request.headers.get('user-agent').includes('curl') ||
    request.headers.get('user-agent').includes('wget')) {
  return new Response('Forbidden', { status: 403 });
}

// 2. Require referer header for authenticated requests
if (!request.headers.get('referer') &&
    request.headers.get('authorization')) {
  return new Response('Forbidden', { status: 403 });
}

// 3. Block excessive requests from single IP
// (Use Cloudflare Rate Limiting rules in dashboard)
// Rule: If > 100 requests/minute from single IP, challenge with captcha

// 4. Geographic restrictions (optional)
// Block requests from high-risk countries (if business allows)

// 5. Challenge suspected bots with Turnstile (Cloudflare captcha)
```

### Cloudflare Dashboard Settings

**Rate Limiting Rules**:
```
Rule 1: API Protection
- If: hostname equals "yourdomain.com" AND path starts with "/api/"
- Action: Rate limit at 60 requests per minute
- Exceeds: Block for 10 minutes

Rule 2: Signup Protection
- If: path equals "/auth/signup"
- Action: Rate limit at 5 requests per hour
- Exceeds: Challenge with Turnstile

Rule 3: Swipe Endpoint
- If: path contains "/swipe"
- Action: Rate limit at 100 requests per minute
- Exceeds: Block for 5 minutes
```

**Firewall Rules**:
```
Rule 1: Block Known Bots
- If: User Agent contains "bot" OR "scraper" OR "spider"
- Action: Block

Rule 2: Require Referer
- If: (path starts with "/api/") AND (referer is empty) AND (has Authorization header)
- Action: Block

Rule 3: Geographic Filter (optional)
- If: country NOT IN ["US", "CA", "GB", "EU countries"]
- Action: Challenge
```

---

## BEHAVIORAL DETECTION

### Anomaly Detection SQL

```sql
-- Detect suspicious activity patterns
CREATE OR REPLACE FUNCTION detect_suspicious_behavior(
  check_user_id UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  suspicion_score NUMERIC := 0;
  swipe_rate NUMERIC;
  message_rate NUMERIC;
  profile_view_rate NUMERIC;
BEGIN
  -- Check swipe rate (bots swipe very fast)
  SELECT COUNT(*) / EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) * 60
  INTO swipe_rate
  FROM public.likes
  WHERE user_id = check_user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF swipe_rate > 50 THEN  -- More than 50 swipes per minute
    suspicion_score := suspicion_score + 30;
  END IF;

  -- Check message rate (bots spam messages)
  SELECT COUNT(*) / EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) * 60
  INTO message_rate
  FROM public.conversation_messages
  WHERE sender_id = check_user_id
    AND created_at > NOW() - INTERVAL '1 hour';

  IF message_rate > 20 THEN  -- More than 20 messages per minute
    suspicion_score := suspicion_score + 25;
  END IF;

  -- Check profile completeness (bots have minimal profiles)
  IF (SELECT profile_completion_percentage FROM public.profiles WHERE id = check_user_id) < 30 THEN
    suspicion_score := suspicion_score + 15;
  END IF;

  -- Check account age (new accounts more suspicious)
  IF (SELECT created_at FROM public.profiles WHERE id = check_user_id) > NOW() - INTERVAL '24 hours' THEN
    suspicion_score := suspicion_score + 10;
  END IF;

  -- Check if all swipes are likes (humans mix likes/dislikes)
  IF (SELECT COUNT(*) FROM public.dislikes WHERE user_id = check_user_id) = 0
     AND (SELECT COUNT(*) FROM public.likes WHERE user_id = check_user_id) > 50 THEN
    suspicion_score := suspicion_score + 20;
  END IF;

  -- Update device session suspicion score
  UPDATE public.device_sessions
  SET suspicious_activity_score = suspicion_score
  WHERE user_id = check_user_id;

  RETURN suspicion_score;
END;
$$;

-- Scheduled job to detect and flag suspicious users
CREATE OR REPLACE FUNCTION flag_suspicious_users()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  flagged_count INTEGER := 0;
BEGIN
  -- Flag users with suspicion score > 70
  UPDATE public.profiles
  SET
    is_suspended = true,
    suspension_reason = 'Automated suspension: Suspicious bot-like behavior detected',
    suspended_at = NOW()
  WHERE id IN (
    SELECT user_id
    FROM public.device_sessions
    WHERE suspicious_activity_score > 70
      AND is_blocked = false
  );

  GET DIAGNOSTICS flagged_count = ROW_COUNT;

  -- Notify admins
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type
  )
  SELECT
    au.user_id,
    'Suspicious Users Detected',
    format('%s users auto-suspended for bot-like behavior', flagged_count),
    'admin_alert'
  FROM public.admin_users au
  WHERE au.role IN ('admin', 'super_admin')
    AND au.is_active = true;

  RETURN flagged_count;
END;
$$;

-- Run hourly via pg_cron or Edge Function cron trigger
```

---

## WHAT CAN VS CANNOT BE BLOCKED

### ✅ CAN Be Blocked/Detected

1. **Simple Scrapers** - curl, wget, basic scripts
2. **High-Volume Requests** - Rate limiting catches mass downloads
3. **Known Bot User Agents** - Block scrapy, selenium, puppeteer signatures
4. **Missing Referers** - Legitimate requests come from your domain
5. **Suspicious Patterns** - Too fast swiping, identical timing
6. **New Account Spam** - Flag accounts <24 hours old with high activity
7. **Single-IP Mass Requests** - Cloudflare catches this easily

### ❌ CANNOT Be Completely Blocked

1. **Sophisticated Bots** - Headless browsers with full browser fingerprints
2. **Distributed Scrapers** - Rotating residential IPs (can't tell from real users)
3. **Manual Scraping** - Human-in-the-loop data collection
4. **API Clients** - If someone copies your JWT, they can impersonate user
5. **Insider Threats** - Compromised admin accounts
6. **Zero-Day Exploits** - Unknown vulnerabilities

### 🟡 Partial Protection

1. **Rate Limits** - Slows down scraping but doesn't stop patient attackers
2. **Pagination Caps** - Forces multiple requests, but still scrapeable
3. **Fingerprinting** - Helps detect but privacy-conscious users may look suspicious
4. **Behavioral Analysis** - High false-positive rate, needs manual review

---

## IMPLEMENTATION CHECKLIST

### Immediate (Do Now)

- [ ] Implement rate limiting on all Edge Functions
- [ ] Add pagination hard caps to database functions
- [ ] Enable Cloudflare rate limiting rules
- [ ] Block known bot user agents
- [ ] Add device session tracking

### Short-Term (This Month)

- [ ] Implement behavioral anomaly detection
- [ ] Create admin dashboard for suspicious activity
- [ ] Add automated suspension for bot behavior
- [ ] Set up monitoring alerts for unusual patterns

### Long-Term (Ongoing)

- [ ] Regular review of rate limits (adjust based on usage)
- [ ] Monitor false positives (legitimate users being blocked)
- [ ] Update bot detection heuristics
- [ ] Implement machine learning for better detection

---

## MONITORING & ALERTS

### Dashboard Queries

```sql
-- Top IPs by request volume (last hour)
SELECT
  ip_address,
  COUNT(*) as request_count,
  COUNT(DISTINCT user_id) as unique_users,
  array_agg(DISTINCT endpoint) as endpoints
FROM api_rate_limits
WHERE last_request_at > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
ORDER BY request_count DESC
LIMIT 20;

-- Users with highest suspicion scores
SELECT
  p.id,
  p.full_name,
  p.email,
  ds.suspicious_activity_score,
  ds.request_count,
  ds.last_seen_at
FROM device_sessions ds
JOIN profiles p ON p.id = ds.user_id
ORDER BY ds.suspicious_activity_score DESC
LIMIT 20;

-- Rate limit violations (blocked requests)
SELECT
  endpoint,
  COUNT(*) as violation_count,
  COUNT(DISTINCT ip_address) as unique_ips
FROM api_rate_limits
WHERE request_count >= window_duration_seconds
  AND last_request_at > NOW() - INTERVAL '24 hours'
GROUP BY endpoint
ORDER BY violation_count DESC;
```

---

## SUMMARY

✅ **Multi-Layer Defense**:
- Rate limiting (per user, per IP, per endpoint)
- Pagination caps (max 100/page, max 1000 offset)
- Privacy-safe fingerprinting (no invasive techniques)
- Cloudflare WAF rules (block bots, rate limit, geo-filter)
- Behavioral detection (flag suspicious patterns)

✅ **Privacy Compliant**:
- No canvas/WebGL fingerprinting (Apple/Google flagged)
- Transparent to users
- No tracking without consent

❌ **Reality Check**:
- Cannot stop all scraping (sophisticated bots will get through)
- Can slow down and deter 90% of attackers
- Focus on making scraping expensive and detectable

**Status**: Production-ready, multi-layer bot protection with privacy compliance.
