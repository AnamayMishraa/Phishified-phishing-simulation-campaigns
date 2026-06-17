export type CampaignStatus = "active" | "draft" | "completed" | "paused";

export type CampaignType = "Email" | "SMS" | "Voice" | "QR Code";

export interface CampaignTarget {
  id: number;
  name: string;
  email: string;
  department: string;
  clicked: boolean;
  submitted: boolean;
  reported: boolean;
}

export interface CampaignActivity {
  id: number;
  type: "sent" | "opened" | "clicked" | "submitted" | "reported" | "event";
  message: string;
  time: string;
  date: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetCount: number;
  clickCount: number;
  reportCount: number;
  openCount: number;
  submissionCount: number;
  clickRate: string;
  reportRate: string;
  openRate: string;
  submissionRate: string;
  date: string;
  endDate: string;
  description: string;
  createdBy: string;
  department: string;
  templateId: string;
  createdAt: string;
}

export const campaignStatusConfig: Record<
  CampaignStatus,
  { bg: string; text: string; dot: string; label: string }
> = {
  active: {
    bg: "bg-status-success/10 border-status-success/20",
    text: "text-status-success",
    dot: "bg-status-success animate-glow-pulse",
    label: "Active",
  },
  draft: {
    bg: "bg-text-muted/10 border-text-muted/20",
    text: "text-text-secondary",
    dot: "bg-text-muted",
    label: "Draft",
  },
  completed: {
    bg: "bg-accent-blue/10 border-accent-blue/20",
    text: "text-accent-blue-light",
    dot: "bg-accent-blue",
    label: "Completed",
  },
  paused: {
    bg: "bg-status-warning/10 border-status-warning/20",
    text: "text-status-warning",
    dot: "bg-status-warning",
    label: "Paused",
  },
};

