import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; description: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && (
              <div
                className={cn(
                  "h-px w-5 transition-all duration-300",
                  isCompleted ? "bg-primary/50" : "bg-[hsl(var(--border))]"
                )}
              />
            )}
            <div className="flex items-center gap-1.5">
              {/* Align UI: 정밀한 step circle */}
              <div
                className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-all duration-200",
                  isActive && "bg-primary text-white shadow-[0_0_10px_rgba(27,98,255,0.4)]",
                  isCompleted && "bg-primary/80 text-white",
                  !isActive && !isCompleted && "bg-[hsl(var(--muted))] text-muted-foreground border border-[hsl(var(--border))]"
                )}
              >
                {isCompleted ? <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> : stepNum}
              </div>
              {/* Label — hidden on small screens */}
              <div className="hidden sm:block">
                <p className={cn(
                  "text-[11px] font-medium leading-none",
                  isActive ? "text-foreground" : "text-muted-foreground/60"
                )}>
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
