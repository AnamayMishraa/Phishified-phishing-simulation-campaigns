import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  subtext?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ComponentType<{ className?: string }>;
}

export function StatCard({
  title,
  value,
  subtext,
  trend,
  icon: Icon,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-default-border bg-surface p-5 relative overflow-hidden transition-all duration-300 hover:border-accent-blue/20",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {title}
        </span>
        {Icon && (
          <div className="flex items-center justify-center size-8 rounded-lg bg-white/[0.03] text-text-secondary">
            <Icon className="size-4" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold font-mono text-text-primary">{value}</span>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded",
              trend.direction === "up" && "text-status-success bg-status-success/10",
              trend.direction === "down" && "text-status-danger bg-status-danger/10",
              trend.direction === "neutral" && "text-text-muted bg-white/[0.04]"
            )}
          >
            {trend.direction === "up" && <ArrowUpRight className="size-3" />}
            {trend.direction === "down" && <ArrowDownRight className="size-3" />}
            {trend.direction === "neutral" && <Minus className="size-3" />}
            {trend.value}
          </span>
        )}
      </div>
      {subtext && <p className="text-xs text-text-muted">{subtext}</p>}
    </div>
  );
}
