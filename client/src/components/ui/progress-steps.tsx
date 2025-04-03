import React from "react";
import { cn } from "@/lib/utils";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressSteps({ currentStep, totalSteps }: ProgressStepsProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div
              key={index}
              className={cn(
                "relative h-2 rounded-full flex-1",
                isCompleted ? "bg-blue-600" : isActive ? "bg-blue-400" : "bg-gray-200",
                index !== totalSteps - 1 ? "mr-0.5" : ""
              )}
            >
              {(isActive || isCompleted) && (
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                  {stepNumber}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}