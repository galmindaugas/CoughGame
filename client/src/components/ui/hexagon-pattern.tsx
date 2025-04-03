import React from "react";
import { cn } from "@/lib/utils";

interface HexagonPatternProps {
  className?: string;
  children?: React.ReactNode;
  variant?: "light" | "dark";
  opacity?: "low" | "medium" | "high";
}

export function HexagonPattern({
  className,
  children,
  variant = "light",
  opacity = "medium",
}: HexagonPatternProps) {
  const variantColors = {
    light: {
      bgColor: "bg-white",
      patternColor: variant === "light" ? "#f7f7f9" : "#2e3542",
    },
    dark: {
      bgColor: "bg-secondary",
      patternColor: "#232a36",
    },
  };

  const opacityValues = {
    low: "0.2",
    medium: "0.4",
    high: "0.6",
  };

  const patternSvg = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15L30 0z' fill='${variantColors[variant].patternColor}' fill-opacity='${opacityValues[opacity]}' fill-rule='evenodd'/%3E%3C/svg%3E")`;

  return (
    <div
      className={cn(
        variantColors[variant].bgColor,
        "relative overflow-hidden",
        className
      )}
      style={{
        backgroundImage: patternSvg,
        backgroundSize: "60px 60px",
      }}
    >
      {children}
    </div>
  );
}