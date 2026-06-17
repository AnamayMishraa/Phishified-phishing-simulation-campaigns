export type EmployeeRiskLevel = "High Risk" | "Medium Risk" | "Secure";

export interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  title: string;
  riskScore: number;
  status: EmployeeRiskLevel;
  joinDate: string;
  campaignsCompleted: number;
  totalPhishClicked: number;
  lastPhishClicked: string | null;
  trainingCompleted: number;
}

export function getRiskLevel(score: number): EmployeeRiskLevel {
  if (score > 70) return "High Risk";
  if (score > 40) return "Medium Risk";
  return "Secure";
}

export function getEmployeeById(id: number): Employee | undefined {
  return employees.find((e) => e.id === id);
}

export function getEmployeesByDepartment(department: string): Employee[] {
  return employees.filter((e) => e.department === department);
}

export function getHighRiskEmployees(): Employee[] {
  return employees.filter((e) => e.riskScore > 70);
}

export function getDepartments(): string[] {
  return [...new Set(employees.map((e) => e.department))];
}

export function getEmployeeStats() {
  return {
    total: employees.length,
    highRisk: employees.filter((e) => e.riskScore > 70).length,
    mediumRisk: employees.filter((e) => e.riskScore > 40 && e.riskScore <= 70).length,
    secure: employees.filter((e) => e.riskScore <= 40).length,
    averageRiskScore: Math.round(
      employees.reduce((sum, e) => sum + e.riskScore, 0) / employees.length
    ),
  };
}

export interface EmployeeCampaign {
  id: string;
  name: string;
  date: string;
  clicked: boolean;
  submitted: boolean;
  reported: boolean;
  outcome: "Passed" | "Clicked" | "Submitted";
}

export interface EmployeeTrainingCourse {
  courseId: string;
  name: string;
  category: string;
  completed: boolean;
  score: number;
}

export interface EmployeeRiskAssessment {
  overallScore: number;
  level: EmployeeRiskLevel;
  factors: { name: string; score: number; severity: "low" | "medium" | "high" }[];
  trend: "improving" | "stable" | "declining";
  lastAssessment: string;
}

const campaignHistories: Record<number, EmployeeCampaign[]> = {
  1: [
    { id: "1", name: "Q4 Benefits Update", date: "2026-06-10", clicked: true, submitted: true, reported: false, outcome: "Submitted" },
    { id: "2", name: "Password Reset Urgent", date: "2026-06-15", clicked: true, submitted: false, reported: false, outcome: "Clicked" },
    { id: "7", name: "CEO Fraud Wire Transfer", date: "2026-06-01", clicked: false, submitted: false, reported: true, outcome: "Passed" },
  ],
  5: [
    { id: "7", name: "CEO Fraud Wire Transfer", date: "2026-06-01", clicked: true, submitted: true, reported: false, outcome: "Submitted" },
    { id: "11", name: "Zoom Pro Account Suspension", date: "2026-06-18", clicked: true, submitted: false, reported: false, outcome: "Clicked" },
    { id: "1", name: "Q4 Benefits Update", date: "2026-06-10", clicked: false, submitted: false, reported: true, outcome: "Passed" },
  ],
  11: [
    { id: "2", name: "Password Reset Urgent", date: "2026-06-15", clicked: true, submitted: true, reported: false, outcome: "Submitted" },
    { id: "7", name: "CEO Fraud Wire Transfer", date: "2026-06-01", clicked: true, submitted: false, reported: false, outcome: "Clicked" },
  ],
  13: [
    { id: "1", name: "Q4 Benefits Update", date: "2026-06-10", clicked: true, submitted: false, reported: false, outcome: "Clicked" },
    { id: "11", name: "Zoom Pro Account Suspension", date: "2026-06-18", clicked: true, submitted: true, reported: false, outcome: "Submitted" },
    { id: "7", name: "CEO Fraud Wire Transfer", date: "2026-06-01", clicked: false, submitted: false, reported: true, outcome: "Passed" },
  ],
};

export function getEmployeeCampaignHistory(id: number): EmployeeCampaign[] {
  return campaignHistories[id] || [
    { id: "3", name: "Invoice #4892", date: "2026-05-20", clicked: false, submitted: false, reported: true, outcome: "Passed" },
    { id: "6", name: "Google Workspace Alert", date: "2026-03-01", clicked: false, submitted: false, reported: false, outcome: "Passed" },
    { id: "9", name: "LinkedIn Connection Request", date: "2026-01-20", clicked: false, submitted: false, reported: true, outcome: "Passed" },
  ];
}