export const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Q4 Benefits Update",
    type: "Email",
    status: "active",
    targetCount: 450,
    clickCount: 56,
    reportCount: 172,
    openCount: 298,
    submissionCount: 42,
    clickRate: "12.4%",
    reportRate: "38.2%",
    openRate: "66.2%",
    submissionRate: "9.3%",
    date: "2026-06-10",
    endDate: "2026-07-10",
    description: "Simulated HR benefits update email targeting all employees with embedded credential harvesting link designed to test general awareness across departments.",
    createdBy: "Jane Doe",
    department: "All Departments",
    templateId: "2",
    createdAt: "2026-06-01",
  },
  {
    id: "2",
    name: "Password Reset Urgent",
    type: "Email",
    status: "active",
    targetCount: 120,
    clickCount: 34,
    reportCount: 27,
    openCount: 95,
    submissionCount: 28,
    clickRate: "28.1%",
    reportRate: "22.5%",
    openRate: "79.2%",
    submissionRate: "23.3%",
    date: "2026-06-15",
    endDate: "2026-06-29",
    description: "Urgent password reset notification targeting Engineering department using urgency tactics to test technical team security awareness.",
    createdBy: "Jane Doe",
    department: "Engineering",
    templateId: "1",
    createdAt: "2026-06-05",
  },
  {
    id: "3",
    name: "Invoice #4892",
    type: "Email",
    status: "completed",
    targetCount: 380,
    clickCount: 32,
    reportCount: 171,
    openCount: 245,
    submissionCount: 14,
    clickRate: "8.5%",
    reportRate: "45.1%",
    openRate: "64.5%",
    submissionRate: "3.7%",
    date: "2026-05-20",
    endDate: "2026-06-05",
    description: "Fake invoice attachment targeting Finance and Operations teams with sophisticated PDF malware simulation to test advanced threat detection.",
    createdBy: "Marcus Chen",
    department: "Finance",
    templateId: "3",
    createdAt: "2026-05-15",
  },
  {
    id: "4",
    name: "IT Audit Compliance",
    type: "Email",
    status: "paused",
    targetCount: 200,
    clickCount: 6,
    reportCount: 104,
    openCount: 112,
    submissionCount: 2,
    clickRate: "3.2%",
    reportRate: "51.8%",
    openRate: "56.0%",
    submissionRate: "1.0%",
    date: "2026-04-12",
    endDate: "2026-05-12",
    description: "IT audit compliance notice with credential capture form designed to test response to internal IT communications. Paused for content review following low engagement.",
    createdBy: "Jane Doe",
    department: "All Departments",
    templateId: "4",
    createdAt: "2026-04-01",
  },
  {
    id: "5",
    name: "Slack Integration Notification",
    type: "Email",
    status: "draft",
    targetCount: 0,
    clickCount: 0,
    reportCount: 0,
    openCount: 0,
    submissionCount: 0,
    clickRate: "--",
    reportRate: "--",
    openRate: "--",
    submissionRate: "--",
    date: "Draft",
    endDate: "Draft",
    description: "Fake Slack integration notification email mimicking workplace tool communications. Pending team review prior to approval for launch.",
    createdBy: "Marcus Chen",
    department: "All Departments",
    templateId: "5",
    createdAt: "2026-06-12",
  },
  {
    id: "6",
    name: "Google Workspace Alert",
    type: "Email",
    status: "completed",
    targetCount: 520,
    clickCount: 82,
    reportCount: 163,
    openCount: 380,
    submissionCount: 55,
    clickRate: "15.7%",
    reportRate: "31.4%",
    openRate: "73.1%",
    submissionRate: "10.6%",
    date: "2026-03-01",
    endDate: "2026-03-31",
    description: "Google Workspace security alert simulation targeting all staff with a fake suspicious login notification and credential harvesting page.",
    createdBy: "Jane Doe",
    department: "All Departments",
    templateId: "4",
    createdAt: "2026-02-20",
  },
  {
    id: "7",
    name: "CEO Fraud Wire Transfer",
    type: "Email",
    status: "active",
    targetCount: 45,
    clickCount: 3,
    reportCount: 28,
    openCount: 38,
    submissionCount: 1,
    clickRate: "6.7%",
    reportRate: "62.3%",
    openRate: "84.4%",
    submissionRate: "2.2%",
    date: "2026-06-01",
    endDate: "2026-07-01",
    description: "Business email compromise simulation targeting finance team with urgent wire transfer request impersonating CEO. Tests executive impersonation awareness.",
    createdBy: "Marcus Chen",
    department: "Finance",
    templateId: "3",
    createdAt: "2026-05-28",
  },
  {
    id: "8",
    name: "COVID-19 Policy Update",
    type: "SMS",
    status: "completed",
    targetCount: 1200,
    clickCount: 268,
    reportCount: 227,
    openCount: 890,
    submissionCount: 145,
    clickRate: "22.3%",
    reportRate: "18.9%",
    openRate: "74.2%",
    submissionRate: "12.1%",
    date: "2026-02-15",
    endDate: "2026-03-01",
    description: "SMS-based phishing simulation impersonating government health advisory regarding updated COVID-19 workplace protocols. Tests mobile phishing awareness.",
    createdBy: "Jane Doe",
    department: "All Departments",
    templateId: "6",
    createdAt: "2026-02-10",
  },
  {
    id: "9",
    name: "LinkedIn Connection Request",
    type: "Email",
    status: "completed",
    targetCount: 310,
    clickCount: 74,
    reportCount: 92,
    openCount: 220,
    submissionCount: 38,
    clickRate: "23.9%",
    reportRate: "29.7%",
    openRate: "71.0%",
    submissionRate: "12.3%",
    date: "2026-01-20",
    endDate: "2026-02-20",
    description: "Fake LinkedIn notification email with malicious connection request link. Tests social media platform impersonation awareness.",
    createdBy: "Jane Doe",
    department: "All Departments",
    templateId: "5",
    createdAt: "2026-01-15",
  },
  {
    id: "10",
    name: "FedEx Package Delivery",
    type: "SMS",
    status: "draft",
    targetCount: 0,
    clickCount: 0,
    reportCount: 0,
    openCount: 0,
    submissionCount: 0,
    clickRate: "--",
    reportRate: "--",
    openRate: "--",
    submissionRate: "--",
    date: "Draft",
    endDate: "Draft",
    description: "SMS-based package delivery notification phishing simulation. Targets mobile users with fake shipping update link.",
    createdBy: "Marcus Chen",
    department: "All Departments",
    templateId: "6",
    createdAt: "2026-06-14",
  },
  {
    id: "11",
    name: "Zoom Pro Account Suspension",
    type: "Email",
    status: "active",
    targetCount: 680,
    clickCount: 102,
    reportCount: 210,
    openCount: 480,
    submissionCount: 78,
    clickRate: "15.0%",
    reportRate: "30.9%",
    openRate: "70.6%",
    submissionRate: "11.5%",
    date: "2026-06-18",
    endDate: "2026-07-02",
    description: "Fake Zoom account suspension warning with urgency-based messaging targeting frequent meeting participants across all departments.",
    createdBy: "Jane Doe",
    department: "All Departments",
    templateId: "5",
    createdAt: "2026-06-16",
  },
  {
    id: "12",
    name: "Q2 Benefits Renewal",
    type: "Email",
    status: "active",
    targetCount: 1200,
    clickCount: 144,
    reportCount: 360,
    openCount: 840,
    submissionCount: 108,
    clickRate: "12.0%",
    reportRate: "30.0%",
    openRate: "70.0%",
    submissionRate: "9.0%",
    date: "2026-06-20",
    endDate: "2026-07-20",
    description: "Quarterly benefits renewal scam with realistic HR branding and urgent action required messaging. Tests bulk awareness across entire organization.",
    createdBy: "Jane Doe",
    department: "All Departments",
    templateId: "2",
    createdAt: "2026-06-18",
  },
];

export function getCampaignById(id: string): Campaign | undefined {
  return campaigns.find((c) => c.id === id);
}

