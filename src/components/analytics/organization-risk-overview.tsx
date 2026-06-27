"use client";

import type { RiskOverview } from "@/lib/api/types";
import { ShieldAlert } from "lucide-react";

interface RiskOverviewWidgetProps {
  data: RiskOverview | null;
  loading: boolean;
}

export function OrganizationRiskOverview({ data, loading }: RiskOverviewWidgetProps) {
  if (loading) return <div className="rounded-xl border border-default-border bg-surface p-5 h-full"><div className="h-48 bg-white/5 rounded animate-pulse" /></div>;
  if (!data) return null;

  const seg = data.segmentation;
  const total = data.total_employees;

  const segments = [
    { label: "Low", count: seg.low, color: "bg-status-success", textColor: "text-status-success" },
    { label: "Medium", count: seg.medium, color: "bg-accent-amber", textColor: "text-accent-amber" },
    { label: "High", count: seg.high, color: "bg-accent-orange", textColor: "text-accent-orange" },
    { label: "Critical", count: seg.critical, color: "bg-status-danger", textColor: "text-status-danger" },
  ];

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert className="size-4 text-text-primary" />
        <h3 className="text-sm font-semibold text-text-primary">Organization Risk Overview</h3>
      </div>
      <div className="flex items-end gap-1 mb-4">
        {segments.map((s) => (
          <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
            <span className={`text-lg font-mono font-semibold ${s.textColor}`}>{s.count}</span>
            <div
              className={`w-full rounded-t ${s.color}`}
              style={{ height: `${Math.max(4, (s.count / Math.max(1, total)) * 120)}px` }}
            />
            <span className="text-[10px] text-text-muted">{s.label}</span>
          </div>
        ))}
      </div>
      <div className="text-[11px] text-text-muted text-center">
        {total} total employees &middot; {seg.high + seg.critical} at elevated risk
      </div>
    </div>
  );
}
