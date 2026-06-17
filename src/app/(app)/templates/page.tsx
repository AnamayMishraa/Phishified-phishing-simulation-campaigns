"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Star, Plus } from "lucide-react";
import { templates, getCategories } from "@/data/templates";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...getCategories()];

  const filtered = useMemo(() => {
    let result = [...templates];
    if (category !== "All") {
      result = result.filter((t) => t.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, category]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Templates"
        description="Browse and manage phishing simulation email templates"
        actions={
          <Link href="/templates/new">
            <Button className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2">
              <Plus className="size-4" /> New Template
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <SearchInput
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-default-border bg-surface p-0.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors",
                category === cat
                  ? "bg-accent-blue/10 text-accent-blue-light"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-text-muted">
        {filtered.length} template{filtered.length !== 1 ? "s" : ""}
        {filtered.length !== templates.length && ` (filtered from ${templates.length})`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => (
          <Link key={template.id} href={`/templates/${template.id}`}>
            <div className="border border-default-border bg-surface rounded-xl p-5 hover:border-accent-blue/20 transition-all duration-200 h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] font-semibold text-accent-purple-light uppercase bg-accent-purple/10 border border-accent-purple/20 rounded px-2 py-0.5">
                  {template.category}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="size-3 text-status-warning fill-status-warning" />
                  <span className="text-[10px] font-mono text-text-muted">{template.rating}</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">{template.name}</h3>
              <p className="text-xs text-text-muted leading-relaxed flex-1">{template.description}</p>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-default-border/40 text-[10px] text-text-muted">
                <span>{template.difficulty}</span>
                <span>•</span>
                <span>{template.uses.toLocaleString()} uses</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">No templates match your filters</p>
          <button
            onClick={() => { setSearch(""); setCategory("All"); }}
            className="mt-2 text-xs text-accent-blue-light hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
