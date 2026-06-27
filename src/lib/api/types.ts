// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RefreshResponse {
  access: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "analyst" | "viewer";
  organization_id: string;
  organization_name: string;
  is_active: boolean;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// Employees
export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_name: string;
  position: string;
  risk_score: number;
  risk_level: RiskLevel;
  is_active: boolean;
  created_at: string;
}

export interface EmployeeDetail extends Employee {
  organization_id: string;
  department_id: string | null;
  department_name: string;
  hire_date: string | null;
  updated_at: string;
}

export interface EmployeeWrite {
  department?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  position?: string;
  hire_date?: string | null;
  risk_score?: number;
  risk_level?: RiskLevel;
  is_active?: boolean;
}

export interface EmployeeRiskSnapshot {
  id: string;
  risk_score: number;
  risk_level: RiskLevel;
  factors: Record<string, unknown>;
  trigger_reason: string;
  snapshot_date: string;
  created_at: string;
}

// Templates
export interface Template {
  id: string;
  name: string;
  category: string;
  difficulty_level: string;
  subject: string;
  sender_name: string;
  is_active: boolean;
  created_at: string;
}

export interface TemplateDetail extends Template {
  organization_id: string;
  sender_email: string;
  html_content: string;
  plain_text_content: string;
  tags: string[];
  created_by_name: string;
  updated_at: string;
}

export interface TemplateWrite {
  name: string;
  category: string;
  subject: string;
  sender_name?: string;
  sender_email?: string;
  html_content?: string;
  plain_text_content?: string;
  difficulty_level?: string;
  tags?: string[];
  is_active?: boolean;
}

// Campaigns
export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type CampaignType = "email" | "sms" | "voice" | "qr_code";

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  department: string;
  sent_count: number;
  open_count: number;
  click_count: number;
  submission_count: number;
  report_count: number;
  open_rate: number;
  click_rate: number;
  created_at: string;
}

export interface CampaignDetail extends Campaign {
  organization_id: string;
  description: string;
  email_template: string | null;
  template_name: string | null;
  landing_page: string | null;
  created_by: string | null;
  created_by_name: string;
  scheduled_date: string | null;
  completed_date: string | null;
  bounce_count: number;
  submission_rate: number;
  report_rate: number;
  updated_at: string;
}

export interface CampaignWrite {
  name: string;
  type?: CampaignType;
  description?: string;
  department?: string;
  email_template?: string | null;
  landing_page?: string | null;
  scheduled_date?: string | null;
}

export interface CampaignAssignment {
  id: string;
  employee: string;
  employee_name: string;
  funnel_step: "pending" | "sent" | "opened" | "clicked" | "submitted" | "reported";
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  submitted_at: string | null;
  reported_at: string | null;
  created_at: string;
}

export interface CampaignActivity {
  id: string;
  activity_type: string;
  message: string;
  employee: string | null;
  employee_name: string;
  timestamp: string;
}

export interface ActionResponse {
  detail: string;
  target_count?: number;
}

