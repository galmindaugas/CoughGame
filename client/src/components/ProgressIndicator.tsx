interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
}

const ProgressIndicator = ({ currentStep, totalSteps, completedSteps }: ProgressIndicatorProps) => {
  // Generate array of step numbers [1,2,3,4,5]
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <div className="flex justify-between max-w-md mx-auto w-full mb-6">
      {steps.map((step) => {
        // Determine step status
        const isDone = step < currentStep || (step === currentStep && step <= completedSteps);
        const isCurrent = step === currentStep;
        const isPending = step > currentStep;
        
        return (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                isDone
                  ? "bg-primary text-white"
                  : isCurrent
                  ? "border-2 border-primary text-primary"
                  : "border-2 border-gray-300 text-gray-400"
              }`}
            >
              {step}
            </div>
            <div
              className={`text-xs mt-1 ${
                isDone
                  ? "text-primary font-medium"
                  : isCurrent
                  ? "text-primary"
                  : "text-gray-400"
              }`}
            >
              {isDone ? "Done" : isCurrent ? "Current" : "Pending"}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressIndicator;
