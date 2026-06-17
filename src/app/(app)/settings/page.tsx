import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, Palette, Key, Users } from "lucide-react";

export const metadata = {
  title: "Settings — Phishified",
  description: "Configure your account, notifications, and security preferences.",
};

const sections = [
  {
    icon: User,
    title: "Profile",
    description: "Manage your account details and preferences",
    color: "text-accent-blue-light",
    bg: "bg-accent-blue/10",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Configure email and alert preferences",
    color: "text-accent-purple-light",
    bg: "bg-accent-purple/10",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Two-factor authentication and session management",
    color: "text-status-success",
    bg: "bg-status-success/10",
  },
  {
    icon: Palette,
    title: "Appearance",
    description: "Customize the interface theme and layout",
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
  },
  {
    icon: Key,
    title: "API Keys",
    description: "Manage integration API tokens",
    color: "text-status-warning",
    bg: "bg-status-warning/10",
  },
  {
    icon: Users,
    title: "Team",
    description: "Manage team members and permissions",
    color: "text-status-danger",
    bg: "bg-status-danger/10",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Settings"
        description="Configure your account, notifications, and security preferences"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <button
            key={section.title}
            className="flex items-start gap-4 p-4 border border-default-border bg-surface rounded-xl hover:border-accent-blue/20 transition-all duration-200 text-left"
          >
            <div className={`flex items-center justify-center size-10 rounded-lg ${section.bg} shrink-0`}>
              <section.icon className={`size-5 ${section.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary">{section.title}</h3>
              <p className="text-xs text-text-muted mt-1">{section.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
