"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Plus,
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const actions = [
  {
    label: "New Campaign",
    description: "Launch a phishing simulation",
    href: "/campaigns/new",
    icon: Plus,
    accentColor: "from-accent-blue/20 to-accent-blue/5",
    iconColor: "text-accent-blue-light",
  },
  {
    label: "Import Employees",
    description: "Add employees from CSV or HRIS",
    href: "/employees/import",
    icon: Upload,
    accentColor: "from-accent-purple/20 to-accent-purple/5",
    iconColor: "text-accent-purple-light",
  },
  {
    label: "View Reports",
    description: "Generate compliance reports",
    href: "/reports",
    icon: FileText,
    accentColor: "from-accent-cyan/20 to-accent-cyan/5",
    iconColor: "text-accent-cyan-light",
  },
  {
    label: "AI Analysis",
    description: "Get AI-powered risk insights",
    href: "/ai-assistant",
    icon: Sparkles,
    accentColor: "from-status-warning/20 to-status-warning/5",
    iconColor: "text-status-warning",
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">
          Quick Actions
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Common tasks and shortcuts
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              "group flex flex-col gap-2 rounded-lg border border-default-border p-3.5 transition-all duration-200",
              "hover:border-accent-blue/20 hover:bg-white/[0.02]"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center size-9 rounded-lg bg-gradient-to-br",
                action.accentColor
              )}
            >
              <action.icon className={cn("size-[18px]", action.iconColor)} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-text-primary">
                  {action.label}
                </span>
                <ArrowRight className="size-3 text-text-muted opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
              </div>
              <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
