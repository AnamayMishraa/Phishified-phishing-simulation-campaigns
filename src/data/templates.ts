export interface Template {
  id: string;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  rating: string;
  description: string;
  author: string;
  uses: number;
  createdAt: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  emailBody: string;
  clickRate: string;
  successRate: string;
}

export interface TemplateStats {
  totalCampaigns: number;
  averageClickRate: string;
  averageReportRate: string;
  lastUsed: string;
}

export function getTemplateById(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter((t) => t.category === category);
}

export function getCategories(): string[] {
  return [...new Set(templates.map((t) => t.category))];
}

export function getTemplateStats(id: string): TemplateStats | null {
  const template = templates.find((t) => t.id === id);
  if (!template) return null;

  const rates = [
    { click: "12.4%", report: "38.2%" },
    { click: "28.1%", report: "22.5%" },
    { click: "8.5%", report: "45.1%" },
    { click: "15.7%", report: "31.4%" },
    { click: "6.7%", report: "62.3%" },
    { click: "23.9%", report: "29.7%" },
    { click: "15.0%", report: "30.9%" },
    { click: "12.0%", report: "30.0%" },
  ];
  const idx = parseInt(id) % rates.length;
  return {
    totalCampaigns: Math.floor(Math.random() * 15) + 3,
    averageClickRate: rates[idx].click,
    averageReportRate: rates[idx].report,
    lastUsed: ["2026-06-15", "2026-06-10", "2026-06-05", "2026-05-28"][idx % 4],
  };
}

