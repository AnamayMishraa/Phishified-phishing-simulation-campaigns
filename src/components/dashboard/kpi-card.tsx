import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    trend: "up" | "down" | "neutral";
    label?: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: "blue" | "purple" | "cyan" | "green" | "amber";
  className?: string;
}

const accentMap = {
  blue: {
    iconBg: "bg-accent-blue/10",
    iconText: "text-accent-blue-light",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.08)]",
  },
  purple: {
    iconBg: "bg-accent-purple/10",
    iconText: "text-accent-purple-light",
    glow: "shadow-[0_0_20px_rgba(124,58,237,0.08)]",
  },
  cyan: {
    iconBg: "bg-accent-cyan/10",
    iconText: "text-accent-cyan-light",
    glow: "shadow-[0_0_20px_rgba(6,182,212,0.08)]",
  },
  green: {
    iconBg: "bg-status-success/10",
    iconText: "text-status-success",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.08)]",
  },
  amber: {
    iconBg: "bg-status-warning/10",
    iconText: "text-status-warning",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.08)]",
  },
};

const trendColors = {
  up: "text-status-success",
  down: "text-status-danger",
  neutral: "text-text-muted",
};

const TrendIcon = {
  up: TrendingUp,
  down: TrendingDown,
  neutral: Minus,
};

export function KpiCard({
  title,
  value,
  change,
  icon: Icon,
  accentColor = "blue",
  className,
}: KpiCardProps) {
  const accent = accentMap[accentColor];

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-default-border bg-surface p-5 transition-all duration-300 hover:border-accent-blue/20",
        accent.glow,
        className
      )}
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-accent-blue/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
            {title}
          </span>
          <div
            className={cn(
              "flex items-center justify-center size-9 rounded-lg transition-transform duration-300 group-hover:scale-105",
              accent.iconBg
            )}
          >
            <Icon className={cn("size-[18px]", accent.iconText)} />
          </div>
        </div>

        {/* Value */}
        <div className="mb-2">
          <span className="text-2xl font-bold tracking-tight text-text-primary font-mono">
            {value}
          </span>
        </div>

        {/* Change indicator */}
        {change && (
          <div className="flex items-center gap-1.5">
            {(() => {
              const TIcon = TrendIcon[change.trend];
              return (
                <TIcon
                  className={cn("size-3.5", trendColors[change.trend])}
                />
              );
            })()}
            <span
              className={cn("text-xs font-medium", trendColors[change.trend])}
            >
              {change.value}
            </span>
            {change.label && (
              <span className="text-xs text-text-muted">{change.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
