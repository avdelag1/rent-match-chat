import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import { logBundleSize } from './utils/performance'
import { setupUpdateChecker, checkAppVersion } from './utils/cacheManager'
import { ErrorBoundaryWrapper } from './components/ErrorBoundaryWrapper'
import { initPerformanceOptimizations } from './utils/performanceMonitor'

// Initialize performance monitoring and update checking
logBundleSize();
checkAppVersion();
setupUpdateChecker();
initPerformanceOptimizations();

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
