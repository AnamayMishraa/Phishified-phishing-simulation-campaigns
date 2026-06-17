"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MousePointerClick, Check, X, TrendingUp, TrendingDown, Minus, Calendar, Building2, Briefcase } from "lucide-react";
import { api, ApiError } from "@/lib/api/client";
import type { EmployeeDetail, EmployeeRiskSnapshot } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const riskLevelLabels: Record<string, string> = {
  secure: "Secure",
  medium: "Medium Risk",
  high: "High Risk",
};

const riskColors: Record<string, string> = {
  "High Risk": "text-status-danger bg-status-danger/10 border-status-danger/20",
  "Medium Risk": "text-status-warning bg-status-warning/10 border-status-warning/20",
  Secure: "text-status-success bg-status-success/10 border-status-success/20",
};

function getInitials(first: string, last: string): string {
  return (first[0] ?? "" + (last[0] ?? "")).toUpperCase().slice(0, 2);
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [snapshot, setSnapshot] = useState<EmployeeRiskSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      api<EmployeeDetail>(`/employees/${id}/`),
      api<{ results: EmployeeRiskSnapshot[] }>(`/employees/${id}/risk-snapshots/`).catch(() => ({ results: [] })),
    ])
      .then(([emp, snapData]) => {
        if (!cancelled) {
          setEmployee(emp);
          setSnapshot(snapData.results[0] ?? null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? String(err.body ?? err.message) : "Failed to load employee");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="size-8 rounded-lg bg-void" />
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-void" />
            <div className="space-y-2">
              <div className="h-5 w-48 rounded bg-void" />
              <div className="h-3 w-32 rounded bg-void" />
            </div>
          </div>
        </div>
        <div className="text-center py-12 text-sm text-text-muted">Loading employee...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/employees" className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline">
          <ArrowLeft className="size-4" /> Back to employees
        </Link>
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-6 text-center">
          <p className="text-sm text-status-danger mb-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/employees" className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline">
          <ArrowLeft className="size-4" /> Back to employees
        </Link>
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">Employee not found</p>
        </div>
      </div>
    );
  }

  const riskLevel = riskLevelLabels[employee.risk_level] ?? "Secure";
  const riskColor = riskColors[riskLevel] ?? riskColors.Secure;
  const initials = getInitials(employee.first_name, employee.last_name);
  const assessmentFactors = (snapshot?.factors as Array<{ name: string; score: number; severity: string }> | undefined) ?? [];
  const trend = snapshot?.trigger_reason ?? "stable";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start gap-4">
        <Link
          href="/employees"
          className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all shrink-0 mt-1"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <div className="size-12 rounded-full bg-accent-blue/10 flex items-center justify-center text-sm font-bold text-accent-blue-light shrink-0 border border-accent-blue/20">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-xl font-semibold tracking-tight text-text-primary">{employee.first_name} {employee.last_name}</h1>
              <span className={cn("text-[10px] font-semibold border rounded px-2 py-0.5", riskColor)}>
                {riskLevel}
              </span>
            </div>
            <p className="text-xs text-text-muted">{employee.position} &bull; {employee.department_name}</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 shrink-0">
            <Mail className="size-3.5" /> Send Training
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Profile</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted flex items-center gap-1"><Building2 className="size-3" /> Department</span>
                <span className="text-xs font-medium text-text-secondary">{employee.department_name}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted flex items-center gap-1"><Briefcase className="size-3" /> Title</span>
                <span className="text-xs font-medium text-text-secondary">{employee.position}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted flex items-center gap-1"><Mail className="size-3" /> Email</span>
                <span className="text-xs font-mono text-text-secondary truncate">{employee.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted flex items-center gap-1"><Calendar className="size-3" /> Joined</span>
                <span className="text-xs text-text-secondary">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : new Date(employee.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="border border-default-border bg-surface rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Risk Assessment</h3>
              <div className={cn("flex items-center gap-1 text-xs", trend === "improving" ? "text-status-success" : trend === "declining" ? "text-status-danger" : "text-text-muted")}>
                {trend === "improving" && <TrendingUp className="size-3.5" />}
                {trend === "declining" && <TrendingDown className="size-3.5" />}
                {trend === "stable" && <Minus className="size-3.5" />}
                <span className="capitalize">{trend}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-text-muted">Overall Risk Score</span>
                <span className={cn(
                  "text-sm font-bold font-mono",
                  riskLevel === "High Risk" ? "text-status-danger" :
                  riskLevel === "Medium Risk" ? "text-status-warning" :
                  "text-status-success"
                )}>{employee.risk_score}/100</span>
              </div>
              <div className="w-full h-2.5 bg-void rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    riskLevel === "High Risk" ? "bg-status-danger" :
                    riskLevel === "Medium Risk" ? "bg-status-warning" :
                    "bg-status-success"
                  )}
                  style={{ width: `${employee.risk_score}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-text-muted">
                <span>Secure (0)</span>
                <span>High (100)</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {assessmentFactors.length > 0 ? assessmentFactors.map((factor) => (
                <div key={factor.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-text-secondary">{factor.name}</span>
                    <span className={cn(
                      "text-[10px] font-medium",
                      factor.severity === "high" ? "text-status-danger" : factor.severity === "medium" ? "text-status-warning" : "text-status-success"
                    )}>
                      {factor.score}% — {factor.severity}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-void rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        factor.severity === "high" ? "bg-status-danger" : factor.severity === "medium" ? "bg-status-warning" : "bg-status-success"
                      )}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="text-xs text-text-muted text-center py-2">No risk assessment factors available</p>
              )}
            </div>
          </div>

          <div className="border border-default-border bg-surface rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Training Progress</h3>
              <span className="text-xs text-text-muted">0/0 courses</span>
            </div>
            <div className="w-full h-2 bg-void rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full bg-accent-cyan" style={{ width: "0%" }} />
            </div>
            <p className="text-xs text-text-muted text-center py-4">Training data will appear once courses are assigned</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Activity Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-void rounded-lg p-3 text-center">
                <span className="text-lg font-bold font-mono text-text-primary">0</span>
                <p className="text-[10px] text-text-muted mt-0.5">Campaigns</p>
              </div>
              <div className="bg-void rounded-lg p-3 text-center">
                <span className="text-lg font-bold font-mono text-status-danger">0</span>
                <p className="text-[10px] text-text-muted mt-0.5">Phish Clicks</p>
              </div>
              <div className="bg-void rounded-lg p-3 text-center">
                <span className="text-lg font-bold font-mono text-status-success">0</span>
                <p className="text-[10px] text-text-muted mt-0.5">Trainings</p>
              </div>
              <div className="bg-void rounded-lg p-3 text-center">
                <span className="text-lg font-bold font-mono text-accent-purple-light">N/A</span>
                <p className="text-[10px] text-text-muted mt-0.5">Last Click</p>
              </div>
            </div>
          </div>

          <div className="border border-default-border bg-surface rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Campaign History</h3>
            <p className="text-xs text-text-muted text-center py-4">Campaign history will appear once campaigns are assigned</p>
          </div>

          <div className="space-y-2">
            <Button className="w-full bg-accent-blue hover:bg-accent-blue-dim text-white text-xs">
              Assign Training
            </Button>
            <Button variant="outline" className="w-full text-xs">
              Add to Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
