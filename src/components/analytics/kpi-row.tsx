"use client";

import type { AnalyticsKpis } from "@/lib/api/types";
import {
  Brain, Eye, MousePointerClick, Shield, TrendingUp, Clock, GraduationCap,
} from "lucide-react";

interface KpiRowProps {
  kpis: AnalyticsKpis | null;
  loading: boolean;
}

const kpiConfig = [
  { key: "security_awareness_score", label: "Security Awareness Score", icon: Brain, suffix: "/100", color: "text-accent-purple-light", bg: "bg-accent-purple/10" },
  { key: "open_rate", label: "Open Rate", icon: Eye, suffix: "%", color: "text-accent-blue-light", bg: "bg-accent-blue/10" },
  { key: "click_rate", label: "Click Rate", icon: MousePointerClick, suffix: "%", color: "text-accent-amber", bg: "bg-accent-amber/10" },
  { key: "submission_rate", label: "Submission Rate", icon: Shield, suffix: "%", color: "text-status-danger", bg: "bg-status-danger/10" },
  { key: "report_rate", label: "Report Rate", icon: TrendingUp, suffix: "%", color: "text-status-success", bg: "bg-status-success/10" },
  { key: "avg_report_time_minutes", label: "Avg Report Time", icon: Clock, suffix: " min", color: "text-accent-cyan", bg: "bg-accent-cyan/10" },
  { key: "training_completion_pct", label: "Training Completion", icon: GraduationCap, suffix: "%", color: "text-accent-green", bg: "bg-accent-green/10" },
];

export function KpiRow({ kpis, loading }: KpiRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {kpiConfig.map((cfg) => {
        const value = kpis?.[cfg.key as keyof AnalyticsKpis];
        return (
          <div key={cfg.key} className="rounded-xl border border-default-border bg-surface p-4 hover:border-accent-blue/20 transition-all duration-200">
            <div className="flex items-center gap-2 mb-2">
              <div className={`${cfg.bg} p-1.5 rounded-lg`}>
                <cfg.icon className={`size-3.5 ${cfg.color}`} />
              </div>
              <span className="text-[10px] font-medium text-text-muted uppercase tracking-wide">{cfg.label}</span>
            </div>
            <div className="flex items-baseline gap-1">
              {loading ? (
                <div className="h-6 w-16 bg-white/5 rounded animate-pulse" />
              ) : (
                <span className="text-xl font-mono font-semibold text-text-primary tabular-nums">
                  {value?.value ?? "-"}{cfg.suffix}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
