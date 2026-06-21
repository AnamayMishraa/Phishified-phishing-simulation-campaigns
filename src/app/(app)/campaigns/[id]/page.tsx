"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api/client";
import type { CampaignDetail, CampaignAssignment, CampaignActivity as ApiActivity, PaginatedResponse } from "@/lib/api/types";
import {
  ArrowLeft,
  Play,
  Pause,
  Edit,
  Trash2,
  MousePointerClick,
  ShieldCheck,
  Send,
  Eye,
  KeyRound,
  Users,
  Calendar,
  User,
  Check,
  X,
  Flag,
  Clock,
  Loader2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  sent: Send,
  opened: Eye,
  clicked: MousePointerClick,
  submitted: KeyRound,
  reported: ShieldCheck,
  event: Flag,
};

const activityStyles: Record<string, string> = {
  sent: "text-accent-blue-light bg-accent-blue/10",
  opened: "text-accent-cyan-light bg-accent-cyan/10",
  clicked: "text-status-danger bg-status-danger/10",
  submitted: "text-status-warning bg-status-warning/10",
  reported: "text-status-success bg-status-success/10",
  event: "text-text-secondary bg-text-muted/10",
};

function formatRate(rate: number | null | undefined): string {
  if (rate == null) return "—";
  return `${(rate * 100).toFixed(1)}%`;
}

function hasOpened(target: CampaignAssignment): boolean {
  return !!target.opened_at;
}

function hasClicked(target: CampaignAssignment): boolean {
  return !!target.clicked_at;
}

function hasSubmitted(target: CampaignAssignment): boolean {
  return !!target.submitted_at;
}

