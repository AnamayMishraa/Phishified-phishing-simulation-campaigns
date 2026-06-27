export type CampaignStatus = "active" | "draft" | "completed" | "paused";
export type CampaignType = "Email" | "SMS" | "Voice" | "QR Code";

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
