"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import type { TemplateDetail, TemplateWrite } from "@/lib/api/types";
import { Eye, Edit3, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { label: "Credential Harvesting", value: "credential_harvesting" },
  { label: "Link Click", value: "link_click" },
  { label: "Attachment", value: "attachment" },
];

const difficulties = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

interface FormValues {
  name: string;
  category: string;
  difficulty_level: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  html_content: string;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      category: "credential_harvesting",
      difficulty_level: "easy",
      sender_name: "",
      sender_email: "",
      subject: "",
      html_content: "",
    },
  });

  const watched = watch();
  const placeholderSubject = watched.subject || "[Subject line will appear here]";
  const placeholderSender = watched.sender_name || "Sender Name";
  const placeholderEmail = watched.sender_email || "sender@company.com";
  const placeholderBody = watched.html_content || "Email body content will appear here...";

  const categoryLabel = categories.find((c) => c.value === watched.category)?.label ?? watched.category;
  const difficultyLabel = difficulties.find((d) => d.value === watched.difficulty_level)?.label ?? watched.difficulty_level;

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      const created = await api<TemplateDetail>("/templates/", {
        method: "POST",
        body: {
          name: data.name,
          category: data.category,
          difficulty_level: data.difficulty_level,
          sender_name: data.sender_name || undefined,
          sender_email: data.sender_email || undefined,
          subject: data.subject || "",
          html_content: data.html_content || undefined,
        } satisfies TemplateWrite,
      });

      toast.success("Template created successfully");
      router.push(`/templates/${created.id}`);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : JSON.stringify(e.body)
          : "Failed to create template";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        title="New Template"
        description="Design a new phishing simulation email template"
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Tabs */}
        <div className="flex items-center gap-1.5 rounded-lg border border-default-border bg-surface p-0.5 w-fit">
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors",
              tab === "edit" ? "bg-accent-blue/10 text-accent-blue-light" : "text-text-muted hover:text-text-primary"
            )}
          >
            <Edit3 className="size-3.5" /> Editor
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors",
              tab === "preview" ? "bg-accent-blue/10 text-accent-blue-light" : "text-text-muted hover:text-text-primary"
            )}
          >
            <Eye className="size-3.5" /> Preview
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mt-5">
          {/* Editor */}
          <div className={cn("lg:col-span-3 space-y-5", tab === "preview" && "hidden lg:block")}>
            <div className="border border-default-border bg-surface rounded-xl p-5 space-y-5">
              <div className="space-y-2">
                <label htmlFor="template-name" className="text-xs font-medium text-text-secondary">
                  Template Name <span className="text-status-danger">*</span>
                </label>
                <input
                  id="template-name"
                  type="text"
                  {...register("name", { required: "Template name is required" })}
                  placeholder="e.g. Q4 Payroll Notification"
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                />
                {errors.name && (
                  <p className="text-[10px] text-status-danger">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="template-category" className="text-xs font-medium text-text-secondary">Category</label>
                  <select
                    id="template-category"
                    {...register("category")}
                    className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
                  >
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="template-difficulty" className="text-xs font-medium text-text-secondary">Difficulty</label>
                  <select
                    id="template-difficulty"
                    {...register("difficulty_level")}
                    className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
                  >
                    {difficulties.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="template-sender-name" className="text-xs font-medium text-text-secondary">Sender Name</label>
                  <input
                    id="template-sender-name"
                    type="text"
                    {...register("sender_name")}
                    placeholder="e.g. IT Security Team"
                    className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="template-sender-email" className="text-xs font-medium text-text-secondary">Sender Email</label>
                  <input
                    id="template-sender-email"
                    type="text"
                    {...register("sender_email", {
                      pattern: {
                        value: /^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email format",
                      },
                    })}
                    placeholder="e.g. security@company.com"
                    className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                  />
                  {errors.sender_email && (
                    <p className="text-[10px] text-status-danger">{errors.sender_email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="template-subject" className="text-xs font-medium text-text-secondary">
                  Subject Line <span className="text-status-danger">*</span>
                </label>
                <input
                  id="template-subject"
                  type="text"
                  {...register("subject", { required: "Subject line is required" })}
                  placeholder="e.g. Urgent: Password Reset Required"
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                />
                {errors.subject && (
                  <p className="text-[10px] text-status-danger">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="template-body" className="text-xs font-medium text-text-secondary">Email Body</label>
                  <Button type="button" variant="ghost" size="sm" className="text-[10px] flex items-center gap-1 text-accent-blue-light">
                    <Sparkles className="size-3" /> AI Generate
                  </Button>
                </div>
                <textarea
                  id="template-body"
                  {...register("html_content")}
                  rows={10}
                  placeholder="Write the phishing email content..."
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 resize-none font-mono leading-relaxed"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-status-danger/30 bg-status-danger/5 p-3">
                <p className="text-xs text-status-danger">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => router.push("/templates")}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="size-3.5 animate-spin" /> Creating...</>
                ) : (
                  "Create Template"
                )}
              </Button>
            </div>
          </div>

          {/* Preview panel */}
          <div className={cn("lg:col-span-2", tab === "edit" && "hidden lg:block")}>
            <div className="border border-default-border bg-surface rounded-xl p-5 sticky top-6">
              <h3 className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Eye className="size-3.5" /> Live Preview
              </h3>

              <div className="bg-void rounded-lg border border-default-border/40">
                {/* Email header */}
                <div className="px-4 py-3 border-b border-default-border/40 space-y-1">
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-text-muted shrink-0">From:</span>
                    <span className="text-text-secondary font-medium truncate">{placeholderSender}</span>
                    <span className="text-text-muted/60 truncate">&lt;{placeholderEmail}&gt;</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="text-text-muted shrink-0">Subject:</span>
                    <span className="text-text-secondary font-medium truncate">{placeholderSubject}</span>
                  </div>
                </div>
                {/* Email body */}
                <div className="px-4 py-4">
                  <div className="text-[11px] text-text-secondary leading-relaxed whitespace-pre-line">
                    {placeholderBody}
                  </div>
                  {!watched.html_content && (
                    <div className="mt-3 rounded-lg border border-dashed border-default-border/60 p-4 text-center">
                      <p className="text-[10px] text-text-muted">Email content will appear here as you type</p>
                    </div>
                  )}
                </div>
              </div>

              {watched.name && (
                <div className="mt-3 flex items-center gap-2 text-[10px] text-text-muted bg-void rounded-lg px-3 py-2 border border-default-border/40">
                  <span className="font-medium text-text-secondary">Template:</span>
                  <span>{watched.name}</span>
                  <span className="text-text-muted/50">•</span>
                  <span className={cn(
                    watched.difficulty_level === "easy" && "text-status-success",
                    watched.difficulty_level === "medium" && "text-status-warning",
                    watched.difficulty_level === "hard" && "text-status-danger",
                  )}>{difficultyLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
