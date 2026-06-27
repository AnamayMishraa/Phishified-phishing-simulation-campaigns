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
