import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import { logBundleSize } from './utils/performance'
import { setupUpdateChecker } from './utils/cacheManager'
import { ErrorBoundaryWrapper } from './components/ErrorBoundaryWrapper'

// Initialize performance monitoring and update checking
logBundleSize();
setupUpdateChecker();

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
