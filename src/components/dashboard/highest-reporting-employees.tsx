"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Building2, Flag } from "lucide-react";
import { api } from "@/lib/api/client";
import type { DashboardData, HighestReportingEmployee } from "@/lib/api/types";

export function HighestReportingEmployees() {
  const [employees, setEmployees] = useState<HighestReportingEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api<DashboardData>("/dashboard/")
      .then((data) => {
        if (!cancelled) setEmployees(data.highest_reporting_employees);
      })
      .catch(() => {
        if (!cancelled) setEmployees([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            Top Reporters
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {loading ? "Loading..." : "Employees who reported the most phishing emails"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-accent-blue/10">
          <ShieldCheck className="size-3.5 text-accent-blue-light" />
          <span className="text-xs font-semibold text-accent-blue-light">
            {loading ? "..." : employees.length}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {loading ? (
          <div className="text-center py-8 text-xs text-text-muted">Loading...</div>
        ) : employees.length === 0 ? (
          <div className="text-center py-8 text-xs text-text-muted">No reports yet</div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-200 hover:bg-white/[0.02]"
            >
              <div className="flex shrink-0 items-center justify-center size-8 rounded-lg bg-accent-blue/10 mt-0.5">
                <Flag className="size-4 text-accent-blue-light" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary">
                  {employee.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Building2 className="size-3" />
                    {employee.department}
                  </span>
                </div>
              </div>
              <div
                className={cn(
                  "shrink-0 px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1",
                  employee.total_reported > 5
                    ? "bg-accent-blue/15 text-accent-blue-light"
                    : "bg-white/[0.04] text-text-secondary"
                )}
              >
                <Flag className="size-3" />
                {employee.total_reported}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
