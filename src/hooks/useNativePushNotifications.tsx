import { useEffect, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Types for push notifications (will be available after installing @capacitor/push-notifications)
interface PushNotificationToken {
  value: string;
}

interface PushNotificationSchema {
  title?: string;
  subtitle?: string;
  body?: string;
  id: string;
  badge?: number;
  notification?: any;
  data: any;
  click_action?: string;
  link?: string;
  group?: string;
  groupSummary?: boolean;
}

interface ActionPerformed {
  actionId: string;
  inputValue?: string;
  notification: PushNotificationSchema;
}

// Lazy load PushNotifications to avoid errors on web
let PushNotifications: any = null;

const loadPushNotifications = async () => {
  if (Capacitor.isNativePlatform() && !PushNotifications) {
    try {
      const module = await import('@capacitor/push-notifications');
      PushNotifications = module.PushNotifications;
    } catch (error) {
      console.log('Push notifications not available:', error);
    }
  }
  return PushNotifications;
};

export function useNativePushNotifications() {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // Get current platform
  const platform = Capacitor.getPlatform() as 'ios' | 'android' | 'web';
  const isNative = Capacitor.isNativePlatform();

  // Save token to Supabase
  const saveToken = useCallback(async (token: string) => {
    if (!user?.id) return;

    try {
      // Upsert the token (update if exists, insert if new)
      const { error } = await supabase
        .from('device_tokens')
        .upsert(
          {
            user_id: user.id,
            token: token,
            platform: platform,
            is_active: true,
            last_used_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,token',
          }
        );

      if (error) {
        console.error('Error saving device token:', error);
      } else {
        console.log('Device token saved successfully');
        setIsRegistered(true);
      }
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  }, [user?.id, platform]);

  // Remove token from Supabase (on logout or unregister)
  const removeToken = useCallback(async (token: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('device_tokens')
        .update({ is_active: false })
        .eq('user_id', user.id)
        .eq('token', token);

      if (error) {
        console.error('Error removing device token:', error);
      }
    } catch (error) {
      console.error('Error removing device token:', error);
    }
  }, [user?.id]);

  // Register for push notifications
  const registerForPush = useCallback(async () => {
    const PN = await loadPushNotifications();
    if (!PN) {
      console.log('Push notifications not available on this platform');
      return false;
    }

    try {
      // Check current permission status
      const permResult = await PN.checkPermissions();

      if (permResult.receive === 'prompt') {
        // Request permission
        const requestResult = await PN.requestPermissions();
        setPermissionStatus(requestResult.receive);

        if (requestResult.receive !== 'granted') {
          console.log('Push notification permission denied');
          return false;
        }
      } else if (permResult.receive === 'denied') {
        setPermissionStatus('denied');
        console.log('Push notification permission previously denied');
        return false;
      } else {
        setPermissionStatus('granted');
      }

      // Register with APNS/FCM
      await PN.register();
      return true;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return false;
    }
  }, []);

  // Initialize push notification listeners
  useEffect(() => {
    if (!isNative || !user?.id) return;

    let cleanupFunctions: (() => void)[] = [];

    const setupListeners = async () => {
      const PN = await loadPushNotifications();
      if (!PN) return;

      // On registration success
      const registrationListener = await PN.addListener(
        'registration',
        (token: PushNotificationToken) => {
          console.log('Push registration success, token:', token.value);
          saveToken(token.value);
        }
      );
      cleanupFunctions.push(() => registrationListener.remove());

      // On registration error
      const errorListener = await PN.addListener(
        'registrationError',
        (error: any) => {
          console.error('Push registration error:', error);
        }
      );
      cleanupFunctions.push(() => errorListener.remove());

      // On push notification received (app in foreground)
      const receivedListener = await PN.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          console.log('Push notification received:', notification);
          // The notification will show automatically on iOS/Android
          // You can also show a local notification or toast here
        }
      );
      cleanupFunctions.push(() => receivedListener.remove());

      // On push notification action performed (user tapped notification)
      const actionListener = await PN.addListener(
        'pushNotificationActionPerformed',
        (action: ActionPerformed) => {
          console.log('Push notification action performed:', action);

          // Handle navigation based on notification data
          const data = action.notification.data;
          if (data?.link_url) {
            // Navigate to the specified URL
            window.location.href = data.link_url;
          } else if (data?.conversation_id) {
            // Navigate to conversation
            window.location.href = `/messages/${data.conversation_id}`;
          } else if (data?.property_id) {
            // Navigate to property
            window.location.href = `/property/${data.property_id}`;
          }
        }
      );
      cleanupFunctions.push(() => actionListener.remove());

      // Auto-register on setup
      await registerForPush();
    };

    setupListeners();

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [isNative, user?.id, saveToken, registerForPush]);

  // Deactivate tokens on logout
  useEffect(() => {
    if (!user?.id) {
      setIsRegistered(false);
    }
  }, [user?.id]);

  return {
    isNative,
    platform,
    isRegistered,
    permissionStatus,
    registerForPush,
    removeToken,
  };
}
