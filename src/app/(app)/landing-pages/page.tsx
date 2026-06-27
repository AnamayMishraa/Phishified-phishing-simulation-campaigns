"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { api, ApiError, getErrorMessage } from "@/lib/api/client";
import type { LandingPage, PaginatedResponse } from "@/lib/api/types";
import { Plus, Globe, ArrowUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = ["All", "auth_portal", "corporate_page", "landing_page"];

const categoryLabels: Record<string, string> = {
  auth_portal: "Auth Portal",
  corporate_page: "Corporate Page",
  landing_page: "Landing Page",
};

export default function LandingPagesPage() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api<PaginatedResponse<LandingPage>>("/landing-pages/")
      .then((res) => { if (!cancelled) setPages(res.results); })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load landing pages"));
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let result = [...pages];

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortAsc ? da - db : db - da;
    });

    return result;
  }, [pages, search, category, sortAsc]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Landing Pages"
        description="Create and manage phishing simulation landing pages"
        actions={
          <Link href="/landing-pages/new">
            <Button className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2">
              <Plus className="size-4" /> New Landing Page
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Search by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 rounded-lg border border-default-border bg-surface p-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                  category === cat ? "bg-accent-blue/10 text-accent-blue-light" : "text-text-muted hover:text-text-primary"
                )}
              >
                {cat === "All" ? "All" : categoryLabels[cat] || cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 rounded-lg border border-default-border bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowUpDown className="size-3" />
            {sortAsc ? "Oldest" : "Newest"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-text-muted">
          <Loader2 className="size-4 animate-spin mr-2" /> Loading landing pages...
        </div>
      ) : error ? (
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-6 text-center">
          <p className="text-sm text-status-danger mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      ) : (
        <>
          <p className="text-[11px] text-text-muted">
            {filtered.length} landing page{filtered.length !== 1 ? "s" : ""}
            {filtered.length !== pages.length && ` (filtered from ${pages.length})`}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((page) => (
              <Link key={page.id} href={`/landing-pages/${page.id}`}>
                <div className="border border-default-border bg-surface rounded-xl p-5 hover:border-accent-blue/20 transition-all duration-200 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center justify-center size-10 rounded-lg bg-white/[0.03]">
                      <Globe className="size-5 text-accent-cyan" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-medium uppercase rounded px-1.5 py-0.5 border text-accent-blue-light bg-accent-blue/10 border-accent-blue/20">
                        {categoryLabels[page.category] || page.category}
                      </span>
                      <span className={cn(
                        "size-1.5 rounded-full",
                        page.is_active ? "bg-status-success" : "bg-text-muted"
                      )} />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{page.name}</h3>
                  <p className="text-xs text-text-muted leading-relaxed flex-1 font-mono">/{page.slug}</p>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-default-border/40 text-[10px] text-text-muted">
                    <span>{new Date(page.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
              <p className="text-sm text-text-muted">No landing pages match your filters</p>
              <button onClick={() => { setSearch(""); setCategory("All"); }} className="mt-2 text-xs text-accent-blue-light hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
