"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { FileText, Download, Calendar, ArrowUpDown } from "lucide-react";
import { reports } from "@/data/reports";
import { cn } from "@/lib/utils";

const statusFilters = ["All", "Generated", "Archived", "Generating"] as const;

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    let result = [...reports];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }

    if (statusFilter !== "All") {
      result = result.filter((r) => r.status === statusFilter);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [search, statusFilter, sortAsc]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const statusColors: Record<string, string> = {
    Generated: "text-status-success bg-status-success/10 border-status-success/20",
    Archived: "text-text-muted bg-text-muted/10 border-default-border",
    Generating: "text-status-warning bg-status-warning/10 border-status-warning/20",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Reports"
        description="Download audit-ready executive reports and compliance documentation"
        actions={
          <Button className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2">
            <FileText className="size-4" /> Generate New Report
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <SearchInput placeholder="Search reports..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-default-border bg-surface p-0.5">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                  statusFilter === s ? "bg-accent-blue/10 text-accent-blue-light" : "text-text-muted hover:text-text-primary"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 rounded-lg border border-default-border bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowUpDown className="size-3" /> Date
          </button>
        </div>
      </div>

      <p className="text-[11px] text-text-muted">
        {filtered.length} report{filtered.length !== 1 ? "s" : ""}
        {filtered.length !== reports.length && ` (filtered from ${reports.length})`}
      </p>

      <div className="grid grid-cols-1 gap-3">
        {paged.map((report) => (
          <Link key={report.id} href={`/reports/${report.id}`}>
            <div className="flex items-center justify-between p-4 border border-default-border bg-surface rounded-xl hover:border-accent-blue/20 transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center size-10 rounded-lg bg-accent-blue/10 shrink-0">
                  <FileText className="size-5 text-accent-blue-light" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-text-primary">{report.name}</h4>
                  <p className="text-[10px] text-text-muted mt-0.5 line-clamp-1">{report.description}</p>
                  <div className="flex items-center gap-2 text-[10px] text-text-muted mt-1">
                    <span>{report.format}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                    <span>•</span>
                    <span>{report.pages} pages</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      <span>{report.date}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("text-[10px] font-medium border rounded px-1.5 py-0.5", statusColors[report.status])}>
                  {report.status}
                </span>
                <button className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all">
                  <Download className="size-3.5" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {paged.length === 0 && (
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">No reports match your filters</p>
          <button onClick={() => { setSearch(""); setStatusFilter("All"); }} className="mt-2 text-xs text-accent-blue-light hover:underline">
            Clear all filters
          </button>
        </div>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
