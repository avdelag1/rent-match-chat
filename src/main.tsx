import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import { ErrorBoundaryWrapper } from './components/ErrorBoundaryWrapper'

// Remove static loading screen immediately before React renders
const loadingScreen = document.getElementById('app-loading-screen');
if (loadingScreen) {
  loadingScreen.remove();
}

// Render React app immediately - fastest possible FCP
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundaryWrapper>
      <App />
    </ErrorBoundaryWrapper>
  </StrictMode>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFERRED INITIALIZATION
// Non-critical operations run after main render completes
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Use requestIdleCallback for non-critical init, fallback to setTimeout
const deferredInit = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 3000 });
  } else {
    setTimeout(callback, 100);
  }
};

// Defer all non-critical initialization
deferredInit(async () => {
  // Dynamic imports for non-critical modules
  const [
    { logBundleSize },
    { setupUpdateChecker, checkAppVersion },
    { initPerformanceOptimizations },
    { initWebVitalsMonitoring }
  ] = await Promise.all([
    import('./utils/performance'),
    import('./utils/cacheManager'),
    import('./utils/performanceMonitor'),
    import('./utils/webVitals')
  ]);

  // Initialize performance monitoring
  logBundleSize();
  checkAppVersion();
  setupUpdateChecker();
  initPerformanceOptimizations();
  initWebVitalsMonitoring();
});

// Capacitor StatusBar initialization - only on native platforms
deferredInit(async () => {
  const { Capacitor } = await import('@capacitor/core');

  if (Capacitor.isNativePlatform()) {
    try {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#FF0000' });
    } catch {
      // StatusBar initialization errors are non-critical
    }
  }
});
