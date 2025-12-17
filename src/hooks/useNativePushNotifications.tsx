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
      // Dynamic import - only works if package is installed
      const module = await import('@capacitor/push-notifications' as any);
      PushNotifications = module.PushNotifications;
    } catch (error) {
      // Push notifications not available
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

  // Save token to local storage (device_tokens table not available)
  const saveToken = useCallback(async (token: string) => {
    if (!user?.id) return;

    try {
      // Store token locally since device_tokens table is not available
      localStorage.setItem(`push_token_${user.id}`, JSON.stringify({
        token,
        platform,
        updated_at: new Date().toISOString(),
      }));
      setIsRegistered(true);
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  }, [user?.id, platform]);

  // Remove token from local storage
  const removeToken = useCallback(async (_token: string) => {
    if (!user?.id) return;

    try {
      localStorage.removeItem(`push_token_${user.id}`);
    } catch (error) {
      console.error('Error removing device token:', error);
    }
  }, [user?.id]);

  // Register for push notifications
  const registerForPush = useCallback(async () => {
    const PN = await loadPushNotifications();
    if (!PN) {
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
          return false;
        }
      } else if (permResult.receive === 'denied') {
        setPermissionStatus('denied');
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
          // The notification will show automatically on iOS/Android
          // You can also show a local notification or toast here
        }
      );
      cleanupFunctions.push(() => receivedListener.remove());

      // On push notification action performed (user tapped notification)
      const actionListener = await PN.addListener(
        'pushNotificationActionPerformed',
        (action: ActionPerformed) => {
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
