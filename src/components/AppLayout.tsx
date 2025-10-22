import { useEffect, useState } from 'react';
import { AppLoadingScreen } from './AppLoadingScreen';
import { UpdateNotification } from './UpdateNotification';
import { SkipToMainContent, useFocusManagement } from './AccessibilityHelpers';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { useAuth } from '@/hooks/useAuth';
import { useErrorReporting } from '@/hooks/useErrorReporting';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Initialize app features
  useKeyboardShortcuts();
  useFocusManagement();
  useOfflineDetection();
  useErrorReporting();

  useEffect(() => {
    // Show initial app loading screen only on first load
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen ONLY during initial app load, not on navigation
  if (isInitialLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <div className="min-h-screen w-full">
      <SkipToMainContent />
      <main id="main-content" tabIndex={-1} className="outline-none w-full min-h-screen">
        <div className="w-full min-h-screen overflow-x-hidden">
          {children}
        </div>
      </main>
      <UpdateNotification />
    </div>
  );
}