"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api, ApiError, getErrorMessage } from "@/lib/api/client";
import type { LandingPageDetail, LandingPageWrite } from "@/lib/api/types";
import { Sparkles, Loader2, Edit3, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { LivePreview } from "@/components/landing-pages/live-preview";
import { BuilderMode, buildLandingPageHtml, buildLandingPageCss } from "@/components/landing-pages/builder-mode";
import { CustomHtmlMode } from "@/components/landing-pages/custom-html-mode";
import type { FormField } from "@/components/landing-pages/builder-mode";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    || "untitled";
}

interface LandingPageStudioProps {
  mode: "create" | "edit";
  id?: string;
  onSuccess: (id: string) => void;
  onCancel: () => void;
}

export function LandingPageStudio({ mode, id, onSuccess, onCancel }: LandingPageStudioProps) {
  const [studioMode, setStudioMode] = useState<"builder" | "custom-html">("builder");
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("auth_portal");
  const [isActive, setIsActive] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState("medium");

  const [brand, setBrand] = useState("");
  const [heading, setHeading] = useState("Sign in to your account");
  const [subtext, setSubtext] = useState("Enter your credentials to continue");
  const [buttonText, setButtonText] = useState("Sign in");
  const [pageUrl, setPageUrl] = useState("");
  const [fields, setFields] = useState<FormField[]>([
    { id: 1, type: "email", label: "Email", placeholder: "name@company.com", required: true },
    { id: 2, type: "password", label: "Password", placeholder: "Enter your password", required: true },
  ]);

  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [cssContent, setCssContent] = useState("");

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    let cancelled = false;

    api<LandingPageDetail>(`/landing-pages/${id}/`)
      .then((data) => {
        if (cancelled) return;
        setName(data.name);
        setSlug(data.slug);
        setCategory(data.category);
        setTitle(data.title);
        setHtmlContent(data.html_content);
        setCssContent(data.css_content);
        setDifficultyLevel(data.difficulty_level);
        setIsActive(data.is_active);
        if (data.html_content) setStudioMode("custom-html");
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setFetchError(getErrorMessage(err, "Failed to load landing page"));
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [mode, id]);

  const errors: Record<string, string | undefined> = {};
  if (!name.trim()) errors.name = "Page name is required";

  const handleFieldChange = useCallback((key: string, value: string | boolean) => {
    const setter: Record<string, (v: any) => void> = {
      name: setName,
      slug: setSlug,
      category: setCategory,
      brand: setBrand,
      url: setPageUrl,
      heading: setHeading,
      subtext: setSubtext,
      button_text: setButtonText,
      title: setTitle,
      html_content: setHtmlContent,
      css_content: setCssContent,
      difficulty_level: setDifficultyLevel,
      is_active: setIsActive,
    };
    setter[key]?.(value);
  }, []);

  const handleGenerateHtml = useCallback(() => {
    const generated = buildLandingPageHtml(brand, heading, subtext, fields, buttonText);
    const generatedCss = buildLandingPageCss(brand);
    setHtmlContent(generated);
    setCssContent(generatedCss);
    setTitle(heading);
    setStudioMode("custom-html");
    toast.success("HTML generated from builder. You can now fine-tune it.");
  }, [brand, heading, subtext, fields, buttonText]);

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Page name is required"); return; }

    if (studioMode === "builder") {
      const slugVal = pageUrl ? slugify(pageUrl) : slugify(name);
      const html = buildLandingPageHtml(brand, heading, subtext, fields, buttonText);
      const body: LandingPageWrite = {
        name: name.trim(),
        slug: slugVal,
        category,
        title: heading,
        html_content: html,
        css_content: buildLandingPageCss(brand),
        difficulty_level: difficultyLevel,
        is_active: isActive,
      };
      await save(body);
    } else {
      if (!slug.trim()) { toast.error("Slug is required"); return; }
      const body: LandingPageWrite = {
        name: name.trim(),
        slug: slug.trim(),
        category,
        title: title || "",
        html_content: htmlContent || "",
        css_content: cssContent || "",
        difficulty_level: difficultyLevel,
        is_active: isActive,
      };
      await save(body);
    }
  };

  const save = async (body: LandingPageWrite) => {
    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        const created = await api<LandingPageDetail>("/landing-pages/", { method: "POST", body });
        toast.success("Landing page created successfully");
        onSuccess(created.id);
      } else {
        await api(`/landing-pages/${id}/`, { method: "PATCH", body });
        toast.success("Landing page updated");
        onSuccess(id!);
      }
    } catch (e) {
      const message =
        e instanceof ApiError
          ? typeof e.body === "object" && e.body !== null && "detail" in e.body
            ? String((e.body as Record<string, unknown>).detail)
            : JSON.stringify(e.body)
          : mode === "create" ? "Failed to create landing page" : "Failed to update landing page";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-sm text-text-muted">Loading landing page...</div>
    );
  }

  if (fetchError) {
    return (
      <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-6 text-center">
        <p className="text-sm text-status-danger mb-2">{fetchError}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Mode switch */}
      <div className="flex items-center gap-1.5 rounded-lg border border-default-border bg-surface p-0.5 w-fit">
        <button
          type="button"
          onClick={() => setStudioMode("builder")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors",
            studioMode === "builder" ? "bg-accent-blue/10 text-accent-blue-light" : "text-text-muted hover:text-text-primary"
          )}
        >
          <Edit3 className="size-3.5" /> Builder
        </button>
        <button
          type="button"
          onClick={() => setStudioMode("custom-html")}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-medium transition-colors",
            studioMode === "custom-html" ? "bg-accent-blue/10 text-accent-blue-light" : "text-text-muted hover:text-text-primary"
          )}
        >
          <Code2 className="size-3.5" /> Custom HTML
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left panel */}
        <div className="lg:col-span-3 space-y-5">
          {studioMode === "builder" ? (
            <BuilderMode
              name={name} category={category} brand={brand} url={pageUrl}
              heading={heading} subtext={subtext} buttonText={buttonText}
              fields={fields} errors={errors}
              onFieldChange={handleFieldChange}
              onFieldsChange={setFields}
              onGenerateHtml={handleGenerateHtml}
            />
          ) : (
            <CustomHtmlMode
              name={name} slug={slug} category={category} title={title}
              htmlContent={htmlContent} cssContent={cssContent}
              difficultyLevel={difficultyLevel} isActive={isActive}
              onFieldChange={handleFieldChange}
            />
          )}

          {error && (
            <div className="rounded-lg border border-status-danger/30 bg-status-danger/5 p-3">
              <p className="text-xs text-status-danger">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={saving || (studioMode === "builder" && !name.trim()) || (studioMode === "custom-html" && !name.trim())}
              onClick={handleSave}
              className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-1.5"
            >
              {saving ? (
                <><Loader2 className="size-3.5 animate-spin" /> {mode === "create" ? "Creating..." : "Saving..."}</>
              ) : (
                <><Sparkles className="size-3.5" /> {mode === "create" ? "Create Page" : "Save Changes"}</>
              )}
            </Button>
          </div>
        </div>

        {/* Right panel - live preview */}
        <div className="lg:col-span-2">
          <LivePreview
            mode={studioMode}
            builderValues={{
              brand, heading, subtext, fields, buttonText,
              name, category, url: pageUrl,
            }}
            customHtmlValues={{ htmlContent, cssContent }}
            name={name}
          />
        </div>
      </div>
    </div>
  );
}
