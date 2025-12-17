import React from 'react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      role="status"
      aria-label={`Empty state: ${title}`}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground text-4xl">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          variant="default"
          size="sm"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
