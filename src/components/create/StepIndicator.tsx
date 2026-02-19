import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <div
                className={cn(
                  "h-px w-6 transition-colors",
                  isCompleted ? "bg-primary/60" : "bg-border/50"
                )}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-primary/80 text-primary-foreground",
                  !isActive && !isCompleted && "bg-muted/50 text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : stepNum}
              </div>
              <div className="hidden sm:block">
                <p
                  className={cn(
                    "text-[11px] font-medium leading-none",
                    isActive ? "text-foreground" : "text-muted-foreground/70"
                  )}
                >
                  {step.label}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
