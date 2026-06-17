"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { employees, getDepartments } from "@/data/employees";
import { cn } from "@/lib/utils";
import { ArrowUpDown } from "lucide-react";

const departments = getDepartments();

const riskColors = {
  "High Risk": "text-status-danger bg-status-danger/10 border-status-danger/20",
  "Medium Risk": "text-status-warning bg-status-warning/10 border-status-warning/20",
  Secure: "text-status-success bg-status-success/10 border-status-success/20",
};

const riskFilterOptions = ["All", "High Risk", "Medium Risk", "Secure"] as const;

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getTrainingStatus(completed: number): { label: string; color: string } {
  if (completed >= 8) return { label: "Advanced", color: "text-status-success" };
  if (completed >= 4) return { label: "Intermediate", color: "text-status-warning" };
  return { label: "Beginner", color: "text-status-danger" };
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let result = [...employees];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }

    if (deptFilter !== "All") {
      result = result.filter((e) => e.department === deptFilter);
    }

    if (riskFilter !== "All") {
      result = result.filter((e) => e.status === riskFilter);
    }

    result.sort((a, b) => sortAsc ? a.riskScore - b.riskScore : b.riskScore - a.riskScore);

    return result;
  }, [search, deptFilter, riskFilter, sortAsc]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Employees"
        description="Manage employees, view risk assessments, and import team members"
        actions={
          <div className="flex gap-2">
            <Link href="/employees/import">
              <Button variant="outline" className="flex items-center gap-2">Import</Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Search by name, email, title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-lg border border-default-border bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary focus:outline-none focus:border-accent-blue/30"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>

          <div className="flex items-center gap-1 rounded-lg border border-default-border bg-surface p-0.5">
            {riskFilterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setRiskFilter(opt)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap",
                  riskFilter === opt
                    ? "bg-accent-blue/10 text-accent-blue-light"
                    : "text-text-muted hover:text-text-primary"
                )}
              >
                {opt === "All" ? "All" : opt}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 rounded-lg border border-default-border bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowUpDown className="size-3" />
            Risk
          </button>
        </div>
      </div>

      <p className="text-[11px] text-text-muted">
        {filtered.length} employee{filtered.length !== 1 ? "s" : ""}
        {filtered.length !== employees.length && ` (filtered from ${employees.length})`}
      </p>

      <div className="border border-default-border bg-surface rounded-xl overflow-x-auto">
        <table className="w-full text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-default-border/40 text-text-muted text-[10px] font-medium uppercase tracking-wider">
              <th className="text-left px-4 py-3 font-medium">Employee</th>
              <th className="text-left px-4 py-3 font-medium">Department</th>
              <th className="text-left px-4 py-3 font-medium">Risk Score</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Training</th>
              <th className="text-right px-4 py-3 font-medium">Phish Clicks</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((employee) => {
              const initials = getInitials(employee.name);
              const training = getTrainingStatus(employee.trainingCompleted);
              return (
                <tr
                  key={employee.id}
                  className="border-b border-default-border/20 hover:bg-white/[0.02] transition-colors last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link href={`/employees/${employee.id}`} className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-accent-blue/10 flex items-center justify-center text-[10px] font-semibold text-accent-blue-light shrink-0">
                        {initials}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-text-primary">{employee.name}</p>
                        <p className="text-[10px] text-text-muted font-mono">{employee.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-[11px]">{employee.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-void rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all",
                            employee.riskScore > 70 ? "bg-status-danger" : employee.riskScore > 40 ? "bg-status-warning" : "bg-status-success"
                          )}
                          style={{ width: `${employee.riskScore}%` }}
                        />
                      </div>
                      <span className={cn(
                        "text-[11px] font-mono font-medium",
                        employee.riskScore > 70 ? "text-status-danger" : employee.riskScore > 40 ? "text-status-warning" : "text-status-success"
                      )}>
                        {employee.riskScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "text-[10px] font-semibold border rounded px-1.5 py-0.5",
                      riskColors[employee.status]
                    )}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-void rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent-cyan"
                          style={{ width: `${(employee.trainingCompleted / 10) * 100}%` }}
                        />
                      </div>
                      <span className={cn("text-[10px] font-medium", training.color)}>
                        {employee.trainingCompleted}/10
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(
                      "text-[11px] font-mono font-medium",
                      employee.totalPhishClicked > 3 ? "text-status-danger" : employee.totalPhishClicked > 0 ? "text-status-warning" : "text-status-success"
                    )}>
                      {employee.totalPhishClicked}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">No employees match your filters</p>
          <button
            onClick={() => { setSearch(""); setDeptFilter("All"); setRiskFilter("All"); }}
            className="mt-2 text-xs text-accent-blue-light hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
