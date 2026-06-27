"use client";

import type { FastestReporter } from "@/lib/api/types";
import { Zap } from "lucide-react";

interface FastestReportersProps {
  data: FastestReporter[] | null;
  loading: boolean;
}

export function FastestReporters({ data, loading }: FastestReportersProps) {
  if (loading) return <div className="rounded-xl border border-default-border bg-surface p-5 h-full"><div className="h-40 bg-white/5 rounded animate-pulse" /></div>;
  if (!data?.length) return null;

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="size-4 text-accent-amber" />
        <h3 className="text-sm font-semibold text-text-primary">Fastest Reporters</h3>
      </div>
      <div className="space-y-2">
        {data.map((e) => (
          <div key={e.id} className="flex items-center justify-between py-1.5 border-b border-default-border/40 last:border-0">
            <div>
              <p className="text-xs font-medium text-text-primary">{e.name}</p>
              <p className="text-[10px] text-text-muted">{e.department}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-semibold text-status-success">{e.report_time_minutes}m</span>
              <p className="text-[9px] text-text-muted">avg report time</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
