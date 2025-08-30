
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Clock } from 'lucide-react';

interface AvailabilityCalendarProps {
  availableDates?: Date[];
  blockedDates?: Date[];
  onDateChange: (dates: Date[]) => void;
  onDurationChange?: (duration: string) => void;
  mode?: 'view' | 'edit';
  minStayDays?: number;
}

export function AvailabilityCalendar({ 
  availableDates = [], 
  blockedDates = [],
  onDateChange,
  onDurationChange,
  mode = 'view',
  minStayDays = 30
}: AvailabilityCalendarProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>(availableDates);
  const [duration, setDuration] = useState<string>('monthly');

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || mode === 'view') return;

    const isSelected = selectedDates.some(d => d.toDateString() === date.toDateString());
    let newDates: Date[];

    if (isSelected) {
      newDates = selectedDates.filter(d => d.toDateString() !== date.toDateString());
    } else {
      newDates = [...selectedDates, date];
    }

    setSelectedDates(newDates);
    onDateChange(newDates);
  };

  const handleDurationChange = (newDuration: string) => {
    setDuration(newDuration);
    onDurationChange?.(newDuration);
  };

  const isDateAvailable = (date: Date) => {
    return selectedDates.some(d => d.toDateString() === date.toDateString());
  };

  const isDateBlocked = (date: Date) => {
    return blockedDates.some(d => d.toDateString() === date.toDateString());
  };

  const getDayClassName = (date: Date) => {
    if (isDateBlocked(date)) return 'bg-red-100 text-red-800 line-through';
    if (isDateAvailable(date)) return 'bg-green-100 text-green-800';
    return '';
  };

  const availableCount = selectedDates.length;
  const blockedCount = blockedDates.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          Availability Calendar
        </CardTitle>
        {mode === 'edit' && (
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <Select value={duration} onValueChange={handleDurationChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Rental</SelectItem>
                  <SelectItem value="weekly">Weekly Rental</SelectItem>
                  <SelectItem value="monthly">Monthly Rental</SelectItem>
                  <SelectItem value="long-term">Long-term (6+ months)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span>Available ({availableCount} days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span>Blocked ({blockedCount} days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
            <span>Not set</span>
          </div>
        </div>

        {/* Calendar */}
        <Calendar
          mode="single"
          selected={undefined}
          onSelect={handleDateSelect}
          className="rounded-md border"
          modifiers={{
            available: selectedDates,
            blocked: blockedDates
          }}
          modifiersClassNames={{
            available: 'bg-green-100 text-green-800',
            blocked: 'bg-red-100 text-red-800 line-through'
          }}
          disabled={mode === 'view' ? () => false : (date) => date < new Date()}
        />

        {/* Rental Terms */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Badge variant="outline" className="mb-2">
              Minimum Stay
            </Badge>
            <p className="text-muted-foreground">
              {minStayDays} days minimum
            </p>
          </div>
          <div>
            <Badge variant="outline" className="mb-2">
              Rental Type
            </Badge>
            <p className="text-muted-foreground capitalize">
              {duration.replace('-', ' ')} rental
            </p>
          </div>
        </div>

        {mode === 'edit' && (
          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const next30Days = Array.from({ length: 30 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i + 1);
                    return date;
                  });
                  setSelectedDates(next30Days);
                  onDateChange(next30Days);
                }}
              >
                Mark Next 30 Days Available
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSelectedDates([]);
                  onDateChange([]);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
