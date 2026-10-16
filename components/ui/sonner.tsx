"use client";

import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      closeButton
      className="toaster group font-sans"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#131316]/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-[#f4f4f5] group-[.toaster]:border group-[.toaster]:border-[#3d494c]/60 group-[.toaster]:shadow-[0_16px_40px_rgba(0,0,0,0.7)] group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:gap-3",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm group-[.toast]:tracking-tight group-[.toast]:text-white",
          description: "group-[.toast]:text-[#a1a1aa] group-[.toast]:text-xs group-[.toast]:font-mono group-[.toast]:mt-0.5",
          actionButton:
            "group-[.toast]:bg-cyan-500 group-[.toast]:text-slate-950 font-bold group-[.toast]:rounded-lg group-[.toast]:font-mono group-[.toast]:text-xs",
          cancelButton:
            "group-[.toast]:bg-[#27272a] group-[.toast]:text-zinc-300 group-[.toast]:rounded-lg group-[.toast]:font-mono group-[.toast]:text-xs",
          closeButton:
            "group-[.toast]:bg-[#1f1f22] group-[.toast]:border-[#3d494c]/50 group-[.toast]:text-zinc-400 hover:group-[.toast]:text-white",
          success:
            "group-[.toaster]:!border-emerald-500/50 group-[.toaster]:!bg-gradient-to-r group-[.toaster]:!from-emerald-950/40 group-[.toaster]:!via-[#1b1b1e]/95 group-[.toaster]:!to-[#131316]/95 group-[.toaster]:!shadow-[0_0_25px_rgba(16,185,129,0.18)] group-[.toast]:!text-emerald-100",
          error:
            "group-[.toaster]:!border-rose-500/50 group-[.toaster]:!bg-gradient-to-r group-[.toaster]:!from-rose-950/40 group-[.toaster]:!via-[#1b1b1e]/95 group-[.toaster]:!to-[#131316]/95 group-[.toaster]:!shadow-[0_0_25px_rgba(244,63,94,0.18)] group-[.toast]:!text-rose-100",
          info:
            "group-[.toaster]:!border-cyan-500/50 group-[.toaster]:!bg-gradient-to-r group-[.toaster]:!from-cyan-950/40 group-[.toaster]:!via-[#1b1b1e]/95 group-[.toaster]:!to-[#131316]/95 group-[.toaster]:!shadow-[0_0_25px_rgba(6,182,212,0.18)] group-[.toast]:!text-cyan-100",
          warning:
            "group-[.toaster]:!border-amber-500/50 group-[.toaster]:!bg-gradient-to-r group-[.toaster]:!from-amber-950/40 group-[.toaster]:!via-[#1b1b1e]/95 group-[.toaster]:!to-[#131316]/95 group-[.toaster]:!shadow-[0_0_25px_rgba(245,158,11,0.18)] group-[.toast]:!text-amber-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
