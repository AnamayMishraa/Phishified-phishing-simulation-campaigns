"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Eye, Edit3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = ["Credential Harvesting", "Link Click", "Attachment"];
const difficulties = ["Easy", "Medium", "Hard"];

export default function NewTemplatePage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [difficulty, setDifficulty] = useState(difficulties[0]);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [tab, setTab] = useState<"edit" | "preview">("edit");

  const placeholderSubject = subject || "[Subject line will appear here]";
  const placeholderSender = senderName || "Sender Name";
  const placeholderEmail = senderEmail || "sender@company.com";
  const placeholderBody = body || "Email body content will appear here...";

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        title="New Template"
        description="Design a new phishing simulation email template"
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
          <Edit3 className="size-3.5" /> Editor
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
        {/* Editor */}
        <div className={cn("lg:col-span-3 space-y-5", tab === "preview" && "hidden lg:block")}>
          <div className="border border-default-border bg-surface rounded-xl p-5 space-y-5">
            <div className="space-y-2">
              <label htmlFor="template-name" className="text-xs font-medium text-text-secondary">Template Name</label>
              <input
                id="template-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 Payroll Notification"
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="template-category" className="text-xs font-medium text-text-secondary">Category</label>
                <select
                  id="template-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
                >
                  {categories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="template-difficulty" className="text-xs font-medium text-text-secondary">Difficulty</label>
                <select
                  id="template-difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/50"
                >
                  {difficulties.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="template-sender-name" className="text-xs font-medium text-text-secondary">Sender Name</label>
                <input
                  id="template-sender-name"
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. IT Security Team"
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="template-sender-email" className="text-xs font-medium text-text-secondary">Sender Email</label>
                <input
                  id="template-sender-email"
                  type="text"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="e.g. security@company.com"
                  className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="template-subject" className="text-xs font-medium text-text-secondary">Subject Line</label>
              <input
                id="template-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Urgent: Password Reset Required"
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="template-body" className="text-xs font-medium text-text-secondary">Email Body</label>
                <Button variant="ghost" size="sm" className="text-[10px] flex items-center gap-1 text-accent-blue-light">
                  <Sparkles className="size-3" /> AI Generate
                </Button>
              </div>
              <textarea
                id="template-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                placeholder="Write the phishing email content..."
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 resize-none font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm">Save as Draft</Button>
            <Button className="bg-accent-blue hover:bg-accent-blue-dim text-white">Create Template</Button>
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
                {!body && (
                  <div className="mt-3 rounded-lg border border-dashed border-default-border/60 p-4 text-center">
                    <p className="text-[10px] text-text-muted">Email content will appear here as you type</p>
                  </div>
                )}
              </div>
            </div>

            {name && (
              <div className="mt-3 flex items-center gap-2 text-[10px] text-text-muted bg-void rounded-lg px-3 py-2 border border-default-border/40">
                <span className="font-medium text-text-secondary">Template:</span>
                <span>{name}</span>
                <span className="text-text-muted/50">•</span>
                <span className={cn(
                  difficulty === "Easy" && "text-status-success",
                  difficulty === "Medium" && "text-status-warning",
                  difficulty === "Hard" && "text-status-danger",
                )}>{difficulty}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
