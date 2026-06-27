"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, Users, BarChart3, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api/client";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

function triggerDownload(url: string, filename: string) {
  const token = getToken();
  fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
    .then((res) => {
      if (!res.ok) throw new Error("Export failed");
      return res.blob();
    })
    .then((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch(() => {});
}

export function ExportButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items = [
    {
      label: "Executive PDF Report",
      desc: "Full security awareness report with charts",
      icon: FileText,
      iconColor: "text-status-danger",
      action: () => triggerDownload(`${API_URL}/analytics/export/pdf/`, `executive_report_${new Date().toISOString().slice(0, 10)}.pdf`),
    },
    {
      label: "Employee Risk CSV",
      desc: "Risk scores and phishing history",
      icon: Users,
      iconColor: "text-accent-blue-light",
      action: () => triggerDownload(`${API_URL}/analytics/export/employee-risk-csv/`, `employee_risk_${new Date().toISOString().slice(0, 10)}.csv`),
    },
    {
      label: "Campaign Performance CSV",
      desc: "Per-campaign metrics and rates",
      icon: BarChart3,
      iconColor: "text-accent-purple-light",
      action: () => triggerDownload(`${API_URL}/analytics/export/campaign-performance-csv/`, `campaign_performance_${new Date().toISOString().slice(0, 10)}.csv`),
    },
    {
      label: "Analytics Summary CSV",
      desc: "KPI summary and funnel data",
      icon: FileSpreadsheet,
      iconColor: "text-status-success",
      action: () => triggerDownload(`${API_URL}/analytics/export/analytics-csv/`, `analytics_summary_${new Date().toISOString().slice(0, 10)}.csv`),
    },
  ];

  return (
    <div ref={ref} className="relative">
      <Button variant="outline" className="text-xs flex items-center gap-1.5" onClick={() => setOpen(!open)}>
        <Download className="size-3.5" />
        Export
        <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-64 rounded-xl border border-default-border bg-elevated shadow-2xl z-50 overflow-hidden">
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.action(); setOpen(false); }}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-default-border/30 last:border-0"
            >
              <div className="mt-0.5">
                <item.icon className={`size-4 ${item.iconColor}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-text-primary">{item.label}</p>
                <p className="text-[10px] text-text-muted">{item.desc}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
