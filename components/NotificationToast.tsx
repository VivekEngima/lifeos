"use client";

import React, { useEffect } from "react";
import { useLifeOS, ToastNotification } from "@/context/LifeOSContext";

function ToastItem({
  notification,
  onDismiss,
}: {
  notification: ToastNotification;
  onDismiss: (id: string) => void;
}) {
  const { id, title, message, type = "success" } = notification;

  const handleDismiss = () => {
    onDismiss(id);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 2400);

    return () => clearTimeout(timer);
  }, [id]);

  const isSuccess = type === "success";
  const isError = type === "error";
  const isWarning = type === "warning";

  const borderColor = isSuccess
    ? "border-[#10b981]/50 shadow-[0_4px_24px_rgba(16,185,129,0.18)]"
    : isError
      ? "border-[#ef4444]/50 shadow-[0_4px_24px_rgba(239,68,68,0.18)]"
      : isWarning
        ? "border-[#f59e0b]/50 shadow-[0_4px_24px_rgba(245,158,11,0.18)]"
        : "border-[#06b6d4]/50 shadow-[0_4px_24px_rgba(6,182,212,0.18)]";

  const badgeColor = isSuccess
    ? "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30"
    : isError
      ? "text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30"
      : isWarning
        ? "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30"
        : "text-[#06b6d4] bg-[#06b6d4]/10 border-[#06b6d4]/30";

  const iconName = isSuccess
    ? "check_circle"
    : isError
      ? "error"
      : isWarning
        ? "warning"
        : "info";

  const iconColor = isSuccess
    ? "text-[#10b981]"
    : isError
      ? "text-[#ef4444]"
      : isWarning
        ? "text-[#f59e0b]"
        : "text-[#06b6d4]";

  const progressBg = isSuccess
    ? "bg-[#10b981]"
    : isError
      ? "bg-[#ef4444]"
      : isWarning
        ? "bg-[#f59e0b]"
        : "bg-[#06b6d4]";

  return (
    <div
      role="alert"
      className={`relative pointer-events-auto bg-[#121215]/95 backdrop-blur-md border ${borderColor} rounded-[6px] p-4 text-[#f4f4f5] overflow-hidden flex flex-col gap-1.5 transition-all duration-300 animate-in fade-in slide-in-from-right-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span
            className={`material-symbols-outlined ${iconColor} text-[20px] mt-0.5 shrink-0`}
          >
            {iconName}
          </span>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-[2px] border ${badgeColor} font-semibold uppercase tracking-wider`}
              >
                {isSuccess ? "Supabase Sealed" : isError ? "Error" : "Ledger Update"}
              </span>
            </div>
            <h4 className="text-sm font-semibold font-sans text-[#f4f4f5] tracking-tight">
              {title}
            </h4>
            {message && (
              <p className="text-xs text-[#a1a1aa] font-sans leading-relaxed">
                {message}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-[#71717a] hover:text-[#f4f4f5] transition-colors p-1 rounded hover:bg-[#1f1f22]"
          title="Dismiss notification"
        >
          <span className="material-symbols-outlined text-[16px] block">close</span>
        </button>
      </div>

      {/* Auto-dismiss progress countdown line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1e1e24] overflow-hidden">
        <div
          className={`h-full ${progressBg} w-full transition-all ease-linear`}
          style={{
            animation: "toastProgress 2200ms linear forwards",
          }}
        />
      </div>
    </div>
  );
}

export default function NotificationToast() {
  const { notifications, dismissNotification } = useLifeOS();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      {notifications.map((n) => (
        <ToastItem key={n.id} notification={n} onDismiss={dismissNotification} />
      ))}
    </div>
  );
}
