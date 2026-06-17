export type LandingPageCategory = "Auth Portal" | "Corporate Page" | "Landing Page";

export interface LandingPage {
  id: number;
  name: string;
  url: string;
  category: LandingPageCategory;
  visitors: number;
  credentialsEntered: number;
  createdAt: string;
  conversionRate: string;
  templateName: string;
  brand: string;
  status: "active" | "inactive";
  fieldCount: number;
  bounceRate: string;
  avgSessionDuration: string;
  pageContent: string;
}

export interface VisitorHistoryPoint {
  date: string;
  visitors: number;
  submissions: number;
}

export interface LandingPageStats {
  totalCampaigns: number;
  avgConversion: string;
  peakVisitors: number;
  lastActive: string;
}

export function getLandingPageById(id: number): LandingPage | undefined {
  return landingPages.find((p) => p.id === id);
}

export function getLandingPagesByCategory(category: LandingPageCategory): LandingPage[] {
  return landingPages.filter((p) => p.category === category);
}

export function getLandingPageStats(id: number): LandingPageStats | null {
  const page = landingPages.find((p) => p.id === id);
  if (!page) return null;

  const campaigns = ["Q4 Benefits Update", "Password Reset Urgent", "Zoom Pro Account Suspension", "Google Workspace Alert"];
  return {
    totalCampaigns: (id % 4) + 2,
    avgConversion: page.conversionRate,
    peakVisitors: Math.round(page.visitors * 1.4),
    lastActive: ["2026-06-15", "2026-06-10", "2026-06-05", "2026-05-28"][id % 4],
  };
}

export function getVisitorHistory(id: number): VisitorHistoryPoint[] {
  const base = (id % 5) * 10;
  return [
    { date: "Week 1", visitors: Math.max(5, base + 10), submissions: Math.max(1, base + 2) },
    { date: "Week 2", visitors: Math.max(8, base + 25), submissions: Math.max(2, base + 5) },
    { date: "Week 3", visitors: Math.max(12, base + 40), submissions: Math.max(3, base + 8) },
    { date: "Week 4", visitors: Math.max(15, base + 55), submissions: Math.max(4, base + 12) },
  ];
}

