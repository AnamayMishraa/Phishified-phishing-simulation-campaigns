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
import type { TemplateDetail } from "@/lib/api/types";
import {
  ArrowLeft, Trash2, User, Calendar, Clock, Activity,
  Tag, AtSign, FileText, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  credential_harvesting: "Credential Harvesting",
  link_click: "Link Click",
  attachment: "Attachment",
};

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchTemplate = useCallback(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    api<TemplateDetail>(`/templates/${id}/`)
      .then((data) => { if (!cancelled) setTemplate(data); })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? getErrorMessage(err, "Failed to load template") : "Failed to load template");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => { fetchTemplate(); }, [fetchTemplate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api(`/templates/${id}/`, { method: "DELETE" });
      toast.success("Template deactivated");
      router.push("/templates");
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Failed to deactivate template"
          : "Failed to deactivate template";
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
        <div className="text-center py-12 text-sm text-text-muted"><Loader2 className="size-4 animate-spin inline mr-2" />Loading template...</div>
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
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
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

  const previewDoc = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body>${template.html_content || ""}</body>
</html>`;

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
            <span className={cn(
              "size-2 rounded-full",
              template.is_active ? "bg-status-success" : "bg-text-muted"
            )} />
          </div>
          <p className="text-sm text-text-muted">{categoryLabels[template.category] || template.category} &bull; {template.difficulty_level}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger render={
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 text-status-danger">
                <Trash2 className="size-3.5" /> Delete
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deactivate Template</DialogTitle>
                <DialogDescription>
                  This will deactivate "{template.name}". Campaigns using this template will retain their reference but the template will be marked as inactive and unavailable for new campaigns.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" size="sm" disabled={deleting}>Cancel</Button>} />
                <Button
                  variant="outline" size="sm" disabled={deleting}
                  onClick={handleDelete}
                  className="text-status-danger flex items-center gap-1.5"
                >
                  {deleting ? <><Loader2 className="size-3.5 animate-spin" /> Deactivating...</> : <><Trash2 className="size-3.5" /> Deactivate</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Tag} label="Category" value={categoryLabels[template.category] || template.category} color="text-accent-purple-light" />
        <StatCard icon={Activity} label="Difficulty" value={template.difficulty_level} color="text-accent-cyan-light" />
        <StatCard icon={AtSign} label="Sender" value={template.sender_name || "—"} color="text-text-primary" />
        <StatCard icon={User} label="Created By" value={template.created_by_name || "—"} color="text-text-primary" />
        <StatCard icon={Calendar} label="Created" value={new Date(template.created_at).toLocaleDateString()} color="text-text-primary" />
        <StatCard icon={Clock} label="Status" value={template.is_active ? "Active" : "Inactive"} color={template.is_active ? "text-status-success" : "text-text-muted"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-default-border bg-surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Email Preview</h3>
            <span className="text-[10px] text-text-muted">{template.subject}</span>
          </div>
          <iframe
            sandbox="allow-scripts"
            srcDoc={previewDoc}
            title={template.name}
            className="w-full bg-white rounded-lg"
            style={{ minHeight: 360, border: "none" }}
          />
        </div>

        <div className="space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                <span className="text-xs text-text-muted">Subject</span>
                <span className="text-xs font-mono font-semibold text-text-primary text-right max-w-[180px] truncate">{template.subject}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                <span className="text-xs text-text-muted">Sender Name</span>
                <span className="text-xs text-text-secondary text-right max-w-[180px] truncate">{template.sender_name || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                <span className="text-xs text-text-muted">Sender Email</span>
                <span className="text-xs font-mono text-text-secondary text-right max-w-[180px] truncate">{template.sender_email || "—"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-text-muted">Active</span>
                <span className={cn("text-xs font-mono font-semibold", template.is_active ? "text-status-success" : "text-text-muted")}>
                  {template.is_active ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>

          {template.tags && template.tags.length > 0 && (
            <div className="border border-default-border bg-surface rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {template.tags.map((tag, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full border border-default-border bg-void text-text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {template.plain_text_content && (
        <div className="border border-default-border bg-surface rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            <FileText className="size-3.5 inline mr-1.5" /> Plain Text Version
          </h3>
          <pre className="text-[11px] text-text-secondary leading-relaxed bg-void rounded-lg border border-default-border/40 p-4 overflow-x-auto whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
            {template.plain_text_content}
          </pre>
        </div>
      )}

      <div className="border border-default-border bg-surface rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">HTML Source</h3>
        <pre className="text-[11px] text-text-secondary leading-relaxed bg-void rounded-lg border border-default-border/40 p-4 overflow-x-auto whitespace-pre-wrap font-mono max-h-[400px] overflow-y-auto">
          {template.html_content || "No HTML content"}
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
