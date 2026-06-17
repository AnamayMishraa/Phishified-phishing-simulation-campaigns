export type ActivityType =
  | "click"
  | "report"
  | "campaign"
  | "training"
  | "alert"
  | "employee";

export interface Activity {
  id: number;
  type: ActivityType;
  message: string;
  department: string;
  time: string;
}

export const activities: Activity[] = [
  {
    id: 1,
    type: "click",
    message: 'Employee clicked phishing link in "Q4 Benefits Update" campaign',
    department: "Marketing",
    time: "2 min ago",
  },
  {
    id: 2,
    type: "report",
    message: 'Phishing email reported by Sarah Chen — "Invoice #4892" campaign',
    department: "Finance",
    time: "8 min ago",
  },
  {
    id: 3,
    type: "campaign",
    message: '"Password Reset Urgent" campaign launched to Engineering team',
    department: "Engineering",
    time: "15 min ago",
  },
  {
    id: 4,
    type: "training",
    message: "12 employees completed Security Awareness Module 3",
    department: "Sales",
    time: "32 min ago",
  },
  {
    id: 5,
    type: "alert",
    message: "High-risk employee group detected: Support team click rate at 58%",
    department: "Support",
    time: "1 hour ago",
  },
  {
    id: 6,
    type: "employee",
    message: "24 new employees imported from HR system",
    department: "HR",
    time: "2 hours ago",
  },
  {
    id: 7,
    type: "click",
    message: 'Employee submitted credentials in "CEO Fraud" campaign',
    department: "Finance",
    time: "25 min ago",
  },
  {
    id: 8,
    type: "training",
    message: "Engineering team completed Phishing Foundations course at 92%",
    department: "Engineering",
    time: "45 min ago",
  },
  {
    id: 9,
    type: "alert",
    message: "Multiple failed login attempts detected from suspicious IP range",
    department: "Security",
    time: "1 hour ago",
  },
  {
    id: 10,
    type: "report",
    message: 'Campaign "Zoom Account Suspension" reported by 10 employees',
    department: "Operations",
    time: "3 hours ago",
  },
];

export function getRecentActivities(limit = 6): Activity[] {
  return activities.slice(0, limit);
}

export function getActivityConfig(type: ActivityType) {
  const configs: Record<ActivityType, { iconName: string; color: string; bg: string }> = {
    click: { iconName: "MousePointerClick", color: "text-status-danger", bg: "bg-status-danger/10" },
    report: { iconName: "ShieldCheck", color: "text-status-success", bg: "bg-status-success/10" },
    campaign: { iconName: "Mail", color: "text-accent-blue", bg: "bg-accent-blue/10" },
    training: { iconName: "Clock", color: "text-accent-purple-light", bg: "bg-accent-purple/10" },
    alert: { iconName: "AlertTriangle", color: "text-status-warning", bg: "bg-status-warning/10" },
    employee: { iconName: "UserPlus", color: "text-accent-cyan", bg: "bg-accent-cyan/10" },
  };

  return configs[type];
}
