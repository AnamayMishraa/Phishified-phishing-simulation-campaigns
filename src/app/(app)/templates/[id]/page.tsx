"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, Copy, Pencil, MousePointerClick, Flag, Calendar, User, BarChart3 } from "lucide-react";
import { api, ApiError } from "@/lib/api/client";
import type { TemplateDetail } from "@/lib/api/types";
import { cn } from "@/lib/utils";

function difficultyColor(d: string) {
  switch (d.toLowerCase()) {
    case "easy": return "text-status-success bg-status-success/10 border-status-success/20";
    case "medium": return "text-status-warning bg-status-warning/10 border-status-warning/20";
    case "hard": return "text-status-danger bg-status-danger/10 border-status-danger/20";
    default: return "text-text-muted bg-text-muted/10 border-default-border";
  }
}

function formatCategory(cat: string): string {
  return cat
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    api<TemplateDetail>(`/templates/${id}/`)
      .then((data) => {
        if (!cancelled) setTemplate(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? String(err.body ?? err.message) : "Failed to load template");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-lg bg-void" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-64 rounded bg-void" />
            <div className="h-4 w-48 rounded bg-void" />
          </div>
        </div>
        <div className="text-center py-12 text-sm text-text-muted">Loading template...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/templates" className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline">
          <ArrowLeft className="size-4" /> Back to templates
        </Link>
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-6 text-center">
          <p className="text-sm text-status-danger mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/templates" className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline">
          <ArrowLeft className="size-4" /> Back to templates
        </Link>
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">Template not found</p>
        </div>
      </div>
    );
  }

  const displayCategory = formatCategory(template.category);
  const displayDifficulty = template.difficulty_level.charAt(0).toUpperCase() + template.difficulty_level.slice(1);
  const emailContent = template.plain_text_content || template.html_content || "No content";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <Link
          href="/templates"
          className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all shrink-0 mt-1"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">{template.name}</h1>
            <span className={cn("text-[10px] font-semibold uppercase border rounded px-2 py-0.5", difficultyColor(template.difficulty_level))}>
              {displayDifficulty}
            </span>
          </div>
          <p className="text-sm text-text-muted">{template.subject}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
            <Copy className="size-3.5" /> Duplicate
          </Button>
          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
            <Pencil className="size-3.5" /> Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-default-border bg-surface rounded-xl p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted block mb-1">Category</span>
          <span className="text-xs font-semibold text-accent-purple-light bg-accent-purple/10 border border-accent-purple/20 rounded px-2 py-0.5">
            {displayCategory}
          </span>
        </div>
        <div className="border border-default-border bg-surface rounded-xl p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted block mb-1">Rating</span>
          <div className="flex items-center gap-1.5">
            <Star className="size-3.5 text-status-warning fill-status-warning" />
            <span className="text-xs font-semibold text-text-secondary">—</span>
          </div>
        </div>
        <div className="border border-default-border bg-surface rounded-xl p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted block mb-1">Status</span>
          <span className={cn(
            "text-xs font-semibold",
            template.is_active ? "text-status-success" : "text-text-muted"
          )}>
            {template.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="border border-default-border bg-surface rounded-xl p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted block mb-1">Created</span>
          <span className="text-xs font-semibold font-mono text-text-primary">{new Date(template.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-default-border bg-surface rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Email Preview</h3>
          <div className="bg-void rounded-lg border border-default-border/40">
            <div className="px-5 py-3 border-b border-default-border/40 space-y-1">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-text-muted">From:</span>
                <span className="text-text-secondary font-medium">{template.sender_name}</span>
                <span className="text-text-muted/60">&lt;{template.sender_email}&gt;</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-text-muted">Subject:</span>
                <span className="text-text-secondary font-medium">{template.subject}</span>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                {emailContent}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Performance</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <BarChart3 className="size-3.5" />
                  <span>Created By</span>
                </div>
                <span className="text-xs font-semibold font-mono text-text-primary">{template.created_by_name || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Calendar className="size-3.5" />
                  <span>Created</span>
                </div>
                <span className="text-xs font-mono text-text-secondary">{new Date(template.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <Calendar className="size-3.5" />
                  <span>Updated</span>
                </div>
                <span className="text-xs font-mono text-text-secondary">{new Date(template.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="border border-default-border bg-surface rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Metadata</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Author</span>
                <span className="text-text-secondary flex items-center gap-1">
                  <User className="size-3" /> {template.created_by_name || "—"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Tags</span>
                <span className="text-text-secondary">{template.tags.length > 0 ? template.tags.join(", ") : "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Status</span>
                <span className={cn("font-mono", template.is_active ? "text-status-success" : "text-text-muted")}>
                  {template.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <Button className="w-full bg-accent-blue hover:bg-accent-blue-dim text-white text-xs">
            Use This Template
          </Button>
        </div>
      </div>

      <div className="border border-default-border bg-surface rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Email Content</h3>
        <pre className="text-[11px] text-text-secondary leading-relaxed bg-void rounded-lg border border-default-border/40 p-4 overflow-x-auto whitespace-pre-wrap font-mono">
          {emailContent}
        </pre>
      </div>
    </div>
  );
}
