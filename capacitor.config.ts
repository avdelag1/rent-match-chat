import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rentmatch.app',
  appName: 'Rent Match Chat',
  webDir: 'dist',

  // iOS Configuration for Safe Areas
  ios: {
    contentInset: 'always',
  },

  // Android Configuration
  android: {
    allowMixedContent: true,
    captureInput: true,
  },

  // Plugin Configuration
  plugins: {
    StatusBar: {
      // Set to false to ensure status bar doesn't overlay content
      // This is critical for safe-area-inset-top to work properly
      overlay: false,
      // Status bar style: 'LIGHT' (light text) or 'DARK' (dark text)
      style: 'LIGHT',
      // Background color for Android (hex format)
      backgroundColor: '#FF0000',
    },
    PushNotifications: {
      // iOS: Present notifications when app is in foreground
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