export const landingPages: LandingPage[] = [
  {
    id: 1,
    name: "Microsoft 365 Login",
    url: "/login/m365",
    category: "Auth Portal",
    visitors: 340,
    credentialsEntered: 42,
    createdAt: "2026-01-15",
    conversionRate: "12.4%",
    templateName: "Microsoft 365 Clone",
    brand: "Microsoft",
    status: "active",
    fieldCount: 3,
    bounceRate: "38.2%",
    avgSessionDuration: "1m 24s",
    pageContent: `<div style="max-width:400px;margin:40px auto;padding:24px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.15);text-align:center;">
  <img src="/microsoft-logo.png" alt="Microsoft" style="height:36px;margin-bottom:24px;" />
  <h2 style="font-size:18px;margin-bottom:4px;color:#1a1a2e;">Sign in to your account</h2>
  <p style="font-size:13px;color:#666;margin-bottom:24px;">Enter your credentials to continue</p>
  <input placeholder="Email, phone, or Skype" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input type="password" placeholder="Password" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <button style="width:100%;padding:10px;background:#0067b8;color:white;border:none;border-radius:4px;font-size:14px;cursor:pointer;">Sign in</button>
</div>`,
  },
  {
    id: 2,
    name: "Google Workspace Portal",
    url: "/login/gsuite",
    category: "Auth Portal",
    visitors: 110,
    credentialsEntered: 15,
    createdAt: "2026-02-20",
    conversionRate: "13.6%",
    templateName: "Google Workspace Clone",
    brand: "Google",
    status: "active",
    fieldCount: 2,
    bounceRate: "42.1%",
    avgSessionDuration: "2m 05s",
    pageContent: `<div style="max-width:400px;margin:40px auto;padding:24px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.15);text-align:center;">
  <img src="/google-logo.png" alt="Google" style="height:32px;margin-bottom:24px;" />
  <h2 style="font-size:20px;margin-bottom:4px;color:#202124;">Sign in</h2>
  <p style="font-size:13px;color:#5f6368;margin-bottom:24px;">Use your Google Account</p>
  <input placeholder="Email or phone" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input type="password" placeholder="Password" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <button style="width:100%;padding:10px;background:#1a73e8;color:white;border:none;border-radius:4px;font-size:14px;cursor:pointer;">Next</button>
</div>`,
  },
  {
    id: 3,
    name: "HR Portal Benefits",
    url: "/benefits/claim",
    category: "Corporate Page",
    visitors: 89,
    credentialsEntered: 0,
    createdAt: "2026-03-10",
    conversionRate: "0%",
    templateName: "Corporate Portal",
    brand: "Internal",
    status: "inactive",
    fieldCount: 4,
    bounceRate: "65.3%",
    avgSessionDuration: "45s",
    pageContent: `<div style="max-width:500px;margin:40px auto;padding:24px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.15);">
  <h2 style="font-size:18px;color:#1a1a2e;margin-bottom:4px;">Employee Benefits Portal</h2>
  <p style="font-size:13px;color:#666;margin-bottom:20px;">Please log in to access your benefits information</p>
  <input placeholder="Employee ID" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input placeholder="Full Name" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input type="password" placeholder="Date of Birth (MM/DD/YYYY)" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <button style="width:100%;padding:10px;background:#2d6a4f;color:white;border:none;border-radius:4px;font-size:14px;cursor:pointer;">Sign In</button>
</div>`,
  },
  {
    id: 4,
    name: "Docusign Document Review",
    url: "/doc/review",
    category: "Landing Page",
    visitors: 220,
    credentialsEntered: 28,
    createdAt: "2026-04-05",
    conversionRate: "12.7%",
    templateName: "Docusign Clone",
    brand: "DocuSign",
    status: "active",
    fieldCount: 2,
    bounceRate: "35.8%",
    avgSessionDuration: "3m 12s",
    pageContent: `<div style="max-width:500px;margin:40px auto;padding:24px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.15);">
  <div style="text-align:center;margin-bottom:24px;">
    <h2 style="font-size:18px;color:#1a1a2e;margin-bottom:4px;">Review & Sign Document</h2>
    <p style="font-size:13px;color:#666;">Document NDA-2026-342 requires your signature</p>
  </div>
  <div style="background:#f5f5f5;padding:16px;border-radius:6px;margin-bottom:16px;font-size:12px;color:#333;">
    <p><strong>Document:</strong> Mutual Non-Disclosure Agreement</p>
    <p><strong>From:</strong> Legal Department</p>
    <p><strong>Status:</strong> Awaiting Your Signature</p>
  </div>
  <input placeholder="Full Name" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input placeholder="Email Address" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <button style="width:100%;padding:10px;background:#00a3e0;color:white;border:none;border-radius:4px;font-size:14px;cursor:pointer;">Review & Sign</button>
</div>`,
  },
  {
    id: 5,
    name: "Slack Sign-in Gateway",
    url: "/slack/oauth",
    category: "Auth Portal",
    visitors: 45,
    credentialsEntered: 4,
    createdAt: "2026-05-12",
    conversionRate: "8.9%",
    templateName: "Slack Clone",
    brand: "Slack",
    status: "active",
    fieldCount: 2,
    bounceRate: "48.7%",
    avgSessionDuration: "1m 08s",
    pageContent: `<div style="max-width:400px;margin:40px auto;padding:24px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.15);text-align:center;">
  <h2 style="font-size:20px;color:#1a1a2e;margin-bottom:4px;">Sign in to Slack</h2>
  <p style="font-size:13px;color:#666;margin-bottom:24px;">Enter your workspace credentials</p>
  <input placeholder="name@company.com" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input type="password" placeholder="Password" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <button style="width:100%;padding:10px;background:#611f69;color:white;border:none;border-radius:4px;font-size:14px;cursor:pointer;">Sign In</button>
</div>`,
  },
  {
    id: 6,
    name: "Confluence Wiki Login",
    url: "/wiki/auth",
    category: "Auth Portal",
    visitors: 78,
    credentialsEntered: 11,
    createdAt: "2026-03-28",
    conversionRate: "14.1%",
    templateName: "Confluence Clone",
    brand: "Atlassian",
    status: "active",
    fieldCount: 2,
    bounceRate: "40.2%",
    avgSessionDuration: "1m 45s",
    pageContent: `<div style="max-width:400px;margin:40px auto;padding:24px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.15);">
  <h2 style="font-size:18px;color:#1a1a2e;margin-bottom:4px;text-align:center;">Confluence</h2>
  <p style="font-size:13px;color:#666;margin-bottom:24px;text-align:center;">Log in to access your team's workspace</p>
  <input placeholder="Email" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input type="password" placeholder="Password" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <button style="width:100%;padding:10px;background:#0052cc;color:white;border:none;border-radius:4px;font-size:14px;cursor:pointer;">Log in</button>
</div>`,
  },
  {
    id: 7,
    name: "VPN Access Portal",
    url: "/vpn/onboarding",
    category: "Corporate Page",
    visitors: 56,
    credentialsEntered: 8,
    createdAt: "2026-04-20",
    conversionRate: "14.3%",
    templateName: "Corporate Portal",
    brand: "Internal",
    status: "active",
    fieldCount: 3,
    bounceRate: "44.5%",
    avgSessionDuration: "2m 30s",
    pageContent: `<div style="max-width:450px;margin:40px auto;padding:24px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.15);">
  <h2 style="font-size:18px;color:#1a1a2e;margin-bottom:4px;">VPN Access Portal</h2>
  <p style="font-size:13px;color:#666;margin-bottom:20px;">Authenticate to connect to the corporate network</p>
  <input placeholder="Username" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input type="password" placeholder="Password" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input placeholder="2FA Code" style="width:100%;padding:10px;margin-bottom:16px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <button style="width:100%;padding:10px;background:#e65100;color:white;border:none;border-radius:4px;font-size:14px;cursor:pointer;">Connect</button>
</div>`,
  },
  {
    id: 8,
    name: "AWS Console Login",
    url: "/aws/console",
    category: "Auth Portal",
    visitors: 195,
    credentialsEntered: 31,
    createdAt: "2026-05-05",
    conversionRate: "15.9%",
    templateName: "AWS Clone",
    brand: "Amazon",
    status: "active",
    fieldCount: 3,
    bounceRate: "32.1%",
    avgSessionDuration: "2m 55s",
    pageContent: `<div style="max-width:400px;margin:40px auto;padding:24px;border-radius:8px;box-shadow:0 2px 12px rgba(0,0,0,0.15);">
  <h2 style="font-size:18px;color:#1a1a2e;margin-bottom:4px;text-align:center;">AWS Management Console</h2>
  <p style="font-size:13px;color:#666;margin-bottom:24px;text-align:center;">Sign in to your account</p>
  <input placeholder="Account ID (12 digits)" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input placeholder="IAM username" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <input type="password" placeholder="Password" style="width:100%;padding:10px;margin-bottom:12px;border:1px solid #ddd;border-radius:4px;font-size:14px;" />
  <button style="width:100%;padding:10px;background:#ff9900;color:#1a1a2e;border:none;border-radius:4px;font-size:14px;cursor:pointer;">Sign in</button>
</div>`,
  },
];
