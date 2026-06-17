import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import {
  TrendingUp, Clock, Globe, Eye, MousePointerClick, Shield,
} from "lucide-react";
import {
  OpenRateTrendsChart,
  ClickRateTrendsChart,
  CredentialSubmissionTrendsChart,
  DepartmentRiskDistributionChart,
  EmployeeRiskSegmentationChart,
  CampaignComparisonChart,
} from "@/components/analytics/charts";

export const metadata = {
  title: "Analytics — Phishified",
  description: "Deep dive into phishing simulation telemetry and department risk metrics.",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Deep dive into phishing simulation telemetry and department risk metrics"
        actions={
          <Button variant="outline" className="text-xs">Export Report PDF</Button>
        }
      />

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard title="Open Rate" value="50.0%" subtext="Current monthly average" trend={{ value: "-2.1%", direction: "down" }} icon={Eye} />
        <StatCard title="Click Rate" value="14.2%" subtext="Goal is under 10%" trend={{ value: "-2.4%", direction: "down" }} icon={MousePointerClick} />
        <StatCard title="Submission Rate" value="6.0%" subtext="Credential compromise rate" trend={{ value: "-1.1%", direction: "down" }} icon={Shield} />
        <StatCard title="Report Rate" value="42.3%" subtext="Employees reporting threats" trend={{ value: "+4.1%", direction: "up" }} icon={TrendingUp} />
        <StatCard title="Avg Report Time" value="4.5 min" subtext="Time from email delivery" trend={{ value: "-1.2m", direction: "down" }} icon={Clock} />
        <StatCard title="Vulnerable Domains" value="3" subtext="Corporate domains flagged" trend={{ value: "0", direction: "neutral" }} icon={Globe} />
      </div>

      {/* Charts row 1: Open Rate + Click Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OpenRateTrendsChart />
        <ClickRateTrendsChart />
      </div>

      {/* Charts row 2: Credential Submission + Department Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CredentialSubmissionTrendsChart />
        <DepartmentRiskDistributionChart />
      </div>

      {/* Charts row 3: Employee Risk Segmentation + Campaign Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmployeeRiskSegmentationChart />
        <CampaignComparisonChart />
      </div>
    </div>
  );
}
