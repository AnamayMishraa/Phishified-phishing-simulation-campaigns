"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import type { LandingPageDetail as LandingPageDetailType } from "@/lib/api/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { label: "Auth Portal", value: "auth_portal" },
  { label: "Corporate Page", value: "corporate_page" },
  { label: "Landing Page", value: "landing_page" },
];

const difficultyLevels = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

export default function EditLandingPagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("landing_page");
  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [cssContent, setCssContent] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("medium");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    api<LandingPageDetailType>(`/landing-pages/${id}/`)
      .then((data) => {
        if (!cancelled) {
          setName(data.name);
          setSlug(data.slug);
          setCategory(data.category);
          setTitle(data.title);
          setHtmlContent(data.html_content);
          setCssContent(data.css_content);
          setDifficultyLevel(data.difficulty_level);
          setIsActive(data.is_active);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFetchError(err instanceof ApiError ? String(err.body ?? err.message) : "Failed to load landing page");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!slug.trim()) { toast.error("Slug is required"); return; }

    setSaving(true);
    try {
      await api(`/landing-pages/${id}/`, {
        method: "PATCH",
        body: {
          name: name.trim(),
          slug: slug.trim(),
          category,
          title: title || undefined,
          html_content: htmlContent || undefined,
          css_content: cssContent || undefined,
          difficulty_level: difficultyLevel,
          is_active: isActive,
        },
      });

      toast.success("Landing page updated");
      router.push(`/landing-pages/${id}`);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Failed to update landing page"
          : "Failed to update landing page";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

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
        <div className="text-center py-12 text-sm text-text-muted">Loading landing page...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/landing-pages" className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline">
          <ArrowLeft className="size-4" /> Back to landing pages
        </Link>
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-6 text-center">
          <p className="text-sm text-status-danger mb-2">{fetchError}</p>
          <Button variant="outline" size="sm" onClick={() => router.refresh()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <Link
        href={`/landing-pages/${id}`}
        className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline w-fit"
      >
        <ArrowLeft className="size-4" /> Back to landing page
      </Link>

      <PageHeader title="Edit Landing Page" description="Update landing page details and content." />

      <div className="border border-default-border bg-surface rounded-xl p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="edit-name" className="text-xs font-medium text-text-secondary">Name <span className="text-status-danger">*</span></label>
            <input id="edit-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50" />
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-slug" className="text-xs font-medium text-text-secondary">Slug <span className="text-status-danger">*</span></label>
            <input id="edit-slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary font-mono focus:outline-none focus:border-accent-blue/50" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="edit-category" className="text-xs font-medium text-text-secondary">Category</label>
            <select id="edit-category" value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50">
              {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="edit-difficulty" className="text-xs font-medium text-text-secondary">Difficulty</label>
            <select id="edit-difficulty" value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)}
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50">
              {difficultyLevels.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-title" className="text-xs font-medium text-text-secondary">Title (optional)</label>
          <input id="edit-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title shown in the browser tab"
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50" />
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-html" className="text-xs font-medium text-text-secondary">HTML Content</label>
          <textarea id="edit-html" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} rows={10}
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary font-mono leading-relaxed focus:outline-none focus:border-accent-blue/50 resize-y" />
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-css" className="text-xs font-medium text-text-secondary">CSS Content (optional)</label>
          <textarea id="edit-css" value={cssContent} onChange={(e) => setCssContent(e.target.value)} rows={5}
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary font-mono leading-relaxed focus:outline-none focus:border-accent-blue/50 resize-y" />
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer" />
            <div className="w-9 h-5 bg-text-muted/30 rounded-full peer peer-checked:bg-status-success/60 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
          </label>
          <span className="text-xs text-text-secondary">Active</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link href={`/landing-pages/${id}`}>
          <Button variant="outline" size="sm" disabled={saving}>Cancel</Button>
        </Link>
        <Button
          size="sm" disabled={saving || !name.trim() || !slug.trim()} onClick={handleSave}
          className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2"
        >
          {saving ? <><Loader2 className="size-3.5 animate-spin" /> Saving...</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
