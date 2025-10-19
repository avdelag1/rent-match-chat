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

// Don't remove loading screen here - let components remove it when ready to paint
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundaryWrapper>
      <App />
    </ErrorBoundaryWrapper>
  </StrictMode>
);
