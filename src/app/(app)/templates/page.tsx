"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Star, Plus } from "lucide-react";
import { api, ApiError } from "@/lib/api/client";
import type { Template, PaginatedResponse } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api<PaginatedResponse<Template>>("/templates/")
      .then((data) => {
        if (!cancelled) setTemplates(data.results);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? String(err.body ?? err.message) : "Failed to load templates");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(templates.map((t) => t.category))],
    [templates]
  );

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
          t.subject.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, category, templates]);

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
        {loading ? "Loading..." : `${filtered.length} template${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {error && (
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-4 text-sm text-status-danger">
          {error}
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              api<PaginatedResponse<Template>>("/templates/")
                .then((data) => setTemplates(data.results))
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
        <div className="text-center py-12 text-sm text-text-muted">Loading templates...</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">
            {templates.length === 0 ? "No templates yet. Create your first template to get started." : "No templates match your filters"}
          </p>
          {templates.length > 0 && (
            <button
              onClick={() => { setSearch(""); setCategory("All"); }}
              className="mt-2 text-xs text-accent-blue-light hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
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
                    <span className="text-[10px] font-mono text-text-muted">—</span>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{template.name}</h3>
                <p className="text-xs text-text-muted leading-relaxed flex-1">{template.subject}</p>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-default-border/40 text-[10px] text-text-muted">
                  <span>{template.difficulty_level}</span>
                  <span>•</span>
                  <span>{template.is_active ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
