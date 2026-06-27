"use client";

import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api/client";
import type { AnalyticsFilters as FiltersType } from "@/lib/api/types";
import { Calendar, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DATE_RANGES = [
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "90d", value: "90d" },
  { label: "1y", value: "1y" },
  { label: "Custom", value: "custom" },
] as const;

export interface ActiveFilters {
  date_range: string;
  date_from: string;
  date_to: string;
  campaign_id: string;
  department_id: string;
}

interface GlobalFiltersProps {
  onChange: (filters: ActiveFilters) => void;
}

export function GlobalFilters({ onChange }: GlobalFiltersProps) {
  const [filters, setFilters] = useState<FiltersType>({ campaigns: [], departments: [] });
  const [dateRange, setDateRange] = useState("90d");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    api<FiltersType>("/analytics/filters/")
      .then(setFilters)
      .catch(() => {});
  }, []);

  const emitChange = useCallback(() => {
    onChange({ date_range: dateRange, date_from: dateFrom, date_to: dateTo, campaign_id: campaignId, department_id: departmentId });
  }, [dateRange, dateFrom, dateTo, campaignId, departmentId, onChange]);

  useEffect(() => { emitChange(); }, [emitChange]);

  const activeCount = [campaignId, departmentId].filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-default-border bg-surface">
      <div className="flex items-center gap-1 mr-1">
        <Calendar className="size-3.5 text-text-muted" />
      </div>

      <div className="flex items-center gap-0.5 rounded-lg border border-default-border bg-elevated p-0.5">
        {DATE_RANGES.map((dr) => (
          <button
            key={dr.value}
            onClick={() => {
              setDateRange(dr.value);
              setShowCustom(dr.value === "custom");
            }}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
              dateRange === dr.value
                ? "bg-accent-blue/10 text-accent-blue-light"
                : "text-text-muted hover:text-text-primary"
            )}
          >
            {dr.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-7 rounded-md border border-default-border bg-elevated px-2 text-[11px]" />
          <span className="text-[11px] text-text-muted">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-7 rounded-md border border-default-border bg-elevated px-2 text-[11px]" />
        </div>
      )}

      <div className="w-px h-5 bg-default-border mx-1" />

      <Filter className="size-3 text-text-muted" />
      <select
        value={campaignId}
        onChange={(e) => setCampaignId(e.target.value)}
        className="h-7 rounded-md border border-default-border bg-elevated px-2 text-[11px] max-w-[160px]"
      >
        <option value="">All Campaigns</option>
        {filters.campaigns.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <select
        value={departmentId}
        onChange={(e) => setDepartmentId(e.target.value)}
        className="h-7 rounded-md border border-default-border bg-elevated px-2 text-[11px] max-w-[160px]"
      >
        <option value="">All Departments</option>
        {filters.departments.map((d) => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>

      {activeCount > 0 && (
        <button onClick={() => { setCampaignId(""); setDepartmentId(""); }} className="flex items-center gap-1 text-[11px] text-status-danger hover:underline ml-1">
          <X className="size-3" /> Clear ({activeCount})
        </button>
      )}
    </div>
  );
}
