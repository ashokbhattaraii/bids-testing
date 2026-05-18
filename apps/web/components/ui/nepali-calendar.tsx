"use client";

import * as React from "react";
import NepaliDate from "nepali-date-converter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  selected?: Date | undefined;
  onSelect: (d: Date | undefined) => void;
  className?: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function NepaliCalendar({ selected, onSelect, className }: Props) {
  // Keep an internal BS month view. Initialize from selected AD date if provided.
  const [view, setView] = React.useState(() => {
    try {
      const now = selected ? selected : new Date();
      const nd = new NepaliDate(now);
      return { year: nd.getYear(), monthIndex: nd.getMonth() };
    } catch (e) {
      return { year: 2080, monthIndex: 0 };
    }
  });

  const buildDays = React.useMemo(() => {
    const days: { bsDay: number; jsDate: Date }[] = [];
    const { year, monthIndex } = view;
    // Try days 1..35 and include those that map to the same BS month
    for (let d = 1; d <= 35; d++) {
      try {
        // Note: NepaliDate constructor uses month index (0-based)
        const nd = new (NepaliDate as any)(year, monthIndex, d);
        const js = nd.toJsDate();
        // Double-check that nd month matches view
        if (nd.getMonth() === monthIndex) {
          days.push({ bsDay: nd.getDate(), jsDate: js });
        } else {
          // when month overflows, stop adding
          break;
        }
      } catch (e) {
        break;
      }
    }
    return days;
  }, [view]);

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrev = () => {
    setView((v) => {
      let mi = v.monthIndex - 1;
      let y = v.year;
      if (mi < 0) {
        mi = 11;
        y -= 1;
      }
      return { year: y, monthIndex: mi };
    });
  };
  const handleNext = () => {
    setView((v) => {
      let mi = v.monthIndex + 1;
      let y = v.year;
      if (mi > 11) {
        mi = 0;
        y += 1;
      }
      return { year: y, monthIndex: mi };
    });
  };

  const selectedTime = selected ? selected.getTime() : null;

  return (
    <div className={cn("w-[320px] p-2 bg-background rounded-md border", className)}>
      <div className="flex items-center justify-between px-2 pb-2">
        <Button variant="ghost" size="icon" onClick={handlePrev} aria-label="Previous month">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {/* Show BS month/year in English digits */}
          {view.year}-{pad(view.monthIndex + 1)}
        </div>
        <Button variant="ghost" size="icon" onClick={handleNext} aria-label="Next month">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[11px] text-muted-foreground px-2">
        {weekdayLabels.map((w) => (
          <div key={w} className="text-center font-medium">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-2 px-2">
        {(() => {
          // Determine weekday of first day
          if (buildDays.length === 0) return null;
          const firstJs = buildDays[0].jsDate;
          const startWeekday = firstJs.getDay();
          const blanks = Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`b-${i}`} />
          ));

          return (
            <>
              {blanks}
              {buildDays.map((it) => {
                const t = it.jsDate.getTime();
                const isSelected = selectedTime === t;
                return (
                  <button
                    key={it.bsDay}
                    type="button"
                    onClick={() => onSelect(it.jsDate)}
                    className={cn(
                      'h-8 w-full rounded-md text-sm leading-8',
                      isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/40'
                    )}
                  >
                    {it.bsDay}
                  </button>
                );
              })}
            </>
          );
        })()}
      </div>
    </div>
  );
}

export default NepaliCalendar;
