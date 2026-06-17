"use client";

import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";
import { GlowButton } from "@/components/ui/glow-button";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-[-20%] left-[-10%] size-[500px] rounded-full bg-accent-blue/10 blur-[120px] pointer-events-none animate-orb-float" />
      <div className="absolute bottom-[-10%] right-[-5%] size-[600px] rounded-full bg-accent-purple/10 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-8 relative z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-blue/30 bg-accent-blue/5 px-3 py-1 text-xs font-medium text-accent-blue-light animate-fade-in">
          <ShieldAlert className="size-3.5" /> Platform Release v2026.1
        </span>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-text-primary max-w-3xl leading-[1.1] font-sans">
          AI-Powered Phishing Simulations. <br />
          <span className="gradient-text">Built for Enterprise SOCs.</span>
        </h1>

        <p className="text-sm sm:text-base text-text-secondary max-w-2xl leading-relaxed">
          Phishified trains your workforce to identify social engineering before threats reach your inbox. Continuous AI-driven drills with high-fidelity telemetry.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <GlowButton glowColor="purple" className="w-full text-xs font-semibold px-6 py-2.5">
              Launch Dashboard <ArrowRight className="size-4" />
            </GlowButton>
          </Link>
          <button className="px-6 py-2.5 rounded-lg border border-default-border bg-surface text-xs font-semibold text-text-secondary hover:text-text-primary transition-all duration-300 cursor-pointer">
            Read Security Docs
          </button>
        </div>

        {/* Mockup Dashboard Preview */}
        <div className="w-full pt-16 max-w-4xl animate-float">
          <div className="glass-panel rounded-xl border border-default-border p-2 bg-void/50 shadow-2xl relative">
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-40 h-[1px] bg-gradient-to-r from-transparent via-accent-cyan to-transparent opacity-50" />
            {/* Top header of mockup */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-default-border/40 text-[10px] text-text-muted">
              <span className="size-2 rounded-full bg-status-danger/60" />
              <span className="size-2 rounded-full bg-status-warning/60" />
              <span className="size-2 rounded-full bg-status-success/60" />
              <span className="ml-2 font-mono">console.phishified.com</span>
            </div>

            {/* Dashboard Content Mock */}
            <div className="grid grid-cols-4 bg-void/80 text-[10px] text-left p-4 gap-3 rounded-b-lg font-sans">
              {/* Fake Sidebar */}
              <div className="space-y-2 border-r border-default-border/40 pr-3">
                <div className="font-semibold text-text-primary mb-3">◆ PHISHIFIED</div>
                <div className="h-5 bg-white/[0.04] rounded px-1.5 flex items-center text-accent-blue-light font-medium">Dashboard</div>
                <div className="h-5 text-text-muted px-1.5 flex items-center">Campaigns</div>
                <div className="h-5 text-text-muted px-1.5 flex items-center">Templates</div>
                <div className="h-5 text-text-muted px-1.5 flex items-center">Employees</div>
              </div>

              {/* Fake Dashboard Body */}
              <div className="col-span-3 space-y-3 pl-1">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-text-primary">Simulations Overview</div>
                  <div className="text-[8px] text-status-success bg-status-success/10 px-1 rounded">Live tracking</div>
                </div>

                {/* KPI stats mockup */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-surface border border-default-border/40 p-2 rounded">
                    <div className="text-text-muted text-[8px]">Active Simulations</div>
                    <div className="text-xs font-bold font-mono text-text-primary mt-0.5">12</div>
                  </div>
                  <div className="bg-surface border border-default-border/40 p-2 rounded">
                    <div className="text-text-muted text-[8px]">Click Rate</div>
                    <div className="text-xs font-bold font-mono text-status-warning mt-0.5">14.2%</div>
                  </div>
                  <div className="bg-surface border border-default-border/40 p-2 rounded">
                    <div className="text-text-muted text-[8px]">Employees Trained</div>
                    <div className="text-xs font-bold font-mono text-accent-cyan-light mt-0.5">847</div>
                  </div>
                </div>

                {/* Graph mockup */}
                <div className="bg-surface border border-default-border/40 p-3 rounded h-24 flex flex-col justify-between">
                  <div className="text-[8px] text-text-secondary">Security Posture Trend</div>
                  <div className="flex items-end justify-between h-12 gap-1 px-2">
                    {[30, 45, 35, 60, 40, 50, 75, 65, 80].map((val, idx) => (
                      <div key={idx} className="w-full bg-accent-blue/20 rounded-t relative" style={{ height: `${val}%` }}>
                        <div className="absolute inset-x-0 bottom-0 bg-accent-blue rounded-t" style={{ height: "30%" }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
