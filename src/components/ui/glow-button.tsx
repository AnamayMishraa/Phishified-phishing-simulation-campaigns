import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface GlowButtonProps extends React.ComponentProps<typeof Button> {
  glowColor?: "blue" | "purple" | "cyan";
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ className, glowColor = "blue", children, ...props }, ref) => {
    const glowClass = {
      blue: "hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] border-accent-blue/30 text-accent-blue-light hover:bg-accent-blue/10",
      purple: "hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] border-accent-purple/30 text-accent-purple-light hover:bg-accent-purple/10",
      cyan: "hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] border-accent-cyan/30 text-accent-cyan-light hover:bg-accent-cyan/10",
    }[glowColor];

    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden border bg-surface transition-all duration-300",
          glowClass,
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        <span className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 transition-opacity duration-300 group-hover/button:opacity-100" />
      </Button>
    );
  }
);

GlowButton.displayName = "GlowButton";
