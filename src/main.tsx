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
const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <ErrorBoundaryWrapper>
      <App />
    </ErrorBoundaryWrapper>
  </React.StrictMode>,
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

// Priority 1: Prefetch de rutas importantes
deferredInit(async () => {
  try {
    const { prefetchCriticalRoutes } = await import("@/utils/routePrefetcher");
    prefetchCriticalRoutes();
  } catch {}
}, 1000);

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

// Service Worker solo en producción
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
