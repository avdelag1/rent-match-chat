import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/responsive.css";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FAST INITIAL RENDER - Quita el loader apenas carga la página
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const initialLoader = document.getElementById("initial-loader");
if (initialLoader) {
  initialLoader.style.opacity = "0";
  initialLoader.style.transition = "opacity 150ms ease-out";
  setTimeout(() => initialLoader.remove(), 150);
}

// Arranca la app normalmente
// NOTE: StrictMode REMOVED intentionally for production-like performance
// StrictMode double-mounts components causing: dashboard flicker, duplicate fetches,
// delayed UI completion, subscription thrash. Preview must match production behavior.
const root = createRoot(document.getElementById("root")!);
root.render(
  <ErrorBoundaryWrapper>
    <App />
  </ErrorBoundaryWrapper>,
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEFERRED INITIALIZATION - Todo lo pesado se carga DESPUÉS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const deferredInit = (callback: () => void, timeout = 3000) => {
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, timeout);
  }
};

// SPEED OF LIGHT: Do NOT prefetch routes on startup
// Route prefetching now happens inside DashboardLayout ONLY after first paint
// via requestIdleCallback. This ensures initial render is never blocked.

// Priority 2: Herramientas de rendimiento
deferredInit(async () => {
  try {
    const [
      { logBundleSize },
      { setupUpdateChecker, checkAppVersion },
      { initPerformanceOptimizations },
      { initWebVitalsMonitoring },
    ] = await Promise.all([
      import("@/utils/performance"),
      import("@/utils/cacheManager"),
      import("@/utils/performanceMonitor"),
      import("@/utils/webVitals"),
    ]);
    logBundleSize();
    checkAppVersion();
    setupUpdateChecker();
    initPerformanceOptimizations();
    initWebVitalsMonitoring();
  } catch {}
}, 3000);

// Priority 3: Configuración nativa (solo en app móvil)
deferredInit(async () => {
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#FF0000" });
    }
  } catch {}
}, 5000);

// Service Worker with proper versioning and update handling
// Version is passed as URL param since /public/ isn't processed by Vite
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    // Use build timestamp for cache versioning
    // In production, this changes with each deploy, ensuring cache busting
    const swVersion = import.meta.env.VITE_BUILD_TIME || Date.now().toString();

    navigator.serviceWorker
      .register(`/sw.js?v=${swVersion}`)
      .then((registration) => {
        // Check for updates periodically (every 5 minutes)
        setInterval(() => registration.update(), 300000);

        // Handle new SW waiting to activate
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              // New SW is installed and waiting - tell it to activate
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // Skip waiting to activate the new SW immediately
                newWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          }
        });
      })
      .catch(() => {});

    // CRITICAL: Reload page when new SW takes control
    // This ensures the app uses fresh assets after deploy
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}
