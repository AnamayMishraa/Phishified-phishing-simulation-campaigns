"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { api, ApiError, getErrorMessage } from "@/lib/api/client";
import type { LandingPageDetail as LandingPageDetailType } from "@/lib/api/types";
import { PagePreviewRenderer } from "@/components/landing-pages/live-preview";
import {
  ArrowLeft, Eye, Globe, Edit, Trash2,
  User, Calendar, Clock, Activity, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  auth_portal: "Auth Portal",
  corporate_page: "Corporate Page",
  landing_page: "Landing Page",
};

export default function LandingPageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [page, setPage] = useState<LandingPageDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchPage = useCallback(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    api<LandingPageDetailType>(`/landing-pages/${id}/`)
      .then((data) => { if (!cancelled) setPage(data); })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(getErrorMessage(err, "Failed to load landing page"));
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => { fetchPage(); }, [fetchPage]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api(`/landing-pages/${id}/`, { method: "DELETE" });
      toast.success("Landing page deleted");
      router.push("/landing-pages");
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Failed to delete landing page"
          : "Failed to delete landing page";
      toast.error(message);
      setDeleting(false);
      setDeleteDialogOpen(false);
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
        <div className="text-center py-12 text-sm text-text-muted"><Loader2 className="size-4 animate-spin inline mr-2" />Loading landing page...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/landing-pages" className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline">
          <ArrowLeft className="size-4" /> Back to landing pages
        </Link>
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-6 text-center">
          <p className="text-sm text-status-danger mb-2">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/landing-pages" className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline">
          <ArrowLeft className="size-4" /> Back to landing pages
        </Link>
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">Landing page not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <Link
          href="/landing-pages"
          className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all shrink-0 mt-1"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">{page.name}</h1>
            <span className={cn(
              "size-2 rounded-full",
              page.is_active ? "bg-status-success" : "bg-text-muted"
            )} />
          </div>
          <p className="text-sm text-text-muted">/{page.slug} &bull; {categoryLabels[page.category] || page.category}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Link href={`/landing-pages/${page.id}/edit`}>
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <Edit className="size-3.5" /> Edit
            </Button>
          </Link>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger render={
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 text-status-danger">
                <Trash2 className="size-3.5" /> Delete
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Landing Page</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{page.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" size="sm" disabled={deleting}>Cancel</Button>} />
                <Button
                  variant="outline" size="sm" disabled={deleting}
                  onClick={handleDelete}
                  className="text-status-danger flex items-center gap-1.5"
                >
                  {deleting ? <><Loader2 className="size-3.5 animate-spin" /> Deleting...</> : <><Trash2 className="size-3.5" /> Delete</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Globe} label="Category" value={categoryLabels[page.category] || page.category} color="text-text-primary" />
        <StatCard icon={Eye} label="Difficulty" value={page.difficulty_level} color="text-accent-cyan-light" />
        <StatCard icon={User} label="Created By" value={page.created_by_name || "—"} color="text-text-primary" />
        <StatCard icon={Calendar} label="Created" value={new Date(page.created_at).toLocaleDateString()} color="text-text-primary" />
        <StatCard icon={Clock} label="Updated" value={new Date(page.updated_at).toLocaleDateString()} color="text-text-muted" />
        <StatCard icon={Activity} label="Status" value={page.is_active ? "Active" : "Inactive"} color={page.is_active ? "text-status-success" : "text-text-muted"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-default-border bg-surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Page Preview</h3>
            <span className="text-[10px] text-text-muted">{categoryLabels[page.category] || page.category}</span>
          </div>
          <div className="bg-white rounded-lg min-h-[320px] overflow-x-auto">
            <PagePreviewRenderer htmlContent={page.html_content} cssContent={page.css_content} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                <span className="text-xs text-text-muted">Title</span>
                <span className="text-xs font-mono font-semibold text-text-primary text-right max-w-[180px] truncate">{page.title || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                <span className="text-xs text-text-muted">Slug</span>
                <span className="text-xs font-mono text-text-secondary">/{page.slug}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                <span className="text-xs text-text-muted">Difficulty</span>
                <span className="text-xs font-mono font-semibold text-text-primary capitalize">{page.difficulty_level}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-text-muted">Active</span>
                <span className={cn("text-xs font-mono font-semibold", page.is_active ? "text-status-success" : "text-text-muted")}>
                  {page.is_active ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-default-border bg-surface rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Page Source</h3>
        <pre className="text-[11px] text-text-secondary leading-relaxed bg-void rounded-lg border border-default-border/40 p-4 overflow-x-auto whitespace-pre-wrap font-mono max-h-[400px] overflow-y-auto">
          {page.html_content || page.css_content ? (
            <>{page.html_content}{page.css_content ? `\n\n/* CSS */\n${page.css_content}` : ""}</>
          ) : (
            "No content"
          )}
        </pre>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; color: string }) {
  return (
    <div className="border border-default-border bg-surface rounded-xl p-4">
      <div className="flex items-center gap-2 text-text-muted mb-2">
        <Icon className="size-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className={cn("text-sm font-semibold font-mono", color)}>{value}</span>
    </div>
  );
}
