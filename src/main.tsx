import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import { ErrorBoundaryWrapper } from './components/ErrorBoundaryWrapper'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERFORMANCE: Render React app immediately - fastest possible FCP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Remove initial loader immediately when React starts rendering
const initialLoader = document.getElementById('initial-loader');
if (initialLoader) {
  initialLoader.style.opacity = '0';
  initialLoader.style.transition = 'opacity 150ms ease-out';
  setTimeout(() => initialLoader.remove(), 150);
}

const root = createRoot(document.getElementById("root")!);
root.render(
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
const deferredInit = (callback: () => void, timeout = 3000) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 100);
  }
};

// Priority 1: Route prefetching for instant navigation (runs first)
deferredInit(async () => {
  const { prefetchCriticalRoutes } = await import('./utils/routePrefetcher');
  prefetchCriticalRoutes();
}, 1000);

// Priority 2: Performance monitoring and cache management
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
}, 3000);

// Priority 3: Capacitor StatusBar - only on native platforms
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
}, 5000);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE WORKER REGISTRATION
// Register SW for offline support and faster repeat visits
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed - non-critical
    });
  });
}
