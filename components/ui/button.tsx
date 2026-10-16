import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-cyan-500 text-slate-950 font-semibold shadow hover:bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]",
        destructive:
          "bg-red-500/15 text-red-300 border border-red-500/40 hover:bg-red-500/25 shadow-sm",
        outline:
          "border border-outline-variant/60 bg-surface-container/60 hover:bg-surface-container-high hover:text-cyan-300 hover:border-cyan-500/40 text-on-surface",
        secondary:
          "bg-surface-container-high text-on-surface border border-outline-variant/40 hover:bg-surface-container-highest",
        ghost: "hover:bg-surface-container-high text-on-surface hover:text-cyan-300",
        link: "text-cyan-400 underline-offset-4 hover:underline",
        emerald:
          "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
        amber:
          "bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-8 w-8 rounded-md",
        xs: "h-6 rounded px-2 text-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
