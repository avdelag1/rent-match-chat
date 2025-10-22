import { UpdateNotification } from './UpdateNotification';
import { SkipToMainContent, useFocusManagement } from './AccessibilityHelpers';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useOfflineDetection } from '@/hooks/useOfflineDetection';
import { useErrorReporting } from '@/hooks/useErrorReporting';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  // Initialize app features
  useKeyboardShortcuts();
  useFocusManagement();
  useOfflineDetection();
  useErrorReporting();

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