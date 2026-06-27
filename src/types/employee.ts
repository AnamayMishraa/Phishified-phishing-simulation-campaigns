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
