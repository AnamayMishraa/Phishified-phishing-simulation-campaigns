"use client";

import type { ExecutiveSummary } from "@/lib/api/types";
import { FileText, Shield, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

interface ExecutiveViewProps {
  data: ExecutiveSummary | null;
  loading: boolean;
}

export function ExecutiveView({ data, loading }: ExecutiveViewProps) {
  if (loading) return (
    <div className="space-y-4">
      <div className="h-20 bg-white/5 rounded-xl animate-pulse" />
      <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
      <div className="h-40 bg-white/5 rounded-xl animate-pulse" />
    </div>
  );
  if (!data) return null;

  const scoreColor = data.awareness_score >= 70 ? "text-status-success" : data.awareness_score >= 50 ? "text-accent-amber" : "text-status-danger";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-default-border bg-surface p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="size-6 text-accent-blue-light" />
          <div>
            <h3 className="text-base font-semibold text-text-primary">Security Awareness Score</h3>
            <p className="text-xs text-text-muted">Overall organizational security posture</p>
          </div>
        </div>
        <div className="flex items-baseline gap-3">
          <span className={`text-5xl font-mono font-bold ${scoreColor}`}>{data.awareness_score}</span>
          <span className="text-xl text-text-muted">/ 100</span>
          <span className={`text-sm font-medium px-2 py-0.5 rounded-full capitalize ${data.risk_assessment === "low" ? "bg-status-success/10 text-status-success" : data.risk_assessment === "moderate" ? "bg-accent-amber/10 text-accent-amber" : "bg-status-danger/10 text-status-danger"}`}>
            {data.risk_assessment} risk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-default-border bg-surface p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-accent-blue-light" />
            <h4 className="text-sm font-semibold text-text-primary">Major Trends</h4>
          </div>
          <ul className="space-y-2">
            {data.findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                <span className="mt-0.5 size-1.5 rounded-full bg-accent-blue/50 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-default-border bg-surface p-5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="size-4 text-accent-amber" />
            <h4 className="text-sm font-semibold text-text-primary">Key Recommendations</h4>
          </div>
          <ul className="space-y-2">
            {data.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-text-secondary">
                <span className="mt-0.5 size-1.5 rounded-full bg-accent-amber/50 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-default-border bg-surface p-5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="size-4 text-accent-orange" />
          <h4 className="text-sm font-semibold text-text-primary">Top Risks</h4>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {data.findings.filter(f => f.toLowerCase().includes("risk") || f.toLowerCase().includes("critical")).slice(0, 3).map((risk, i) => (
            <div key={i} className="flex-1 min-w-[200px] rounded-lg border border-status-danger/20 bg-status-danger/5 p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="size-3 text-status-danger" />
                <span className="text-[11px] font-semibold text-status-danger">Risk #{i + 1}</span>
              </div>
              <p className="text-[11px] text-text-secondary">{risk}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="text-right text-[10px] text-text-muted">
        <FileText className="size-3 inline mr-1" />
        Generated {new Date(data.generated_at).toLocaleString()}
      </div>
    </div>
  );
}
