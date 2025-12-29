import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Settings, Radio, Users, User, Briefcase, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { useNavigate } from 'react-router-dom';

export type OwnerClientGender = 'female' | 'male' | 'any';
export type OwnerClientType = 'all' | 'hire' | 'rent' | 'buy';

export interface OwnerFilters {
  clientGender?: OwnerClientGender;
  clientType?: OwnerClientType;
}

interface TopBarProps {
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  className?: string;
  // Owner filter props
  showOwnerFilters?: boolean;
  ownerFilters?: OwnerFilters;
  onOwnerFiltersChange?: (filters: OwnerFilters) => void;
}

const genderOptions: { id: OwnerClientGender; label: string; icon: React.ReactNode }[] = [
  { id: 'any', label: 'All', icon: <Users className="w-4 h-4" /> },
  { id: 'female', label: 'Women', icon: <User className="w-4 h-4" /> },
  { id: 'male', label: 'Men', icon: <User className="w-4 h-4" /> },
];

const clientTypeOptions: { id: OwnerClientType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'hire', label: 'Hiring' },
  { id: 'rent', label: 'Renting' },
  { id: 'buy', label: 'Buying' },
];

// Compact filter dropdown for TopBar
function TopBarFilterDropdown({
  label,
  icon,
  options,
  value,
  onChange,
  isActive
}: {
  label: string;
  icon?: React.ReactNode;
  options: { id: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (id: string) => void;
  isActive?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  const selectedOption = options.find(o => o.id === value);

  return (
    <div ref={dropdownRef} className="relative flex-shrink-0">
      <motion.button
        ref={buttonRef}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-all duration-200',
          'border',
          isActive
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-500 shadow-sm shadow-orange-500/25'
            : 'bg-muted/50 text-muted-foreground border-white/10 hover:bg-muted hover:border-white/20'
        )}
      >
        {icon}
        <span className="hidden xs:inline">{selectedOption?.label || label}</span>
        <ChevronDown className={cn('w-2.5 h-2.5 transition-transform', isOpen && 'rotate-180')} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              right: dropdownPosition.right,
            }}
            className="z-[9999] min-w-[100px] bg-popover border border-border rounded-lg shadow-xl overflow-hidden pointer-events-auto"
          >
            {options.map((option) => (
              <button
                key={option.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors',
                  value === option.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopBarComponent({
  onNotificationsClick,
  onSettingsClick,
  className,
  showOwnerFilters,
  ownerFilters,
  onOwnerFiltersChange
}: TopBarProps) {
  const { unreadCount: notificationCount } = useUnreadNotifications();
  const navigate = useNavigate();

  const hasActiveFilters = showOwnerFilters && (
    (ownerFilters?.clientGender && ownerFilters.clientGender !== 'any') ||
    (ownerFilters?.clientType && ownerFilters.clientType !== 'all')
  );

  const handleGenderChange = (gender: string) => {
    onOwnerFiltersChange?.({
      ...ownerFilters,
      clientGender: gender as OwnerClientGender,
    });
  };

  const handleClientTypeChange = (type: string) => {
    onOwnerFiltersChange?.({
      ...ownerFilters,
      clientType: type as OwnerClientType,
    });
  };

  const handleResetFilters = () => {
    onOwnerFiltersChange?.({
      clientGender: 'any',
      clientType: 'all',
    });
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn('app-header bg-background/80 backdrop-blur-2xl border-b border-white/5', className)}
    >
      <div className="flex items-center justify-between h-10 max-w-screen-xl mx-auto">
        {/* Logo with 3D game-style effect */}
        <motion.div
          className="flex items-center gap-0.5 select-none"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Owner Filters - shown when on owner dashboard */}
          {showOwnerFilters && (
            <>
              <TopBarFilterDropdown
                label="Gender"
                icon={<Users className="w-3.5 h-3.5" />}
                options={genderOptions}
                value={ownerFilters?.clientGender || 'any'}
                onChange={handleGenderChange}
                isActive={ownerFilters?.clientGender !== 'any' && ownerFilters?.clientGender !== undefined}
              />
              <TopBarFilterDropdown
                label="Looking for"
                icon={<Briefcase className="w-3.5 h-3.5" />}
                options={clientTypeOptions}
                value={ownerFilters?.clientType || 'all'}
                onChange={handleClientTypeChange}
                isActive={ownerFilters?.clientType !== 'all' && ownerFilters?.clientType !== undefined}
              />
              {/* Reset button */}
              <AnimatePresence>
                {hasActiveFilters && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResetFilters}
                    className={cn(
                      'flex items-center justify-center h-6 w-6 rounded-full text-xs',
                      'bg-destructive/10 text-destructive border border-destructive/20',
                      'hover:bg-destructive/20 transition-all duration-200 flex-shrink-0'
                    )}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </motion.button>
                )}
              </AnimatePresence>
              {/* Divider between filters and other actions */}
              <div className="w-px h-5 bg-white/10 mx-1" />
            </>
          )}
          {/* Notifications */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 hover:bg-white/10 rounded-xl transition-all duration-200"
              onClick={onNotificationsClick}
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ''}`}
            >
              <Bell className="h-5 w-5 text-foreground/80" />
              <AnimatePresence>
                {notificationCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-red-500 to-orange-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center shadow-lg shadow-red-500/50 ring-2 ring-background"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* Radio moved before filters */}

          {/* Radio */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.17, type: 'spring', stiffness: 500 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-white/10 rounded-xl transition-all duration-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/radio');
              }}
              aria-label="Radio"
            >
              <Radio className="h-5 w-5 text-foreground/80" />
            </Button>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 hover:bg-white/10 rounded-xl transition-all duration-200"
              onClick={onSettingsClick}
              aria-label="Settings menu"
            >
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Settings className="h-5 w-5 text-foreground/80" />
              </motion.div>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

export const TopBar = memo(TopBarComponent);
