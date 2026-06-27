"use client";

import type { HighRiskDepartment } from "@/lib/api/types";
import { Building2 } from "lucide-react";

interface HighestRiskDeptsProps {
  data: HighRiskDepartment[] | null;
  loading: boolean;
}

export function HighestRiskDepartments({ data, loading }: HighestRiskDeptsProps) {
  if (loading) return <div className="rounded-xl border border-default-border bg-surface p-5 h-full"><div className="h-40 bg-white/5 rounded animate-pulse" /></div>;
  if (!data?.length) return null;

  const maxRisk = Math.max(...data.map(d => d.avg_risk), 1);

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="size-4 text-text-primary" />
        <h3 className="text-sm font-semibold text-text-primary">Highest Risk Departments</h3>
      </div>
      <div className="space-y-3">
        {data.map((d) => {
          const pct = (d.avg_risk / maxRisk) * 100;
          const barColor = d.avg_risk >= 60 ? "bg-status-danger" : d.avg_risk >= 40 ? "bg-accent-amber" : "bg-status-success";
          return (
            <div key={d.department}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-text-primary">{d.department}</span>
                <span className="text-[11px] font-mono font-semibold text-text-primary">{d.avg_risk}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-text-muted">{d.employee_count} employees</span>
                <span className="text-[9px] text-text-muted">{d.high_risk_count} high risk</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
