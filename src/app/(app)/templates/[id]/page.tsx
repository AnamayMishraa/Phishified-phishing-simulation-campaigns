import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { templates, getTemplateStats } from "@/data/templates";
import { Star, ShieldAlert, ArrowLeft, Copy, Pencil, MousePointerClick, Flag, Calendar, User, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return templates.map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "Template — Phishified" };
}

function difficultyColor(d: string) {
  switch (d) {
    case "Easy": return "text-status-success bg-status-success/10 border-status-success/20";
    case "Medium": return "text-status-warning bg-status-warning/10 border-status-warning/20";
    case "Hard": return "text-status-danger bg-status-danger/10 border-status-danger/20";
    default: return "text-text-muted bg-text-muted/10 border-default-border";
  }
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = templates.find((t) => t.id === id);

  if (!template) {
    notFound();
  }

  const stats = getTemplateStats(id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
            <span className={cn("text-[10px] font-semibold uppercase border rounded px-2 py-0.5", difficultyColor(template.difficulty))}>
              {template.difficulty}
            </span>
          </div>
          <p className="text-sm text-text-muted">{template.description}</p>
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

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="border border-default-border bg-surface rounded-xl p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted block mb-1">Category</span>
          <span className="text-xs font-semibold text-accent-purple-light bg-accent-purple/10 border border-accent-purple/20 rounded px-2 py-0.5">
            {template.category}
          </span>
        </div>
        <div className="border border-default-border bg-surface rounded-xl p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted block mb-1">Rating</span>
          <div className="flex items-center gap-1.5">
            <Star className="size-3.5 text-status-warning fill-status-warning" />
            <span className="text-xs font-semibold text-text-secondary">{template.rating}</span>
          </div>
        </div>
        <div className="border border-default-border bg-surface rounded-xl p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted block mb-1">Total Uses</span>
          <span className="text-xs font-semibold font-mono text-text-primary">{template.uses.toLocaleString()}</span>
        </div>
        <div className="border border-default-border bg-surface rounded-xl p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-text-muted block mb-1">Avg. Click Rate</span>
          <span className="text-xs font-semibold font-mono text-status-danger">{template.clickRate}</span>
        </div>
      </div>

      {/* Email Preview + Metadata sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Email Preview */}
        <div className="lg:col-span-2 border border-default-border bg-surface rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Email Preview</h3>
          <div className="bg-void rounded-lg border border-default-border/40">
            {/* Email header */}
            <div className="px-5 py-3 border-b border-default-border/40 space-y-1">
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-text-muted">From:</span>
                <span className="text-text-secondary font-medium">{template.senderName}</span>
                <span className="text-text-muted/60">&lt;{template.senderEmail}&gt;</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-text-muted">Subject:</span>
                <span className="text-text-secondary font-medium">{template.subject}</span>
              </div>
            </div>
            {/* Email body */}
            <div className="px-5 py-4">
              <div className="text-xs text-text-secondary leading-relaxed whitespace-pre-line">
                {template.emailBody}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats card */}
          {stats && (
            <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <BarChart3 className="size-3.5" />
                    <span>Campaigns</span>
                  </div>
                  <span className="text-xs font-semibold font-mono text-text-primary">{stats.totalCampaigns}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <MousePointerClick className="size-3.5" />
                    <span>Avg. Click Rate</span>
                  </div>
                  <span className="text-xs font-semibold font-mono text-status-danger">{stats.averageClickRate}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Flag className="size-3.5" />
                    <span>Avg. Report Rate</span>
                  </div>
                  <span className="text-xs font-semibold font-mono text-status-success">{stats.averageReportRate}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Calendar className="size-3.5" />
                    <span>Last Used</span>
                  </div>
                  <span className="text-xs font-mono text-text-secondary">{stats.lastUsed}</span>
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border border-default-border bg-surface rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Metadata</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Author</span>
                <span className="text-text-secondary flex items-center gap-1">
                  <User className="size-3" /> {template.author}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Created</span>
                <span className="text-text-secondary">{template.createdAt}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-muted">Uses</span>
                <span className="text-text-secondary font-mono">{template.uses.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <Button className="w-full bg-accent-blue hover:bg-accent-blue-dim text-white text-xs">
            Use This Template
          </Button>
        </div>
      </div>

      {/* Email Body (raw) */}
      <div className="border border-default-border bg-surface rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Email Content</h3>
        <pre className="text-[11px] text-text-secondary leading-relaxed bg-void rounded-lg border border-default-border/40 p-4 overflow-x-auto whitespace-pre-wrap font-mono">
          {template.emailBody}
        </pre>
      </div>
    </div>
  );
}
