import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { SkipToMainContent, useFocusManagement } from './AccessibilityHelpers';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { useErrorReporting } from '@/hooks/useErrorReporting';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  
  // Initialize app features
  useKeyboardShortcuts();
  useFocusManagement();
  useOfflineDetection();
  useErrorReporting();

  return (
    <div className="min-h-screen w-full bg-background">
      <SkipToMainContent />
      <main id="main-content" tabIndex={-1} className="outline-none w-full min-h-screen">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              type: 'spring',
              stiffness: 380,
              damping: 30,
              mass: 0.8,
            }}
            className="w-full min-h-screen overflow-x-hidden"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
