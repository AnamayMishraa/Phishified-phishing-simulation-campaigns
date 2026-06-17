export interface MonthOverMonth {
  month: string;
  clickRate: number;
  reportRate: number;
}

export interface DepartmentRisk {
  name: string;
  risk: number;
  employees: number;
  change: number;
}

export interface KpiMetric {
  title: string;
  value: string;
  change: { value: string; trend: "up" | "down" | "neutral"; label: string };
  accentColor: "blue" | "purple" | "cyan" | "green" | "amber";
}

export interface OverviewStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalEmployees: number;
  trainedEmployees: number;
  overallClickRate: number;
  overallReportRate: number;
  credentialSubmissionRate: string;
  trainingCompletionRate: string;
  riskScore: number;
  riskScoreChange: number;
}

export const campaignPerformanceData: MonthOverMonth[] = [
  { month: "Jan", clickRate: 34, reportRate: 12 },
  { month: "Feb", clickRate: 31, reportRate: 15 },
  { month: "Mar", clickRate: 28, reportRate: 18 },
  { month: "Apr", clickRate: 25, reportRate: 22 },
  { month: "May", clickRate: 22, reportRate: 25 },
  { month: "Jun", clickRate: 23, reportRate: 28 },
  { month: "Jul", clickRate: 19, reportRate: 31 },
  { month: "Aug", clickRate: 18, reportRate: 33 },
  { month: "Sep", clickRate: 16, reportRate: 35 },
  { month: "Oct", clickRate: 15, reportRate: 38 },
  { month: "Nov", clickRate: 14, reportRate: 40 },
  { month: "Dec", clickRate: 12, reportRate: 42 },
];

export const departmentRiskData: DepartmentRisk[] = [
  { name: "Marketing", risk: 78, employees: 42, change: -3 },
  { name: "Sales", risk: 65, employees: 38, change: 5 },
  { name: "Finance", risk: 52, employees: 28, change: -8 },
  { name: "Engineering", risk: 28, employees: 65, change: -2 },
  { name: "HR", risk: 44, employees: 18, change: 3 },
  { name: "Legal", risk: 35, employees: 12, change: -5 },
  { name: "Support", risk: 58, employees: 24, change: 7 },
  { name: "Operations", risk: 72, employees: 15, change: 10 },
];

export function getDashboardKpis(): KpiMetric[] {
  return [
    {
      title: "Active Campaigns",
      value: "5",
      change: { value: "+3", trend: "up", label: "this week" },
      accentColor: "blue",
    },
    {
      title: "Employees Tested",
      value: "1,200",
      change: { value: "+150", trend: "up", label: "this quarter" },
      accentColor: "green",
    },
    {
      title: "Click Rate",
      value: "14.2%",
      change: { value: "-5.2%", trend: "down", label: "vs last month" },
      accentColor: "purple",
    },
    {
      title: "Credential Submission",
      value: "12.3%",
      change: { value: "+0.8%", trend: "up", label: "vs last quarter" },
      accentColor: "amber",
    },
    {
      title: "Training Completion",
      value: "56%",
      change: { value: "+12%", trend: "up", label: "overall" },
      accentColor: "cyan",
    },
  ];
}

export function getAnalyticsKpis() {
  return [
    {
      title: "Overall Click Rate",
      value: "14.2%",
      subtext: "Goal is under 10%",
      trend: { value: "-2.4%", direction: "down" as const },
      icon: "TrendingUp" as const,
    },
    {
      title: "Avg Report Time",
      value: "4.5 min",
      subtext: "Time from email delivery",
      trend: { value: "-1.2m", direction: "down" as const },
      icon: "Clock" as const,
    },
    {
      title: "Vulnerable Domains",
      value: "3",
      subtext: "Corporate domains flagged",
      trend: { value: "0", direction: "neutral" as const },
      icon: "Globe" as const,
    },
  ];
}

export function getOverviewStats(): OverviewStats {
  return {
    totalCampaigns: 12,
    activeCampaigns: 5,
    totalEmployees: 1200,
    trainedEmployees: 847,
    overallClickRate: 14.2,
    overallReportRate: 35.8,
    credentialSubmissionRate: "12.3%",
    trainingCompletionRate: "56.0%",
    riskScore: 72,
    riskScoreChange: -8,
  };
}

export function getRiskColor(risk: number): string {
  if (risk >= 70) return "#ef4444";
  if (risk >= 50) return "#f59e0b";
  if (risk >= 30) return "#3b82f6";
  return "#22c55e";
}

// --- New analytics data for the full analytics page ---

export interface OpenTrend {
  month: string;
  openRate: number;
}

export interface CredentialSubmission {
  month: string;
  submissionRate: number;
  totalSubmissions: number;
}

export interface RiskSegment {
  name: string;
  value: number;
  color: string;
}

export interface CampaignComparison {
  name: string;
  clickRate: number;
  reportRate: number;
  targetCount: number;
}

export const openRateData: OpenTrend[] = [
  { month: "Jan", openRate: 72 },
  { month: "Feb", openRate: 70 },
  { month: "Mar", openRate: 68 },
  { month: "Apr", openRate: 65 },
  { month: "May", openRate: 67 },
  { month: "Jun", openRate: 63 },
  { month: "Jul", openRate: 60 },
  { month: "Aug", openRate: 58 },
  { month: "Sep", openRate: 55 },
  { month: "Oct", openRate: 53 },
  { month: "Nov", openRate: 52 },
  { month: "Dec", openRate: 50 },
];

export const credentialSubmissionData: CredentialSubmission[] = [
  { month: "Jan", submissionRate: 18, totalSubmissions: 85 },
  { month: "Feb", submissionRate: 16, totalSubmissions: 92 },
  { month: "Mar", submissionRate: 14, totalSubmissions: 78 },
  { month: "Apr", submissionRate: 15, totalSubmissions: 104 },
  { month: "May", submissionRate: 12, totalSubmissions: 67 },
  { month: "Jun", submissionRate: 11, totalSubmissions: 73 },
  { month: "Jul", submissionRate: 10, totalSubmissions: 58 },
  { month: "Aug", submissionRate: 9, totalSubmissions: 62 },
  { month: "Sep", submissionRate: 8, totalSubmissions: 45 },
  { month: "Oct", submissionRate: 8, totalSubmissions: 51 },
  { month: "Nov", submissionRate: 7, totalSubmissions: 39 },
  { month: "Dec", submissionRate: 6, totalSubmissions: 33 },
];

export const employeeRiskSegmentationData: RiskSegment[] = [
  { name: "High Risk", value: 4, color: "#ef4444" },
  { name: "Medium Risk", value: 5, color: "#f59e0b" },
  { name: "Low Risk", value: 3, color: "#3b82f6" },
  { name: "Secure", value: 8, color: "#22c55e" },
];

export const campaignComparisonData: CampaignComparison[] = [
  { name: "Q4 Benefits", clickRate: 12.4, reportRate: 38.2, targetCount: 450 },
  { name: "Password Reset", clickRate: 28.1, reportRate: 22.5, targetCount: 120 },
  { name: "Invoice #4892", clickRate: 8.5, reportRate: 45.1, targetCount: 380 },
  { name: "IT Audit", clickRate: 3.2, reportRate: 51.8, targetCount: 200 },
  { name: "CEO Fraud", clickRate: 6.7, reportRate: 62.3, targetCount: 45 },
  { name: "Zoom Suspension", clickRate: 15.0, reportRate: 30.9, targetCount: 680 },
  { name: "Q2 Benefits", clickRate: 12.0, reportRate: 30.0, targetCount: 1200 },
];
