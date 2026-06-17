export interface ReportMetric {
  campaignsRun: number;
  employeesTested: number;
  avgClickRate: string;
  avgReportRate: string;
  highRiskEmployees: number;
  trainingsCompleted: number;
}

export interface Report {
  id: string;
  name: string;
  format: string;
  size: string;
  date: string;
  status: "Generated" | "Archived" | "Generating";
  description: string;
  generatedBy: string;
  generatedAt: string;
  pages: number;
  metrics: ReportMetric;
}

export function getReportById(id: string): Report | undefined {
  return reports.find((r) => r.id === id);
}

export function getLatestReports(limit = 4): Report[] {
  return [...reports]
    .filter((r) => r.status === "Generated")
    .slice(0, limit);
}

export interface ReportCampaignSummary {
  id: string;
  name: string;
  department: string;
  employees: number;
  clicks: number;
  clickRate: string;
  reports: number;
  reportRate: string;
}

export interface ReportDepartmentSummary {
  name: string;
  employees: number;
  riskScore: number;
  clickRate: string;
  reportRate: string;
  trainingsCompleted: number;
}

export function getReportCampaigns(reportId: string): ReportCampaignSummary[] {
  const raw: { id: string; name: string; department: string; employees: number; clicks: number; reports: number }[] = [
    { id: "1", name: "Q4 Benefits Update", department: "Marketing", employees: 450, clicks: 56, reports: 172 },
    { id: "2", name: "Password Reset Urgent", department: "Engineering", employees: 120, clicks: 34, reports: 27 },
    { id: "7", name: "CEO Fraud Wire Transfer", department: "Finance", employees: 45, clicks: 3, reports: 28 },
    { id: "11", name: "Zoom Pro Account Suspension", department: "All Departments", employees: 680, clicks: 102, reports: 210 },
    { id: "12", name: "Q2 Benefits Renewal", department: "All Departments", employees: 1200, clicks: 144, reports: 360 },
  ];

  const idx = parseInt(reportId) % 3;
  return raw.slice(idx, idx + 3 + (parseInt(reportId) % 2)).map((c) => ({
    ...c,
    clickRate: `${((c.clicks / c.employees) * 100).toFixed(1)}%`,
    reportRate: `${((c.reports / c.employees) * 100).toFixed(1)}%`,
  }));
}

export function getReportDepartments(reportId: string): ReportDepartmentSummary[] {
  return [
    { name: "Marketing", employees: 42, riskScore: 78, clickRate: "22.4%", reportRate: "28.5%", trainingsCompleted: 28 },
    { name: "Engineering", employees: 65, riskScore: 28, clickRate: "8.2%", reportRate: "52.3%", trainingsCompleted: 58 },
    { name: "Finance", employees: 28, riskScore: 52, clickRate: "14.8%", reportRate: "38.1%", trainingsCompleted: 20 },
    { name: "Sales", employees: 38, riskScore: 65, clickRate: "19.5%", reportRate: "31.2%", trainingsCompleted: 25 },
    { name: "HR", employees: 18, riskScore: 44, clickRate: "12.1%", reportRate: "41.8%", trainingsCompleted: 14 },
    { name: "Operations", employees: 15, riskScore: 72, clickRate: "21.3%", reportRate: "24.6%", trainingsCompleted: 8 },
  ];
}

