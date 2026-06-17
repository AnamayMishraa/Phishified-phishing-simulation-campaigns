import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { landingPages, getLandingPageStats, getVisitorHistory } from "@/data/landing-pages";
import { ArrowLeft, Eye, MousePointerClick, Globe, ExternalLink, Clock, Activity, BarChart3, Target, TrendingUp, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return landingPages.map((p) => ({ id: String(p.id) }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "Landing Page — Phishified" };
}

export default async function LandingPageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const page = landingPages.find((p) => String(p.id) === id);

  if (!page) {
    notFound();
  }

  const stats = getLandingPageStats(page.id);
  const history = getVisitorHistory(page.id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
              page.status === "active" ? "bg-status-success" : "bg-text-muted"
            )} />
          </div>
          <p className="text-sm text-text-muted">
            {page.url} &bull; {page.templateName} &bull; {page.brand}
          </p>
        </div>
        <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 shrink-0">
          <ExternalLink className="size-3.5" /> Preview
        </Button>
      </div>

      {/* Stats grid — 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Eye} label="Visitors" value={page.visitors.toLocaleString()} color="text-text-primary" />
        <StatCard icon={MousePointerClick} label="Credentials" value={page.credentialsEntered.toLocaleString()} color="text-status-danger" />
        <StatCard icon={Target} label="Conversion" value={page.conversionRate} color="text-accent-cyan-light" />
        <StatCard icon={Activity} label="Bounce Rate" value={page.bounceRate} color="text-status-warning" />
        <StatCard icon={Clock} label="Avg. Session" value={page.avgSessionDuration} color="text-accent-purple-light" />
        <StatCard icon={Layers} label="Form Fields" value={String(page.fieldCount)} color="text-text-primary" />
      </div>

      {/* Main content: Preview + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Page preview */}
        <div className="lg:col-span-2 border border-default-border bg-surface rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Page Preview</h3>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded border",
                page.status === "active"
                  ? "text-status-success bg-status-success/10 border-status-success/20"
                  : "text-text-muted bg-text-muted/10 border-default-border"
              )}>
                {page.status === "active" ? "Active" : "Inactive"}
              </span>
              <span className="text-[10px] text-text-muted">{page.category}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 min-h-[320px] flex items-center justify-center overflow-x-auto">
            <div dangerouslySetInnerHTML={{ __html: page.pageContent }} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Performance stats */}
          {stats && (
            <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                  <span className="text-xs text-text-muted flex items-center gap-2">
                    <BarChart3 className="size-3.5" /> Campaigns
                  </span>
                  <span className="text-xs font-mono font-semibold text-text-primary">{stats.totalCampaigns}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                  <span className="text-xs text-text-muted flex items-center gap-2">
                    <TrendingUp className="size-3.5" /> Avg. Conversion
                  </span>
                  <span className="text-xs font-mono font-semibold text-accent-cyan-light">{stats.avgConversion}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-default-border/40">
                  <span className="text-xs text-text-muted flex items-center gap-2">
                    <Eye className="size-3.5" /> Peak Visitors
                  </span>
                  <span className="text-xs font-mono font-semibold text-text-primary">{stats.peakVisitors}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-text-muted flex items-center gap-2">
                    <Clock className="size-3.5" /> Last Active
                  </span>
                  <span className="text-xs font-mono text-text-secondary">{stats.lastActive}</span>
                </div>
              </div>
            </div>
          )}

          {/* Visitor history chart */}
          <div className="border border-default-border bg-surface rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Visitor History</h3>
            <div className="space-y-3">
              {history.map((point) => {
                const maxVisitors = Math.max(...history.map((h) => h.visitors));
                return (
                  <div key={point.date}>
                    <div className="flex justify-between text-[10px] text-text-muted mb-1">
                      <span>{point.date}</span>
                      <span>{point.visitors} visits &bull; {point.submissions} subs</span>
                    </div>
                    <div className="flex gap-1 h-6 items-end">
                      <div
                        className="flex-1 rounded-t-sm bg-accent-cyan/60"
                        style={{ height: `${(point.visitors / maxVisitors) * 100}%` }}
                      />
                      <div
                        className="flex-1 rounded-t-sm bg-status-danger/50"
                        style={{ height: `${(point.submissions / maxVisitors) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-default-border/40 text-[10px] text-text-muted">
              <span className="flex items-center gap-1"><div className="size-2 rounded-sm bg-accent-cyan/60" /> Visitors</span>
              <span className="flex items-center gap-1"><div className="size-2 rounded-sm bg-status-danger/50" /> Submissions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Raw HTML content */}
      <div className="border border-default-border bg-surface rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Page Source</h3>
        <pre className="text-[11px] text-text-secondary leading-relaxed bg-void rounded-lg border border-default-border/40 p-4 overflow-x-auto whitespace-pre-wrap font-mono">
          {page.pageContent}
        </pre>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; color: string;
}) {
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
