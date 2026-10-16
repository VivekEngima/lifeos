import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400 select-none",
  {
    variants: {
      variant: {
        default:
          "border-cyan-500/30 bg-cyan-950/60 text-cyan-300 shadow-sm",
        secondary:
          "border-outline-variant/50 bg-surface-container text-on-surface-variant",
        destructive:
          "border-red-500/40 bg-red-950/60 text-red-300",
        outline: "text-on-surface border-outline-variant/60",
        emerald:
          "border-emerald-500/40 bg-emerald-950/60 text-emerald-300 shadow-sm",
        amber:
          "border-amber-500/40 bg-amber-950/60 text-amber-300 shadow-sm",
        purple:
          "border-purple-500/40 bg-purple-950/60 text-purple-300 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
