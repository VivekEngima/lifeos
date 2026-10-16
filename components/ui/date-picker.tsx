"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { formatDayFullWithOrdinal, parseDateString, getLocalTodayStr } from "@/lib/date-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerProps {
  value?: string; // Format: YYYY-MM-DD
  onChange?: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  align?: "center" | "start" | "end";
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
  align = "start",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDateObj = React.useMemo(() => {
    if (!value) return undefined;
    try {
      return parseDateString(value);
    } catch {
      return undefined;
    }
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    onChange?.(dateStr);
    setOpen(false);
  };

  const displayText = value ? formatDayFullWithOrdinal(value) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-mono font-medium text-xs px-2.5 py-1.5 h-auto min-h-[34px] border-[#27272a] bg-[#121215] hover:bg-[#18181b] hover:border-cyan-500/50 hover:text-cyan-300 text-[#f4f4f5] shadow-sm",
            !value && "text-[#71717a]",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <span className="truncate" title={displayText}>
            {displayText}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border border-outline-variant/70 shadow-2xl bg-[#13141a] z-[100]"
        align={align}
      >
        <Calendar
          mode="single"
          selected={selectedDateObj}
          onSelect={handleSelect}
        />
        <div className="p-2 border-t border-outline-variant/40 flex justify-between items-center bg-surface-container-lowest text-xs font-mono">
          <span className="text-on-surface-variant text-[11px] truncate max-w-[180px]">
            {value ? formatDayFullWithOrdinal(value) : "No date"}
          </span>
          <Button
            type="button"
            variant="link"
            size="xs"
            onClick={() => {
              const today = getLocalTodayStr();
              onChange?.(today);
              setOpen(false);
            }}
            className="text-cyan-400 text-[11px] p-0 h-auto font-mono hover:text-cyan-300"
          >
            Today
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
