"use client";

import type { TrainingImpact as TrainingImpactType } from "@/lib/api/types";
import { GraduationCap } from "lucide-react";

interface TrainingImpactProps {
  data: TrainingImpactType | null;
  loading: boolean;
}

export function TrainingImpact({ data, loading }: TrainingImpactProps) {
  if (loading) return <div className="rounded-xl border border-default-border bg-surface p-5"><div className="h-[220px] bg-white/5 rounded animate-pulse" /></div>;
  if (!data) return null;

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="size-4 text-accent-blue-light" />
        <h3 className="text-sm font-semibold text-text-primary">Training Impact Analysis</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`rounded-lg border p-3 ${data.trained.employee_count > 0 ? "border-status-success/30 bg-status-success/5" : "border-default-border bg-transparent"}`}>
          <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">Trained</p>
          <p className="text-lg font-mono font-semibold text-text-primary">{data.trained.employee_count}</p>
          <p className="text-[11px] text-text-muted">employees</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px]"><span className="text-text-muted">Avg Risk</span><span className="font-mono text-status-success">{data.trained.avg_risk_score}</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-text-muted">Click Rate</span><span className="font-mono text-text-primary">{data.trained.click_rate}%</span></div>
          </div>
        </div>

        <div className={`rounded-lg border p-3 ${data.untrained.employee_count > 0 ? "border-status-danger/30 bg-status-danger/5" : "border-default-border bg-transparent"}`}>
          <p className="text-[10px] uppercase tracking-wide text-text-muted mb-1">Untrained</p>
          <p className="text-lg font-mono font-semibold text-text-primary">{data.untrained.employee_count}</p>
          <p className="text-[11px] text-text-muted">employees</p>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-[10px]"><span className="text-text-muted">Avg Risk</span><span className="font-mono text-status-danger">{data.untrained.avg_risk_score}</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-text-muted">Click Rate</span><span className="font-mono text-text-primary">{data.untrained.click_rate}%</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-accent-blue/5 border border-accent-blue/20 p-3 text-center">
        <span className="text-[11px] text-text-muted">Risk Reduction from Training: </span>
        <span className="text-lg font-mono font-semibold text-status-success">{data.risk_reduction}</span>
        <span className="text-[11px] text-text-muted"> points</span>
      </div>
    </div>
  );
}
