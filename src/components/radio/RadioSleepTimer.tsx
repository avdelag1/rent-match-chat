import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Clock, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRadioPlayer, SleepTimerOption } from '@/hooks/useRadioPlayer';
import { cn } from '@/lib/utils';

const TIMER_OPTIONS: { value: SleepTimerOption; label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: null, label: 'Off' },
];

export const RadioSleepTimer: React.FC = () => {
  const { sleepTimer, sleepTimerEndTime, setSleepTimer, getRemainingTime } = useRadioPlayer();
  const [remainingTime, setRemainingTime] = useState(0);

  // Update remaining time every second when timer is active
  useEffect(() => {
    if (!sleepTimerEndTime) {
      setRemainingTime(0);
      return;
    }

    const updateRemaining = () => {
      const remaining = getRemainingTime();
      setRemainingTime(remaining);
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEndTime, getRemainingTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base mb-1 flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            Sleep Timer
          </h3>
          <p className="text-xs text-muted-foreground">
            Automatically stop playback
          </p>
        </div>

        {/* Active Timer Display */}
        {sleepTimer && remainingTime > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full"
          >
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono font-semibold text-primary">
              {formatTime(remainingTime)}
            </span>
            <button
              onClick={() => setSleepTimer(null)}
              className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
            >
              <X className="w-3 h-3 text-primary" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Timer Options */}
      <div className="grid grid-cols-4 gap-2">
        {TIMER_OPTIONS.map((option) => {
          const isSelected = sleepTimer === option.value;

          return (
            <Button
              key={option.value ?? 'off'}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => setSleepTimer(option.value)}
              className={cn(
                "h-14 flex-col gap-0.5 rounded-xl",
                isSelected && "bg-primary text-primary-foreground"
              )}
            >
              {option.value !== null ? (
                <>
                  <span className="text-lg font-bold">{option.value}</span>
                  <span className="text-[10px] opacity-70">min</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5" />
                  <span className="text-[10px] opacity-70">Off</span>
                </>
              )}

              {isSelected && option.value !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Info Text */}
      <p className="text-xs text-muted-foreground text-center">
        {sleepTimer
          ? `Radio will stop in ${sleepTimer} minutes`
          : 'Set a timer to fall asleep to your favorite station'
        }
      </p>
    </div>
  );
};
