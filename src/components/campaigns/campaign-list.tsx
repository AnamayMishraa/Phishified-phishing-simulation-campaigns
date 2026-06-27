"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { Play, Pause, MoreHorizontal, ArrowUpDown } from "lucide-react";
import { api, ApiError, getErrorMessage } from "@/lib/api/client";
import type { Campaign, PaginatedResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const statusFilters: { value: string; label: string; color: string }[] = [
  { value: "all", label: "All", color: "text-text-secondary" },
  { value: "active", label: "Active", color: "text-status-success" },
  { value: "draft", label: "Draft", color: "text-text-secondary" },
  { value: "completed", label: "Completed", color: "text-accent-blue-light" },
  { value: "paused", label: "Paused", color: "text-status-warning" },
];

const typeFilters: { value: string; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

export function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api<PaginatedResponse<Campaign>>("/campaigns/")
      .then((data) => {
        if (!cancelled) setCampaigns(data.results);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? getErrorMessage(err) : "Failed to load campaigns");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const departments = useMemo(
    () => [...new Set(campaigns.map((c) => c.department).filter(Boolean))].sort(),
    [campaigns]
  );

  const filtered = useMemo(() => {
    let result = [...campaigns];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    if (typeFilter !== "all") {
      result = result.filter((c) => c.type === typeFilter);
    }

    if (deptFilter !== "all") {
      result = result.filter((c) => c.department === deptFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [search, statusFilter, typeFilter, deptFilter, sortAsc, campaigns]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Search campaigns..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 rounded-lg border border-default-border bg-surface p-0.5">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatusFilter(f.value); setCurrentPage(1); }}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                  statusFilter === f.value
                    ? "bg-accent-blue/10 text-accent-blue-light"
                    : f.color + " hover:text-text-primary"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-lg border border-default-border bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary focus:outline-none focus:border-accent-blue/30"
          >
            {typeFilters.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
            className="rounded-lg border border-default-border bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary focus:outline-none focus:border-accent-blue/30"
          >
            <option value="all">All Depts</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 rounded-lg border border-default-border bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowUpDown className="size-3" />
            {sortAsc ? "Oldest" : "Newest"}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-text-muted">
        {loading ? "Loading..." : `${filtered.length} campaign${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {error && (
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-4 text-sm text-status-danger">
          {error}
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              api<PaginatedResponse<Campaign>>("/campaigns/")
                .then((data) => setCampaigns(data.results))
                .catch((err: unknown) => setError(err instanceof ApiError ? getErrorMessage(err) : "Failed to load"))
                .finally(() => setLoading(false));
            }}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="text-center py-12 text-sm text-text-muted">Loading campaigns...</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">
            {campaigns.length === 0 ? "No campaigns yet. Create your first campaign to get started." : "No campaigns match your filters"}
          </p>
          {campaigns.length > 0 && (
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); setTypeFilter("all"); setDeptFilter("all"); }}
              className="mt-2 text-xs text-accent-blue-light hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {paged.map((campaign) => (
            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
              <div className="flex items-center justify-between p-4 border border-default-border bg-surface rounded-xl hover:border-accent-blue/20 transition-all duration-200">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex items-center justify-center size-10 rounded-lg",
                      campaign.status === "active"
                        ? "bg-status-success/10 text-status-success"
                        : campaign.status === "completed"
                        ? "bg-accent-blue/10 text-accent-blue-light"
                        : campaign.status === "paused"
                        ? "bg-status-warning/10 text-status-warning"
                        : "bg-text-muted/10 text-text-muted"
                    )}
                  >
                    {campaign.status === "active" ? (
                      <Play className="size-5" />
                    ) : campaign.status === "completed" ? (
                      <Play className="size-5" />
                    ) : (
                      <Pause className="size-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-text-primary">
                      {campaign.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-text-muted mt-1">
                      <span>{campaign.department}</span>
                      <span>•</span>
                      <span>{campaign.type}</span>
                      <span>•</span>
                      <span>{campaign.sent_count.toLocaleString()} targeted</span>
                      <span>•</span>
                      <span>
                        {campaign.click_count} clicks ({formatRate(campaign.click_rate)})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={campaign.status} />
                  <button aria-label="Campaign actions" className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all">
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
