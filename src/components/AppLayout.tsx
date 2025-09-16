import { useEffect, useState } from 'react';
import { AppLoadingScreen } from './AppLoadingScreen';
import { PWAInstallPrompt } from './PWAInstallPrompt';
import { SkipToMainContent, useFocusManagement } from './AccessibilityHelpers';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { useAuth } from '@/hooks/useAuth';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { loading } = useAuth();
  
  // Initialize app features
  useKeyboardShortcuts();
  useFocusManagement();
  useOfflineDetection();

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Show loading screen during initial load or auth loading
  if (isInitialLoading || loading) {
    return <AppLoadingScreen />;
  }

  return (
    <>
      <SkipToMainContent />
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <PWAInstallPrompt />
    </>
  );
}