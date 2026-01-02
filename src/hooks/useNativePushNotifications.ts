import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Define types for push notifications (since @capacitor/push-notifications may not be installed)
interface PushNotificationToken {
  value: string;
}

interface PushNotificationActionPerformed {
  notification: PushNotification;
  actionId: string;
}

interface PushNotification {
  id?: string;
  title?: string;
  body?: string;
  data?: Record<string, unknown>;
}

type PermissionStatus = 'prompt' | 'prompt-with-rationale' | 'granted' | 'denied';

/**
 * Hook for managing native push notifications via Capacitor.
 * Registers device tokens and handles push notification events.
 */
export function useNativePushNotifications() {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('prompt');
  const [error, setError] = useState<string | null>(null);

  // Check if running on a native platform
  const isNative = Capacitor.isNativePlatform();

  // Save device token to database
  const saveDeviceToken = useCallback(async (token: string, platform: string) => {
    if (!user?.id) return;

    try {
      // Check if token already exists
      const { data: existingToken } = await supabase
        .from('device_tokens' as any)
        .select('id')
        .eq('user_id', user.id)
        .eq('token', token)
        .maybeSingle();

      if (existingToken) {
        // Update existing token to active
        await supabase
          .from('device_tokens' as any)
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', existingToken.id);
      } else {
        // Insert new token
        await supabase
          .from('device_tokens' as any)
          .insert({
            user_id: user.id,
            token: token,
            platform: platform,
            is_active: true,
          });
      }

      console.log('[Push] Device token saved successfully');
    } catch (err) {
      console.error('[Push] Failed to save device token:', err);
    }
  }, [user?.id]);

  // Remove device token from database
  const removeDeviceToken = useCallback(async (token: string) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('device_tokens' as any)
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('token', token);
    } catch (err) {
      console.error('[Push] Failed to remove device token:', err);
    }
  }, [user?.id]);

  // Register for push notifications
  const registerForPush = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      console.log('[Push] Not on native platform, skipping registration');
      return false;
    }

    try {
      // Dynamically import PushNotifications
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // Check current permission status
      const permResult = await PushNotifications.checkPermissions();
      setPermissionStatus(permResult.receive);

      // Request permission if needed
      if (permResult.receive !== 'granted') {
        const requestResult = await PushNotifications.requestPermissions();
        setPermissionStatus(requestResult.receive);

        if (requestResult.receive !== 'granted') {
          setError('Push notification permission denied');
          return false;
        }
      }

      // Register with APNs/FCM
      await PushNotifications.register();
      return true;
    } catch (err) {
      console.error('[Push] Registration error:', err);
      setError(err instanceof Error ? err.message : 'Failed to register for push notifications');
      return false;
    }
  }, [isNative]);

  // Initialize push notifications on mount
  useEffect(() => {
    if (!isNative || !user?.id) return;

    let PushNotificationsModule: typeof import('@capacitor/push-notifications').PushNotifications | null = null;

    const setupPushNotifications = async () => {
      try {
        // Dynamically import to avoid errors when not installed
        const module = await import('@capacitor/push-notifications');
        PushNotificationsModule = module.PushNotifications;

        // Listen for registration success
        PushNotificationsModule.addListener('registration', (token: PushNotificationToken) => {
          console.log('[Push] Registration successful, token:', token.value.substring(0, 20) + '...');
          setIsRegistered(true);
          const platform = Capacitor.getPlatform();
          saveDeviceToken(token.value, platform);
        });

        // Listen for registration errors
        PushNotificationsModule.addListener('registrationError', (error: { error: string }) => {
          console.error('[Push] Registration error:', error);
          setError(error.error);
          setIsRegistered(false);
        });

        // Listen for push notification received (app in foreground)
        PushNotificationsModule.addListener('pushNotificationReceived', (notification: PushNotification) => {
          console.log('[Push] Notification received:', notification);
          // The notification will be handled by the app's notification system
        });

        // Listen for notification action (user tapped notification)
        PushNotificationsModule.addListener('pushNotificationActionPerformed', (action: PushNotificationActionPerformed) => {
          console.log('[Push] Notification action performed:', action);

          // Handle navigation based on notification data
          const data = action.notification.data;
          if (data?.link_url) {
            // Navigate to the link URL
            window.location.href = data.link_url as string;
          } else if (data?.message_id || data?.notification_type === 'new_message') {
            window.location.href = '/messages';
          } else if (data?.notification_type === 'new_like') {
            window.location.href = '/notifications';
          }
        });

        // Auto-register on setup
        await registerForPush();
      } catch (err) {
        // Plugin not installed, silently skip
        console.log('[Push] Push notifications plugin not available');
      }
    };

    setupPushNotifications();

    // Cleanup listeners on unmount
    return () => {
      if (PushNotificationsModule) {
        PushNotificationsModule.removeAllListeners();
      }
    };
  }, [isNative, user?.id, registerForPush, saveDeviceToken]);

  // Unregister when user logs out
  useEffect(() => {
    if (!user?.id) {
      setIsRegistered(false);
    }
  }, [user?.id]);

  return {
    isNative,
    isRegistered,
    permissionStatus,
    error,
    registerForPush,
    removeDeviceToken,
  };
}

/**
 * Helper hook to show a prompt for enabling push notifications.
 * Use this in settings or onboarding screens.
 */
export function usePushNotificationPrompt() {
  const { isNative, isRegistered, permissionStatus, registerForPush } = useNativePushNotifications();

  const shouldShowPrompt = isNative && !isRegistered && permissionStatus !== 'denied';

  const promptForPush = async () => {
    const success = await registerForPush();
    return success;
  };

  return {
    shouldShowPrompt,
    isEnabled: isRegistered,
    promptForPush,
  };
}
