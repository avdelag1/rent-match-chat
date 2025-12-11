import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, content-type',
}

interface PushNotificationPayload {
  user_id: string
  title: string
  body: string
  data?: Record<string, string>
  sound?: string
  badge?: number
}

// Get Firebase access token using service account
async function getFirebaseAccessToken(): Promise<string> {
  const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON')
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not configured')
  }

  const serviceAccount = JSON.parse(serviceAccountJson)

  // Create JWT for Firebase
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  }

  // Base64url encode
  const encode = (obj: object) => {
    const json = JSON.stringify(obj)
    const base64 = btoa(json)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  const headerB64 = encode(header)
  const payloadB64 = encode(payload)
  const unsignedToken = `${headerB64}.${payloadB64}`

  // Import the private key and sign
  const privateKeyPem = serviceAccount.private_key
  const pemContents = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')

  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0))

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  )

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  const jwt = `${unsignedToken}.${signatureB64}`

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const tokenData = await tokenResponse.json()
  if (!tokenData.access_token) {
    throw new Error('Failed to get Firebase access token: ' + JSON.stringify(tokenData))
  }

  return tokenData.access_token
}

// Send notification via FCM HTTP v1 API
async function sendFCMNotification(
  token: string,
  title: string,
  body: string,
  data: Record<string, string> = {},
  sound: string = 'default'
): Promise<boolean> {
  const projectId = Deno.env.get('FIREBASE_PROJECT_ID')
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID not configured')
  }

  const accessToken = await getFirebaseAccessToken()

  const message = {
    message: {
      token: token,
      notification: {
        title: title,
        body: body,
      },
      data: data,
      android: {
        priority: 'high',
        notification: {
          sound: sound,
          default_sound: true,
          default_vibrate_timings: true,
          channel_id: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: sound,
            badge: 1,
            'content-available': 1,
          },
        },
      },
    },
  }

  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    }
  )

  if (!response.ok) {
    const errorText = await response.text()
    console.error('FCM error:', errorText)

    // If token is invalid, we should mark it as inactive
    if (response.status === 404 || errorText.includes('NOT_FOUND') || errorText.includes('UNREGISTERED')) {
      return false // Token is invalid
    }
    throw new Error(`FCM request failed: ${response.status} ${errorText}`)
  }

  return true
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const payload: PushNotificationPayload = await req.json()
    const { user_id, title, body, data = {}, sound = 'default' } = payload

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, title, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get all active device tokens for the user
    const { data: tokens, error: tokensError } = await supabase
      .from('device_tokens')
      .select('id, token, platform')
      .eq('user_id', user_id)
      .eq('is_active', true)

    if (tokensError) {
      throw tokensError
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: 'No active device tokens found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send to all devices
    let successCount = 0
    let failedTokenIds: string[] = []

    for (const deviceToken of tokens) {
      try {
        const success = await sendFCMNotification(
          deviceToken.token,
          title,
          body,
          data,
          sound
        )

        if (success) {
          successCount++
        } else {
          // Token is invalid, mark for deactivation
          failedTokenIds.push(deviceToken.id)
        }
      } catch (error) {
        console.error(`Failed to send to token ${deviceToken.id}:`, error)
      }
    }

    // Deactivate invalid tokens
    if (failedTokenIds.length > 0) {
      await supabase
        .from('device_tokens')
        .update({ is_active: false })
        .in('id', failedTokenIds)
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failedTokenIds.length,
        total: tokens.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