export function getEmployeeTrainingProgress(id: number): EmployeeTrainingCourse[] {
  const completed = employees.find((e) => e.id === id)?.trainingCompleted || 0;
  const courses = [
    { courseId: "1", name: "Phishing Foundations: Spotting Red Flags", category: "Core Training", completed: completed > 0, score: completed > 0 ? 92 : 0 },
    { courseId: "2", name: "Social Engineering Tactics", category: "Advanced", completed: completed > 1, score: completed > 1 ? 88 : 0 },
    { courseId: "3", name: "Securing Your Remote Workplace", category: "Compliance", completed: completed > 2, score: completed > 2 ? 95 : 0 },
    { courseId: "4", name: "Credential Safety & MFA", category: "Core Training", completed: completed > 3, score: completed > 3 ? 90 : 0 },
    { courseId: "5", name: "Mobile Device Security & SMS Phishing", category: "Advanced", completed: completed > 4, score: completed > 4 ? 85 : 0 },
    { courseId: "6", name: "GDPR & Data Privacy Compliance", category: "Compliance", completed: completed > 5, score: completed > 5 ? 78 : 0 },
  ];
  return courses.slice(0, Math.max(completed + 2, 4));
}

export function getEmployeeRiskAssessment(id: number): EmployeeRiskAssessment {
  const employee = employees.find((e) => e.id === id);
  if (!employee) {
    return { overallScore: 0, level: "Secure", factors: [], trend: "stable", lastAssessment: "N/A" };
  }

  const { riskScore, totalPhishClicked, campaignsCompleted, trainingCompleted } = employee;
  const level = getRiskLevel(riskScore);

  const factors = [
    { name: "Phishing Click Rate", score: Math.min(totalPhishClicked * 15, 100), severity: totalPhishClicked > 4 ? "high" as const : totalPhishClicked > 1 ? "medium" as const : "low" as const },
    { name: "Training Completion", score: Math.max(0, 100 - trainingCompleted * 15), severity: trainingCompleted < 2 ? "high" as const : trainingCompleted < 5 ? "medium" as const : "low" as const },
    { name: "Campaign Engagement", score: Math.min(campaignsCompleted * 5, 100), severity: "low" as const },
    { name: "Repeat Offender Risk", score: totalPhishClicked > 3 ? 80 : totalPhishClicked > 1 ? 40 : 10, severity: totalPhishClicked > 3 ? "high" as const : totalPhishClicked > 1 ? "medium" as const : "low" as const },
  ];

  const trends = ["improving", "stable", "declining"] as const;
  const trend = trends[riskScore % 3];

  return {
    overallScore: riskScore,
    level,
    factors,
    trend,
    lastAssessment: "2026-06-15",
  };
}

