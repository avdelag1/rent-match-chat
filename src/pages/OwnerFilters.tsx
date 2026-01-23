/**
 * OWNER FILTERS PAGE
 *
 * Full-screen, mobile-first filter page for owners.
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, User, Briefcase, Check, Home, ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Gender = 'male' | 'female' | 'any';
type ClientType = 'all' | 'hire' | 'rent' | 'buy';

const genderOptions = [
  {
    id: 'any' as Gender,
    label: 'All',
    description: 'Show everyone',
    icon: <Users className="w-6 h-6" />
  },
  {
    id: 'female' as Gender,
    label: 'Women',
    description: 'Female clients',
    icon: <User className="w-6 h-6" />
  },
  {
    id: 'male' as Gender,
    label: 'Men',
    description: 'Male clients',
    icon: <User className="w-6 h-6" />
  },
];

const clientTypeOptions = [
  {
    id: 'all' as ClientType,
    label: 'All Types',
    description: 'Show all clients',
    icon: <Users className="w-6 h-6" />,
    gradient: 'from-gray-500 to-slate-600'
  },
  {
    id: 'hire' as ClientType,
    label: 'Hiring',
    description: 'Looking to hire services',
    icon: <Briefcase className="w-6 h-6" />,
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    id: 'rent' as ClientType,
    label: 'Renting',
    description: 'Looking to rent',
    icon: <Home className="w-6 h-6" />,
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'buy' as ClientType,
    label: 'Buying',
    description: 'Looking to purchase',
    icon: <ShoppingCart className="w-6 h-6" />,
    gradient: 'from-green-500 to-emerald-600'
  },
];

export default function OwnerFilters() {
  const navigate = useNavigate();

  const [localGender, setLocalGender] = useState<Gender>('any');
  const [localClientType, setLocalClientType] = useState<ClientType>('all');

  const handleApply = useCallback(() => {
    // TODO: Apply filters to store
    navigate(-1);
  }, [navigate]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-sm font-medium"
        >
          Back
        </Button>

        <h1 className="text-base font-semibold">Client Preferences</h1>

        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4 space-y-8">
          {/* Gender Section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Client Gender
            </h2>
            <div className="flex gap-3">
              {genderOptions.map((option) => {
                const isActive = localGender === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setLocalGender(option.id)}
                    className={cn(
                      'flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-2xl border-2 transition-all min-h-[100px]',
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'mb-2 p-2 rounded-xl',
                      isActive ? 'bg-white/20' : 'bg-muted'
                    )}>
                      {option.icon}
                    </div>
                    <div className="text-base font-semibold">{option.label}</div>
                    <div className={cn(
                      'text-xs mt-0.5',
                      isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}>
                      {option.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Client Type Section */}
          <section>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase mb-4">
              Looking For
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {clientTypeOptions.map((option) => {
                const isActive = localClientType === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setLocalClientType(option.id)}
                    className={cn(
                      'relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all',
                      isActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center w-12 h-12 rounded-xl text-white bg-gradient-to-br',
                      option.gradient
                    )}>
                      {option.icon}
                    </div>

                    <div className="flex-1 text-left">
                      <div className="text-base font-semibold">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>

                    {isActive && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border"
        style={{ paddingBottom: 'calc(var(--safe-bottom) + 16px)' }}
      >
        <Button
          onClick={handleApply}
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
        >
          Apply Filters
        </Button>
      </footer>
    </div>
  );
}
