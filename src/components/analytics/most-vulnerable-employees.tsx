"use client";

import type { VulnerableEmployee } from "@/lib/api/types";
import { AlertTriangle } from "lucide-react";

interface MostVulnerableProps {
  data: VulnerableEmployee[] | null;
  loading: boolean;
}

export function MostVulnerableEmployees({ data, loading }: MostVulnerableProps) {
  if (loading) return <div className="rounded-xl border border-default-border bg-surface p-5 h-full"><div className="h-40 bg-white/5 rounded animate-pulse" /></div>;
  if (!data?.length) return null;

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="size-4 text-status-danger" />
        <h3 className="text-sm font-semibold text-text-primary">Most Vulnerable Employees</h3>
      </div>
      <div className="space-y-2">
        {data.map((e) => (
          <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-default-border/40 last:border-0">
            <div>
              <p className="text-xs font-medium text-text-primary">{e.name}</p>
              <p className="text-[10px] text-text-muted">{e.department}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-text-muted">{e.total_phish_clicked} clicks</span>
              <span className={`text-xs font-mono font-semibold ${e.risk_level === "critical" ? "text-status-danger" : "text-accent-orange"}`}>
                {e.risk_score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
