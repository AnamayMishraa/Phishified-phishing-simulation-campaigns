"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { GlobalFilters, type ActiveFilters } from "@/components/analytics/global-filters";
import { KpiRow } from "@/components/analytics/kpi-row";
import { CampaignFunnel } from "@/components/analytics/campaign-funnel";
import { DepartmentHeatmap } from "@/components/analytics/department-heatmap";
import { RiskTrendTimeline } from "@/components/analytics/risk-trend-timeline";
import { DepartmentComparison } from "@/components/analytics/department-comparison";
import { TrainingImpact } from "@/components/analytics/training-impact";
import { OrganizationRiskOverview } from "@/components/analytics/organization-risk-overview";
import { MostVulnerableEmployees } from "@/components/analytics/most-vulnerable-employees";
import { MostImprovedEmployees } from "@/components/analytics/most-improved-employees";
import { FastestReporters } from "@/components/analytics/fastest-reporters";
import { HighestRiskDepartments } from "@/components/analytics/highest-risk-departments";
import { ExecutiveView } from "@/components/analytics/executive-view";
import { ExportButton } from "@/components/analytics/export-button";
import { api, ApiError, getErrorMessage } from "@/lib/api/client";
import type { AnalyticsAllData } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { BarChart3, LayoutDashboard } from "lucide-react";

type Tab = "analytics" | "executive";

function buildQuery(filters: ActiveFilters): string {
  const params = new URLSearchParams();
  if (filters.campaign_id) params.set("campaign_id", filters.campaign_id);
  if (filters.department_id) params.set("department_id", filters.department_id);
  if (filters.date_range === "custom" && filters.date_from && filters.date_to) {
    params.set("date_from", filters.date_from);
    params.set("date_to", filters.date_to);
  } else {
    params.set("date_range", filters.date_range);
  }
  const q = params.toString();
  return q ? `?${q}` : "";
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>("analytics");
  const [filters, setFilters] = useState<ActiveFilters>({
    date_range: "90d", date_from: "", date_to: "", campaign_id: "", department_id: "",
  });
  const [data, setData] = useState<AnalyticsAllData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback((f: ActiveFilters) => {
    setLoading(true);
    setError(null);
    const qs = buildQuery(f);
    api<AnalyticsAllData>(`/analytics/executive/${qs}`)
      .then((d) => setData(d))
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? getErrorMessage(err, "Failed to load analytics") : "Failed to load analytics");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(filters); }, [filters, fetchData]);

  const tabs: { key: Tab; label: string; icon: typeof BarChart3 }[] = [
    { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "executive", label: "Executive View", icon: LayoutDashboard },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Security awareness metrics, phishing intelligence, and executive reporting"
        actions={<ExportButton />}
      />

      <GlobalFilters onChange={setFilters} />

      {error && (
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-4 text-sm text-status-danger">
          {error}
          <button onClick={() => fetchData(filters)} className="ml-2 underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-default-border bg-surface p-0.5 w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors",
              tab === t.key
                ? "bg-accent-blue/10 text-accent-blue-light"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "analytics" && (
        <>
          <KpiRow kpis={data?.kpis ?? null} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CampaignFunnel data={data?.funnel ?? null} loading={loading} />
            <DepartmentHeatmap data={data?.heatmap ?? null} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RiskTrendTimeline data={data?.risk_trend ?? null} loading={loading} />
            <DepartmentComparison data={data?.department_comparison ?? null} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TrainingImpact data={data?.training_impact ?? null} loading={loading} />
            <OrganizationRiskOverview data={data?.risk_overview ?? null} loading={loading} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MostVulnerableEmployees data={data?.most_vulnerable ?? null} loading={loading} />
            <MostImprovedEmployees data={data?.most_improved ?? null} loading={loading} />
            <FastestReporters data={data?.fastest_reporters ?? null} loading={loading} />
            <HighestRiskDepartments data={data?.highest_risk_departments ?? null} loading={loading} />
          </div>
        </>
      )}

      {tab === "executive" && (
        <ExecutiveView data={data?.executive_summary ?? null} loading={loading} />
      )}
    </div>
  );
}
