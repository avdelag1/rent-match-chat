# 🛡️ ADMIN MODERATION SYSTEM

**Production-Grade Admin Controls with Full Audit Trail**

Date: 2026-01-18
Classification: Critical Security Infrastructure

---

## TABLE OF CONTENTS

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Admin Permissions Model](#admin-permissions-model)
5. [Edge Functions](#edge-functions)
6. [Admin UI Logic](#admin-ui-logic)
7. [Audit Logging](#audit-logging)
8. [Security Constraints](#security-constraints)

---

## OVERVIEW

### Core Principles

1. **NO Admin Privileges in Client** - All admin actions go through Edge Functions with service_role key
2. **Full Audit Trail** - Every admin action logged with who/when/why
3. **Graduated Permissions** - Super admin > Admin > Moderator hierarchy
4. **Immediate Effect** - RLS policies respect user status instantly
5. **Reversible Actions** - Suspensions can be lifted, blocks can be removed

### Admin Capabilities

| Action | Regular User | Moderator | Admin | Super Admin |
|--------|--------------|-----------|-------|-------------|
| View reported content | ❌ | ✅ | ✅ | ✅ |
| Suspend users (temporary) | ❌ | ✅ | ✅ | ✅ |
| Block users (permanent) | ❌ | ❌ | ✅ | ✅ |
| Approve deletion requests | ❌ | ❌ | ✅ | ✅ |
| Delete users fully | ❌ | ❌ | ❌ | ✅ |
| Manage admin accounts | ❌ | ❌ | ❌ | ✅ |
| Verify ID documents | ❌ | ✅ | ✅ | ✅ |
| Manage listings | ❌ | ✅ | ✅ | ✅ |
| View audit logs | ❌ | ❌ | ✅ | ✅ |
| Modify user roles | ❌ | ❌ | ❌ | ✅ |

---

## ARCHITECTURE

### Request Flow

```
┌─────────────┐
│ Admin UI    │
│ (Frontend)  │
└──────┬──────┘
       │
       │ 1. Admin clicks "Suspend User"
       │    (JWT token with admin user_id)
       │
       ▼
┌─────────────────────┐
│ Edge Function       │
│ /suspend-user       │
│                     │
│ 2. Verify caller is │
│    active admin     │
│ 3. Check permissions│
│ 4. Execute action   │
│ 5. Log to audit     │
└──────┬──────────────┘
       │
       │ Uses service_role key
       │
       ▼
┌─────────────────────┐
│ Supabase Database   │
│                     │
│ - Update user status│
│ - Write audit log   │
│ - RLS enforces      │
└─────────────────────┘
       │
       │ 6. User's next request
       │
       ▼
┌─────────────────────┐
│ RLS Policies        │
│                     │
│ ✅ Check is_suspended│
│ ✅ Check is_blocked  │
│ ❌ Deny if true     │
└─────────────────────┘
```

**Key Points**:
- Frontend NEVER has service_role key
- Frontend only calls Edge Functions
- Edge Functions verify admin status BEFORE executing
- All actions logged with IP, timestamp, reason

---

## DATABASE SCHEMA

### Existing Tables (Enhance)

#### profiles - Add Moderation Fields

```sql
-- Add moderation columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suspension_reason TEXT,
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES public.admin_users(id),
ADD COLUMN IF NOT EXISTS suspension_expires_at TIMESTAMPTZ,

ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS block_reason TEXT,
ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blocked_by UUID REFERENCES public.admin_users(id),

ADD COLUMN IF NOT EXISTS is_read_only BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS read_only_reason TEXT,

ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_request_reason TEXT,
ADD COLUMN IF NOT EXISTS deletion_approved_by UUID REFERENCES public.admin_users(id),
ADD COLUMN IF NOT EXISTS deletion_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS deletion_rejected_by UUID REFERENCES public.admin_users(id),
ADD COLUMN IF NOT EXISTS deletion_rejected_at TIMESTAMPTZ;

-- Add index for moderation queries
CREATE INDEX IF NOT EXISTS idx_profiles_moderation
  ON public.profiles(is_suspended, is_blocked, is_read_only)
  WHERE is_suspended = true OR is_blocked = true OR is_read_only = true;

CREATE INDEX IF NOT EXISTS idx_profiles_deletion_requests
  ON public.profiles(deletion_requested_at)
  WHERE deletion_requested_at IS NOT NULL
  AND deletion_approved_at IS NULL
  AND deletion_rejected_at IS NULL;

COMMENT ON COLUMN public.profiles.is_suspended IS
  'Temporary account lock - user cannot login or perform actions';
COMMENT ON COLUMN public.profiles.is_blocked IS
  'Permanent ban - user cannot login, data may be hidden';
COMMENT ON COLUMN public.profiles.is_read_only IS
  'User can view but cannot post, message, or swipe';
```

---

### New Tables

#### admin_moderation_actions (Master Audit Log)

```sql
-- Comprehensive audit log for all admin moderation actions
CREATE TABLE IF NOT EXISTS public.admin_moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who performed the action
  admin_user_id UUID NOT NULL REFERENCES public.admin_users(id),
  admin_email TEXT NOT NULL,
  admin_role TEXT NOT NULL,

  -- What action was performed
  action_type TEXT NOT NULL, -- 'suspend', 'unsuspend', 'block', 'unblock', 'delete_request_approve', etc.
  target_type TEXT NOT NULL, -- 'user', 'listing', 'message', 'review', etc.
  target_id UUID NOT NULL,

  -- Why
  reason TEXT NOT NULL,
  details JSONB DEFAULT '{}',

  -- When
  performed_at TIMESTAMPTZ DEFAULT NOW(),

  -- Where (IP tracking)
  ip_address TEXT,
  user_agent TEXT,

  -- Additional context
  previous_state JSONB,
  new_state JSONB,

  -- Reversal tracking
  is_reversed BOOLEAN DEFAULT false,
  reversed_by UUID REFERENCES public.admin_users(id),
  reversed_at TIMESTAMPTZ,
  reversal_reason TEXT
);

-- Enable RLS
ALTER TABLE public.admin_moderation_actions ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "admins_view_moderation_logs"
  ON public.admin_moderation_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('admin', 'super_admin')
    )
  );

-- Indexes for audit queries
CREATE INDEX idx_moderation_actions_admin
  ON public.admin_moderation_actions(admin_user_id, performed_at DESC);

CREATE INDEX idx_moderation_actions_target
  ON public.admin_moderation_actions(target_type, target_id, performed_at DESC);

CREATE INDEX idx_moderation_actions_type
  ON public.admin_moderation_actions(action_type, performed_at DESC);

COMMENT ON TABLE public.admin_moderation_actions IS
  'Comprehensive audit log of all admin moderation actions with full context';
```

---

#### user_deletion_requests (Track Deletion Requests)

```sql
-- Dedicated table for user deletion requests
CREATE TABLE IF NOT EXISTS public.user_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,

  -- Request details
  reason TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),

  -- Review
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  reviewed_by UUID REFERENCES public.admin_users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,

  -- Deletion execution
  deleted_at TIMESTAMPTZ,
  deletion_executed_by UUID REFERENCES public.admin_users(id)
);

-- Enable RLS
ALTER TABLE public.user_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own deletion request
CREATE POLICY "users_view_own_deletion_request"
  ON public.user_deletion_requests FOR SELECT
  USING (user_id = auth.uid());

-- Users can create deletion requests
CREATE POLICY "users_create_deletion_request"
  ON public.user_deletion_requests FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
  );

-- Admins can view all deletion requests
CREATE POLICY "admins_view_deletion_requests"
  ON public.user_deletion_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
    )
  );

-- Admins can update deletion requests
CREATE POLICY "admins_update_deletion_requests"
  ON public.user_deletion_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
      AND is_active = true
      AND role IN ('admin', 'super_admin')
    )
  );

-- Indexes
CREATE INDEX idx_deletion_requests_status
  ON public.user_deletion_requests(status, requested_at DESC);

CREATE INDEX idx_deletion_requests_user
  ON public.user_deletion_requests(user_id);

COMMENT ON TABLE public.user_deletion_requests IS
  'User-initiated deletion requests that require admin approval';
```

---

## ADMIN PERMISSIONS MODEL

### Admin Roles

```typescript
// types/admin.ts
export type AdminRole = 'super_admin' | 'admin' | 'moderator';

export interface AdminPermissions {
  // User moderation
  canSuspendUsers: boolean;
  canBlockUsers: boolean;
  canDeleteUsers: boolean;
  canManageUserRoles: boolean;

  // Content moderation
  canVerifyDocuments: boolean;
  canModerateListings: boolean;
  canModerateMessages: boolean;
  canModerateReviews: boolean;

  // System admin
  canViewAuditLogs: boolean;
  canManageAdmins: boolean;
  canConfigureSystem: boolean;
}

export const ADMIN_ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  moderator: {
    canSuspendUsers: true,
    canBlockUsers: false,
    canDeleteUsers: false,
    canManageUserRoles: false,
    canVerifyDocuments: true,
    canModerateListings: true,
    canModerateMessages: true,
    canModerateReviews: true,
    canViewAuditLogs: false,
    canManageAdmins: false,
    canConfigureSystem: false,
  },

  admin: {
    canSuspendUsers: true,
    canBlockUsers: true,
    canDeleteUsers: false,  // Only super_admin can delete
    canManageUserRoles: false,
    canVerifyDocuments: true,
    canModerateListings: true,
    canModerateMessages: true,
    canModerateReviews: true,
    canViewAuditLogs: true,
    canManageAdmins: false,
    canConfigureSystem: false,
  },

  super_admin: {
    canSuspendUsers: true,
    canBlockUsers: true,
    canDeleteUsers: true,
    canManageUserRoles: true,
    canVerifyDocuments: true,
    canModerateListings: true,
    canModerateMessages: true,
    canModerateReviews: true,
    canViewAuditLogs: true,
    canManageAdmins: true,
    canConfigureSystem: true,
  },
};
```

---

## EDGE FUNCTIONS

### 1. suspend-user (Temporary Lock)

```typescript
// supabase/functions/suspend-user/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface SuspendUserRequest {
  targetUserId: string;
  reason: string;
  durationHours?: number;  // Optional: auto-unsuspend after duration
  details?: Record<string, any>;
}

serve(async (req) => {
  try {
    // 1. Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    // 2. Create Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 3. Get admin user from JWT
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
      });
    }

    // 4. Verify user is an active admin/moderator
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('id, role, email')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminUser) {
      return new Response(JSON.stringify({ error: 'Not an admin' }), {
        status: 403,
      });
    }

    // 5. Check permissions
    if (!['moderator', 'admin', 'super_admin'].includes(adminUser.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403,
      });
    }

    // 6. Parse request body
    const { targetUserId, reason, durationHours, details }: SuspendUserRequest =
      await req.json();

    if (!targetUserId || !reason) {
      return new Response(
        JSON.stringify({ error: 'targetUserId and reason required' }),
        { status: 400 }
      );
    }

    // 7. Get target user's current state
    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, is_suspended, is_blocked')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
      });
    }

    // 8. Calculate suspension expiry
    const suspensionExpiresAt = durationHours
      ? new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString()
      : null;

    // 9. Suspend the user
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_suspended: true,
        suspension_reason: reason,
        suspended_at: new Date().toISOString(),
        suspended_by: adminUser.id,
        suspension_expires_at: suspensionExpiresAt,
      })
      .eq('id', targetUserId);

    if (updateError) {
      throw updateError;
    }

    // 10. Log to audit trail
    const { error: auditError } = await supabaseAdmin
      .from('admin_moderation_actions')
      .insert({
        admin_user_id: adminUser.id,
        admin_email: adminUser.email,
        admin_role: adminUser.role,
        action_type: 'suspend',
        target_type: 'user',
        target_id: targetUserId,
        reason: reason,
        details: {
          ...details,
          duration_hours: durationHours,
          expires_at: suspensionExpiresAt,
        },
        ip_address: req.headers.get('cf-connecting-ip') || 'unknown',
        user_agent: req.headers.get('user-agent'),
        previous_state: {
          is_suspended: targetUser.is_suspended,
        },
        new_state: {
          is_suspended: true,
          suspension_expires_at: suspensionExpiresAt,
        },
      });

    if (auditError) {
      console.error('Audit log failed:', auditError);
      // Don't fail the request if audit fails, but log it
    }

    // 11. Optionally: Terminate active sessions
    // await supabaseAdmin.auth.admin.deleteUser(targetUserId);  // Nuclear option
    // Better: Let RLS handle blocking on next request

    return new Response(
      JSON.stringify({
        success: true,
        message: `User ${targetUser.full_name} suspended`,
        expiresAt: suspensionExpiresAt,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error suspending user:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500 }
    );
  }
});
```

---

### 2. unsuspend-user (Lift Suspension)

```typescript
// supabase/functions/unsuspend-user/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface UnsuspendUserRequest {
  targetUserId: string;
  reason: string;
}

serve(async (req) => {
  try {
    // Same auth verification as suspend-user (steps 1-5)
    // ... (omitted for brevity)

    const { targetUserId, reason }: UnsuspendUserRequest = await req.json();

    // Clear suspension fields
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_suspended: false,
        suspension_reason: null,
        suspended_at: null,
        suspended_by: null,
        suspension_expires_at: null,
      })
      .eq('id', targetUserId);

    if (updateError) throw updateError;

    // Log to audit
    await supabaseAdmin.from('admin_moderation_actions').insert({
      admin_user_id: adminUser.id,
      admin_email: adminUser.email,
      admin_role: adminUser.role,
      action_type: 'unsuspend',
      target_type: 'user',
      target_id: targetUserId,
      reason: reason,
      ip_address: req.headers.get('cf-connecting-ip') || 'unknown',
      user_agent: req.headers.get('user-agent'),
      new_state: { is_suspended: false },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

---

### 3. block-user (Permanent Ban)

```typescript
// supabase/functions/block-user/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface BlockUserRequest {
  targetUserId: string;
  reason: string;
  details?: Record<string, any>;
}

serve(async (req) => {
  try {
    // Auth verification (steps 1-5) - REQUIRE admin or super_admin
    // ... (omitted for brevity)

    // Block requires admin or higher
    if (!['admin', 'super_admin'].includes(adminUser.role)) {
      return new Response(JSON.stringify({ error: 'Requires admin role' }), {
        status: 403,
      });
    }

    const { targetUserId, reason, details }: BlockUserRequest = await req.json();

    // Block the user
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_blocked: true,
        block_reason: reason,
        blocked_at: new Date().toISOString(),
        blocked_by: adminUser.id,
        // Also suspend to immediately prevent login
        is_suspended: true,
        suspension_reason: `Blocked: ${reason}`,
        suspended_at: new Date().toISOString(),
        suspended_by: adminUser.id,
      })
      .eq('id', targetUserId);

    if (updateError) throw updateError;

    // Log to audit
    await supabaseAdmin.from('admin_moderation_actions').insert({
      admin_user_id: adminUser.id,
      admin_email: adminUser.email,
      admin_role: adminUser.role,
      action_type: 'block',
      target_type: 'user',
      target_id: targetUserId,
      reason: reason,
      details: details,
      ip_address: req.headers.get('cf-connecting-ip') || 'unknown',
      user_agent: req.headers.get('user-agent'),
      new_state: { is_blocked: true },
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

---

### 4. approve-deletion-request (Admin Approves User Deletion)

```typescript
// supabase/functions/approve-deletion-request/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface ApproveDeletionRequest {
  requestId: string;
  reviewNotes?: string;
}

serve(async (req) => {
  try {
    // Auth verification - REQUIRE admin or super_admin
    // ... (omitted for brevity)

    if (!['admin', 'super_admin'].includes(adminUser.role)) {
      return new Response(JSON.stringify({ error: 'Requires admin role' }), {
        status: 403,
      });
    }

    const { requestId, reviewNotes }: ApproveDeletionRequest = await req.json();

    // 1. Get the deletion request
    const { data: deletionRequest, error: requestError } = await supabaseAdmin
      .from('user_deletion_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single();

    if (requestError || !deletionRequest) {
      return new Response(JSON.stringify({ error: 'Request not found' }), {
        status: 404,
      });
    }

    // 2. Update request status
    await supabaseAdmin
      .from('user_deletion_requests')
      .update({
        status: 'approved',
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
      })
      .eq('id', requestId);

    // 3. Log approval (actual deletion happens in separate function)
    await supabaseAdmin.from('admin_moderation_actions').insert({
      admin_user_id: adminUser.id,
      admin_email: adminUser.email,
      admin_role: adminUser.role,
      action_type: 'deletion_request_approved',
      target_type: 'user',
      target_id: deletionRequest.user_id,
      reason: reviewNotes || 'Deletion request approved',
      details: {
        request_id: requestId,
        user_reason: deletionRequest.reason,
      },
      ip_address: req.headers.get('cf-connecting-ip') || 'unknown',
      user_agent: req.headers.get('user-agent'),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Deletion request approved. User can now be deleted.',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
```

---

### 5. delete-user-admin (Full User Deletion - Super Admin Only)

See `USER_DELETION_FLOW.md` for complete implementation.

---

## ADMIN UI LOGIC

### Admin Dashboard Components

```typescript
// src/components/admin/UserModerationPanel.tsx
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ModerationAction {
  type: 'suspend' | 'unsuspend' | 'block' | 'unblock';
  userId: string;
  userName: string;
}

export function UserModerationPanel({ userId, userName, currentStatus }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSuspend = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suspend-user', {
        body: {
          targetUserId: userId,
          reason: reason,
          durationHours: 168, // 7 days
        },
      });

      if (error) throw error;

      alert(`User ${userName} suspended successfully`);
      setReason('');
      // Refresh user data
    } catch (error) {
      console.error('Suspension failed:', error);
      alert('Failed to suspend user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsuspend = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('unsuspend-user', {
        body: {
          targetUserId: userId,
          reason: 'Suspension lifted by admin',
        },
      });

      if (error) throw error;
      alert(`User ${userName} unsuspended`);
    } catch (error) {
      alert('Failed to unsuspend: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason');
      return;
    }

    const confirmed = confirm(
      `PERMANENT BAN: Are you sure you want to block ${userName}? This cannot be easily undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('block-user', {
        body: {
          targetUserId: userId,
          reason: reason,
        },
      });

      if (error) throw error;
      alert(`User ${userName} permanently blocked`);
    } catch (error) {
      alert('Failed to block: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="moderation-panel">
      <h3>Moderation Actions for {userName}</h3>

      <div className="status">
        <span>Suspended: {currentStatus.is_suspended ? 'Yes' : 'No'}</span>
        <span>Blocked: {currentStatus.is_blocked ? 'Yes' : 'No'}</span>
      </div>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for action (required)"
        rows={3}
      />

      <div className="actions">
        {!currentStatus.is_suspended ? (
          <button onClick={handleSuspend} disabled={loading}>
            Suspend (7 days)
          </button>
        ) : (
          <button onClick={handleUnsuspend} disabled={loading}>
            Lift Suspension
          </button>
        )}

        {!currentStatus.is_blocked && (
          <button
            onClick={handleBlock}
            disabled={loading}
            className="danger"
          >
            Permanent Block
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## AUDIT LOGGING

### Automatic Audit on All Admin Actions

Every Edge Function should:

1. **Log Before Execution** - Record intent
2. **Capture Previous State** - For reversibility
3. **Log After Execution** - Record result
4. **Include Context** - IP, user agent, reason

### Audit Query Examples

```sql
-- View all actions by a specific admin
SELECT
  performed_at,
  action_type,
  target_type,
  reason,
  details
FROM admin_moderation_actions
WHERE admin_user_id = 'specific-admin-uuid'
ORDER BY performed_at DESC;

-- View all actions on a specific user
SELECT
  a.performed_at,
  a.action_type,
  a.reason,
  au.email as admin_email,
  au.role as admin_role
FROM admin_moderation_actions a
JOIN admin_users au ON au.id = a.admin_user_id
WHERE a.target_id = 'specific-user-uuid'
ORDER BY a.performed_at DESC;

-- Find all suspensions in the last 30 days
SELECT
  performed_at,
  admin_email,
  target_id,
  reason,
  details->>'duration_hours' as duration
FROM admin_moderation_actions
WHERE action_type = 'suspend'
AND performed_at > NOW() - INTERVAL '30 days'
ORDER BY performed_at DESC;
```

---

## SECURITY CONSTRAINTS

### 1. RLS Enforcement of Moderation Status

```sql
-- Add check to all user-facing RLS policies
CREATE OR REPLACE FUNCTION is_user_active(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    NOT COALESCE(is_suspended, false)
    AND NOT COALESCE(is_blocked, false)
  FROM public.profiles
  WHERE id = user_uuid;
$$;

-- Example: Block suspended users from sending messages
CREATE POLICY "users_send_messages_if_active"
  ON conversation_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND is_user_active(auth.uid())  -- Check if user is not suspended/blocked
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.owner_id = auth.uid())
    )
  );
```

### 2. Auto-Expiry of Temporary Suspensions

```sql
-- Scheduled job (run every hour via pg_cron or Edge Function + cron trigger)
CREATE OR REPLACE FUNCTION expire_suspensions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.profiles
  SET
    is_suspended = false,
    suspension_reason = NULL,
    suspended_at = NULL,
    suspended_by = NULL,
    suspension_expires_at = NULL
  WHERE is_suspended = true
    AND suspension_expires_at IS NOT NULL
    AND suspension_expires_at <= NOW();

  GET DIAGNOSTICS expired_count = ROW_COUNT;

  RAISE NOTICE 'Auto-expired % suspensions', expired_count;

  RETURN expired_count;
END;
$$;

-- Call via pg_cron (if enabled)
-- SELECT cron.schedule('expire-suspensions', '0 * * * *', 'SELECT expire_suspensions();');

-- OR call via Edge Function triggered by Supabase cron
```

### 3. Read-Only Mode (Limit Actions, Keep View Access)

```sql
-- Example: Users in read-only mode can view but not swipe
CREATE POLICY "users_swipe_if_not_readonly"
  ON likes FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND NOT COALESCE(
      (SELECT is_read_only FROM profiles WHERE id = auth.uid()),
      false
    )
  );
```

---

## SUMMARY

This admin moderation system provides:

✅ **Complete Control** - Suspend, block, limit, delete users
✅ **Server-Side Enforcement** - All actions via Edge Functions with service_role
✅ **Full Audit Trail** - Every action logged with who/when/why/IP
✅ **Graduated Permissions** - Moderator < Admin < Super Admin
✅ **Immediate Effect** - RLS policies respect status instantly
✅ **Reversible Actions** - Unsuspend, unblock capabilities
✅ **User-Initiated Deletion** - Admin approval required
✅ **Auto-Expiry** - Temporary suspensions expire automatically

**Next Steps**: See `USER_DELETION_FLOW.md` for complete user deletion implementation.
