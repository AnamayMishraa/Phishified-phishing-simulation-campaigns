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
export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department_name: string;
  position: string;
  risk_score: number;
  risk_level: "secure" | "medium" | "high";
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
  risk_level?: "secure" | "medium" | "high";
  is_active?: boolean;
}

export interface EmployeeRiskSnapshot {
  id: string;
  risk_score: number;
  risk_level: "secure" | "medium" | "high";
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

// Error
export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}
