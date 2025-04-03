import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps, completedSteps }: ProgressIndicatorProps) => {
  // Generate array of step numbers [1,2,3,4,5]
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <div className="max-w-md mx-auto w-full mb-6">
      {/* Progress bar */}
      <div className="relative h-2 bg-hyfe-lightgrey rounded-full overflow-hidden mb-4">
        <div 
          className="absolute top-0 left-0 h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step) => {
          // Determine step status
          const isDone = step < currentStep;
          const isCurrent = step === currentStep;
          const isPending = step > currentStep;
          
          return (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                  isDone
                    ? "bg-primary text-secondary"
                    : isCurrent
                    ? "bg-white border-2 border-primary text-secondary"
                    : "bg-white border-2 border-hyfe-lightgrey text-hyfe-grey"
                } shadow-sm transition-all duration-200`}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step
                )}
              </div>
              <div
                className={`text-xs mt-2 font-medium ${
                  isDone
                    ? "text-secondary"
                    : isCurrent
                    ? "text-secondary"
                    : "text-hyfe-grey"
                }`}
              >
                {isDone ? "Done" : isCurrent ? "Current" : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
