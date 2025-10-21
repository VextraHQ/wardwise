import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  className?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  stepTitle,
  className,
}: StepProgressProps) {
  return (
    <div className={cn("space-y-2 sm:space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold">
            {currentStep}
          </div>
          <span className="text-foreground text-sm font-medium sm:text-base">
            {stepTitle}
          </span>
        </div>
        <span className="text-muted-foreground text-xs sm:text-sm">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < currentStep
                ? "bg-primary"
                : i === currentStep - 1
                  ? "bg-primary"
                  : "bg-muted",
            )}
          />
        ))}
      </div>
    </div>
  );
}