function hasReported(target: CampaignAssignment): boolean {
  return !!target.reported_at;
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="border border-default-border bg-surface rounded-xl p-4">
      <div className="flex items-center gap-2 text-text-muted mb-2">
        <Icon className="size-3.5" />
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className={cn("text-sm font-semibold font-mono", color)}>
        {value}
      </span>
    </div>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [assignments, setAssignments] = useState<CampaignAssignment[]>([]);
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [launching, setLaunching] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [resuming, setResuming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const handleExportCsv = async () => {
    setExportingCsv(true);
    try {
      const token = localStorage.getItem("access_token");
      const url = `http://localhost:8000/api/v1/campaigns/${id}/export-csv/`;
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${campaign?.name ?? "campaign"}-export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error("Failed to export CSV");
    } finally {
      setExportingCsv(false);
    }
  };

  const fetchCampaign = useCallback(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      api<CampaignDetail>(`/campaigns/${id}/`),
      api<PaginatedResponse<CampaignAssignment>>(`/campaigns/${id}/assignments/`).catch(() => ({ results: [], count: 0, next: null, previous: null })),
      api<PaginatedResponse<ApiActivity>>(`/campaigns/${id}/activities/`).catch(() => ({ results: [], count: 0, next: null, previous: null })),
    ])
      .then(([camp, assignData, activityData]) => {
        if (!cancelled) {
          setCampaign(camp);
          setAssignments(assignData.results);
          setActivities(activityData.results);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof ApiError ? String(err.body ?? err.message) : "Failed to load campaign");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleLaunch = async () => {
    setLaunching(true);
    try {
      await api(`/campaigns/${id}/launch/`, { method: "POST" });
      toast.success("Campaign launched successfully");
      fetchCampaign();
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Failed to launch campaign"
          : "Failed to launch campaign";
      toast.error(message);
    } finally {
      setLaunching(false);
    }
  };

  const handlePause = async () => {
    setPausing(true);
    try {
      await api(`/campaigns/${id}/pause/`, { method: "POST" });
      toast.success("Campaign paused");
      fetchCampaign();
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Failed to pause campaign"
          : "Failed to pause campaign";
      toast.error(message);
    } finally {
      setPausing(false);
    }
  };

  const handleResume = async () => {
    setResuming(true);
    try {
      await api(`/campaigns/${id}/resume/`, { method: "POST" });
      toast.success("Campaign resumed");
      fetchCampaign();
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Failed to resume campaign"
          : "Failed to resume campaign";
      toast.error(message);
    } finally {
      setResuming(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api(`/campaigns/${id}/`, { method: "DELETE" });
      toast.success("Campaign deleted");
      router.push("/campaigns");
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Failed to delete campaign"
          : "Failed to delete campaign";
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
        <div className="text-center py-12 text-sm text-text-muted">Loading campaign...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/campaigns" className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline">
          <ArrowLeft className="size-4" /> Back to campaigns
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

  if (!campaign) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/campaigns" className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline">
          <ArrowLeft className="size-4" /> Back to campaigns
        </Link>
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">Campaign not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <Link
          href="/campaigns"
          className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all shrink-0 mt-1"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary">
              {campaign.name}
            </h1>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-sm text-text-muted">
            {campaign.department} &bull; {campaign.type} &bull; {campaign.sent_count.toLocaleString()} employees
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {campaign.status === "active" ? (
            <Button variant="outline" size="sm" disabled={pausing} onClick={handlePause} className="text-xs flex items-center gap-1.5">
              {pausing ? <><Loader2 className="size-3.5 animate-spin" /> Pausing...</> : <><Pause className="size-3.5" /> Pause</>}
            </Button>
          ) : campaign.status === "draft" ? (
            <Button
              variant="outline"
              size="sm"
              disabled={launching}
              onClick={handleLaunch}
              className="text-xs flex items-center gap-1.5"
            >
              {launching ? (
                <><Loader2 className="size-3.5 animate-spin" /> Launching...</>
              ) : (
                <><Play className="size-3.5" /> Launch</>
              )}
            </Button>
          ) : campaign.status === "paused" ? (
            <Button variant="outline" size="sm" disabled={resuming} onClick={handleResume} className="text-xs flex items-center gap-1.5">
              {resuming ? <><Loader2 className="size-3.5 animate-spin" /> Resuming...</> : <><Play className="size-3.5" /> Resume</>}
            </Button>
          ) : null}
          {campaign.status !== "completed" && (
            <Link href={`/campaigns/${campaign.id}/edit`}>
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
                <Edit className="size-3.5" /> Edit
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={exportingCsv}
            onClick={handleExportCsv}
            className="text-xs flex items-center gap-1.5"
          >
            {exportingCsv ? (
              <><Loader2 className="size-3.5 animate-spin" /> Exporting...</>
            ) : (
              <><Download className="size-3.5" /> CSV</>
            )}
          </Button>
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger render={
              <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 text-status-danger">
                <Trash2 className="size-3.5" /> Delete
              </Button>
            } />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Campaign</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{campaign.name}"? This action cannot be undone.
                  {campaign.status === "active" && " Active campaigns must be paused before deletion."}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="outline" size="sm" disabled={deleting}>Cancel</Button>} />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deleting}
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
        <StatCard icon={Send} label="Targeted" value={campaign.sent_count.toLocaleString()} color="text-text-primary" />
        <StatCard icon={Eye} label="Opened" value={`${campaign.open_count} (${formatRate(campaign.open_rate)})`} color="text-accent-cyan-light" />
        <StatCard icon={MousePointerClick} label="Clicked" value={`${campaign.click_count} (${formatRate(campaign.click_rate)})`} color="text-status-danger" />
        <StatCard icon={KeyRound} label="Submitted" value={`${campaign.submission_count} (${formatRate(campaign.submission_rate)})`} color="text-status-warning" />
        <StatCard icon={ShieldCheck} label="Reported" value={`${campaign.report_count} (${formatRate(campaign.report_rate)})`} color="text-status-success" />
        <StatCard icon={Users} label="Type" value={campaign.type} color="text-text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-default-border bg-surface rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Description</h3>
          <p className="text-xs text-text-secondary leading-relaxed">{campaign.description || "No description provided."}</p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-default-border/60">
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <User className="size-3.5" />
              Created by {campaign.created_by_name}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <Calendar className="size-3.5" />
              Created {new Date(campaign.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="border border-default-border bg-surface rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Activity Timeline</h3>
          <div className="space-y-0">
            {activities.length > 0 ? activities.map((activity, idx) => {
              const Icon = activityIcons[activity.activity_type] ?? Flag;
              const style = activityStyles[activity.activity_type] ?? activityStyles.event;
              return (
                <div key={activity.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {idx < activities.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-default-border/60" />
                  )}
                  <div className={cn("flex shrink-0 items-center justify-center size-[30px] rounded-lg mt-0.5", style)}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-text-secondary leading-relaxed">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="size-3 text-text-muted" />
                      <span className="text-[10px] text-text-muted">{new Date(activity.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-text-muted text-center py-4">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="border border-default-border bg-surface rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Target List</h3>
            <p className="text-xs text-text-muted mt-0.5">{assignments.length} employees targeted</p>
          </div>
        </div>

        {assignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-default-border/60">
                  <th className="text-[10px] font-medium uppercase tracking-wider text-text-muted pb-2 pr-4">Employee</th>
                  <th className="text-[10px] font-medium uppercase tracking-wider text-text-muted pb-2 pr-4 text-center">Opened</th>
                  <th className="text-[10px] font-medium uppercase tracking-wider text-text-muted pb-2 pr-4 text-center">Clicked</th>
                  <th className="text-[10px] font-medium uppercase tracking-wider text-text-muted pb-2 pr-4 text-center">Submitted</th>
                  <th className="text-[10px] font-medium uppercase tracking-wider text-text-muted pb-2 text-center">Reported</th>
                </tr>
              </thead>
              <tbody>
                {assignments.slice(0, 10).map((target) => (
                  <tr key={target.id} className="border-b border-default-border/20 last:border-0">
                    <td className="py-3 pr-4">
                      <div>
                        <p className="text-xs font-medium text-text-primary">{target.employee_name}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      {hasOpened(target) ? (
                        <Check className="size-4 text-accent-cyan-light inline" />
                      ) : (
                        <X className="size-4 text-text-muted/40 inline" />
                      )}
                    </td>
                    <td className="py-3 pr-4 text-center">
                      {hasClicked(target) ? (
                        <Check className="size-4 text-status-danger inline" />
                      ) : (
                        <X className="size-4 text-text-muted/40 inline" />
                      )}
                    </td>
                    <td className="py-3 pr-4 text-center">
                      {hasSubmitted(target) ? (
                        <Check className="size-4 text-status-warning inline" />
                      ) : (
                        <X className="size-4 text-text-muted/40 inline" />
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {hasReported(target) ? (
                        <Check className="size-4 text-status-success inline" />
                      ) : (
                        <X className="size-4 text-text-muted/40 inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-text-muted py-4 text-center">No targets assigned yet</p>
        )}
      </div>
    </div>
  );
}
