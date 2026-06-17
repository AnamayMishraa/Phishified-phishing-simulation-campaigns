"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: number;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between border border-default-border bg-surface rounded-xl p-1.5">
      {steps.map((s, idx) => {
        const SIcon = s.icon;
        const isActive = currentStep === s.id;
        const isDone = currentStep > s.id;
        return (
          <div key={s.id} className="flex items-center gap-1 flex-1">
            <button
              type="button"
              onClick={() => { if (isDone && onStepClick) onStepClick(s.id); }}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center",
                isActive && "bg-accent-blue/10 text-accent-blue-light",
                isDone && "text-status-success cursor-pointer hover:bg-status-success/5",
                !isActive && !isDone && "text-text-muted"
              )}
            >
              <div className={cn(
                "flex items-center justify-center size-5 rounded-full text-[10px] font-bold",
                isActive && "bg-accent-blue text-white",
                isDone && "bg-status-success text-white",
                !isActive && !isDone && "bg-text-muted/20 text-text-muted"
              )}>
                {isDone ? <Check className="size-3" /> : <SIcon className="size-3" />}
              </div>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {idx < steps.length - 1 && (
              <div className={cn(
                "h-px flex-1 mx-1",
                isDone ? "bg-status-success/50" : "bg-default-border/60"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
