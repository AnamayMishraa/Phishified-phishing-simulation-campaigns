"use client";

import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import { api, ApiError, getErrorMessage } from "@/lib/api/client";
import type { LeaderboardEntry, PaginatedResponse } from "@/lib/api/types";
import { ArrowUpDown } from "lucide-react";

const riskLevelLabels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const riskColors: Record<string, string> = {
  Low: "text-status-success bg-status-success/10 border-status-success/20",
  Medium: "text-status-warning bg-status-warning/10 border-status-warning/20",
  High: "text-status-danger bg-status-danger/10 border-status-danger/20",
  Critical: "text-[#7c3aed] bg-[#7c3aed]/10 border-[#7c3aed]/20",
};

const orderingOptions = [
  { value: "-risk_score", label: "Risk Score (High First)" },
  { value: "risk_score", label: "Risk Score (Low First)" },
  { value: "-click_rate", label: "Click Rate (High First)" },
  { value: "-report_rate", label: "Report Rate (High First)" },
  { value: "-campaigns_participated", label: "Most Participated" },
  { value: "last_name", label: "Name (A-Z)" },
] as const;

function getInitials(first: string, last: string): string {
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase().slice(0, 2);
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState("All");
  const [ordering, setOrdering] = useState("-risk_score");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: Record<string, string> = { ordering };
    if (deptFilter !== "All") params.department = deptFilter;

    api<PaginatedResponse<LeaderboardEntry>>("/employees/leaderboard/", { params })
      .then((data) => {
        if (!cancelled) setEntries(data.results);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load leaderboard"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [deptFilter, ordering]);

  const departments = useMemo(
    () => [...new Set(entries.map((e) => e.department_name).filter(Boolean))].sort(),
    [entries]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Leaderboard"
        description="Employee phishing risk rankings and performance metrics"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-lg border border-default-border bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary focus:outline-none focus:border-accent-blue/30"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>

          <div className="flex items-center gap-1 rounded-lg border border-default-border bg-surface p-0.5">
            {(["All", "Critical", "High", "Medium", "Low"] as const).map((opt) => (
              <button
                key={opt}
                disabled
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap opacity-50 cursor-not-allowed",
                  "text-text-muted"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-3 text-text-muted" />
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="rounded-lg border border-default-border bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary focus:outline-none focus:border-accent-blue/30"
          >
            {orderingOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-[11px] text-text-muted">
        {loading ? "Loading..." : `${entries.length} employee${entries.length !== 1 ? "s" : ""}`}
      </p>

      {error && (
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-4 text-sm text-status-danger">
          {error}
        </div>
      )}

      {loading && !error && (
        <div className="text-center py-12 text-sm text-text-muted">Loading leaderboard...</div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">
            {deptFilter !== "All" ? "No employees match your department filter" : "No employees found"}
          </p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="border border-default-border bg-surface rounded-xl overflow-x-auto">
          <table className="w-full text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-default-border/40 text-text-muted text-[10px] font-medium uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium w-[200px]">Employee</th>
                <th className="text-left px-4 py-3 font-medium">Department</th>
                <th className="text-center px-4 py-3 font-medium">Risk Score</th>
                <th className="text-center px-4 py-3 font-medium">Level</th>
                <th className="text-center px-4 py-3 font-medium">Campaigns</th>
                <th className="text-center px-4 py-3 font-medium">Open Rate</th>
                <th className="text-center px-4 py-3 font-medium">Click Rate</th>
                <th className="text-center px-4 py-3 font-medium">Submit Rate</th>
                <th className="text-center px-4 py-3 font-medium">Report Rate</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const name = `${entry.first_name} ${entry.last_name}`;
                const initials = getInitials(entry.first_name, entry.last_name);
                const levelLabel = riskLevelLabels[entry.risk_level] ?? "Low";
                return (
                  <tr
                    key={entry.id}
                    className={cn(
                      "border-b border-default-border/20 hover:bg-white/[0.02] transition-colors last:border-0",
                      idx < 3 && "bg-[#fbbf24]/[0.02]"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full bg-accent-blue/10 flex items-center justify-center text-[10px] font-semibold text-accent-blue-light shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-text-primary">{name}</p>
                          <p className="text-[10px] text-text-muted font-mono">{entry.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-[11px]">{entry.department_name || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "font-mono font-bold text-sm",
                        entry.risk_score >= 80 ? "text-[#7c3aed]" :
                        entry.risk_score >= 50 ? "text-status-danger" :
                        entry.risk_score >= 20 ? "text-status-warning" :
                        "text-status-success"
                      )}>
                        {entry.risk_score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "text-[10px] font-semibold border rounded px-1.5 py-0.5",
                        riskColors[levelLabel]
                      )}>
                        {levelLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-text-secondary font-mono text-[11px]">
                      {entry.campaigns_participated}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono text-[11px] text-text-secondary">
                        {entry.open_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "font-mono text-[11px]",
                        entry.click_rate > 50 ? "text-status-danger" :
                        entry.click_rate > 20 ? "text-status-warning" :
                        "text-text-secondary"
                      )}>
                        {entry.click_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "font-mono text-[11px]",
                        entry.submission_rate > 30 ? "text-status-danger" :
                        entry.submission_rate > 10 ? "text-status-warning" :
                        "text-text-secondary"
                      )}>
                        {entry.submission_rate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn(
                        "font-mono text-[11px]",
                        entry.report_rate > 20 ? "text-status-success" :
                        "text-text-secondary"
                      )}>
                        {entry.report_rate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
