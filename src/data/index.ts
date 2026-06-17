export type { Campaign, CampaignStatus, CampaignType, CampaignTarget, CampaignActivity } from "./campaigns";
export { campaigns, getCampaignById, getCampaignsByStatus, getActiveCampaigns, getRecentCampaigns, getCampaignCountByStatus, getAverageClickRate, getAverageReportRate, getCampaignTargets, getCampaignActivities, campaignStatusConfig } from "./campaigns";

export type { Employee, EmployeeRiskLevel, EmployeeCampaign, EmployeeTrainingCourse, EmployeeRiskAssessment } from "./employees";
export { employees, getEmployeeById, getEmployeesByDepartment, getHighRiskEmployees, getDepartments, getEmployeeStats, getRiskLevel, getEmployeeCampaignHistory, getEmployeeTrainingProgress, getEmployeeRiskAssessment } from "./employees";

export type { Template, TemplateStats } from "./templates";
export { templates, getTemplateById, getTemplatesByCategory, getCategories, getTemplateStats } from "./templates";

export type { MonthOverMonth, DepartmentRisk, KpiMetric, OverviewStats, OpenTrend, CredentialSubmission, RiskSegment, CampaignComparison } from "./analytics";
export { campaignPerformanceData, departmentRiskData, openRateData, credentialSubmissionData, employeeRiskSegmentationData, campaignComparisonData, getDashboardKpis, getAnalyticsKpis, getOverviewStats, getRiskColor } from "./analytics";

export type { Report, ReportMetric, ReportCampaignSummary, ReportDepartmentSummary } from "./reports";
export { reports, getReportById, getLatestReports, getReportCampaigns, getReportDepartments } from "./reports";

export type { Activity, ActivityType } from "./activity";
export { activities, getRecentActivities, getActivityConfig } from "./activity";

export type { LandingPage, LandingPageStats, VisitorHistoryPoint } from "./landing-pages";
export { landingPages, getLandingPageById, getLandingPagesByCategory, getLandingPageStats, getVisitorHistory } from "./landing-pages";

export type { Course, CourseModule, Certificate } from "./training";
export { courses, getCourseById, getCourseCertificate, getCertificates } from "./training";

export { suggestedPrompts, getMockResponse } from "./ai-responses";
