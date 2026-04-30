'use client';

import { useEffect, useState } from 'react';
import NepaliDate from 'nepali-date-converter';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DualDatePickerProps {
  value: string; // AD date in YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
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
}: DualDatePickerProps) {
  const [mode, setMode] = useState<'AD' | 'BS'>('AD');
  const [bsInput, setBsInput] = useState('');

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

  const helperText =
    value && bsInput
      ? mode === 'AD'
        ? `BS: ${bsInput}`
        : `AD: ${value}`
      : '';

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
        <button
          type="button"
          onClick={() => setMode('AD')}
          className={cn(
            'px-2.5 py-0.5 text-xs font-medium rounded-sm transition-colors',
            mode === 'AD'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={mode === 'AD'}
        >
          English (AD)
        </button>
        <button
          type="button"
          onClick={() => setMode('BS')}
          className={cn(
            'px-2.5 py-0.5 text-xs font-medium rounded-sm transition-colors',
            mode === 'BS'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
          aria-pressed={mode === 'BS'}
        >
          Nepali (BS)
        </button>
      </div>

      <div className="relative">
        {mode === 'AD' ? (
          <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn('pl-10', inputClassName)}
            placeholder={placeholder}
          />
        ) : (
          <Input
            type="text"
            value={bsInput}
            onChange={(e) => handleBsChange(e.target.value)}
            placeholder="YYYY-MM-DD (BS)"
            className={cn('pl-10', inputClassName)}
            inputMode="numeric"
          />
        )}
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>

      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
