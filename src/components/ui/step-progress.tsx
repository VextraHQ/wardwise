import { cn } from "@/lib/utils";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  className?: string;
  canvasser?: boolean;
  contextLabel?: string;
}

export function StepProgress({
  currentStep,
  totalSteps,
  stepTitle,
  className,
  canvasser,
  contextLabel = "Registration Progress",
}: StepProgressProps) {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={cn("mx-auto w-full space-y-4", className)}>
      {/* Mature Infrastructure Header */}
      <div className="flex items-end justify-between px-0.5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "text-[11px] font-extrabold tracking-widest uppercase sm:text-xs",
                canvasser ? "text-amber-600" : "text-primary",
              )}
            >
              Step {currentStep} of {totalSteps}
            </span>
            <div className="bg-border h-3 w-px" />
            <span className="text-muted-foreground text-xs font-bold tracking-widest">
              {contextLabel}
            </span>
          </div>
          <h3 className="text-foreground text-sm font-bold tracking-widest uppercase">
            {stepTitle}
          </h3>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1.5 opacity-70 grayscale">
            <div className="bg-primary size-1 rounded-full" />
            <span className="text-muted-foreground font-mono text-[12px] font-bold tracking-tighter uppercase italic">
              Progress: {percentage}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-1 gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepIndex = i + 1;
          const isActive = stepIndex <= currentStep;
          const isCurrent = stepIndex === currentStep;

          return (
            <div
              key={i}
              className={cn(
                "relative h-full flex-1 transition-all duration-500",
                !isActive
                  ? "bg-muted-foreground/15"
                  : canvasser
                    ? "bg-amber-600"
                    : "bg-primary",
              )}
            >
              {isCurrent && (
                <div
                  className={cn(
                    "absolute inset-0 animate-pulse",
                    canvasser ? "bg-amber-600" : "bg-primary/30",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