export const templates: Template[] = [
  {
    id: "1",
    name: "Urgent Microsoft Password Reset",
    category: "Credential Harvesting",
    difficulty: "Medium",
    rating: "4.8",
    description: "Simulates an urgent Microsoft 365 password expiration notice with a fake login portal and credential capture form. Widely used for enterprise security awareness testing and highly effective against distracted employees.",
    author: "Phishified AI",
    uses: 1240,
    createdAt: "2026-01-15",
    senderName: "Microsoft Security Center",
    senderEmail: "security@microsoft-security.com",
    subject: "[ACTION REQUIRED] Your password will expire in 24 hours",
    emailBody: `Dear Valued User,

Your Microsoft 365 password is set to expire in less than 24 hours. To avoid interruption of service, you must verify your credentials immediately.

Click the link below to complete the verification process:
🔗 Verify Your Account → https://login-microsoft-secure.com/verify

Failure to verify within 24 hours will result in permanent account suspension.

This is an automated security notification. Do not reply to this email.

© Microsoft Corporation 2026. All rights reserved.`,
    clickRate: "28.1%",
    successRate: "12.4%",
  },
  {
    id: "2",
    name: "Q4 HR Benefits Policy Change",
    category: "Link Click",
    difficulty: "Easy",
    rating: "4.5",
    description: "Fake HR benefits update notification with embedded tracking link. Tests employee susceptibility to internal-looking communications with official branding and realistic HR language.",
    author: "Marcus Chen",
    uses: 890,
    createdAt: "2026-02-20",
    senderName: "HR Benefits Team",
    senderEmail: "benefits@company-hr-portal.com",
    subject: "Important: Q4 Benefits Policy Changes Require Your Review",
    emailBody: `Hello,

The HR Benefits Team has published important updates to our Q4 benefits policy that may affect your current coverage selections.

Please review and acknowledge the updated policy documents at your earliest convenience:
📄 Review Benefits Changes → https://company-benefits-portal.com/q4-review

All employees must acknowledge these changes by the end of this quarter to maintain active benefits enrollment.

Thank you,
HR Benefits Team`,
    clickRate: "12.4%",
    successRate: "9.3%",
  },
  {
    id: "3",
    name: "Outstanding Invoice #892",
    category: "Attachment",
    difficulty: "Hard",
    rating: "4.9",
    description: "Sophisticated invoice-themed email with malicious PDF attachment. Tests advanced threat detection and reporting behavior in finance and operations teams.",
    author: "Phishified AI",
    uses: 2100,
    createdAt: "2025-12-01",
    senderName: "AP Automation",
    senderEmail: "invoices@ap-automation-system.net",
    subject: "Invoice #892 — Payment Overdue — Please Review Attached",
    emailBody: `Dear Accounts Payable,

Our records indicate that Invoice #892 in the amount of $47,832.00 is now 14 days past due.

Please review the attached PDF invoice summary and process payment at your earliest convenience to avoid service interruption.

📎 Invoice_892_Overdue_Summary.pdf (encrypted)

Payment Portal: https://vendor-payment-portal.com/invoice/892

If payment has already been submitted, please disregard this notice.

Regards,
AP Automation Billing`,
    clickRate: "8.5%",
    successRate: "3.7%",
  },
  {
    id: "4",
    name: "Google Docs Shared Document",
    category: "Credential Harvesting",
    difficulty: "Easy",
    rating: "4.3",
    description: "Google Workspace collaboration notification with credential harvesting link hidden behind a 'View Document' button. Tests cloud service phishing awareness.",
    author: "Marcus Chen",
    uses: 760,
    createdAt: "2026-03-10",
    senderName: "Google Docs",
    senderEmail: "docs@google-docs-share.com",
    subject: "Sarah shared a document with you",
    emailBody: `Sarah Chen has invited you to view the following document:

📄 Q2_Marketing_Strategy_2026.pptx

Sarah wrote:
"Hey team, I've updated the Q2 strategy deck with the new campaign metrics. Please review and add your comments before Friday's presentation."

Open in Google Docs:
🔗 View Document → https://docs-google-share.com/view/Q2-strategy

This share notification was sent to your company email. You can adjust sharing notifications in your Google Docs settings.

—
Google Docs`,
    clickRate: "15.7%",
    successRate: "10.6%",
  },
  {
    id: "5",
    name: "Docusign Signature Request",
    category: "Link Click",
    difficulty: "Medium",
    rating: "4.7",
    description: "Fake electronic signature request from DocuSign with urgent callback language. Tests employee response to common business workflow notifications across departments.",
    author: "Phishified AI",
    uses: 1580,
    createdAt: "2026-01-28",
    senderName: "DocuSign Notification",
    senderEmail: "notifications@docusign-esignature.com",
    subject: "Urgent: Please sign Document NDA-2026-342",
    emailBody: `You have a document awaiting your signature.

Document: NDA-2026-342 — Mutual Non-Disclosure Agreement
Sender: Legal Department
Deadline: 48 hours

Please review and sign using the secure link below:
✍️ Review & Sign → https://docusign-esignature.com/sign/NDA-2026-342

This document requires your immediate attention. Failure to sign by the deadline may result in delayed project onboarding.

—
DocuSign Electronic Signature Service`,
    clickRate: "23.9%",
    successRate: "12.3%",
  },
  {
    id: "6",
    name: "Zoom Meeting Invitation",
    category: "Link Click",
    difficulty: "Easy",
    rating: "4.1",
    description: "Fake Zoom meeting invitation with malicious join link. Tests susceptibility to calendar-based social engineering and meeting notification fatigue.",
    author: "Jane Doe",
    uses: 420,
    createdAt: "2026-04-05",
    senderName: "Zoom Notifications",
    senderEmail: "no-reply@zoom-meeting-invites.net",
    subject: "Reminder: Meeting 'Q2 Strategy' starts in 15 minutes",
    emailBody: `Hello,

Your scheduled Zoom meeting is about to begin.

Meeting: Q2 Strategy Review — All Hands
Start Time: 2:00 PM (15 minutes)
Duration: 60 minutes
Host: Marcus Chen

Join the meeting:
🔗 Join Zoom Meeting → https://zoom-meeting-join.com/room/234-567-890

Meeting ID: 234 567 890
Passcode: 7a2k9p

One tap mobile: +1 555 123 4567

—
Zoom Video Communications`,
    clickRate: "22.3%",
    successRate: "12.1%",
  },
  {
    id: "7",
    name: "FedEx Package Tracking",
    category: "Link Click",
    difficulty: "Medium",
    rating: "4.6",
    description: "Fake package delivery notification with tracking link. Targets recurring high-volume package recipients during holiday seasons using delivery anxiety.",
    author: "Phishified AI",
    uses: 950,
    createdAt: "2026-03-20",
    senderName: "FedEx Delivery Services",
    senderEmail: "tracking@fedex-delivery-updates.com",
    subject: "Delivery Attempt Failed — Reschedule Delivery",
    emailBody: `Dear Customer,

FedEx attempted to deliver your package (Tracking #7823 4901 2837 4) but was unable to complete the delivery.

Reason: No one was available to receive the package.

Next Steps:
📦 Reschedule Delivery → https://fedex-reschedule-delivery.com/track/7823490128374

Please reschedule within 72 hours to avoid the package being returned to sender.

Thank you,
FedEx Customer Service`,
    clickRate: "15.0%",
    successRate: "11.5%",
  },
  {
    id: "8",
    name: "LinkedIn Professional Network",
    category: "Link Click",
    difficulty: "Easy",
    rating: "4.2",
    description: "Fake LinkedIn notification about profile views, connection requests, or InMail messages. Tests social engineering through professional network impersonation.",
    author: "Marcus Chen",
    uses: 680,
    createdAt: "2026-04-15",
    senderName: "LinkedIn Notifications",
    senderEmail: "notifications@linkedin-network-alerts.com",
    subject: "You have 5 new profile views this week",
    emailBody: `Hi there,

Your professional profile is gaining traction! Here's your weekly update:

👀 5 new profile views
🔗 3 new connection requests
💬 2 new messages

See who's viewed your profile:
🔍 View My Insights → https://linkedin-profile-views.com/insights

Upgrade to Premium to see full details and unlock who's viewing your profile.

—
LinkedIn Professional Network`,
    clickRate: "12.0%",
    successRate: "9.0%",
  },
  {
    id: "9",
    name: "IRS Tax Refund Notification",
    category: "Credential Harvesting",
    difficulty: "Hard",
    rating: "4.9",
    description: "Sophisticated IRS tax refund notification with official government branding. High-stakes scenario testing response to financial incentive-based phishing during tax season.",
    author: "Phishified AI",
    uses: 320,
    createdAt: "2025-11-15",
    senderName: "IRS Tax Refund Processing",
    senderEmail: "refunds@irs-tax-processing.gov",
    subject: "Tax Refund Available — Confirm Direct Deposit",
    emailBody: `Dear Taxpayer,

The Internal Revenue Service has processed your 2025 tax return and you are eligible for a refund of $1,284.00.

Your refund is pending release to your registered account. To complete the deposit, please verify your direct deposit information:

💰 Confirm Deposit → https://irs-tax-refund-processing.gov/confirm/REF-2025-7823

Funds will be deposited within 3-5 business days after verification.

Sincerely,
IRS Tax Refund Processing Center

This is an automated message from the IRS. Do not reply to this email.`,
    clickRate: "6.7%",
    successRate: "2.2%",
  },
  {
    id: "10",
    name: "Company Holiday Party RSVP",
    category: "Link Click",
    difficulty: "Easy",
    rating: "4.0",
    description: "Fake company holiday party invitation with RSVP link. Tests social engineering through exciting internal events where employees let their guard down.",
    author: "Jane Doe",
    uses: 510,
    createdAt: "2025-12-01",
    senderName: "Events Committee",
    senderEmail: "events@company-holiday-invite.com",
    subject: "You're Invited: Annual Company Holiday Party!",
    emailBody: `You're invited to the Annual Company Holiday Party!

🎄 Date: Friday, December 20th
🕒 Time: 6:00 PM — 11:00 PM
📍 Venue: The Grand Ballroom, Downtown

Join your colleagues for an evening of celebration, dinner, and entertainment. Plus, exclusive gift bags for all attendees!

Please RSVP by December 10th:
🎉 Confirm Attendance → https://company-holiday-rsvp.com/confirm

We look forward to celebrating with you!

Warmly,
The Events Committee`,
    clickRate: "18.5%",
    successRate: "8.2%",
  },
  {
    id: "11",
    name: "SaaS License Renewal Notice",
    category: "Link Click",
    difficulty: "Medium",
    rating: "4.4",
    description: "Fake SaaS license renewal notification urging immediate payment. Targets department managers who manage software subscriptions and budgets.",
    author: "Marcus Chen",
    uses: 380,
    createdAt: "2026-05-01",
    senderName: "Software Licensing Team",
    senderEmail: "licensing@software-renewal-portal.com",
    subject: "[LICENSE RENEWAL] 3 licenses expiring — immediate action required",
    emailBody: `Dear Manager,

Our records indicate that the following software licenses under your management are expiring within 7 days:

• Adobe Creative Cloud (2 seats) — Expires Jun 24
• Jira Premium (1 seat) — Expires Jun 20
• Slack Enterprise (1 seat) — Expires Jun 22

To avoid disruption of service, please review and approve the renewal:
🔄 Renew Licenses → https://software-renewal-portal.com/renew/MGR-3847

Total estimated renewal cost: $3,240/year

If these licenses are no longer needed, please submit a deprovisioning request.

—
Software Asset Management`,
    clickRate: "8.5%",
    successRate: "3.7%",
  },
  {
    id: "12",
    name: "CEO Directive: Urgent Compliance",
    category: "Credential Harvesting",
    difficulty: "Hard",
    rating: "4.8",
    description: "Advanced CEO fraud template combining authority pressure with compliance urgency. Uses executive branding and legal jargon to bypass scrutiny from experienced employees.",
    author: "Phishified AI",
    uses: 190,
    createdAt: "2026-02-10",
    senderName: "CEO Office",
    senderEmail: "ceo@company-executive-office.com",
    subject: "CONFIDENTIAL: Urgent Compliance Directive — Action Required",
    emailBody: `CONFIDENTIAL — FOR YOUR EYES ONLY

To: All Department Heads
From: Office of the CEO
Subject: Urgent Compliance Directive

Team,

Following our latest security audit, we have identified several compliance gaps that require immediate attention. The board has requested that all department heads complete the following by EOD Friday:

Please review and acknowledge the attached directive:
🔐 Review Directive → https://company-compliance-portal.com/acknowledge/DIR-2026-07

This is a time-sensitive matter that requires your personal attention. Do not delegate.

Your prompt response is appreciated.

Regards,
Sarah Chen
Chief Executive Officer`,
    clickRate: "6.7%",
    successRate: "2.2%",
  },
];
