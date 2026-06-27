import * as React from "react";
import { cn } from "@/lib/utils";

export type CampaignStatus = "active" | "draft" | "completed" | "paused";

const campaignStatusConfig: Record<
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

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: CampaignStatus;
}

export function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  const style = campaignStatusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors duration-200",
        style.bg,
        style.text,
        className
      )}
      {...props}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}
