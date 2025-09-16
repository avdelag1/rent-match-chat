import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logBundleSize } from './utils/performance'

// Initialize performance monitoring
logBundleSize();

createRoot(document.getElementById("root")!).render(<App />);
