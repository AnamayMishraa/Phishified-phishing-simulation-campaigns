"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Plus, Globe, Eye, MousePointerClick, ArrowUpDown } from "lucide-react";
import { landingPages } from "@/data/landing-pages";
import { cn } from "@/lib/utils";

const categories = ["All", "Auth Portal", "Corporate Page", "Landing Page"];

export default function LandingPagesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"visitors" | "date">("visitors");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let result = [...landingPages];

    if (category !== "All") {
      result = result.filter((p) => p.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.url.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "visitors") return sortAsc ? a.visitors - b.visitors : b.visitors - a.visitors;
      return sortAsc
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [search, category, sortBy, sortAsc]);

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
            placeholder="Search by name or URL..."
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
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1 rounded-lg border border-default-border bg-surface px-2.5 py-1.5 text-[11px] text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowUpDown className="size-3" />
            {sortBy === "visitors" ? "Visitors" : "Date"}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-text-muted">
        {filtered.length} landing page{filtered.length !== 1 ? "s" : ""}
        {filtered.length !== landingPages.length && ` (filtered from ${landingPages.length})`}
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
                    {page.category}
                  </span>
                  <span className={cn(
                    "size-1.5 rounded-full",
                    page.status === "active" ? "bg-status-success" : "bg-text-muted"
                  )} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{page.name}</h3>
              <p className="text-xs text-text-muted leading-relaxed flex-1 font-mono">{page.url}</p>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-default-border/40 text-[10px] text-text-muted">
                <span className="flex items-center gap-1"><Eye className="size-3" /> {page.visitors.toLocaleString()}</span>
                <span className="flex items-center gap-1"><MousePointerClick className="size-3" /> {page.credentialsEntered.toLocaleString()}</span>
                <span className="font-medium text-accent-cyan-light">{page.conversionRate}</span>
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
    </div>
  );
}
