// src/hooks/useNativePushNotifications.ts
import { useCallback, useState } from "react";

/**
 * IMPORTANT:
 * Lovable runs in a WEB environment.
 * Capacitor push notifications are NATIVE ONLY.
 *
 * This hook is intentionally disabled for web preview
 * so the app does NOT crash.
 *
 * Native push will be implemented later for Android/iOS.
 */

type PushState = {
  isNative: boolean;
  isSupported: boolean;
  permission: "granted" | "denied" | "unknown";
  token?: string;
  lastError?: string;
};

export function useNativePushNotifications() {
  const [state, setState] = useState<PushState>({
    isNative: false,
    isSupported: false,
    permission: "unknown",
  });

  const requestPermissionAndRegister = useCallback(async () => {
    // Web-safe no-op
    setState((s) => ({
      ...s,
      permission: "denied",
      lastError: "Push notifications are disabled in web preview. Available only on native Android/iOS builds.",
    }));
  }, []);

  return {
    ...state,
    requestPermissionAndRegister,
  };
}
