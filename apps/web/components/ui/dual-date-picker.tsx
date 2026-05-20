'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import NepaliDate from 'nepali-date-converter';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import NepaliCalendar from './nepali-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DualDatePickerProps {
  value: string; // AD date in YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  minDate?: Date;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function adToBsString(adIso: string): string {
  if (!adIso) return '';
  try {
    const d = new Date(adIso);
    if (Number.isNaN(d.getTime())) return '';
    const nd = new NepaliDate(d);
    return `${nd.getYear()}-${pad(nd.getMonth() + 1)}-${pad(nd.getDate())}`;
  } catch {
    return '';
  }
}

function bsStringToAd(bs: string): string {
  const m = bs.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return '';
  try {
    const nd = new NepaliDate(
      parseInt(m[1], 10),
      parseInt(m[2], 10) - 1,
      parseInt(m[3], 10)
    );
    const d = nd.toJsDate();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch {
    return '';
  }
}

export function DualDatePicker({
  value,
  onChange,
  className,
  inputClassName,
  placeholder,
  minDate,
}: DualDatePickerProps) {
  const [bsInput, setBsInput] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Keep BS input in sync with AD value
  useEffect(() => {
    setBsInput(adToBsString(value));
  }, [value]);

  const handleBsChange = (str: string) => {
    setBsInput(str);
    const ad = bsStringToAd(str);
    if (ad) onChange(ad);
    else if (!str) onChange('');
  };


  const selectedDate = value ? parseISO(value) : undefined;
  const minTime = minDate ? new Date(minDate).setHours(0, 0, 0, 0) : null;

  return (
    <div className={cn('space-y-1.5', className)}>
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn('w-full justify-start gap-2 font-normal', !value && 'text-muted-foreground', inputClassName)}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {value ? (bsInput || format(selectedDate ?? new Date(value), 'yyyy-MM-dd')) : placeholder || 'Select Nepali date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <NepaliCalendar
            selected={selectedDate}
            onSelect={(date) => {
              if (date && minTime != null && date.setHours(0, 0, 0, 0) < minTime) {
                return;
              }
              onChange(date ? format(date, 'yyyy-MM-dd') : '');
              setCalendarOpen(false);
            }}
            minDate={minDate}
          />
        </PopoverContent>
      </Popover>

      {/* helper text removed to avoid duplicate BS display */}
    </div>
  );
}
