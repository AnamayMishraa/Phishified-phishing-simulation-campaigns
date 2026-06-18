"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api/client";
import type { LandingPageDetail, LandingPageWrite } from "@/lib/api/types";
import { Plus, Trash2, GripVertical, Eye, Edit3, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormField {
  id: number;
  type: "text" | "password" | "email";
  label: string;
  placeholder: string;
  required: boolean;
}

const categories = [
  { label: "Auth Portal", value: "auth_portal" },
  { label: "Corporate Page", value: "corporate_page" },
  { label: "Landing Page", value: "landing_page" },
];

const brandColors: Record<string, string> = {
  Microsoft: "#0067b8",
  Google: "#1a73e8",
  DocuSign: "#00a3e0",
  Slack: "#611f69",
  Atlassian: "#0052cc",
  Amazon: "#ff9900",
  Internal: "#2d6a4f",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    || "untitled";
}

function buildLandingPageHtml(
  brand: string,
  heading: string,
  subtext: string,
  fields: FormField[],
  buttonText: string,
): string {
  const accent = brandColors[brand] || "#3b82f6";
  const brandInitial = brand ? brand[0] : "";
  const brandBlock = brand
    ? `<div style="text-align:center;margin-bottom:20px">
<div style="width:40px;height:40px;border-radius:8px;background:${accent};margin:0 auto 12px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:bold">${brandInitial}</div>
</div>`
    : "";

  const fieldsHtml = fields.map((f) =>
    `<div style="margin-bottom:12px">
<label style="font-size:12px;color:#333;margin-bottom:4px;display:block">${f.label}${f.required ? '<span style="color:#ef4444">*</span>' : ""}</label>
<input type="${f.type}" placeholder="${f.placeholder}" style="width:100%;padding:10px 12px;font-size:14px;border:1px solid #d1d5db;border-radius:6px;outline:none;box-sizing:border-box" />
</div>`
  ).join("\n");

  return `<html><body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box">
<div style="max-width:380px;width:100%;background:#fff;border-radius:12px;padding:32px 24px;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
${brandBlock}
<h2 style="font-size:18px;font-weight:600;color:#1a1a2e;margin-bottom:4px;text-align:center">${heading || "Sign in to your account"}</h2>
<p style="font-size:13px;color:#666;margin-bottom:24px;text-align:center">${subtext || "Enter your credentials to continue"}</p>
<form method="POST" action="/api/v1/track/submit/">
${fieldsHtml}
<button type="submit" style="width:100%;padding:12px;margin-top:8px;background:${accent};color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer">${buttonText || "Sign in"}</button>
</form>
<p style="font-size:11px;color:#999;text-align:center;margin-top:16px">Protected by industry-standard encryption</p>
</div>
</div></body></html>`;
}

interface FormValues {
  name: string;
  category: string;
  brand: string;
  url: string;
  heading: string;
  subtext: string;
  button_text: string;
}

export default function NewLandingPagePage() {
  const router = useRouter();
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FormField[]>([
    { id: 1, type: "email", label: "Email", placeholder: "name@company.com", required: true },
    { id: 2, type: "password", label: "Password", placeholder: "Enter your password", required: true },
  ]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      category: "auth_portal",
      brand: "",
      url: "",
      heading: "Sign in to your account",
      subtext: "Enter your credentials to continue",
      button_text: "Sign in",
    },
  });

  const watched = watch();
  const nextId = Math.max(0, ...fields.map((f) => f.id)) + 1;

  const addField = (type: FormField["type"]) => {
    const labels = { text: "Full Name", password: "Confirm Password", email: "Phone Number" };
    const placeholders = { text: "Enter your full name", password: "Confirm your password", email: "phone@company.com" };
    setFields([...fields, { id: nextId, type, label: labels[type], placeholder: placeholders[type], required: true }]);
  };

  const removeField = (id: number) => {
    if (fields.length > 1) setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: number, key: keyof FormField, value: string | boolean) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  const accentColor = brandColors[watched.brand] || "#3b82f6";

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setError(null);

    const slug = data.url ? slugify(data.url) : slugify(data.name);
    const htmlContent = buildLandingPageHtml(
      data.brand,
      data.heading,
      data.subtext,
      fields,
      data.button_text,
    );

    try {
      const created = await api<LandingPageDetail>("/landing-pages/", {
        method: "POST",
        body: {
          name: data.name,
          slug,
          category: data.category,
          title: data.heading,
          html_content: htmlContent,
          is_active: true,
        } satisfies LandingPageWrite,
      });

      toast.success("Landing page created successfully");
      router.push(`/landing-pages/${created.id}`);
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : JSON.stringify(e.body)
          : "Failed to create landing page";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <PageHeader
        title="New Landing Page"
        description="Design a new phishing simulation landing page"
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
            <Edit3 className="size-3.5" /> Builder
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
          {/* Builder panel */}
          <div className={cn("lg:col-span-3 space-y-5", tab === "preview" && "hidden lg:block")}>
            {/* Basic settings */}
            <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Basic Settings</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-text-muted">
                    Page Name <span className="text-status-danger">*</span>
                  </label>
                  <input
                    {...register("name", { required: "Page name is required" })}
                    placeholder="e.g. Office 365 Login"
                    className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                  />
                  {errors.name && (
                    <p className="text-[10px] text-status-danger">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-text-muted">Category</label>
                  <select
                    {...register("category")}
                    className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
                  >
                    {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-text-muted">Brand</label>
                  <input
                    {...register("brand")}
                    placeholder="e.g. Microsoft, Google"
                    className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-text-muted">Page URL</label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-text-muted shrink-0">/</span>
                    <input
                      {...register("url")}
                      placeholder="login/verify"
                      className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content settings */}
            <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Content</h3>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-text-muted">Heading</label>
                <input
                  {...register("heading")}
                  placeholder="Sign in to your account"
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-text-muted">Subtext</label>
                <input
                  {...register("subtext")}
                  placeholder="Enter your credentials"
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-text-muted">Button Text</label>
                <input
                  {...register("button_text")}
                  placeholder="Sign in"
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                />
              </div>
            </div>

            {/* Form fields builder */}
            <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Form Fields</h3>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => addField("text")} className="text-[10px] px-2 py-1 rounded border border-default-border text-text-muted hover:text-text-primary transition-colors">+ Text</button>
                  <button type="button" onClick={() => addField("email")} className="text-[10px] px-2 py-1 rounded border border-default-border text-text-muted hover:text-text-primary transition-colors">+ Email</button>
                  <button type="button" onClick={() => addField("password")} className="text-[10px] px-2 py-1 rounded border border-default-border text-text-muted hover:text-text-primary transition-colors">+ Password</button>
                </div>
              </div>
              <div className="space-y-2">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center gap-2 rounded-lg border border-default-border bg-void/50 p-3">
                    <GripVertical className="size-3.5 text-text-muted shrink-0" />
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <input
                        value={field.label}
                        onChange={(e) => updateField(field.id, "label", e.target.value)}
                        className="rounded border border-default-border bg-void px-2 py-1 text-[10px] text-text-primary focus:outline-none focus:border-accent-blue/30"
                      />
                      <input
                        value={field.placeholder}
                        onChange={(e) => updateField(field.id, "placeholder", e.target.value)}
                        className="rounded border border-default-border bg-void px-2 py-1 text-[10px] text-text-muted focus:outline-none focus:border-accent-blue/30"
                      />
                      <div className="flex items-center gap-2">
                        <select
                          value={field.type}
                          onChange={(e) => updateField(field.id, "type", e.target.value)}
                          className="rounded border border-default-border bg-void px-2 py-1 text-[10px] text-text-primary focus:outline-none"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="password">Password</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="text-status-danger/60 hover:text-status-danger transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-status-danger/30 bg-status-danger/5 p-3">
                <p className="text-xs text-status-danger">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => router.push("/landing-pages")}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-1.5"
              >
                {submitting ? (
                  <><Loader2 className="size-3.5 animate-spin" /> Creating...</>
                ) : (
                  <><Sparkles className="size-3.5" /> Create Page</>
                )}
              </Button>
            </div>
          </div>

          {/* Live preview */}
          <div className={cn("lg:col-span-2", tab === "edit" && "hidden lg:block")}>
            <div className="border border-default-border bg-surface rounded-xl p-5 sticky top-6">
              <h3 className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-2">
                <Eye className="size-3.5" /> Live Preview
              </h3>
              <div className="bg-white rounded-lg p-6 flex items-center justify-center" style={{ minHeight: 320 }}>
                <div style={{ maxWidth: 380, width: "100%" }}>
                  {watched.brand && (
                    <div style={{ textAlign: "center", marginBottom: 20 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: accentColor, margin: "0 auto 12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 20, fontWeight: "bold",
                      }}>
                        {watched.brand[0]}
                      </div>
                    </div>
                  )}
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 4, textAlign: "center" }}>
                    {watched.heading || "Sign in to your account"}
                  </h2>
                  <p style={{ fontSize: 13, color: "#666", marginBottom: 24, textAlign: "center" }}>
                    {watched.subtext || "Enter your credentials to continue"}
                  </p>
                  {fields.map((field) => (
                    <div key={field.id} style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: "#333", marginBottom: 4, display: "block" }}>
                        {field.label}{field.required && <span style={{ color: "#ef4444" }}>*</span>}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        style={{
                          width: "100%", padding: "10px 12px", fontSize: 14,
                          border: "1px solid #d1d5db", borderRadius: 6,
                          outline: "none", boxSizing: "border-box",
                        }}
                        readOnly
                      />
                    </div>
                  ))}
                  <button type="button" style={{
                    width: "100%", padding: 12, marginTop: 8,
                    background: accentColor, color: "#fff",
                    border: "none", borderRadius: 6, fontSize: 14,
                    fontWeight: 600, cursor: "pointer",
                  }}>
                    {watched.button_text || "Sign in"}
                  </button>
                  <p style={{ fontSize: 11, color: "#999", textAlign: "center", marginTop: 16 }}>
                    Protected by industry-standard encryption
                  </p>
                </div>
              </div>
              {watched.name && (
                <div className="mt-3 flex items-center gap-2 text-[10px] text-text-muted bg-void rounded-lg px-3 py-2 border border-default-border/40">
                  <span className="font-medium text-text-secondary">{watched.name}</span>
                  <span className="text-text-muted/50">•</span>
                  <span>{(categories.find((c) => c.value === watched.category)?.label ?? watched.category)}</span>
                  {watched.url && <><span className="text-text-muted/50">•</span><span className="font-mono">/{watched.url}</span></>}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
