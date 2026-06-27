"use client";

import { useState, useEffect } from "react";
import { Crosshair, MousePointerClick, Users, ShieldAlert, GraduationCap } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  CampaignPerformanceChart,
  DepartmentRiskChart,
} from "@/components/dashboard/charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { HighRiskEmployees } from "@/components/dashboard/high-risk-employees";
import { MostImprovedEmployees } from "@/components/dashboard/most-improved-employees";
import { HighestReportingEmployees } from "@/components/dashboard/highest-reporting-employees";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { api, getErrorMessage } from "@/lib/api/client";
import type { DashboardData } from "@/lib/api/types";

interface KpiDisplay {
  title: string;
  value: string;
  change: { value: string; trend: "up" | "down" | "neutral"; label: string };
  icon: React.ComponentType<{ className?: string }>;
  accentColor: "blue" | "purple" | "cyan" | "green" | "amber";
}

const kpiConfig: Array<{
  key: string;
  title: string;
  format: (v: number) => string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: "blue" | "purple" | "cyan" | "green" | "amber";
}> = [
  { key: "active_campaigns", title: "Active Campaigns", format: (v) => String(v), icon: Crosshair, accentColor: "blue" },
  { key: "employees_tested", title: "Employees Tested", format: (v) => v.toLocaleString(), icon: Users, accentColor: "green" },
  { key: "click_rate", title: "Click Rate", format: (v) => `${v}%`, icon: MousePointerClick, accentColor: "purple" },
  { key: "credential_submission_rate", title: "Credential Submission", format: (v) => `${v}%`, icon: ShieldAlert, accentColor: "amber" },
  { key: "training_completion_rate", title: "Training Completion", format: (v) => `${v}%`, icon: GraduationCap, accentColor: "cyan" },
];

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KpiDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api<DashboardData>("/dashboard/")
      .then((data) => {
        if (cancelled) return;
        const mapped = kpiConfig
          .map((cfg) => {
            const kpi = data.kpis[cfg.key];
            if (!kpi) return null;
            return {
              title: cfg.title,
              value: cfg.format(kpi.value),
              change: kpi.change,
              icon: cfg.icon,
              accentColor: cfg.accentColor,
            };
          })
          .filter((k): k is KpiDisplay => k !== null);
        setKpis(mapped);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    blue: Crosshair,
    green: Users,
    purple: MousePointerClick,
    amber: ShieldAlert,
    cyan: GraduationCap,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text-primary">
          Dashboard
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Overview of your security awareness program
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {error ? (
          <div className="col-span-full text-sm text-status-danger text-center py-8">
            {error}
          </div>
        ) : loading ? (
          <div className="col-span-full text-sm text-text-muted text-center py-8">
            Loading...
          </div>
        ) : (
          kpis.map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
              change={kpi.change}
              icon={iconMap[kpi.accentColor] || Crosshair}
              accentColor={kpi.accentColor}
            />
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CampaignPerformanceChart />
        <DepartmentRiskChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HighRiskEmployees />
        <MostImprovedEmployees />
        <HighestReportingEmployees />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ActivityFeed />
        </div>
      </div>

      <QuickActions />
    </div>
  );
}
