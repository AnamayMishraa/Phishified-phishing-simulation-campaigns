"use client";

import { usePathname } from "next/navigation";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { routeLabels } from "@/lib/navigation";
import { Search, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({
  onOpenCommandPalette,
}: {
  onOpenCommandPalette: () => void;
}) {
  const pathname = usePathname();
  const { isCollapsed } = useSidebar();

  const segments = pathname.split("/").filter(Boolean);
  const currentPage =
    routeLabels[pathname] || segments[segments.length - 1] || "Dashboard";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between border-b border-default-border bg-void/80 backdrop-blur-xl px-6 transition-all duration-300",
        isCollapsed ? "ml-[60px]" : "ml-[240px]"
      )}
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm min-w-0 overflow-hidden">
        <span className="text-text-muted shrink-0">Phishified</span>
        <ChevronRight className="size-3.5 text-text-muted shrink-0" />
        <span className="font-medium text-text-primary truncate">{currentPage}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 rounded-lg border border-default-border bg-surface px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-accent-blue/30 hover:text-text-secondary"
        >
          <Search className="size-3.5" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-default-border bg-elevated px-1.5 py-0.5 text-[10px] font-mono text-text-muted">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative text-text-muted hover:text-text-primary"
        >
          <Bell className="size-[18px]" />
          <span className="absolute top-1.5 right-1.5 size-2 bg-accent-blue rounded-full animate-glow-pulse" />
        </Button>
      </div>
    </header>
  );
}
