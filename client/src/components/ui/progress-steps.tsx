import { Progress } from "./progress";

interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressSteps({ currentStep, totalSteps }: ProgressStepsProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-600">Progress</span>
        <span className="text-sm font-medium text-gray-600">
          Audio <span className="text-primary font-semibold">{currentStep}</span> of {totalSteps}
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2.5" />
    </div>
  );
}