// Landing Pages
export interface LandingPage {
  id: string;
  name: string;
  slug: string;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface LandingPageDetail extends LandingPage {
  organization_id: string;
  title: string;
  html_content: string;
  css_content: string;
  difficulty_level: string;
  created_by_name: string;
  updated_at: string;
}

export interface LandingPageWrite {
  name: string;
  slug?: string;
  category?: string;
  title?: string;
  html_content?: string;
  css_content?: string;
  difficulty_level?: string;
  is_active?: boolean;
}

// Leaderboard
export interface LeaderboardEntry {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_name: string;
  position: string;
  risk_score: number;
  risk_level: RiskLevel;
  campaigns_participated: number;
  open_rate: number;
  click_rate: number;
  submission_rate: number;
  report_rate: number;
}

// Dashboard
export interface DashboardEmployee {
  id: string;
  name: string;
  department: string;
  risk_score: number;
}

export interface HighRiskEmployee extends DashboardEmployee {
  total_phish_clicked: number;
}

export interface MostImprovedEmployee extends DashboardEmployee {
  previous_risk_score: number;
  improvement: number;
}

export interface HighestReportingEmployee extends DashboardEmployee {
  total_reported: number;
}

export interface DashboardKpiChange {
  value: string;
  trend: "up" | "down" | "neutral";
  label: string;
}

export interface DashboardKpi {
  value: number;
  change: DashboardKpiChange;
}

export interface MonthlyPerformance {
  month: string;
  click_rate: number;
  report_rate: number;
}

export interface DepartmentRisk {
  name: string;
  risk: number;
  employee_count: number;
}

export interface DashboardActivity {
  id: string;
  type: string;
  message: string;
  department: string;
  timestamp: string;
}

export interface DashboardData {
  kpis: Record<string, DashboardKpi>;
  campaign_performance: MonthlyPerformance[];
  department_risk: DepartmentRisk[];
  recent_activities: DashboardActivity[];
  high_risk_employees: HighRiskEmployee[];
  most_improved_employees: MostImprovedEmployee[];
  highest_reporting_employees: HighestReportingEmployee[];
}

// Infrastructure Settings
export interface InfrastructureSetting {
  id: string;
  company_name: string;
  sender_name: string;
  sender_email: string;
  landing_domain: string;
  landing_domain_verified: boolean;
  email_provider: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_verified: boolean;
}

export interface InfrastructureSettingWrite {
  company_name?: string;
  sender_name?: string;
  sender_email?: string;
  landing_domain?: string;
  email_provider?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  smtp_password?: string;
}

// Analytics
export interface AnalyticsKpiValue {
  value: number;
  change: number | null;
}

export interface AnalyticsKpis {
  security_awareness_score: AnalyticsKpiValue;
  open_rate: AnalyticsKpiValue;
  click_rate: AnalyticsKpiValue;
  submission_rate: AnalyticsKpiValue;
  report_rate: AnalyticsKpiValue;
  avg_report_time_minutes: AnalyticsKpiValue;
  training_completion_pct: AnalyticsKpiValue;
}

export interface FunnelStage {
  stage: string;
  count: number;
}

export interface HeatmapDepartment {
  department: string;
  low: number;
  medium: number;
  high: number;
  critical: number;
  total: number;
  avg_risk: number;
}

export interface RiskTrendPoint {
  date: string;
  avg_risk: number;
}

export interface DeptComparison {
  department: string;
  open_rate: number;
  click_rate: number;
  submission_rate: number;
  report_rate: number;
  sent: number;
}

export interface TrainingGroup {
  employee_count: number;
  avg_risk_score: number;
  click_rate: number;
}

export interface TrainingImpact {
  trained: TrainingGroup;
  untrained: TrainingGroup;
  risk_reduction: number;
}

export interface RiskSegmentation {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface RiskOverview {
  segmentation: RiskSegmentation;
  total_employees: number;
}

export interface VulnerableEmployee {
  id: string;
  name: string;
  department: string;
  risk_score: number;
  risk_level: string;
  total_phish_clicked: number;
}

export interface ImprovedEmployee {
  id: string;
  name: string;
  department: string;
  risk_score: number;
  previous_risk_score: number;
  improvement: number;
}

export interface FastestReporter {
  id: string;
  name: string;
  department: string;
  report_time_minutes: number;
  campaign: string;
}

export interface HighRiskDepartment {
  department: string;
  avg_risk: number;
  employee_count: number;
  high_risk_count: number;
}

export interface ExecutiveSummary {
  awareness_score: number;
  risk_assessment: string;
  findings: string[];
  recommendations: string[];
  generated_at: string;
}

export interface AnalyticsAllData {
  kpis: AnalyticsKpis;
  funnel: FunnelStage[];
  heatmap: HeatmapDepartment[];
  risk_trend: RiskTrendPoint[];
  department_comparison: DeptComparison[];
  training_impact: TrainingImpact;
  risk_overview: RiskOverview;
  most_vulnerable: VulnerableEmployee[];
  most_improved: ImprovedEmployee[];
  fastest_reporters: FastestReporter[];
  highest_risk_departments: HighRiskDepartment[];
  executive_summary: ExecutiveSummary;
}

export interface AnalyticsFilterOption {
  id: string;
  name: string;
}

export interface AnalyticsFilters {
  campaigns: AnalyticsFilterOption[];
  departments: AnalyticsFilterOption[];
}

// Departments
export interface Department {
  id: string;
  name: string;
  description: string;
  employee_count: number;
  is_active: boolean;
  created_at: string;
}

// Training
export interface CourseModuleAPI {
  id: string;
  title: string;
  description: string;
  content_type: string;
  duration_minutes: number;
  order: number;
}

export interface CourseListItem {
  id: string;
  name: string;
  description: string;
  category: string;
  category_display: string;
  difficulty_level: string;
  difficulty_display: string;
  is_active: boolean;
  total_modules: number;
  total_duration_minutes: number;
  enrollment_count: number;
  completed_count: number;
  created_at: string;
}

export interface CourseDetail extends CourseListItem {
  organization_id: string;
  modules: CourseModuleAPI[];
  updated_at: string;
}

// Reports
export interface ReportMetric {
  campaignsRun: number;
  employeesTested: number;
  avgClickRate: string;
  avgReportRate: string;
  highRiskEmployees: number;
  trainingsCompleted: number;
}

export interface ReportListItem {
  id: string;
  name: string;
  description: string;
  format: string;
  file_size: string;
  pages: number;
  status: string;
  generated_by_name: string;
  generated_at: string;
}

export interface ReportDetail {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  format: string;
  file_size: string;
  pages: number;
  status: string;
  generated_by: string | null;
  generated_by_name: string;
  generated_at: string;
  metrics: ReportMetric;
  campaigns: ReportCampaignSummary[];
  departments: ReportDepartmentSummary[];
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

// Error
export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}
