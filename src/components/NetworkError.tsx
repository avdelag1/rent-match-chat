import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkErrorProps {
  onRetry?: () => void;
  message?: string;
}

export function NetworkError({ onRetry, message }: NetworkErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8 text-orange-600" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connection Problem
      </h3>

      <p className="text-gray-600 mb-6 max-w-sm">
        {message || "We're having trouble connecting. Please check your internet connection and try again."}
      </p>

      {onRetry && (
        <Button onClick={onRetry} variant="default">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}