export const reports: Report[] = [
  {
    id: "1",
    name: "Q1 Cybersecurity Awareness Report",
    format: "PDF",
    size: "4.2 MB",
    date: "2026-03-31",
    status: "Generated",
    description: "Comprehensive Q1 overview of phishing simulation performance, employee risk distribution, and training completion rates across all departments.",
    generatedBy: "Jane Doe",
    generatedAt: "2026-03-31 14:30 UTC",
    pages: 24,
    metrics: {
      campaignsRun: 8,
      employeesTested: 1200,
      avgClickRate: "16.2%",
      avgReportRate: "34.8%",
      highRiskEmployees: 42,
      trainingsCompleted: 680,
    },
  },
  {
    id: "2",
    name: "SOC 2 Type II Readiness Export",
    format: "PDF",
    size: "1.8 MB",
    date: "2026-05-12",
    status: "Generated",
    description: "SOC 2 Type II compliance readiness report mapping simulation results to security control objectives. Includes control gap analysis and remediation roadmap.",
    generatedBy: "System",
    generatedAt: "2026-05-12 09:00 UTC",
    pages: 12,
    metrics: {
      campaignsRun: 12,
      employeesTested: 1200,
      avgClickRate: "14.8%",
      avgReportRate: "37.2%",
      highRiskEmployees: 38,
      trainingsCompleted: 720,
    },
  },
  {
    id: "3",
    name: "Executive Threat Risk Assessment",
    format: "PDF",
    size: "3.5 MB",
    date: "2026-06-01",
    status: "Generated",
    description: "Board-ready executive summary of organizational phishing risk posture with department-level breakdowns, trend analysis, and budget recommendations.",
    generatedBy: "Marcus Chen",
    generatedAt: "2026-06-01 16:45 UTC",
    pages: 18,
    metrics: {
      campaignsRun: 15,
      employeesTested: 1150,
      avgClickRate: "14.2%",
      avgReportRate: "38.5%",
      highRiskEmployees: 35,
      trainingsCompleted: 780,
    },
  },
  {
    id: "4",
    name: "Annual Phishing Drill Compliance Report",
    format: "PDF",
    size: "12.1 MB",
    date: "2025-12-31",
    status: "Archived",
    description: "Full-year compliance report covering all 48 phishing simulations conducted in 2025, employee risk progression, training completion metrics, and year-over-year comparison.",
    generatedBy: "System",
    generatedAt: "2025-12-31 23:59 UTC",
    pages: 48,
    metrics: {
      campaignsRun: 48,
      employeesTested: 1100,
      avgClickRate: "18.5%",
      avgReportRate: "28.3%",
      highRiskEmployees: 85,
      trainingsCompleted: 450,
    },
  },
  {
    id: "5",
    name: "Department Risk Comparison Report",
    format: "PDF",
    size: "2.1 MB",
    date: "2026-04-15",
    status: "Generated",
    description: "Cross-departmental risk comparison analyzing phishing susceptibility patterns, click rates, and reporting behaviors across all 8 organizational departments.",
    generatedBy: "Jane Doe",
    generatedAt: "2026-04-15 11:00 UTC",
    pages: 16,
    metrics: {
      campaignsRun: 10,
      employeesTested: 1180,
      avgClickRate: "15.1%",
      avgReportRate: "35.6%",
      highRiskEmployees: 40,
      trainingsCompleted: 700,
    },
  },
  {
    id: "6",
    name: "New Hire Security Baseline Report",
    format: "PDF",
    size: "1.2 MB",
    date: "2026-05-28",
    status: "Generated",
    description: "Analysis of new employee phishing susceptibility within first 90 days of hire. Includes onboarding training effectiveness metrics and recommendations.",
    generatedBy: "System",
    generatedAt: "2026-05-28 08:30 UTC",
    pages: 10,
    metrics: {
      campaignsRun: 3,
      employeesTested: 142,
      avgClickRate: "28.4%",
      avgReportRate: "18.2%",
      highRiskEmployees: 18,
      trainingsCompleted: 95,
    },
  },
  {
    id: "7",
    name: "Quarterly Board Risk Summary",
    format: "PDF",
    size: "5.8 MB",
    date: "2026-04-01",
    status: "Archived",
    description: "Q1 board-ready risk summary with executive dashboard, key risk indicators, compliance posture, and recommended security awareness investments.",
    generatedBy: "Marcus Chen",
    generatedAt: "2026-04-01 15:00 UTC",
    pages: 30,
    metrics: {
      campaignsRun: 8,
      employeesTested: 1200,
      avgClickRate: "16.2%",
      avgReportRate: "34.8%",
      highRiskEmployees: 42,
      trainingsCompleted: 680,
    },
  },
  {
    id: "8",
    name: "Phishing Simulation Trend Analysis",
    format: "PDF",
    size: "3.0 MB",
    date: "2026-06-10",
    status: "Generating",
    description: "Multi-year trend analysis of phishing simulation results, click rate trajectories, and training ROI calculations. Includes predictive modeling for Q3.",
    generatedBy: "AI System",
    generatedAt: "2026-06-10 22:15 UTC",
    pages: 22,
    metrics: {
      campaignsRun: 36,
      employeesTested: 3500,
      avgClickRate: "15.8%",
      avgReportRate: "32.4%",
      highRiskEmployees: 110,
      trainingsCompleted: 2100,
    },
  },
];
