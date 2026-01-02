import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/responsive.css";
import { ErrorBoundaryWrapper } from "./components/ErrorBoundaryWrapper";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERFORMANCE: Render React app immediately - fastest possible FCP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Remove initial loader immediately when React starts rendering
const initialLoader = document.getElementById("initial-loader");
if (initialLoader) {
  initialLoader.style.opacity = "0";
  initialLoader.style.transition = "opacity 150ms ease-out";
  setTimeout(() => initialLoader.remove(), 150);
}

// Detect "preview/dev" mode (Lovable preview behaves like dev)
const IS_DEV = import.meta.env.DEV;
const IS_PROD = import.meta.env.PROD;

const root = createRoot(document.getElementById("root")!);

// In DEV/PREVIEW: avoid StrictMode double-invocations that cause extra effects/queries.
// In PROD: keep StrictMode for correctness.
const AppTree = (
  <ErrorBoundaryWrapper>
    <App />
  </ErrorBoundaryWrapper>
);

root.render(IS_PROD ? <StrictMode>{AppTree}</StrictMode> : AppTree);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFERRED INITIALIZATION
// Keep heavy tooling ONLY in production to avoid slowing previews.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const deferredInit = (callback: () => void, timeout = 3000) => {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
};

if (IS_PROD) {
  // Priority 1: Route prefetching for instant navigation
  deferredInit(async () => {
    const { prefetchCriticalRoutes } = await import("./utils/routePrefetcher");
    prefetchCriticalRoutes();
  }, 1000);

  // Priority 2: Monitoring and cache management (PROD only)
  deferredInit(async () => {
    const [
      { logBundleSize },
      { setupUpdateChecker, checkAppVersion },
      { initPerformanceOptimizations },
      { initWebVitalsMonitoring },
    ] = await Promise.all([
      import("./utils/performance"),
      import("./utils/cacheManager"),
      import("./utils/performanceMonitor"),
      import("./utils/webVitals"),
    ]);

    logBundleSize();
    checkAppVersion();
    setupUpdateChecker();
    initPerformanceOptimizations();
    initWebVitalsMonitoring();
  }, 3000);

  // Priority 3: Capacitor StatusBar - only on native platforms
  deferredInit(async () => {
    const { Capacitor } = await import("@capacitor/core");

    if (Capacitor.isNativePlatform()) {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: "#FF0000" });
      } catch {
        // non-critical
      }
    }
  }, 5000);

  // Service Worker registration (PROD only)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // non-critical
      });
    });
  }
}