export function getCampaignsByStatus(status: CampaignStatus): Campaign[] {
  return campaigns.filter((c) => c.status === status);
}

export function getActiveCampaigns(): Campaign[] {
  return campaigns.filter((c) => c.status === "active");
}

export function getRecentCampaigns(limit = 5): Campaign[] {
  return [...campaigns]
    .filter((c) => c.status !== "draft")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

export function getCampaignCountByStatus(): Record<CampaignStatus, number> {
  return {
    active: campaigns.filter((c) => c.status === "active").length,
    draft: campaigns.filter((c) => c.status === "draft").length,
    completed: campaigns.filter((c) => c.status === "completed").length,
    paused: campaigns.filter((c) => c.status === "paused").length,
  };
}

export function getAverageClickRate(): number {
  const active = campaigns.filter((c) => c.status !== "draft" && c.clickRate !== "--");
  const total = active.reduce((sum, c) => sum + parseFloat(c.clickRate), 0);
  return active.length > 0 ? total / active.length : 0;
}

export function getAverageReportRate(): number {
  const active = campaigns.filter((c) => c.status !== "draft" && c.reportRate !== "--");
  const total = active.reduce((sum, c) => sum + parseFloat(c.reportRate), 0);
  return active.length > 0 ? total / active.length : 0;
}

export function getCampaignTargets(id: string): CampaignTarget[] {
  const campaign = campaigns.find((c) => c.id === id);
  if (!campaign || campaign.targetCount === 0) return [];

  const department = campaign.department;
  const names = [
    { name: "Alice Smith", email: "alice.s@company.com", dept: "Marketing" },
    { name: "Bob Johnson", email: "bob.j@company.com", dept: "Engineering" },
    { name: "Charlie Brown", email: "charlie.b@company.com", dept: "Finance" },
    { name: "Diana Prince", email: "diana.p@company.com", dept: "Legal" },
    { name: "Ethan Hunt", email: "ethan.h@company.com", dept: "Operations" },
    { name: "Fiona Gallagher", email: "fiona.g@company.com", dept: "HR" },
    { name: "George Lucas", email: "george.l@company.com", dept: "Engineering" },
    { name: "Hannah Baker", email: "hannah.b@company.com", dept: "Marketing" },
    { name: "Ivan Petrov", email: "ivan.p@company.com", dept: "Finance" },
    { name: "Julia Roberts", email: "julia.r@company.com", dept: "Legal" },
  ];

  const matching = department === "All Departments"
    ? names
    : names.filter((n) => n.dept === department);

  const count = Math.min(campaign.targetCount, matching.length * 3);
  const targets: CampaignTarget[] = [];

  for (let i = 0; i < count; i++) {
    const person = matching[i % matching.length];
    const clicked = i < campaign.clickCount % (count || 1);
    const submitted = i < campaign.submissionCount % (count || 1);
    const reported = i < campaign.reportCount % (count || 1);
    targets.push({
      id: i + 1,
      name: person.name,
      email: person.email,
      department: person.dept,
      clicked,
      submitted,
      reported,
    });
  }

  return targets;
}

export function getCampaignActivities(id: string): CampaignActivity[] {
  const campaign = campaigns.find((c) => c.id === id);
  if (!campaign) return [];

  const activities: CampaignActivity[] = [
    {
      id: 1,
      type: "event",
      message: `Campaign "${campaign.name}" created by ${campaign.createdBy}`,
      time: "Campaign created",
      date: campaign.createdAt,
    },
  ];

  if (campaign.status !== "draft") {
    activities.push({
      id: 2,
      type: "sent",
      message: `Phishing emails sent to ${campaign.targetCount} employees in ${campaign.department}`,
      time: "Campaign launched",
      date: campaign.date,
    });
    activities.push({
      id: 3,
      type: "opened",
      message: `${campaign.openCount} employees opened the phishing email (${campaign.openRate} open rate)`,
      time: "Emails opened",
      date: campaign.date,
    });
    activities.push({
      id: 4,
      type: "clicked",
      message: `${campaign.clickCount} employees clicked the phishing link (${campaign.clickRate} click rate)`,
      time: "Links clicked",
      date: campaign.date,
    });
    activities.push({
      id: 5,
      type: "submitted",
      message: `${campaign.submissionCount} employees submitted credentials (${campaign.submissionRate} submission rate)`,
      time: "Credentials submitted",
      date: campaign.date,
    });
    activities.push({
      id: 6,
      type: "reported",
      message: `${campaign.reportCount} employees reported the phishing email (${campaign.reportRate} report rate)`,
      time: "Emails reported",
      date: campaign.date,
    });
  }

  if (campaign.status === "completed") {
    activities.push({
      id: 7,
      type: "event",
      message: `Campaign "${campaign.name}" completed`,
      time: "Campaign ended",
      date: campaign.endDate,
    });
  }

  return activities;
}
