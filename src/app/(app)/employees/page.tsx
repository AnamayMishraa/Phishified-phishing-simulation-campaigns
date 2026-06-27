"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api/client";
import type { Employee, PaginatedResponse } from "@/lib/api/types";
import { ArrowUpDown } from "lucide-react";

const riskLevelLabels: Record<string, string> = {
  secure: "Secure",
  medium: "Medium Risk",
  high: "High Risk",
};

const riskColors: Record<string, string> = {
  "High Risk": "text-status-danger bg-status-danger/10 border-status-danger/20",
  "Medium Risk": "text-status-warning bg-status-warning/10 border-status-warning/20",
  Secure: "text-status-success bg-status-success/10 border-status-success/20",
};

const riskFilterOptions = ["All", "High Risk", "Medium Risk", "Secure"] as const;

function getInitials(first: string, last: string): string {
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase().slice(0, 2);
}

function getTrainingStatus(_completed: number): { label: string; color: string } {
  return { label: "Beginner", color: "text-text-muted" };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState<string>("All");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api<PaginatedResponse<Employee>>("/employees/")
      .then((data) => {
        if (!cancelled) setEmployees(data.results);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? String(err.body ?? err.message) : "Failed to load employees");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const departments = useMemo(
    () => [...new Set(employees.map((e) => e.department_name).filter(Boolean))].sort(),
    [employees]
  );

  const filtered = useMemo(() => {
    let result = [...employees];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.position.toLowerCase().includes(q) ||
          e.department_name.toLowerCase().includes(q)
      );
    }

    if (deptFilter !== "All") {
      result = result.filter((e) => e.department_name === deptFilter);
    }

    if (riskFilter !== "All") {
      result = result.filter((e) => riskLevelLabels[e.risk_level] === riskFilter);
    }

    result.sort((a, b) => (sortAsc ? a.risk_score - b.risk_score : b.risk_score - a.risk_score));

    return result;
  }, [employees, search, deptFilter, riskFilter, sortAsc]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Employees"
        description="Manage employees, view risk assessments, and import team members"
        actions={
          <div className="flex gap-2">
            <Link href="/employees/new">
              <Button className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2">Add Employee</Button>
            </Link>
            <Link href="/employees/leaderboard">
              <Button variant="outline" className="flex items-center gap-2">Leaderboard</Button>
            </Link>
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
        {loading ? "Loading..." : `${filtered.length} employee${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {error && (
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-4 text-sm text-status-danger">
          {error}
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              api<PaginatedResponse<Employee>>("/employees/")
                .then((data) => setEmployees(data.results))
                .catch((err: unknown) => setError(err instanceof ApiError ? String(err.body ?? err.message) : "Failed to load"))
                .finally(() => setLoading(false));
            }}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="text-center py-12 text-sm text-text-muted">Loading employees...</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">
            {employees.length === 0 ? "No employees found. Import employees to get started." : "No employees match your filters"}
          </p>
          {employees.length > 0 && (
            <button
              onClick={() => { setSearch(""); setDeptFilter("All"); setRiskFilter("All"); }}
              className="mt-2 text-xs text-accent-blue-light hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="border border-default-border bg-surface rounded-xl overflow-x-auto">
          <table className="w-full text-xs min-w-[640px]">
            <thead>
              <tr className="border-b border-default-border/40 text-text-muted text-[10px] font-medium uppercase tracking-wider">
                <th className="text-left px-4 py-3 font-medium">Employee</th>
                <th className="text-left px-4 py-3 font-medium">Department</th>
                <th className="text-left px-4 py-3 font-medium">Risk Score</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Position</th>
                <th className="text-right px-4 py-3 font-medium">Active</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((employee) => {
                const name = `${employee.first_name} ${employee.last_name}`;
                const initials = getInitials(employee.first_name, employee.last_name);
                const statusLabel = riskLevelLabels[employee.risk_level] ?? "Secure";
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
                          <p className="text-xs font-medium text-text-primary">{name}</p>
                          <p className="text-[10px] text-text-muted font-mono">{employee.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-[11px]">{employee.department_name}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-void rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              employee.risk_score > 70 ? "bg-status-danger" : employee.risk_score > 40 ? "bg-status-warning" : "bg-status-success"
                            )}
                            style={{ width: `${employee.risk_score}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-[11px] font-mono font-medium",
                          employee.risk_score > 70 ? "text-status-danger" : employee.risk_score > 40 ? "text-status-warning" : "text-status-success"
                        )}>
                          {employee.risk_score}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "text-[10px] font-semibold border rounded px-1.5 py-0.5",
                        riskColors[statusLabel]
                      )}>
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-[11px]">{employee.position || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        "text-[11px] font-medium",
                        employee.is_active ? "text-status-success" : "text-text-muted"
                      )}>
                        {employee.is_active ? "Yes" : "No"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
