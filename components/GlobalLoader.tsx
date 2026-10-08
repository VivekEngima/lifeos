"use client";

import React from "react";
import { useLifeOS } from "@/context/LifeOSContext";

/**
 * GlobalLoader — A subtle, non-intrusive top-of-screen progress bar
 * indicating background syncing without blocking the page or showing a full-screen spinner.
 */
export default function GlobalLoader() {
  const { actionLoading } = useLifeOS();

  if (actionLoading <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
      <div className="h-[2px] w-full bg-transparent overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 animate-[loader-bar_1.2s_ease-in-out_infinite]"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
