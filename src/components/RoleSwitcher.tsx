import { motion } from 'framer-motion';
import { Search, Briefcase, ArrowLeftRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveMode, ActiveMode } from '@/hooks/useActiveMode';
import { Card, CardContent } from '@/components/ui/card';

interface RoleSwitcherProps {
  /** Show as compact toggle (for nav) or full card (for settings) */
  variant?: 'compact' | 'card';
  /** Additional class names */
  className?: string;
}

/**
 * Role Switcher Component
 *
 * Allows users to switch between:
 * - "I'm a Client" mode: Browse and discover deals, services, properties
 * - "I Own / I Can Do" mode: Share services and manage listings
 *
 * One account, two modes - like Uber driver/rider toggle.
 */
export function RoleSwitcher({ variant = 'card', className }: RoleSwitcherProps) {
  const { activeMode, switchMode, isLoading } = useActiveMode();

  if (variant === 'compact') {
    return (
      <motion.button
        onClick={() => switchMode(activeMode === 'client' ? 'owner' : 'client')}
        disabled={isLoading}
        className={cn(
          "relative flex items-center gap-2 px-3 py-2 rounded-full",
          "bg-muted/50 hover:bg-muted transition-colors",
          "text-sm font-medium",
          isLoading && "opacity-50 cursor-not-allowed",
          className
        )}
        whileTap={{ scale: 0.95 }}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ArrowLeftRight className="w-4 h-4" />
        )}
        <span>
          {activeMode === 'client' ? 'Switch to I Own' : 'Switch to I\'m a Client'}
        </span>
      </motion.button>
    );
  }

  return (
    <Card className={cn("bg-card border-border overflow-hidden", className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Account Mode</h3>
            <p className="text-sm text-muted-foreground">
              Switch between browsing and offering
            </p>
          </div>
          {isLoading && (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Toggle Options */}
        <div className="grid grid-cols-2 gap-3">
          <ModeOption
            mode="client"
            icon={Search}
            label="I'm a Client"
            description="Browse & discover"
            isActive={activeMode === 'client'}
            onClick={() => switchMode('client')}
            disabled={isLoading}
          />
          <ModeOption
            mode="owner"
            icon={Briefcase}
            label="I Own / I Can Do"
            description="Share & manage"
            isActive={activeMode === 'owner'}
            onClick={() => switchMode('owner')}
            disabled={isLoading}
          />
        </div>

        {/* Current Mode Indicator */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              "w-2 h-2 rounded-full",
              activeMode === 'client' ? "bg-blue-500" : "bg-orange-500"
            )} />
            <span className="text-muted-foreground">
              Currently in{' '}
              <span className="font-medium text-foreground">
                {activeMode === 'client' ? 'I\'m a Client' : 'I Own / I Can Do'}
              </span>
              {' '}mode
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ModeOptionProps {
  mode: ActiveMode;
  icon: React.ElementType;
  label: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function ModeOption({
  mode,
  icon: Icon,
  label,
  description,
  isActive,
  onClick,
  disabled
}: ModeOptionProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || isActive}
      className={cn(
        "relative flex flex-col items-center gap-2 p-4 rounded-xl",
        "transition-all duration-200",
        isActive
          ? mode === 'client'
            ? "bg-blue-500/15"
            : "bg-orange-500/15"
          : "bg-muted/30 hover:bg-muted/50",
        (disabled && !isActive) && "opacity-50 cursor-not-allowed"
      )}
      whileTap={!disabled && !isActive ? { scale: 0.98 } : undefined}
    >
      {/* Active Indicator */}
      {isActive && (
        <motion.div
          layoutId="active-mode-indicator"
          className={cn(
            "absolute top-2 right-2 w-2 h-2 rounded-full",
            mode === 'client' ? "bg-blue-500" : "bg-orange-500"
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}

      {/* Icon */}
      <div className={cn(
        "p-3 rounded-full",
        isActive
          ? mode === 'client'
            ? "bg-blue-500/20 text-blue-500"
            : "bg-orange-500/20 text-orange-500"
          : "bg-muted text-muted-foreground"
      )}>
        <Icon className="w-6 h-6" />
      </div>

      {/* Label */}
      <div className="text-center">
        <div className={cn(
          "font-semibold",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}>
          {label}
        </div>
        <div className="text-xs text-muted-foreground">
          {description}
        </div>
      </div>
    </motion.button>
  );
}

/**
 * Compact role indicator for navigation/headers
 */
export function RoleIndicator({ className }: { className?: string }) {
  const { activeMode } = useActiveMode();

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
      activeMode === 'client'
        ? "bg-blue-500/10 text-blue-500"
        : "bg-orange-500/10 text-orange-500",
      className
    )}>
      {activeMode === 'client' ? (
        <>
          <Search className="w-3 h-3" />
          <span>I'm a Client</span>
        </>
      ) : (
        <>
          <Briefcase className="w-3 h-3" />
          <span>I Own</span>
        </>
      )}
    </div>
  );
}
