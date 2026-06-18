"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const { isCollapsed } = useSidebar();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-void">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-accent-blue-light" />
          <p className="text-xs text-text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-void text-text-primary">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out",
          isCollapsed ? "ml-[60px]" : "ml-[240px]"
        )}
      >
        <Header onOpenCommandPalette={() => setCommandOpen(true)} />
        <main id="main-content" className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </main>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#1a1a2e",
            color: "#e2e8f0",
            border: "1px solid #2a2a4a",
            fontSize: "13px",
          },
        }}
      />
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AuthProvider>
        <AppShell>{children}</AppShell>
      </AuthProvider>
    </SidebarProvider>
  );
}
