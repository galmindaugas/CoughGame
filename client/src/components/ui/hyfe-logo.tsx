import React from "react";
import { cn } from "@/lib/utils";

interface HyfeLogoProps {
  variant?: "default" | "light" | "dark";
  size?: "small" | "medium" | "large";
  className?: string;
}

export function HyfeLogo({
  variant = "default",
  size = "medium",
  className,
}: HyfeLogoProps) {
  const variantClasses = {
    default: {
      logo: "#FDC500",
      text: "#2E3542",
    },
    light: {
      logo: "#FFFFFF",
      text: "#FFFFFF",
    },
    dark: {
      logo: "#FDC500",
      text: "#2E3542",
    },
  };

  const sizeClasses = {
    small: "h-6",
    medium: "h-8",
    large: "h-12",
  };

  return (
    <div
      className={cn(
        "flex items-center font-bold",
        sizeClasses[size],
        className
      )}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        className={cn("mr-2", sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill={variantClasses[variant].logo}
          d="M8.6,11l-2.5-4.3l2.5-4.3h5l2.5,4.3l-2.5,4.3H8.6z M13.6,17.7l-2.5-4.3l2.5-4.3h5l2.5,4.3l-2.5,4.3H13.6z"
        />
      </svg>
      <span style={{ color: variantClasses[variant].text }}>Hyfe</span>
    </div>
  );
}