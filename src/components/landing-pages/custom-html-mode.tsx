"use client";

import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";

const categories = [
  { label: "Auth Portal", value: "auth_portal" },
  { label: "Corporate Page", value: "corporate_page" },
  { label: "Landing Page", value: "landing_page" },
];

const difficultyLevels = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

interface CustomHtmlModeProps {
  name: string;
  slug: string;
  category: string;
  title: string;
  htmlContent: string;
  cssContent: string;
  difficultyLevel: string;
  isActive: boolean;
  onFieldChange: (key: string, value: string | boolean) => void;
}

export function CustomHtmlMode({
  name, slug, category, title, htmlContent, cssContent, difficultyLevel, isActive,
  onFieldChange,
}: CustomHtmlModeProps) {
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const doc = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${cssContent}</style></head><body>${htmlContent}</body></html>`;
      const parser = new DOMParser();
      const parsed = parser.parseFromString(doc, "text/html");
      const parseError = parsed.querySelector("parsererror");
      if (parseError) {
        setPreviewError("HTML contains syntax errors. Preview may not render correctly.");
      } else {
        setPreviewError(null);
      }
    } catch {
      setPreviewError("Failed to parse HTML. Check for syntax errors.");
    }
  }, [htmlContent, cssContent]);

  return (
    <div className="space-y-5">
      <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Basic Settings</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-text-muted">Name <span className="text-status-danger">*</span></label>
            <input
              value={name}
              onChange={(e) => onFieldChange("name", e.target.value)}
              placeholder="e.g. Office 365 Login"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
            />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-text-muted">Slug <span className="text-status-danger">*</span></label>
            <input
              value={slug}
              onChange={(e) => onFieldChange("slug", e.target.value)}
              placeholder="login-verify"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary font-mono focus:outline-none focus:border-accent-blue/50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-text-muted">Difficulty</label>
            <select
              value={difficultyLevel}
              onChange={(e) => onFieldChange("difficulty_level", e.target.value)}
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
            >
              {difficultyLevels.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">Page Metadata</h3>
        <div className="space-y-1.5">
          <label className="text-[10px] font-medium text-text-muted">Title (optional)</label>
          <input
            value={title}
            onChange={(e) => onFieldChange("title", e.target.value)}
            placeholder="Page title shown in the browser tab"
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
          />
        </div>
      </div>

      <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">HTML Content</h3>
          {previewError && (
            <span className="flex items-center gap-1 text-[10px] text-status-warning">
              <AlertTriangle className="size-3" /> {previewError}
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <textarea
            value={htmlContent}
            onChange={(e) => onFieldChange("html_content", e.target.value)}
            rows={12}
            placeholder="<body>...</body>"
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary font-mono leading-relaxed focus:outline-none focus:border-accent-blue/50 resize-y"
          />
        </div>
      </div>

      <div className="border border-default-border bg-surface rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-semibold text-text-primary uppercase tracking-wider">CSS Content</h3>
        <div className="space-y-1.5">
          <textarea
            value={cssContent}
            onChange={(e) => onFieldChange("css_content", e.target.value)}
            rows={6}
            placeholder="body { ... }"
            className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary font-mono leading-relaxed focus:outline-none focus:border-accent-blue/50 resize-y"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => onFieldChange("is_active", e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-text-muted/30 rounded-full peer peer-checked:bg-status-success/60 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
        </label>
        <span className="text-xs text-text-secondary">Active</span>
      </div>
    </div>
  );
}
