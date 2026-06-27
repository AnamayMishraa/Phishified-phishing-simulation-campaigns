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
