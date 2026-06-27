"use client";

import { Eye } from "lucide-react";

interface FormField {
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

interface BuilderPreviewProps {
  brand: string;
  heading: string;
  subtext: string;
  fields: FormField[];
  buttonText: string;
  name: string;
  category: string;
  url: string;
}

function BuilderPreview({ brand, heading, subtext, fields, buttonText, name, category, url }: BuilderPreviewProps) {
  const accent = brandColors[brand] || "#3b82f6";

  return (
    <>
      <div className="bg-white rounded-lg p-6 flex items-center justify-center" style={{ minHeight: 320 }}>
        <div style={{ maxWidth: 380, width: "100%" }}>
          {brand && (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: accent, margin: "0 auto 12px",
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
                readOnly
                style={{
                  width: "100%", padding: "10px 12px", fontSize: 14,
                  border: "1px solid #d1d5db", borderRadius: 6,
                  outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          ))}
          <button type="button" style={{
            width: "100%", padding: 12, marginTop: 8,
            background: accent, color: "#fff",
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
          <span>{(categories.find((c) => c.value === category)?.label ?? category)}</span>
          {url && <><span className="text-text-muted/50">•</span><span className="font-mono">/{url}</span></>}
        </div>
      )}
    </>
  );
}

export function PagePreviewRenderer({ htmlContent, cssContent }: { htmlContent: string; cssContent: string }) {
  const fullDoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${cssContent || ""}</style>
</head>
<body>${htmlContent || ""}</body>
</html>`;

  return (
    <iframe
      sandbox="allow-scripts"
      srcDoc={fullDoc}
      title="Preview"
      className="w-full bg-white rounded-lg"
      style={{ minHeight: 320, border: "none" }}
    />
  );
}

function CustomHtmlPreview({ htmlContent, cssContent }: { htmlContent: string; cssContent: string }) {
  return <PagePreviewRenderer htmlContent={htmlContent} cssContent={cssContent} />;
}

interface LivePreviewProps {
  mode: "builder" | "custom-html";
  builderValues: {
    brand: string;
    heading: string;
    subtext: string;
    fields: FormField[];
    buttonText: string;
    name: string;
    category: string;
    url: string;
  };
  customHtmlValues: {
    htmlContent: string;
    cssContent: string;
  };
  name: string;
}

export function LivePreview({ mode, builderValues, customHtmlValues, name }: LivePreviewProps) {
  return (
    <div className="border border-default-border bg-surface rounded-xl p-5 sticky top-6">
      <h3 className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-2">
        <Eye className="size-3.5" /> Live Preview
      </h3>
      {mode === "builder" ? (
        <BuilderPreview {...builderValues} />
      ) : (
        <CustomHtmlPreview htmlContent={customHtmlValues.htmlContent} cssContent={customHtmlValues.cssContent} />
      )}
    </div>
  );
}
