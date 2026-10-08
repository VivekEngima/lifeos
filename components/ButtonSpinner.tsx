"use client";

import React from "react";

/**
 * ButtonSpinner — A compact, crisp inline spinner for buttons
 * that inherits the button's text color.
 */
export function ButtonSpinner({
  className = "",
  size = "sm",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-3.5 h-3.5 border-2",
    md: "w-4 h-4 border-2",
    lg: "w-5 h-5 border-2",
  }[size];

  return (
    <span
      className={`inline-block border-current border-t-transparent rounded-full animate-spin shrink-0 ${sizeClasses} ${className}`}
      aria-hidden="true"
    />
  );
}

export default ButtonSpinner;