export const employees: Employee[] = [
  {
    id: 1,
    name: "Alice Smith",
    email: "alice.s@company.com",
    department: "Marketing",
    title: "Marketing Manager",
    riskScore: 82,
    status: "High Risk",
    joinDate: "2024-03-15",
    campaignsCompleted: 3,
    totalPhishClicked: 5,
    lastPhishClicked: "2026-06-10",
    trainingCompleted: 1,
  },
  {
    id: 2,
    name: "Bob Johnson",
    email: "bob.j@company.com",
    department: "Engineering",
    title: "Senior Software Engineer",
    riskScore: 18,
    status: "Secure",
    joinDate: "2023-01-20",
    campaignsCompleted: 8,
    totalPhishClicked: 0,
    lastPhishClicked: null,
    trainingCompleted: 6,
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie.b@company.com",
    department: "Finance",
    title: "Financial Analyst",
    riskScore: 54,
    status: "Medium Risk",
    joinDate: "2024-07-01",
    campaignsCompleted: 5,
    totalPhishClicked: 3,
    lastPhishClicked: "2026-05-20",
    trainingCompleted: 3,
  },
  {
    id: 4,
    name: "Diana Prince",
    email: "diana.p@company.com",
    department: "Legal",
    title: "Legal Counsel",
    riskScore: 12,
    status: "Secure",
    joinDate: "2022-11-10",
    campaignsCompleted: 10,
    totalPhishClicked: 0,
    lastPhishClicked: null,
    trainingCompleted: 8,
  },
  {
    id: 5,
    name: "Ethan Hunt",
    email: "ethan.h@company.com",
    department: "Operations",
    title: "Operations Director",
    riskScore: 90,
    status: "High Risk",
    joinDate: "2023-06-05",
    campaignsCompleted: 2,
    totalPhishClicked: 7,
    lastPhishClicked: "2026-06-15",
    trainingCompleted: 0,
  },
  {
    id: 6,
    name: "Fiona Glenanne",
    email: "fiona.g@company.com",
    department: "Sales",
    title: "Sales Representative",
    riskScore: 35,
    status: "Secure",
    joinDate: "2024-09-12",
    campaignsCompleted: 6,
    totalPhishClicked: 1,
    lastPhishClicked: "2026-03-22",
    trainingCompleted: 4,
  },
  {
    id: 7,
    name: "George Costanza",
    email: "george.c@company.com",
    department: "HR",
    title: "HR Coordinator",
    riskScore: 67,
    status: "Medium Risk",
    joinDate: "2023-04-22",
    campaignsCompleted: 4,
    totalPhishClicked: 4,
    lastPhishClicked: "2026-04-15",
    trainingCompleted: 2,
  },
  {
    id: 8,
    name: "Hannah Montana",
    email: "hannah.m@company.com",
    department: "Marketing",
    title: "Content Strategist",
    riskScore: 41,
    status: "Medium Risk",
    joinDate: "2024-01-08",
    campaignsCompleted: 5,
    totalPhishClicked: 2,
    lastPhishClicked: "2026-05-01",
    trainingCompleted: 3,
  },
  {
    id: 9,
    name: "Ivan Drago",
    email: "ivan.d@company.com",
    department: "Engineering",
    title: "DevOps Engineer",
    riskScore: 8,
    status: "Secure",
    joinDate: "2022-08-30",
    campaignsCompleted: 12,
    totalPhishClicked: 0,
    lastPhishClicked: null,
    trainingCompleted: 10,
  },
  {
    id: 10,
    name: "Julia Roberts",
    email: "julia.r@company.com",
    department: "Finance",
    title: "Accounts Payable",
    riskScore: 73,
    status: "High Risk",
    joinDate: "2023-11-01",
    campaignsCompleted: 3,
    totalPhishClicked: 5,
    lastPhishClicked: "2026-06-01",
    trainingCompleted: 1,
  },
  {
    id: 11,
    name: "Kevin Malone",
    email: "kevin.m@company.com",
    department: "Finance",
    title: "Junior Accountant",
    riskScore: 88,
    status: "High Risk",
    joinDate: "2025-01-15",
    campaignsCompleted: 2,
    totalPhishClicked: 6,
    lastPhishClicked: "2026-06-12",
    trainingCompleted: 0,
  },
  {
    id: 12,
    name: "Lara Croft",
    email: "lara.c@company.com",
    department: "Engineering",
    title: "Security Engineer",
    riskScore: 5,
    status: "Secure",
    joinDate: "2021-06-01",
    campaignsCompleted: 15,
    totalPhishClicked: 0,
    lastPhishClicked: null,
    trainingCompleted: 12,
  },
  {
    id: 13,
    name: "Michael Scott",
    email: "michael.s@company.com",
    department: "Sales",
    title: "Regional Manager",
    riskScore: 76,
    status: "High Risk",
    joinDate: "2022-04-01",
    campaignsCompleted: 3,
    totalPhishClicked: 6,
    lastPhishClicked: "2026-06-08",
    trainingCompleted: 1,
  },
  {
    id: 14,
    name: "Nina Simone",
    email: "nina.s@company.com",
    department: "HR",
    title: "HR Director",
    riskScore: 22,
    status: "Secure",
    joinDate: "2021-09-15",
    campaignsCompleted: 9,
    totalPhishClicked: 1,
    lastPhishClicked: "2026-02-10",
    trainingCompleted: 7,
  },
  {
    id: 15,
    name: "Oscar Martinez",
    email: "oscar.m@company.com",
    department: "Finance",
    title: "Senior Accountant",
    riskScore: 48,
    status: "Medium Risk",
    joinDate: "2023-08-20",
    campaignsCompleted: 6,
    totalPhishClicked: 3,
    lastPhishClicked: "2026-04-28",
    trainingCompleted: 4,
  },
  {
    id: 16,
    name: "Pam Beesly",
    email: "pam.b@company.com",
    department: "Sales",
    title: "Sales Coordinator",
    riskScore: 30,
    status: "Secure",
    joinDate: "2024-02-14",
    campaignsCompleted: 5,
    totalPhishClicked: 1,
    lastPhishClicked: "2026-05-10",
    trainingCompleted: 4,
  },
  {
    id: 17,
    name: "Quinn Fabray",
    email: "quinn.f@company.com",
    department: "Marketing",
    title: "Social Media Specialist",
    riskScore: 59,
    status: "Medium Risk",
    joinDate: "2024-06-01",
    campaignsCompleted: 4,
    totalPhishClicked: 3,
    lastPhishClicked: "2026-05-30",
    trainingCompleted: 2,
  },
  {
    id: 18,
    name: "Rachel Green",
    email: "rachel.g@company.com",
    department: "HR",
    title: "Benefits Coordinator",
    riskScore: 33,
    status: "Secure",
    joinDate: "2023-12-01",
    campaignsCompleted: 6,
    totalPhishClicked: 1,
    lastPhishClicked: "2026-01-15",
    trainingCompleted: 5,
  },
  {
    id: 19,
    name: "Steve Harrington",
    email: "steve.h@company.com",
    department: "Operations",
    title: "Facilities Manager",
    riskScore: 71,
    status: "High Risk",
    joinDate: "2024-10-01",
    campaignsCompleted: 2,
    totalPhishClicked: 4,
    lastPhishClicked: "2026-06-02",
    trainingCompleted: 1,
  },
  {
    id: 20,
    name: "Tina Fey",
    email: "tina.f@company.com",
    department: "Legal",
    title: "Paralegal",
    riskScore: 15,
    status: "Secure",
    joinDate: "2023-05-10",
    campaignsCompleted: 8,
    totalPhishClicked: 0,
    lastPhishClicked: null,
    trainingCompleted: 7,
  },
];
