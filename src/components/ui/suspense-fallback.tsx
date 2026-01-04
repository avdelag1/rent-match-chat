/**
 * Lightweight loading fallback for Suspense boundaries
 * Used instead of null to provide visual feedback on slow connections
 */

import { cn } from '@/lib/utils';

interface SuspenseFallbackProps {
  className?: string;
  minimal?: boolean;
}

export function SuspenseFallback({ className, minimal = false }: SuspenseFallbackProps) {
  if (minimal) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center justify-center min-h-[200px]', className)}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

export default SuspenseFallback;
