"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { api, ApiError, getErrorMessage } from "@/lib/api/client";
import type { CampaignDetail, Template, LandingPage, PaginatedResponse } from "@/lib/api/types";
import { ArrowLeft, Send, MessageSquare, Smartphone, QrCode, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const campaignTypes = [
  { value: "email", label: "Email", icon: Send },
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "voice", label: "Voice", icon: Smartphone },
  { value: "qr_code", label: "QR Code", icon: QrCode },
];

const departments = [
  { value: "", label: "All Departments" },
  { value: "Engineering", label: "Engineering" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "Finance", label: "Finance" },
  { value: "HR", label: "HR" },
  { value: "Operations", label: "Operations" },
  { value: "Legal", label: "Legal" },
];

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignType, setCampaignType] = useState("email");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedLandingPage, setSelectedLandingPage] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState("");

  const [templates, setTemplates] = useState<Template[]>([]);
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    Promise.all([
      api<CampaignDetail>(`/campaigns/${id}/`),
      api<PaginatedResponse<Template>>("/templates/")
        .then((r) => r.results.filter((t) => t.is_active))
        .catch(() => [] as Template[]),
      api<PaginatedResponse<LandingPage>>("/landing-pages/")
        .then((r) => r.results.filter((lp) => lp.is_active))
        .catch(() => [] as LandingPage[]),
    ])
      .then(([campaign, tpls, lps]) => {
        if (!cancelled) {
          setName(campaign.name);
          setDescription(campaign.description);
          setCampaignType(campaign.type);
          setSelectedTemplate(campaign.email_template);
          setSelectedLandingPage(campaign.landing_page);
          setSelectedDept(campaign.department || "");
          setTemplates(tpls);
          setLandingPages(lps);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFetchError(getErrorMessage(err, "Failed to load campaign"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Campaign name is required");
      return;
    }

    if (campaignType !== "qr_code" && !selectedLandingPage) {
      toast.error("Landing page is required for this campaign type");
      return;
    }

    setSaving(true);
    try {
      await api(`/campaigns/${id}/`, {
        method: "PATCH",
        body: {
          name: name.trim(),
          type: campaignType as "email" | "sms" | "voice" | "qr_code",
          description: description || undefined,
          department: selectedDept || undefined,
          email_template: selectedTemplate,
          landing_page: selectedLandingPage,
        },
      });

      toast.success("Campaign updated");
      router.push(`/campaigns/${id}`);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : "Failed to update campaign"
          : "Failed to update campaign";
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
        <div className="text-center py-12 text-sm text-text-muted">Loading campaign...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link href="/campaigns" className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline">
          <ArrowLeft className="size-4" /> Back to campaigns
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
        href={`/campaigns/${id}`}
        className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline w-fit"
      >
        <ArrowLeft className="size-4" /> Back to campaign
      </Link>

      <PageHeader
        title="Edit Campaign"
        description="Update campaign details, content, and targeting."
      />

      <div className="border border-default-border bg-surface rounded-xl p-6 space-y-5">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">Campaign Details</h3>
          <p className="text-xs text-text-muted">Modify the name, type, and description.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="edit-name" className="text-xs font-medium text-text-secondary">
            Campaign Name <span className="text-status-danger">*</span>
          </label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q4 Security Awareness Test"
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-text-secondary">Campaign Type</label>
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
          <label htmlFor="edit-desc" className="text-xs font-medium text-text-secondary">Description (optional)</label>
          <textarea
            id="edit-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of campaign goals..."
            rows={3}
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 resize-none"
          />
        </div>
      </div>

      <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">Email Template</h3>
          <p className="text-xs text-text-muted">Select a phishing template for email campaigns.</p>
        </div>

        {campaignType === "email" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto">
            {templates.length === 0 ? (
              <p className="text-xs text-text-muted col-span-full text-center py-4">No templates available</p>
            ) : templates.map((template) => (
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
              </button>
            ))}
          </div>
        )}

        {campaignType !== "email" && (
          <p className="text-xs text-text-muted text-center py-2">
            Template selection is only available for email campaigns.
          </p>
        )}
      </div>

      <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">Landing Page <span className="text-status-danger">*</span></h3>
          <p className="text-xs text-text-muted">The page users see after clicking the phishing link</p>
        </div>

        {campaignType !== "qr_code" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[200px] overflow-y-auto">
            {landingPages.length === 0 ? (
              <p className="text-xs text-text-muted col-span-full text-center py-4">No landing pages available</p>
            ) : landingPages.map((lp) => (
              <button
                key={lp.id}
                type="button"
                onClick={() => setSelectedLandingPage(selectedLandingPage === lp.id ? null : lp.id)}
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

        {campaignType === "qr_code" && (
          <p className="text-xs text-text-muted text-center py-2">
            Landing pages are not used for QR code campaigns.
          </p>
        )}
      </div>

      <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">Target Group</h3>
          <p className="text-xs text-text-muted">Choose which department to target.</p>
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
                {dept.value === "" ? "All employees" : `${dept.label} department`}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Link href={`/campaigns/${id}`}>
          <Button variant="outline" size="sm" disabled={saving}>Cancel</Button>
        </Link>
        <Button
          size="sm"
          disabled={saving || !name.trim()}
          onClick={handleSave}
          className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2"
        >
          {saving ? (
            <><Loader2 className="size-3.5 animate-spin" /> Saving...</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
