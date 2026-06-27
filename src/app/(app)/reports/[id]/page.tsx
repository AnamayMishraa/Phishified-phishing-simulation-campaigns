"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText, Target, Users, MousePointerClick, Flag, AlertTriangle, GraduationCap, ChevronRight } from "lucide-react";
import { api, ApiError, getErrorMessage } from "@/lib/api/client";
import type { ReportDetail } from "@/lib/api/types";

function getRiskColor(score: number) {
  if (score >= 70) return "text-status-error";
  if (score >= 40) return "text-status-warning";
  return "text-status-success";
}

function getRiskBg(score: number) {
  if (score >= 70) return "bg-status-error/10 border-status-error/20";
  if (score >= 40) return "bg-status-warning/10 border-status-warning/20";
  return "bg-status-success/10 border-status-success/20";
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api<ReportDetail>(`/reports/${id}/`)
      .then((d) => setReport(d))
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err as unknown as Record<string, unknown>).status === 404) {
          notFound();
        }
        setError(err instanceof ApiError ? getErrorMessage(err, "Failed to load report") : "Failed to load report");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="size-8 rounded-lg bg-void" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-64 bg-void rounded" />
            <div className="h-3 w-48 bg-void rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-void rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-4 text-sm text-status-danger">
        {error}
      </div>
    );
  }

  if (!report) return null;

  const m = report.metrics || { campaignsRun: 0, employeesTested: 0, avgClickRate: "0%", avgReportRate: "0%", highRiskEmployees: 0, trainingsCompleted: 0 };

  const executiveCards = [
    { icon: Target, label: "Campaigns Run", value: String(m.campaignsRun), color: "text-accent-blue-light", bg: "bg-accent-blue/10" },
    { icon: Users, label: "Employees Tested", value: String(m.employeesTested), color: "text-accent-purple-light", bg: "bg-accent-purple/10" },
    { icon: MousePointerClick, label: "Avg Click Rate", value: m.avgClickRate, color: "text-status-error", bg: "bg-status-error/10" },
    { icon: Flag, label: "Avg Report Rate", value: m.avgReportRate, color: "text-status-success", bg: "bg-status-success/10" },
    { icon: AlertTriangle, label: "High Risk Employees", value: String(m.highRiskEmployees), color: "text-status-warning", bg: "bg-status-warning/10" },
    { icon: GraduationCap, label: "Trainings Completed", value: String(m.trainingsCompleted), color: "text-accent-cyan-light", bg: "bg-accent-cyan/10" },
  ];

  const campaigns = report.campaigns || [];
  const departments = report.departments || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/reports"
          className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <PageHeader
          title={report.name}
          description={`${report.format} • ${report.file_size} • ${report.generated_at?.split("T")[0]} • ${report.pages} pages`}
          actions={
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-status-success bg-status-success/10 border border-status-success/20 rounded px-1.5 py-0.5">{report.status}</span>
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                <Download className="size-3.5" /> Download
              </Button>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {executiveCards.map((card) => (
          <div key={card.label} className="border border-default-border bg-surface rounded-xl p-4 space-y-2">
            <div className={`flex items-center justify-center size-8 rounded-lg ${card.bg}`}>
              <card.icon className={`size-4 ${card.color}`} />
            </div>
            <p className="text-[10px] text-text-muted">{card.label}</p>
            <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <FileText className="size-4 text-accent-blue-light" /> Executive Summary
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              This report provides a comprehensive overview of the organization&apos;s security awareness
              program performance for the specified period. Key findings highlight improvements in
              employee reporting rates and areas requiring additional training focus.
            </p>
            <p className="text-xs text-text-secondary leading-relaxed">
              Over the reporting period, {m.campaignsRun} phishing simulation campaigns were conducted,
              reaching {m.employeesTested} employees across all departments. The average click rate
              was {m.avgClickRate}, while {m.avgReportRate} of simulated threats were reported by
              vigilant employees. A total of {m.highRiskEmployees} employees remain in the high-risk
              category and require targeted intervention.
            </p>
          </div>

          <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <Target className="size-4 text-accent-blue-light" /> Campaign Performance
            </h3>
            {campaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-default-border/40">
                      <th className="text-left py-2 text-text-muted font-medium">Campaign</th>
                      <th className="text-left py-2 text-text-muted font-medium">Department</th>
                      <th className="text-right py-2 text-text-muted font-medium">Employees</th>
                      <th className="text-right py-2 text-text-muted font-medium">Clicks</th>
                      <th className="text-right py-2 text-text-muted font-medium">Click Rate</th>
                      <th className="text-right py-2 text-text-muted font-medium">Reports</th>
                      <th className="text-right py-2 text-text-muted font-medium">Report Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((c: { id: string; name: string; department: string; employees: number; clicks: number; clickRate: string; reports: number; reportRate: string }) => (
                      <tr key={c.id} className="border-b border-default-border/20 hover:bg-white/[0.02]">
                        <td className="py-2.5 text-text-primary">{c.name}</td>
                        <td className="py-2.5 text-text-secondary">{c.department}</td>
                        <td className="py-2.5 text-text-primary text-right">{c.employees.toLocaleString()}</td>
                        <td className="py-2.5 text-status-error text-right">{c.clicks.toLocaleString()}</td>
                        <td className="py-2.5 text-status-error text-right font-mono">{c.clickRate}</td>
                        <td className="py-2.5 text-status-success text-right">{c.reports.toLocaleString()}</td>
                        <td className="py-2.5 text-status-success text-right font-mono">{c.reportRate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-text-muted py-4 text-center">No campaign data available</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <AlertTriangle className="size-4 text-status-warning" /> Department Risk Breakdown
            </h3>
            {departments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-default-border/40">
                      <th className="text-left py-2 text-text-muted font-medium">Department</th>
                      <th className="text-right py-2 text-text-muted font-medium">Employees</th>
                      <th className="text-right py-2 text-text-muted font-medium">Risk</th>
                      <th className="text-right py-2 text-text-muted font-medium">Click Rate</th>
                      <th className="text-right py-2 text-text-muted font-medium">Report Rate</th>
                      <th className="text-right py-2 text-text-muted font-medium">Trainings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((d: { name: string; employees: number; riskScore: number; clickRate: string; reportRate: string; trainingsCompleted: number }) => (
                      <tr key={d.name} className="border-b border-default-border/20 hover:bg-white/[0.02]">
                        <td className="py-2.5 text-text-primary">{d.name}</td>
                        <td className="py-2.5 text-text-primary text-right">{d.employees}</td>
                        <td className="py-2.5 text-right">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${getRiskBg(d.riskScore)} ${getRiskColor(d.riskScore)}`}>
                            {d.riskScore}
                          </span>
                        </td>
                        <td className={`py-2.5 text-right font-mono ${getRiskColor(d.riskScore)}`}>{d.clickRate}</td>
                        <td className="py-2.5 text-status-success text-right font-mono">{d.reportRate}</td>
                        <td className="py-2.5 text-text-primary text-right">{d.trainingsCompleted}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-text-muted py-4 text-center">No department data available</p>
            )}
          </div>

          <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <ChevronRight className="size-4 text-accent-purple-light" /> Table of Contents
            </h3>
            <div className="space-y-2 text-xs">
              {[
                "Executive Overview",
                "Campaign Performance Analysis",
                "Department Risk Breakdown",
                "Employee Risk Assessment",
                "Training Progress Report",
                "Recommendations & Next Steps",
              ].map((item, i) => (
                <div key={item} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-void border border-default-border/40">
                  <span className="text-[10px] text-text-muted font-mono w-4">{i + 1}.</span>
                  <span className="text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-default-border bg-surface rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Report Info</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Format</span>
                <span className="text-text-secondary">{report.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Size</span>
                <span className="text-text-secondary">{report.file_size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Pages</span>
                <span className="text-text-secondary">{report.pages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Date</span>
                <span className="text-text-secondary">{report.generated_at?.split("T")[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Generated By</span>
                <span className="text-text-secondary">{report.generated_by_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Status</span>
                <span className="text-status-success">{report.status}</span>
              </div>
            </div>
          </div>

          <Button className="w-full bg-accent-blue hover:bg-accent-blue-dim text-white text-xs flex items-center justify-center gap-2">
            <Download className="size-4" /> Download Report
          </Button>
        </div>
      </div>
    </div>
  );
}
