import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import { logBundleSize } from './utils/performance'
import { setupUpdateChecker, checkAppVersion } from './utils/cacheManager'
import { ErrorBoundaryWrapper } from './components/ErrorBoundaryWrapper'
import { initPerformanceOptimizations } from './utils/performanceMonitor'
import { initWebVitalsMonitoring } from './utils/webVitals'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAPACITOR STATUS BAR INITIALIZATION
// Configures safe area handling for iOS and Android
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function initializeStatusBar() {
  // Only run on native platforms (iOS/Android)
  if (Capacitor.isNativePlatform()) {
    try {
      // CRITICAL: Disable overlay mode
      // This prevents the status bar from overlaying the webview
      // and ensures safe-area-inset-top is properly calculated
      await StatusBar.setOverlaysWebView({ overlay: false });

      // Set status bar style (light text on dark background)
      // Use Style.Light for light text, Style.Dark for dark text
      await StatusBar.setStyle({ style: Style.Light });

      // Optional: Set status bar background color (Android only)
      // This should match your app's header background
      await StatusBar.setBackgroundColor({ color: '#FF0000' });
    } catch (error) {
      // StatusBar initialization errors are non-critical
    }
  }
}

// Initialize Capacitor StatusBar before app loads
initializeStatusBar();

// Initialize performance monitoring and update checking
logBundleSize();
checkAppVersion();
setupUpdateChecker();
initPerformanceOptimizations();
initWebVitalsMonitoring(); // Track Core Web Vitals in production

// Remove static loading screen once React is ready to mount
const loadingScreen = document.getElementById('app-loading-screen');
if (loadingScreen) {
  loadingScreen.remove();
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundaryWrapper>
      <App />
    </ErrorBoundaryWrapper>
  </StrictMode>
);
