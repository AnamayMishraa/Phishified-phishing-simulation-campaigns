"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, MousePointerClick, Building2 } from "lucide-react";
import { getHighRiskEmployees } from "@/data/employees";

export function HighRiskEmployees() {
  const employees = getHighRiskEmployees();

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">
            High Risk Employees
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            {employees.length} employees flagged — immediate attention required
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-status-danger/10">
          <AlertTriangle className="size-3.5 text-status-danger" />
          <span className="text-xs font-semibold text-status-danger">
            {employees.length}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        {employees.slice(0, 5).map((employee) => (
          <div
            key={employee.id}
            className="flex items-start gap-3 rounded-lg p-2.5 transition-colors duration-200 hover:bg-white/[0.02]"
          >
            <div className="flex shrink-0 items-center justify-center size-8 rounded-lg bg-status-danger/10 mt-0.5">
              <AlertTriangle className="size-4 text-status-danger" />
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
                <span className="text-[10px] text-text-muted/50">•</span>
                <span className="text-[10px] text-text-muted flex items-center gap-1">
                  <MousePointerClick className="size-3" />
                  {employee.totalPhishClicked} clicks
                </span>
              </div>
            </div>
            <div
              className={cn(
                "shrink-0 px-2 py-1 rounded text-[11px] font-semibold",
                employee.riskScore > 80
                  ? "bg-status-danger/15 text-status-danger"
                  : "bg-status-warning/15 text-status-warning"
              )}
            >
              {employee.riskScore}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
