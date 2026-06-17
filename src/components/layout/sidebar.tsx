"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { mainNavItems, bottomNavItems } from "@/lib/navigation";
import {
  Shield,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

function NavItem({
  item,
  isActive,
  isCollapsed,
}: {
  item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
        isCollapsed && "justify-center px-2",
        isActive
          ? "bg-accent-blue/10 text-accent-blue-light"
          : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-blue rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      )}
      <Icon
        className={cn(
          "shrink-0 size-[18px] transition-colors duration-200",
          isActive
            ? "text-accent-blue-light"
            : "text-text-muted group-hover:text-text-secondary"
        )}
      />
      {!isCollapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={linkContent} />
        <TooltipContent side="right" sideOffset={12}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-3",
          isCollapsed ? "justify-center" : "gap-2.5"
        )}
      >
        <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple shadow-[0_0_12px_rgba(59,130,246,0.3)]">
          <Shield className="size-4 text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              Phishified
            </span>
            <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">
              Security
            </span>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {!isCollapsed && (
          <div className="px-3 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Platform
            </span>
          </div>
        )}
        {mainNavItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-sidebar-border px-2 py-3 space-y-0.5">
        {bottomNavItems.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
            isCollapsed={isCollapsed}
          />
        ))}

        {/* User Profile */}
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 mt-2 transition-colors duration-200 cursor-pointer hover:bg-white/[0.04]",
            isCollapsed && "justify-center px-2"
          )}
        >
          <div className="relative shrink-0">
            <div className="size-7 rounded-full bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center text-[11px] font-semibold text-white">
              JD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 size-2.5 bg-status-success rounded-full border-2 border-sidebar" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">
                Jane Doe
              </p>
              <p className="text-[10px] text-text-muted truncate">
                SOC Analyst
              </p>
            </div>
          )}
          {!isCollapsed && (
            <ChevronDown className="size-3.5 text-text-muted shrink-0" />
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={toggle}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-muted transition-colors duration-200 hover:bg-white/[0.04] hover:text-text-secondary",
            isCollapsed && "justify-center px-2"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeft className="size-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="size-[18px]" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
