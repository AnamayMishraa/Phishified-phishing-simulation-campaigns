import * as React from "react";
import { cn } from "@/lib/utils";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: "blue" | "purple" | "cyan" | "none";
  hoverEffect?: boolean;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, glowColor = "none", hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-panel rounded-xl p-5 relative overflow-hidden transition-all duration-300",
          glowColor === "blue" && "glow-blue",
          glowColor === "purple" && "glow-purple",
          glowColor === "cyan" && "glow-cyan",
          hoverEffect && "hover:border-accent-blue/20 hover:bg-white/[0.02]",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);

GlassPanel.displayName = "GlassPanel";
