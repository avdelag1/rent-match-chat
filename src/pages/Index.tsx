import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/responsive.css";
import { ErrorBoundaryWrapper } from "./components/ErrorBoundaryWrapper";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FAST INITIAL RENDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const initialLoader = document.getElementById("initial-loader");
if (initialLoader) {
  initialLoader.style.opacity = "0";
  initialLoader.style.transition = "opacity 150ms ease-out";
  setTimeout(() => initialLoader.remove(), 150);
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <ErrorBoundaryWrapper>
      <App />
    </ErrorBoundaryWrapper>
  </StrictMode>,
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFERRED INITIALIZATION (SAFE VERSION)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const deferredInit = (callback: () => void, timeout = 3000) => {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
};

// Priority 1: Route prefetching
deferredInit(async () => {
  const { prefetchCriticalRoutes } = await import("./utils/routePrefetcher");
  prefetchCriticalRoutes();
}, 1000);

// Priority 2: Performance + cache tools
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

// Priority 3: Capacitor StatusBar (native only)
deferredInit(async () => {
  const { Capacitor } = await import("@capacitor/core");

  if (Capacitor.isNativePlatform()) {
    try {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#FF0000" });
    } catch {}
  }
}, 5000);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE WORKER (PROD ONLY)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
