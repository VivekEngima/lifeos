"use client";

import React, { useEffect, useState } from "react";
import { useLifeOS } from "@/context/LifeOSContext";

/**
 * GlobalLoader — A subtle, non-intrusive top-of-screen progress bar
 * indicating background syncing without lingering or running indefinitely.
 */
export default function GlobalLoader() {
  const { actionLoading } = useLifeOS();
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (actionLoading > 0) {
      setActive(true);
      // Auto-hide after 450ms safety limit so loader never lingers or runs indefinitely
      timer = setTimeout(() => {
        setActive(false);
      }, 450);
    } else {
      setActive(false);
    }
    return () => clearTimeout(timer);
  }, [actionLoading]);

  if (!active) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-200">
      <div className="h-[2px] w-full bg-transparent overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-400 animate-[loader-bar_0.8s_ease-in-out_infinite]"
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}
