# Push Notifications Setup Guide

This guide explains how to set up native push notifications with sounds for iOS and Android using Firebase Cloud Messaging (FCM) and Supabase.

## Architecture Overview

```
User's Device (Capacitor App)
        │
        ├── Registers for push → Gets FCM token
        │
        ▼
    Supabase Database
        │
        ├── Stores FCM token in device_tokens table
        ├── notifications table insert triggers...
        │
        ▼
    Supabase Edge Function
        │
        ├── Fetches user's device tokens
        ├── Sends to FCM HTTP v1 API
        │
        ▼
    Firebase Cloud Messaging
        │
        ├── Android: Delivers directly
        ├── iOS: Routes through APNs
        │
        ▼
    Native Notification with Sound 🔔
```

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Enable **Cloud Messaging** in Project Settings > Cloud Messaging

## Step 2: Get Firebase Credentials

### For the Edge Function (Server-side):

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. You'll need:
   - The entire JSON content (for `FIREBASE_SERVICE_ACCOUNT_JSON`)
   - The `project_id` value (for `FIREBASE_PROJECT_ID`)

### Set Supabase Secrets:

```bash
# Set these in your Supabase project
supabase secrets set FIREBASE_PROJECT_ID="your-project-id"
supabase secrets set FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...",...}'
```

Or via Supabase Dashboard:
1. Go to Project Settings > Edge Functions
2. Add the secrets there

## Step 3: iOS Setup (APNs)

### 3a. Create APNs Key in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to Certificates, Identifiers & Profiles > Keys
3. Click "+" to create a new key
4. Enable "Apple Push Notifications service (APNs)"
5. Download the `.p8` file (save it securely - you can only download once!)
6. Note your:
   - Key ID (10-character string)
   - Team ID (from Membership page)

### 3b. Upload APNs Key to Firebase

1. Go to Firebase Console > Project Settings > Cloud Messaging
2. Under "Apple app configuration", click the upload button
3. Upload your `.p8` file
4. Enter your Key ID and Team ID

### 3c. Configure Xcode Project

1. Open `ios/App/App.xcworkspace` in Xcode
2. Select your target > Signing & Capabilities
3. Click "+ Capability" and add:
   - **Push Notifications**
   - **Background Modes** → Check "Remote notifications"

### 3d. Add GoogleService-Info.plist

1. In Firebase Console, add an iOS app with your bundle ID (`com.rentmatch.app`)
2. Download `GoogleService-Info.plist`
3. Add it to `ios/App/App/` directory in Xcode

## Step 4: Android Setup

### 4a. Add Firebase to Android

1. In Firebase Console, add an Android app with package name `com.rentmatch.app`
2. Download `google-services.json`
3. Place it in `android/app/google-services.json`

### 4b. Update Android Configuration

Add to `android/app/build.gradle`:

```gradle
apply plugin: 'com.google.gms.google-services'
```

Add to `android/build.gradle`:

```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.4.0'
}
```

### 4c. Create Notification Channel (Android 8+)

Add to `android/app/src/main/java/.../MainActivity.java`:

```java
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                "default",
                "Default Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Default notification channel");
            channel.enableVibration(true);

            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }
}
```

## Step 5: Install Capacitor Plugin

```bash
npm install @capacitor/push-notifications
npx cap sync
```

## Step 6: Deploy Edge Function

```bash
# Deploy the push notification function
supabase functions deploy send-push-notification
```

## Step 7: Configure Supabase Settings

You need to set app settings for the database trigger to work:

```sql
-- Run in Supabase SQL Editor
ALTER DATABASE postgres SET app.settings.edge_function_url = 'https://YOUR_PROJECT_REF.supabase.co/functions/v1';
ALTER DATABASE postgres SET app.settings.service_role_key = 'YOUR_SERVICE_ROLE_KEY';
```

**Note:** The service role key should be kept secret. Consider using Supabase Vault for production.

## Step 8: Use in Your App

The hook is already created. Add it to your app:

```tsx
import { useNativePushNotifications } from '@/hooks/useNativePushNotifications';

function App() {
  const { isRegistered, permissionStatus, registerForPush } = useNativePushNotifications();

  // The hook auto-registers on mount when user is logged in
  // But you can also manually trigger registration:
  const handleEnableNotifications = async () => {
    const success = await registerForPush();
    if (success) {
      console.log('Push notifications enabled!');
    }
  };

  return (
    <div>
      <p>Push Status: {isRegistered ? 'Registered' : 'Not registered'}</p>
      <p>Permission: {permissionStatus}</p>
      <button onClick={handleEnableNotifications}>Enable Notifications</button>
    </div>
  );
}
```

## Step 9: Test Push Notifications

### Option 1: Insert a notification in Supabase

```sql
INSERT INTO notifications (user_id, notification_type, title, message)
VALUES ('USER_UUID_HERE', 'new_message', 'New Message', 'You have a new message!');
```

### Option 2: Call the Edge Function directly

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/send-push-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "user_id": "USER_UUID_HERE",
    "title": "Test Notification",
    "body": "This is a test with sound!",
    "sound": "default"
  }'
```

## Notification Sounds

### iOS
- Use `"default"` for the default iOS notification sound
- For custom sounds, add `.wav`, `.aiff`, or `.caf` files to your Xcode project

### Android
- Use `"default"` for the default Android notification sound
- The notification channel controls the sound settings

## Troubleshooting

### Notifications not appearing?

1. **Check device token is saved:**
   ```sql
   SELECT * FROM device_tokens WHERE user_id = 'YOUR_USER_ID';
   ```

2. **Check Edge Function logs:**
   ```bash
   supabase functions logs send-push-notification
   ```

3. **iOS Simulator:** Push notifications don't work on iOS Simulator. Use a real device.

4. **Android Emulator:** Needs Google Play Services. Use an emulator with Play Store.

### Permission denied?

- iOS: Go to Settings > Notifications > Your App > Allow Notifications
- Android: Go to Settings > Apps > Your App > Notifications

## Cost

- **Firebase Cloud Messaging: FREE** (unlimited notifications)
- **Supabase Edge Functions: FREE** tier includes 500K invocations/month
- **APNs: FREE** (included with Apple Developer Program $99/year)

## Security Notes

1. Never expose your service role key in client-side code
2. The Edge Function uses service role to access all device tokens
3. RLS policies protect device_tokens table for regular users
4. Consider rate limiting in production
