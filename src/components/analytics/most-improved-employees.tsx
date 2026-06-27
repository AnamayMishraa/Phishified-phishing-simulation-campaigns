"use client";

import type { ImprovedEmployee } from "@/lib/api/types";
import { TrendingDown } from "lucide-react";

interface MostImprovedProps {
  data: ImprovedEmployee[] | null;
  loading: boolean;
}

export function MostImprovedEmployees({ data, loading }: MostImprovedProps) {
  if (loading) return <div className="rounded-xl border border-default-border bg-surface p-5 h-full"><div className="h-40 bg-white/5 rounded animate-pulse" /></div>;
  if (!data?.length) return null;

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingDown className="size-4 text-status-success" />
        <h3 className="text-sm font-semibold text-text-primary">Most Improved Employees</h3>
      </div>
      <div className="space-y-2">
        {data.map((e) => (
          <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-default-border/40 last:border-0">
            <div>
              <p className="text-xs font-medium text-text-primary">{e.name}</p>
              <p className="text-[10px] text-text-muted">{e.department}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-text-muted">{e.previous_risk_score} &rarr; {e.risk_score}</span>
              <span className="ml-2 text-[11px] font-semibold text-status-success">-{e.improvement}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
