import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive.css'
import { logBundleSize } from './utils/performance'
import { ErrorBoundaryWrapper } from './components/ErrorBoundaryWrapper'

// Initialize performance monitoring
logBundleSize();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundaryWrapper>
      <App />
    </ErrorBoundaryWrapper>
  </StrictMode>
);
