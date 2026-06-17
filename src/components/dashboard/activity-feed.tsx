"use client";

import { cn } from "@/lib/utils";
import {
  MousePointerClick,
  AlertTriangle,
  ShieldCheck,
  Mail,
  UserPlus,
  Clock,
} from "lucide-react";
import { activities } from "@/data/activity";

const typeConfig = {
  click: {
    icon: MousePointerClick,
    color: "text-status-danger",
    bg: "bg-status-danger/10",
  },
  report: {
    icon: ShieldCheck,
    color: "text-status-success",
    bg: "bg-status-success/10",
  },
  campaign: {
    icon: Mail,
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
  },
  training: {
    icon: Clock,
    color: "text-accent-purple-light",
    bg: "bg-accent-purple/10",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-status-warning",
    bg: "bg-status-warning/10",
  },
  employee: {
    icon: UserPlus,
    color: "text-accent-cyan",
    bg: "bg-accent-cyan/10",
  },
};

export function ActivityFeed() {
  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Recent Activity
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Live feed from active campaigns
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-status-success" />
          </span>
          <span className="text-xs text-status-success font-medium">Live</span>
        </div>
      </div>

      <div className="space-y-1">
        {activities.map((activity, index) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-200 hover:bg-white/[0.02]",
                index === 0 && "animate-slide-up"
              )}
            >
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center size-8 rounded-lg mt-0.5",
                  config.bg
                )}
              >
                <Icon className={cn("size-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-secondary leading-relaxed">
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-medium text-text-muted">
                    {activity.department}
                  </span>
                  <span className="text-[10px] text-text-muted/50">•</span>
                  <span className="text-[10px] text-text-muted">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
