import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-[#13141a] text-on-surface rounded-xl border border-outline-variant/60 font-mono", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-between pt-1 relative items-center px-1 font-mono text-xs",
        caption_label: "text-sm font-semibold font-mono text-cyan-300",
        nav: "space-x-1 flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 text-on-surface-variant hover:text-cyan-300 hover:bg-surface-container absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 text-on-surface-variant hover:text-cyan-300 hover:bg-surface-container absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1 font-mono",
        weekdays: "flex",
        weekday:
          "text-on-surface-variant rounded-md w-9 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
        ),
        selected:
          "bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:text-slate-950 font-bold rounded-md shadow-[0_0_10px_rgba(6,182,212,0.5)]",
        today: "border border-cyan-400 text-cyan-300 font-bold rounded-md",
        outside: "text-on-surface-variant/30 opacity-40",
        disabled: "text-on-surface-variant/20 opacity-20",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
