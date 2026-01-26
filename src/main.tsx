import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/responsive.css";
import { ErrorBoundaryWrapper } from "@/components/ErrorBoundaryWrapper";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CACHE RECOVERY - Force clear all caches if ?clear-cache=1 in URL
// This helps recover from stale service worker or cache issues
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('clear-cache') === '1') {
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });
  }
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
  // Clear local/session storage
  localStorage.clear();
  sessionStorage.clear();
  // Remove the query param and reload
  const cleanUrl = window.location.pathname + window.location.hash;
  window.history.replaceState({}, '', cleanUrl);
  window.location.reload();
}

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

// Priority 2: Herramientas de rendimiento + Offline Sync
deferredInit(async () => {
  try {
    const [
      { logBundleSize },
      { setupUpdateChecker, checkAppVersion },
      { initPerformanceOptimizations },
      { initWebVitalsMonitoring },
      { initOfflineSync },
    ] = await Promise.all([
      import("@/utils/performance"),
      import("@/utils/cacheManager"),
      import("@/utils/performanceMonitor"),
      import("@/utils/webVitals"),
      import("@/utils/offlineSwipeQueue"),
    ]);
    logBundleSize();
    checkAppVersion();
    setupUpdateChecker();
    initPerformanceOptimizations();
    initWebVitalsMonitoring();
    initOfflineSync(); // PERF: Sync queued swipes when back online
  } catch {
    // Silently ignore - these are optional optimizations
  }
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
  } catch {
    // Silently ignore - only applies to native mobile platforms
  }
}, 5000);

// Service Worker with AGGRESSIVE update handling for PWA
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    // Track if we had a controller before (for reload logic)
    const hadController = !!navigator.serviceWorker.controller;
    
    // Use timestamp as version for cache busting
    const swVersion = Date.now().toString();

    navigator.serviceWorker
      .register(`/sw.js?v=${swVersion}`)
      .then((registration) => {
        console.log('[PWA] Service Worker registered');
        
        // Check for updates immediately on PWA launch
        registration.update();
        
        // Check for updates periodically (every 2 minutes for faster updates)
        setInterval(() => registration.update(), 120000);

        // Handle new SW waiting to activate
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            console.log('[PWA] New Service Worker found, installing...');
            newWorker.addEventListener("statechange", () => {
              // New SW is installed - skip waiting immediately
              if (newWorker.state === "installed") {
                console.log('[PWA] New version installed, activating...');
                newWorker.postMessage({ type: "SKIP_WAITING" });
              }
            });
          }
        });
        
        // If there's already a waiting worker, activate it now
        if (registration.waiting) {
          console.log('[PWA] Waiting worker found, activating...');
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      })
      .catch((error) => {
        console.error('[PWA] Service Worker registration failed:', error);
      });

    // Reload when new SW takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (hadController && !refreshing) {
        refreshing = true;
        console.log('[PWA] New version activated, reloading...');
        window.location.reload();
      }
    });
    
    // Listen for SW update messages
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SW_UPDATED") {
        console.log('[PWA] Received update notification:', event.data.version);
      }
    });
  });
}
