"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 inset-x-0 z-50 h-16 border-b transition-all duration-300",
        scrolled
          ? "border-default-border bg-void/80 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="max-w-5xl mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple shadow-[0_0_12px_rgba(59,130,246,0.3)]">
            <Shield className="size-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              Phishified
            </span>
            <span className="text-[9px] font-medium text-text-muted uppercase tracking-widest">
              Security awareness
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-text-secondary">
          <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
          <a href="/dashboard" className="hover:text-text-primary transition-colors">Platform Dashboard</a>
        </div>

        <div>
          <Link href="/dashboard">
            <GlowButton glowColor="blue" size="sm" className="text-xs font-semibold">
              Console Dashboard
            </GlowButton>
          </Link>
        </div>
      </div>
    </nav>
  );
}
