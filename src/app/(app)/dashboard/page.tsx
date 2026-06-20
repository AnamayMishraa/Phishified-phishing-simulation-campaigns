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
import { getDashboardKpis } from "@/data/analytics";
import { getOverviewStats } from "@/data/analytics";

export const metadata = {
  title: "Dashboard — Phishified",
  description: "Overview of your phishing simulation campaigns, employee risk, and security awareness metrics.",
};

export default function DashboardPage() {
  const kpis = getDashboardKpis();
  const stats = getOverviewStats();

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
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={iconMap[kpi.accentColor] || Crosshair}
            accentColor={kpi.accentColor}
          />
        ))}
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
