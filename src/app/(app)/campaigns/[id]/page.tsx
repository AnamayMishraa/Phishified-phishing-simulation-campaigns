import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { campaigns, getCampaignTargets, getCampaignActivities } from "@/data/campaigns";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return campaigns.map((c) => ({ id: c.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "Campaign — Phishified" };
}

const activityIcons = {
  sent: Send,
  opened: Eye,
  clicked: MousePointerClick,
  submitted: KeyRound,
  reported: ShieldCheck,
  event: Flag,
};

const activityStyles = {
  sent: "text-accent-blue-light bg-accent-blue/10",
  opened: "text-accent-cyan-light bg-accent-cyan/10",
  clicked: "text-status-danger bg-status-danger/10",
  submitted: "text-status-warning bg-status-warning/10",
  reported: "text-status-success bg-status-success/10",
  event: "text-text-secondary bg-text-muted/10",
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    notFound();
  }

  const targets = getCampaignTargets(id);
  const activities = getCampaignActivities(id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
            {campaign.department} &bull; {campaign.type} &bull; {campaign.targetCount.toLocaleString()} employees
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {campaign.status === "active" ? (
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <Pause className="size-3.5" /> Pause
            </Button>
          ) : campaign.status === "draft" ? (
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <Play className="size-3.5" /> Launch
            </Button>
          ) : null}
          {campaign.status !== "completed" && (
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <Edit className="size-3.5" /> Edit
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 text-status-danger">
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>

      {/* Stats grid — 6 cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Send} label="Targeted" value={campaign.targetCount.toLocaleString()} color="text-text-primary" />
        <StatCard icon={Eye} label="Opened" value={`${campaign.openCount} (${campaign.openRate})`} color="text-accent-cyan-light" />
        <StatCard icon={MousePointerClick} label="Clicked" value={`${campaign.clickCount} (${campaign.clickRate})`} color="text-status-danger" />
        <StatCard icon={KeyRound} label="Submitted" value={`${campaign.submissionCount} (${campaign.submissionRate})`} color="text-status-warning" />
        <StatCard icon={ShieldCheck} label="Reported" value={`${campaign.reportCount} (${campaign.reportRate})`} color="text-status-success" />
        <StatCard icon={Users} label="Type" value={campaign.type} color="text-text-primary" />
      </div>

      {/* Description + Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 border border-default-border bg-surface rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Description</h3>
          <p className="text-xs text-text-secondary leading-relaxed">{campaign.description}</p>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-default-border/60">
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <User className="size-3.5" />
              Created by {campaign.createdBy}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <Calendar className="size-3.5" />
              Created {campaign.createdAt}
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="border border-default-border bg-surface rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Activity Timeline</h3>
          <div className="space-y-0">
            {activities.map((activity, idx) => {
              const AIcon = activityIcons[activity.type];
              const style = activityStyles[activity.type];
              return (
                <div key={activity.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {idx < activities.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-default-border/60" />
                  )}
                  <div className={cn("flex shrink-0 items-center justify-center size-[30px] rounded-lg mt-0.5", style)}>
                    <AIcon className="size-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-text-secondary leading-relaxed">{activity.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="size-3 text-text-muted" />
                      <span className="text-[10px] text-text-muted">{activity.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target List */}
      <div className="border border-default-border bg-surface rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Target List</h3>
            <p className="text-xs text-text-muted mt-0.5">{targets.length} employees targeted</p>
          </div>
        </div>

        {targets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-default-border/60">
                  <th className="text-[10px] font-medium uppercase tracking-wider text-text-muted pb-2 pr-4">Employee</th>
                  <th className="text-[10px] font-medium uppercase tracking-wider text-text-muted pb-2 pr-4">Department</th>
                  <th className="text-[10px] font-medium uppercase tracking-wider text-text-muted pb-2 pr-4 text-center">Clicked</th>
                  <th className="text-[10px] font-medium uppercase tracking-wider text-text-muted pb-2 pr-4 text-center">Submitted</th>
                  <th className="text-[10px] font-medium uppercase tracking-wider text-text-muted pb-2 text-center">Reported</th>
                </tr>
              </thead>
              <tbody>
                {targets.slice(0, 10).map((target) => (
                  <tr key={target.id} className="border-b border-default-border/20 last:border-0">
                    <td className="py-3 pr-4">
                      <div>
                        <p className="text-xs font-medium text-text-primary">{target.name}</p>
                        <p className="text-[10px] text-text-muted">{target.email}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-text-secondary">{target.department}</span>
                    </td>
                    <td className="py-3 pr-4 text-center">
                      {target.clicked ? (
                        <Check className="size-4 text-status-danger inline" />
                      ) : (
                        <X className="size-4 text-text-muted/40 inline" />
                      )}
                    </td>
                    <td className="py-3 pr-4 text-center">
                      {target.submitted ? (
                        <Check className="size-4 text-status-warning inline" />
                      ) : (
                        <X className="size-4 text-text-muted/40 inline" />
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {target.reported ? (
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
