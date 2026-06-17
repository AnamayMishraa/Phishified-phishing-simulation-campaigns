import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, MousePointerClick, Check, X, TrendingUp, TrendingDown, Minus, Calendar, Building2, Briefcase } from "lucide-react";
import { employees, getRiskLevel, getEmployeeCampaignHistory, getEmployeeTrainingProgress, getEmployeeRiskAssessment } from "@/data/employees";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return employees.map((e) => ({ id: String(e.id) }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return { title: "Employee — Phishified" };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const outcomeBadge: Record<string, { label: string; color: string }> = {
  Passed: { label: "Passed", color: "text-status-success bg-status-success/10 border-status-success/20" },
  Clicked: { label: "Clicked", color: "text-status-danger bg-status-danger/10 border-status-danger/20" },
  Submitted: { label: "Submitted", color: "text-status-warning bg-status-warning/10 border-status-warning/20" },
};

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const employee = employees.find((e) => String(e.id) === id);

  if (!employee) {
    notFound();
  }

  const riskLevel = getRiskLevel(employee.riskScore);
  const campaignHistory = getEmployeeCampaignHistory(employee.id);
  const trainingProgress = getEmployeeTrainingProgress(employee.id);
  const assessment = getEmployeeRiskAssessment(employee.id);

  const trendColor = assessment.trend === "improving" ? "text-status-success" : assessment.trend === "declining" ? "text-status-danger" : "text-text-muted";

  const initials = getInitials(employee.name);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with profile */}
      <div className="flex items-start gap-4">
        <Link
          href="/employees"
          className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all shrink-0 mt-1"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex items-center gap-4 flex-1">
          <div className="size-12 rounded-full bg-accent-blue/10 flex items-center justify-center text-sm font-bold text-accent-blue-light shrink-0 border border-accent-blue/20">
            {initials}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-0.5">
              <h1 className="text-xl font-semibold tracking-tight text-text-primary">{employee.name}</h1>
              <span className={cn(
                "text-[10px] font-semibold border rounded px-2 py-0.5",
                riskLevel === "High Risk" ? "text-status-danger bg-status-danger/10 border-status-danger/20" :
                riskLevel === "Medium Risk" ? "text-status-warning bg-status-warning/10 border-status-warning/20" :
                "text-status-success bg-status-success/10 border-status-success/20"
              )}>
                {riskLevel}
              </span>
            </div>
            <p className="text-xs text-text-muted">{employee.title} &bull; {employee.department}</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5 shrink-0">
            <Mail className="size-3.5" /> Send Training
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column — Profile + Risk + Training */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profile card */}
          <div className="border border-default-border bg-surface rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Profile</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted flex items-center gap-1"><Building2 className="size-3" /> Department</span>
                <span className="text-xs font-medium text-text-secondary">{employee.department}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted flex items-center gap-1"><Briefcase className="size-3" /> Title</span>
                <span className="text-xs font-medium text-text-secondary">{employee.title}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted flex items-center gap-1"><Mail className="size-3" /> Email</span>
                <span className="text-xs font-mono text-text-secondary truncate">{employee.email}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-text-muted flex items-center gap-1"><Calendar className="size-3" /> Joined</span>
                <span className="text-xs text-text-secondary">{employee.joinDate}</span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="border border-default-border bg-surface rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Risk Assessment</h3>
              <div className={cn("flex items-center gap-1 text-xs", trendColor)}>
                {assessment.trend === "improving" && <TrendingUp className="size-3.5" />}
                {assessment.trend === "declining" && <TrendingDown className="size-3.5" />}
                {assessment.trend === "stable" && <Minus className="size-3.5" />}
                <span className="capitalize">{assessment.trend}</span>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-text-muted">Overall Risk Score</span>
                <span className={cn(
                  "text-sm font-bold font-mono",
                  riskLevel === "High Risk" ? "text-status-danger" :
                  riskLevel === "Medium Risk" ? "text-status-warning" :
                  "text-status-success"
                )}>{employee.riskScore}/100</span>
              </div>
              <div className="w-full h-2.5 bg-void rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    riskLevel === "High Risk" ? "bg-status-danger" :
                    riskLevel === "Medium Risk" ? "bg-status-warning" :
                    "bg-status-success"
                  )}
                  style={{ width: `${employee.riskScore}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[10px] text-text-muted">
                <span>Secure (0)</span>
                <span>High (100)</span>
              </div>
            </div>
            <div className="space-y-2.5">
              {assessment.factors.map((factor) => (
                <div key={factor.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] text-text-secondary">{factor.name}</span>
                    <span className={cn(
                      "text-[10px] font-medium",
                      factor.severity === "high" ? "text-status-danger" : factor.severity === "medium" ? "text-status-warning" : "text-status-success"
                    )}>
                      {factor.score}% — {factor.severity}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-void rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        factor.severity === "high" ? "bg-status-danger" : factor.severity === "medium" ? "bg-status-warning" : "bg-status-success"
                      )}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Training Progress */}
          <div className="border border-default-border bg-surface rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-text-primary">Training Progress</h3>
              <span className="text-xs text-text-muted">{employee.trainingCompleted}/{trainingProgress.length} courses</span>
            </div>
            <div className="w-full h-2 bg-void rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full bg-accent-cyan"
                style={{ width: `${(employee.trainingCompleted / trainingProgress.length) * 100}%` }}
              />
            </div>
            <div className="space-y-2">
              {trainingProgress.map((course) => (
                <div key={course.courseId} className="flex items-center justify-between py-2 border-b border-default-border/20 last:border-0">
                  <div className="flex items-center gap-2.5">
                    {course.completed ? (
                      <div className="flex items-center justify-center size-6 rounded-full bg-status-success/10">
                        <Check className="size-3 text-status-success" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center size-6 rounded-full bg-text-muted/10">
                        <X className="size-3 text-text-muted" />
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-medium text-text-primary">{course.name}</p>
                      <span className="text-[10px] text-text-muted">{course.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.completed && (
                      <span className="text-[10px] font-mono text-text-muted">{course.score}%</span>
                    )}
                    <span className={cn(
                      "text-[10px] font-medium px-1.5 py-0.5 rounded",
                      course.completed ? "text-status-success bg-status-success/10" : "text-text-muted bg-text-muted/10"
                    )}>
                      {course.completed ? "Complete" : "Pending"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column — Campaign History + Stats */}
        <div className="space-y-4">
          {/* Stats summary */}
          <div className="border border-default-border bg-surface rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Activity Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-void rounded-lg p-3 text-center">
                <span className="text-lg font-bold font-mono text-text-primary">{employee.campaignsCompleted}</span>
                <p className="text-[10px] text-text-muted mt-0.5">Campaigns</p>
              </div>
              <div className="bg-void rounded-lg p-3 text-center">
                <span className="text-lg font-bold font-mono text-status-danger">{employee.totalPhishClicked}</span>
                <p className="text-[10px] text-text-muted mt-0.5">Phish Clicks</p>
              </div>
              <div className="bg-void rounded-lg p-3 text-center">
                <span className="text-lg font-bold font-mono text-status-success">{employee.trainingCompleted}</span>
                <p className="text-[10px] text-text-muted mt-0.5">Trainings</p>
              </div>
              <div className="bg-void rounded-lg p-3 text-center">
                <span className="text-lg font-bold font-mono text-accent-purple-light">{employee.lastPhishClicked || "N/A"}</span>
                <p className="text-[10px] text-text-muted mt-0.5">Last Click</p>
              </div>
            </div>
          </div>

          {/* Campaign History */}
          <div className="border border-default-border bg-surface rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Campaign History</h3>
            <div className="space-y-2">
              {campaignHistory.map((campaign) => {
                const outcome = outcomeBadge[campaign.outcome];
                return (
                  <div key={campaign.id} className="flex items-start gap-3 py-2 border-b border-default-border/20 last:border-0">
                    <div className={cn(
                      "flex items-center justify-center size-7 rounded-lg shrink-0 mt-0.5",
                      campaign.outcome === "Passed" ? "bg-status-success/10" :
                      campaign.outcome === "Clicked" ? "bg-status-danger/10" :
                      "bg-status-warning/10"
                    )}>
                      <MousePointerClick className={cn(
                        "size-3.5",
                        campaign.outcome === "Passed" ? "text-status-success" :
                        campaign.outcome === "Clicked" ? "text-status-danger" :
                        "text-status-warning"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/campaigns/${campaign.id}`} className="text-[11px] font-medium text-text-primary hover:text-accent-blue-light transition-colors">
                        {campaign.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-text-muted">{campaign.date}</span>
                        <span className={cn("text-[10px] font-medium border rounded px-1", outcome.color)}>
                          {outcome.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <Button className="w-full bg-accent-blue hover:bg-accent-blue-dim text-white text-xs">
              Assign Training
            </Button>
            <Button variant="outline" className="w-full text-xs">
              Add to Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
