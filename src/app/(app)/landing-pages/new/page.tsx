"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Eye, Edit3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormField {
  id: number;
  type: "text" | "password" | "email";
  label: string;
  placeholder: string;
  required: boolean;
}

const categories = ["Auth Portal", "Corporate Page", "Landing Page"];

export default function NewLandingPagePage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Auth Portal");
  const [url, setUrl] = useState("");
  const [brand, setBrand] = useState("");
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [fields, setFields] = useState<FormField[]>([
    { id: 1, type: "email", label: "Email", placeholder: "name@company.com", required: true },
    { id: 2, type: "password", label: "Password", placeholder: "Enter your password", required: true },
  ]);
  const [buttonText, setButtonText] = useState("Sign in");
  const [heading, setHeading] = useState("Sign in to your account");
  const [subtext, setSubtext] = useState("Enter your credentials to continue");

  const nextId = fields.length + 1;

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

  const brandColors: Record<string, string> = {
    Microsoft: "#0067b8",
    Google: "#1a73e8",
    DocuSign: "#00a3e0",
    Slack: "#611f69",
    Atlassian: "#0052cc",
    Amazon: "#ff9900",
    Internal: "#2d6a4f",
  };

  const accentColor = brandColors[brand] || "#3b82f6";

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <PageHeader
        title="New Landing Page"
        description="Design a new phishing simulation landing page"
      />

      {/* Tabs */}
      <div className="flex items-center gap-1.5 rounded-lg border border-default-border bg-surface p-0.5 w-fit">
        <button
          onClick={() => setTab("edit")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors",
            tab === "edit" ? "bg-accent-blue/10 text-accent-blue-light" : "text-text-muted hover:text-text-primary"
          )}
        >
          <Edit3 className="size-3.5" /> Builder
        </button>
        <button
          onClick={() => setTab("preview")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors",
            tab === "preview" ? "bg-accent-blue/10 text-accent-blue-light" : "text-text-muted hover:text-text-primary"
          )}
        >
          <Eye className="size-3.5" /> Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Builder panel */}
        <div className={cn("lg:col-span-3 space-y-5", tab === "preview" && "hidden lg:block")}>
          {/* Basic settings */}
          <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Basic Settings</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-text-muted">Page Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Office 365 Login" className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-text-muted">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50">
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-text-muted">Brand</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Microsoft, Google" className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-text-muted">Page URL</label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-text-muted shrink-0">/</span>
                  <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="login/verify" className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Content settings */}
          <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Content</h3>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-text-muted">Heading</label>
              <input value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="Sign in to your account" className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-text-muted">Subtext</label>
              <input value={subtext} onChange={(e) => setSubtext(e.target.value)} placeholder="Enter your credentials" className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-text-muted">Button Text</label>
              <input value={buttonText} onChange={(e) => setButtonText(e.target.value)} placeholder="Sign in" className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50" />
            </div>
          </div>

          {/* Form fields builder */}
          <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Form Fields</h3>
              <div className="flex items-center gap-1">
                <button onClick={() => addField("text")} className="text-[10px] px-2 py-1 rounded border border-default-border text-text-muted hover:text-text-primary transition-colors">+ Text</button>
                <button onClick={() => addField("email")} className="text-[10px] px-2 py-1 rounded border border-default-border text-text-muted hover:text-text-primary transition-colors">+ Email</button>
                <button onClick={() => addField("password")} className="text-[10px] px-2 py-1 rounded border border-default-border text-text-muted hover:text-text-primary transition-colors">+ Password</button>
              </div>
            </div>
            <div className="space-y-2">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center gap-2 rounded-lg border border-default-border bg-void/50 p-3">
                  <GripVertical className="size-3.5 text-text-muted shrink-0" />
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input value={field.label} onChange={(e) => updateField(field.id, "label", e.target.value)} className="rounded border border-default-border bg-void px-2 py-1 text-[10px] text-text-primary focus:outline-none focus:border-accent-blue/30" />
                    <input value={field.placeholder} onChange={(e) => updateField(field.id, "placeholder", e.target.value)} className="rounded border border-default-border bg-void px-2 py-1 text-[10px] text-text-muted focus:outline-none focus:border-accent-blue/30" />
                    <div className="flex items-center gap-2">
                      <select value={field.type} onChange={(e) => updateField(field.id, "type", e.target.value)} className="rounded border border-default-border bg-void px-2 py-1 text-[10px] text-text-primary focus:outline-none">
                        <option value="text">Text</option>
                        <option value="email">Email</option>
                        <option value="password">Password</option>
                      </select>
                      <button onClick={() => removeField(field.id)} className="text-status-danger/60 hover:text-status-danger transition-colors">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm">Save as Draft</Button>
            <Button className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> Create Page
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
                {brand && (
                  <div style={{ textAlign: "center", marginBottom: 20 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8,
                      background: accentColor, margin: "0 auto 12px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 20, fontWeight: "bold",
                    }}>
                      {brand[0]}
                    </div>
                  </div>
                )}
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1a1a2e", marginBottom: 4, textAlign: "center" }}>
                  {heading || "Sign in to your account"}
                </h2>
                <p style={{ fontSize: 13, color: "#666", marginBottom: 24, textAlign: "center" }}>
                  {subtext || "Enter your credentials to continue"}
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
                <button style={{
                  width: "100%", padding: 12, marginTop: 8,
                  background: accentColor, color: "#fff",
                  border: "none", borderRadius: 6, fontSize: 14,
                  fontWeight: 600, cursor: "pointer",
                }}>
                  {buttonText || "Sign in"}
                </button>
                <p style={{ fontSize: 11, color: "#999", textAlign: "center", marginTop: 16 }}>
                  Protected by industry-standard encryption
                </p>
              </div>
            </div>
            {name && (
              <div className="mt-3 flex items-center gap-2 text-[10px] text-text-muted bg-void rounded-lg px-3 py-2 border border-default-border/40">
                <span className="font-medium text-text-secondary">{name}</span>
                <span className="text-text-muted/50">•</span>
                <span>{category}</span>
                {url && <><span className="text-text-muted/50">•</span><span className="font-mono">/{url}</span></>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
