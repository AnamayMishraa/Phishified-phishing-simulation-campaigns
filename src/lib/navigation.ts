import {
  LayoutDashboard,
  Crosshair,
  Mail,
  Globe,
  Users,
  BarChart3,
  FileText,
  GraduationCap,
  Bot,
  Settings,
  Building2,
  Plus,
  Upload,
  Sparkles,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Campaigns", href: "/campaigns", icon: Crosshair },
  { label: "Email Templates", href: "/templates", icon: Mail },
  { label: "Landing Pages", href: "/landing-pages", icon: Globe },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Training", href: "/training", icon: GraduationCap },
  { label: "AI Assistant", href: "/ai-assistant", icon: Bot },
];

export const bottomNavItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Organization", href: "/settings/organization", icon: Building2 },
];

export const allNavItems: NavItem[] = [...mainNavItems, ...bottomNavItems];

export const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/campaigns": "Campaigns",
  "/templates": "Email Templates",
  "/landing-pages": "Landing Pages",
  "/employees": "Employees",
  "/employees/leaderboard": "Leaderboard",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/training": "Training",
  "/ai-assistant": "AI Assistant",
  "/settings": "Settings",
  "/settings/organization": "Organization Settings",
  "/settings/infrastructure": "Infrastructure Settings",
};

export const quickActions: NavItem[] = [
  { label: "New Campaign", href: "/campaigns/new", icon: Plus },
  { label: "Import Employees", href: "/employees/import", icon: Upload },
  { label: "AI Risk Analysis", href: "/ai-assistant", icon: Sparkles },
];

export const settingsNavItems: NavItem[] = [
  { label: "General Config", href: "/settings", icon: Settings },
  { label: "Organization Profile", href: "/settings/organization", icon: Building2 },
];
