"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StepIndicator } from "@/components/ui/step-indicator";
import { api, ApiError } from "@/lib/api/client";
import type { Template, LandingPage, PaginatedResponse, CampaignDetail } from "@/lib/api/types";
import { Send, ArrowRight, Check, ChevronLeft, Users, Calendar, FileText, Loader2, Smartphone, MessageSquare, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Campaign Details", icon: FileText },
  { id: 2, label: "Select Template", icon: Send },
  { id: 3, label: "Target Group", icon: Users },
  { id: 4, label: "Schedule", icon: Calendar },
];

const campaignTypes = [
  { value: "email", label: "Email", icon: Send },
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "voice", label: "Voice", icon: Smartphone },
  { value: "qr_code", label: "QR Code", icon: QrCode },
];

const departments = [
  { value: "", label: "All Departments", count: null },
  { value: "Engineering", label: "Engineering", count: 240 },
  { value: "Marketing", label: "Marketing", count: 85 },
  { value: "Sales", label: "Sales", count: 120 },
  { value: "Finance", label: "Finance", count: 65 },
  { value: "HR", label: "HR", count: 45 },
  { value: "Operations", label: "Operations", count: 95 },
  { value: "Legal", label: "Legal", count: 30 },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState("email");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedLandingPage, setSelectedLandingPage] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState("");
  const [schedule, setSchedule] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");

  // API data
  const [templates, setTemplates] = useState<Template[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templateSearch, setTemplateSearch] = useState("");

  useEffect(() => {
    Promise.all([
      api<PaginatedResponse<Template>>("/templates/").catch(() => ({ results: [], count: 0, next: null, previous: null })),
      api<PaginatedResponse<LandingPage>>("/landing-pages/").catch(() => ({ results: [], count: 0, next: null, previous: null })),
    ]).then(([tplData, lpData]) => {
      setTemplates(tplData.results.filter((t) => t.is_active));
      setLandingPages(lpData.results.filter((lp) => lp.is_active));
    }).finally(() => setTemplatesLoading(false));
  }, []);

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const canNext = () => {
    switch (step) {
      case 1: return name.trim().length > 0;
      case 2:
        if (campaignType === "email") return selectedTemplate !== null && selectedLandingPage !== null;
        if (campaignType === "qr_code") return true;
        return selectedLandingPage !== null;
      case 3: return true;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < 4 && canNext()) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const saveDraft = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const created = await api<CampaignDetail>("/campaigns/", {
        method: "POST",
        body: {
          name: name.trim(),
          type: campaignType as "email" | "sms" | "voice" | "qr_code",
          description: description || undefined,
          department: selectedDept || undefined,
          email_template: selectedTemplate,
          landing_page: selectedLandingPage,
          scheduled_date: schedule === "later" && scheduleDate
            ? new Date(scheduleDate).toISOString()
            : undefined,
        },
      });

      toast.success("Campaign saved as draft");
      router.push(`/campaigns/${created.id}`);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Failed to save campaign"
          : "Failed to save campaign";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const launchCampaign = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const created = await api<CampaignDetail>("/campaigns/", {
        method: "POST",
        body: {
          name: name.trim(),
          type: campaignType as "email" | "sms" | "voice" | "qr_code",
          description: description || undefined,
          department: selectedDept || undefined,
          email_template: selectedTemplate,
          landing_page: selectedLandingPage,
          scheduled_date: schedule === "later" && scheduleDate
            ? new Date(scheduleDate).toISOString()
            : undefined,
        },
      });

      await api(`/campaigns/${created.id}/launch/`, { method: "POST" });

      toast.success("Campaign launched successfully");
      router.push(`/campaigns/${created.id}`);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Failed to launch campaign"
          : "Failed to launch campaign";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <PageHeader
        title="New Campaign"
        description="Configure and launch a new phishing simulation campaign"
      />

      <StepIndicator steps={steps} currentStep={step} onStepClick={(id) => { if (id < step) setStep(id); }} />

      {/* Step content */}
      <div className="border border-default-border bg-surface rounded-xl p-6">
        {/* Step 1: Campaign Details */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Campaign Details</h3>
              <p className="text-xs text-text-muted">Name your campaign and choose the type of simulation.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="campaign-name" className="text-xs font-medium text-text-secondary">
                Campaign Name <span className="text-status-danger">*</span>
              </label>
              <input
                id="campaign-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 Security Awareness Test"
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="campaign-type" className="text-xs font-medium text-text-secondary">Campaign Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {campaignTypes.map((ct) => {
                  const Icon = ct.icon;
                  return (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => {
                        setCampaignType(ct.value);
                        if (ct.value !== "email") setSelectedTemplate(null);
                        if (ct.value === "qr_code") setSelectedLandingPage(null);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all text-center",
                        campaignType === ct.value
                          ? "border-accent-blue/40 bg-accent-blue/5"
                          : "border-default-border hover:border-accent-blue/20"
                      )}
                    >
                      <Icon className={cn(
                        "size-4",
                        campaignType === ct.value ? "text-accent-blue-light" : "text-text-muted"
                      )} />
                      <span className={cn(
                        "text-[11px] font-medium",
                        campaignType === ct.value ? "text-accent-blue-light" : "text-text-secondary"
                      )}>{ct.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="campaign-desc" className="text-xs font-medium text-text-secondary">Description (optional)</label>
              <textarea
                id="campaign-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of campaign goals..."
                rows={3}
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Template & Landing Page Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Select Content</h3>
              <p className="text-xs text-text-muted">Choose the phishing template and landing page for this campaign.</p>
            </div>

            {campaignType === "email" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-text-secondary">Email Template <span className="text-status-danger">*</span></label>
                  {templatesLoading && <Loader2 className="size-3 animate-spin text-text-muted" />}
                </div>
                <SearchInput
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                />
                {filteredTemplates.length === 0 && !templatesLoading ? (
                  <p className="text-xs text-text-muted text-center py-4">No templates found. Create one first.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto">
                    {filteredTemplates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplate(template.id)}
                        className={cn(
                          "text-left border rounded-lg p-3 transition-all",
                          selectedTemplate === template.id
                            ? "border-accent-blue/40 bg-accent-blue/5"
                            : "border-default-border hover:border-accent-blue/20"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-[10px] font-semibold text-accent-purple-light uppercase bg-accent-purple/10 border border-accent-purple/20 rounded px-1.5 py-0.5">
                            {template.category.replace("_", " ")}
                          </span>
                          {selectedTemplate === template.id && (
                            <Check className="size-3.5 text-accent-blue-light shrink-0" />
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-text-primary">{template.name}</h4>
                        <p className="text-[10px] text-text-muted mt-1.5 line-clamp-2">{template.subject}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-text-muted capitalize">{template.difficulty_level}</span>
                          <span className="text-[10px] text-text-muted/50">•</span>
                          <span className="text-[10px] text-text-muted">{template.sender_name || "No sender"}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {campaignType !== "qr_code" && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-text-secondary">Landing Page <span className="text-status-danger">*</span></label>
                <p className="text-[10px] text-text-muted -mt-1">The page users see after clicking the phishing link</p>
                {landingPages.length === 0 ? (
                  <p className="text-xs text-text-muted py-2">No landing pages available</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {landingPages.map((lp) => (
                      <button
                        key={lp.id}
                        type="button"
                        onClick={() => setSelectedLandingPage(
                          selectedLandingPage === lp.id ? null : lp.id
                        )}
                        className={cn(
                          "text-left border rounded-lg p-3 transition-all",
                          selectedLandingPage === lp.id
                            ? "border-accent-blue/40 bg-accent-blue/5"
                            : "border-default-border hover:border-accent-blue/20"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-semibold text-text-primary">{lp.name}</h4>
                          {selectedLandingPage === lp.id && (
                            <Check className="size-3.5 text-accent-blue-light shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-text-muted mt-1 capitalize">{lp.category.replace("_", " ")}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Target Group */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Select Target Group</h3>
              <p className="text-xs text-text-muted">Choose which department to target with this campaign.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments.map((dept) => (
                <button
                  key={dept.value}
                  type="button"
                  onClick={() => setSelectedDept(dept.value)}
                  className={cn(
                    "text-left border rounded-lg p-4 transition-all",
                    selectedDept === dept.value
                      ? "border-accent-blue/40 bg-accent-blue/5"
                      : "border-default-border hover:border-accent-blue/20"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-semibold text-text-primary">{dept.label}</h4>
                    {selectedDept === dept.value && (
                      <Check className="size-3.5 text-accent-blue-light" />
                    )}
                  </div>
                  <p className="text-[10px] text-text-muted">
                    {dept.count ? `${dept.count.toLocaleString()} employees` : "All employees"}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Schedule */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Schedule Campaign</h3>
              <p className="text-xs text-text-muted">Choose when to launch and how to space out deliveries.</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium text-text-secondary">Launch</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSchedule("now")}
                  className={cn(
                    "border rounded-lg p-4 text-left transition-all",
                    schedule === "now"
                      ? "border-accent-blue/40 bg-accent-blue/5"
                      : "border-default-border hover:border-accent-blue/20"
                  )}
                >
                  <h4 className="text-xs font-semibold text-text-primary">Launch Now</h4>
                  <p className="text-[10px] text-text-muted mt-1">Launch immediately after creation</p>
                </button>
                <button
                  type="button"
                  onClick={() => setSchedule("later")}
                  className={cn(
                    "border rounded-lg p-4 text-left transition-all",
                    schedule === "later"
                      ? "border-accent-blue/40 bg-accent-blue/5"
                      : "border-default-border hover:border-accent-blue/20"
                  )}
                >
                  <h4 className="text-xs font-semibold text-text-primary">Schedule Later</h4>
                  <p className="text-[10px] text-text-muted mt-1">Set a specific launch date</p>
                </button>
              </div>
            </div>

            {schedule === "later" && (
              <div className="space-y-2">
                <label htmlFor="launch-date" className="text-xs font-medium text-text-secondary">Launch Date</label>
                <input
                  id="launch-date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-status-danger/30 bg-status-danger/5 p-3">
                <p className="text-xs text-status-danger">{error}</p>
              </div>
            )}

            <div className="rounded-lg border border-default-border/60 bg-void/30 p-4 space-y-2">
              <h4 className="text-xs font-semibold text-text-primary">Summary</h4>
              <div className="space-y-1 text-[11px] text-text-secondary">
                <p><span className="text-text-muted">Name:</span> {name}</p>
                <p><span className="text-text-muted">Type:</span> <span className="capitalize">{campaignType.replace("_", " ")}</span></p>
                {campaignType === "email" && selectedTemplate && (
                  <p><span className="text-text-muted">Template:</span> {templates.find((t) => t.id === selectedTemplate)?.name || "Selected"}</p>
                )}
                {selectedLandingPage && (
                  <p><span className="text-text-muted">Landing Page:</span> {landingPages.find((lp) => lp.id === selectedLandingPage)?.name || "Selected"}</p>
                )}
                <p><span className="text-text-muted">Target:</span> {selectedDept || "All employees"}</p>
                <p><span className="text-text-muted">Schedule:</span> {schedule === "now" ? "Immediately" : scheduleDate || "Not set"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div>
          {step > 1 && (
            <Button variant="outline" size="sm" onClick={handleBack} disabled={submitting} className="flex items-center gap-1.5">
              <ChevronLeft className="size-3.5" /> Back
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          {step < 4 ? (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={saveDraft}
              >
                Save as Draft
              </Button>
              <Button
                size="sm"
                disabled={!canNext() || submitting}
                onClick={handleNext}
                className={cn(
                  "flex items-center gap-2",
                  canNext() && !submitting
                    ? "bg-accent-blue hover:bg-accent-blue-dim text-white"
                    : "bg-accent-blue/30 text-white/50 cursor-not-allowed"
                )}
              >
                Next Step <ArrowRight className="size-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={submitting}
                onClick={saveDraft}
              >
                {submitting ? <><Loader2 className="size-3.5 animate-spin" /> Saving...</> : "Save as Draft"}
              </Button>
              <Button
                disabled={submitting}
                onClick={launchCampaign}
                className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="size-3.5 animate-spin" /> Launching...</>
                ) : (
                  <><Send className="size-3.5" /> Launch Campaign</>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
