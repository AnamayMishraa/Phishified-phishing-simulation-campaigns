import * as React from "react";
import { cn } from "@/lib/utils";
import { campaignStatusConfig, type CampaignStatus } from "@/data/campaigns";

export type { CampaignStatus };

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
