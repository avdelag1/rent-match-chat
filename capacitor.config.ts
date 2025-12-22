import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swipes.app',
  appName: 'ZWIPES',
  webDir: 'dist',

  // Server configuration for development
  server: {
    // Enable HTTPS for iOS App Transport Security
    androidScheme: 'https',
    iosScheme: 'https',
    // Allow navigation to external URLs
    allowNavigation: [
      'https://*.supabase.co',
      'https://*.supabase.in',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://storage.googleapis.com'
    ],
  },

  // iOS Configuration - Comprehensive settings for App Store
  ios: {
    // Safe area handling
    contentInset: 'always',
    // Allow scrolling in web view
    allowsLinkPreview: true,
    // Scroll behavior
    scrollEnabled: true,
    // Keyboard behavior
    limitsNavigationsToAppBoundDomains: false,
    // Enable background modes
    backgroundColor: '#000000',
    // Web view preferences
    preferredContentMode: 'mobile',
    // Handle URL schemes
    handleApplicationNotifications: true,
  },

  // Android Configuration - Fixed for Play Store compatibility
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#000000',
    // Use default user agent to avoid security flags
    overrideUserAgent: undefined,
    // Disable appendUserAgent to avoid detection issues
    appendUserAgent: undefined,
  },

  // Plugin Configuration
  plugins: {
    StatusBar: {
      // Set to false to ensure status bar doesn't overlay content
      overlay: false,
      // Status bar style for iOS
      style: 'DARK',
      // Background color
      backgroundColor: '#000000',
    },
    PushNotifications: {
      // iOS: Present notifications when app is in foreground
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      // Splash screen duration in milliseconds
      launchShowDuration: 2000,
      // Auto hide splash screen
      launchAutoHide: true,
      // Background color
      backgroundColor: '#000000',
      // Android specific
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      // iOS specific
      showSpinner: false,
      iosSpinnerStyle: 'small',
      spinnerColor: '#ff6b35',
      // Fade out animation
      launchFadeOutDuration: 300,
      // Splash screen image
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      // Keyboard behavior on iOS
      resize: 'body',
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      // Small icon for Android notifications
      smallIcon: 'ic_stat_icon_config_sample',
      iconColor: '#ff6b35',
    },
    App: {
      // URL schemes the app can open
      iosScheme: 'swipes',
    },
  },

  // App URL Launcher configuration
  appUrlOpen: {
    // Handle deep links
    url: 'swipes://',
  },
};

export default config;
