"use client";

import type { HeatmapDepartment } from "@/lib/api/types";
import { cn } from "@/lib/utils";

interface DepartmentHeatmapProps {
  data: HeatmapDepartment[] | null;
  loading: boolean;
}

function riskColor(count: number, total: number): string {
  const ratio = total > 0 ? count / total : 0;
  if (ratio >= 0.4) return "bg-status-danger/80";
  if (ratio >= 0.2) return "bg-accent-amber/80";
  if (ratio >= 0.05) return "bg-accent-blue/30";
  return "bg-status-success/20";
}

export function DepartmentHeatmap({ data, loading }: DepartmentHeatmapProps) {
  if (loading) return <div className="rounded-xl border border-default-border bg-surface p-5"><div className="h-[300px] bg-white/5 rounded animate-pulse" /></div>;
  if (!data?.length) return null;

  const levels = ["low", "medium", "high", "critical"];

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-1">Department Risk Heatmap</h3>
      <p className="text-xs text-text-muted mb-4">Risk level distribution across departments</p>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr>
              <th className="text-left text-text-muted font-medium pb-2 pr-3">Department</th>
              {levels.map((l) => (
                <th key={l} className="text-center text-text-muted font-medium pb-2 px-2 uppercase">{l}</th>
              ))}
              <th className="text-right text-text-muted font-medium pb-2 pl-3">Avg Risk</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.department} className="border-t border-default-border/30">
                <td className="py-2 pr-3 text-text-primary font-medium">{d.department}</td>
                {levels.map((l) => (
                  <td key={l} className="py-1 px-2">
                    <div className={cn(
                      "rounded text-center text-[10px] font-mono py-1.5",
                      riskColor(d[l as keyof typeof d] as number, d.total),
                    )}>
                      {d[l as keyof typeof d] as number}
                    </div>
                  </td>
                ))}
                <td className="py-2 pl-3 text-right font-mono font-semibold text-text-primary">{d.avg_risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-default-border/40">
        <div className="flex items-center gap-1"><div className="size-2.5 rounded bg-status-success/20" /><span className="text-[9px] text-text-muted">Low (&lt;5%)</span></div>
        <div className="flex items-center gap-1"><div className="size-2.5 rounded bg-accent-blue/30" /><span className="text-[9px] text-text-muted">Med (5-20%)</span></div>
        <div className="flex items-center gap-1"><div className="size-2.5 rounded bg-accent-amber/80" /><span className="text-[9px] text-text-muted">High (20-40%)</span></div>
        <div className="flex items-center gap-1"><div className="size-2.5 rounded bg-status-danger/80" /><span className="text-[9px] text-text-muted">Critical (&gt;40%)</span></div>
      </div>
    </div>
  );
}
