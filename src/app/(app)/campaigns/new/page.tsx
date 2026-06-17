"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StepIndicator } from "@/components/ui/step-indicator";
import { Send, ArrowRight, Sparkles, Check, ChevronLeft, Users, Calendar, FileText } from "lucide-react";
import { templates } from "@/data/templates";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Campaign Name", icon: FileText },
  { id: 2, label: "Select Template", icon: Send },
  { id: 3, label: "Target Group", icon: Users },
  { id: 4, label: "Schedule", icon: Calendar },
];

const departments = [
  { value: "All Departments", label: "All Departments", count: 1200 },
  { value: "Engineering", label: "Engineering", count: 240 },
  { value: "Marketing", label: "Marketing", count: 85 },
  { value: "Sales", label: "Sales", count: 120 },
  { value: "Finance", label: "Finance", count: 65 },
  { value: "HR", label: "HR", count: 45 },
  { value: "Operations", label: "Operations", count: 95 },
  { value: "Legal", label: "Legal", count: 30 },
];

export default function NewCampaignPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [schedule, setSchedule] = useState("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [sendDelay, setSendDelay] = useState("0");
  const [templateSearch, setTemplateSearch] = useState("");

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.category.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const canNext = () => {
    switch (step) {
      case 1: return name.trim().length > 0;
      case 2: return selectedTemplate !== null;
      case 3: return selectedDept.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < 4 && canNext()) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
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
        {/* Step 1: Campaign Name */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Campaign Name</h3>
              <p className="text-xs text-text-muted">Give your campaign a descriptive name that your team will recognize.</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="campaign-name" className="text-xs font-medium text-text-secondary">Name</label>
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
              <label htmlFor="campaign-desc" className="text-xs font-medium text-text-secondary">Description (optional)</label>
              <textarea
                id="campaign-desc"
                placeholder="Brief description of campaign goals..."
                rows={3}
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Template Selection */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">Select Phishing Template</h3>
                <p className="text-xs text-text-muted">Choose a template or generate one with AI.</p>
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] flex items-center gap-1 text-accent-blue-light">
                <Sparkles className="size-3" /> AI Generate
              </Button>
            </div>
            <SearchInput
              placeholder="Search templates..."
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
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
                      {template.category}
                    </span>
                    {selectedTemplate === template.id && (
                      <Check className="size-3.5 text-accent-blue-light" />
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-text-primary">{template.name}</h4>
                  <p className="text-[10px] text-text-muted mt-1 line-clamp-2">{template.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-text-muted">{template.difficulty}</span>
                    <span className="text-[10px] text-text-muted/50">•</span>
                    <span className="text-[10px] text-text-muted">{template.rating} ★</span>
                  </div>
                </button>
              ))}
            </div>
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
                  <p className="text-[10px] text-text-muted">{dept.count.toLocaleString()} employees</p>
                </button>
              ))}
            </div>
            <div className="rounded-lg border border-default-border bg-void/50 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Total targets</span>
                <span className="font-semibold text-text-primary font-mono">
                  {departments.find((d) => d.value === selectedDept)?.count.toLocaleString() || 0}
                </span>
              </div>
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
                  onClick={() => setSchedule("now")}
                  className={cn(
                    "border rounded-lg p-4 text-left transition-all",
                    schedule === "now"
                      ? "border-accent-blue/40 bg-accent-blue/5"
                      : "border-default-border hover:border-accent-blue/20"
                  )}
                >
                  <h4 className="text-xs font-semibold text-text-primary">Send Now</h4>
                  <p className="text-[10px] text-text-muted mt-1">Launch immediately after creation</p>
                </button>
                <button
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

            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">Send Configuration</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-default-border rounded-lg p-3">
                  <label htmlFor="send-delay" className="text-[10px] text-text-muted block mb-1">Delay between sends (min)</label>
                  <input
                    id="send-delay"
                    type="number"
                    value={sendDelay}
                    onChange={(e) => setSendDelay(e.target.value)}
                    min={0}
                    className="w-full rounded border border-default-border bg-void px-2 py-1 text-xs text-text-primary focus:outline-none"
                  />
                </div>
                <div className="border border-default-border rounded-lg p-3">
                  <label htmlFor="batch-size" className="text-[10px] text-text-muted block mb-1">Employees per batch</label>
                  <select id="batch-size" className="w-full rounded border border-default-border bg-void px-2 py-1 text-xs text-text-primary focus:outline-none">
                    <option>50</option>
                    <option>100</option>
                    <option>250</option>
                    <option>All at once</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <div>
          {step > 1 && (
            <Button variant="outline" size="sm" onClick={handleBack} className="flex items-center gap-1.5">
              <ChevronLeft className="size-3.5" /> Back
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">Save as Draft</Button>
          {step < 4 ? (
            <Button
              size="sm"
              disabled={!canNext()}
              onClick={handleNext}
              className={cn(
                "flex items-center gap-2",
                canNext()
                  ? "bg-accent-blue hover:bg-accent-blue-dim text-white"
                  : "bg-accent-blue/30 text-white/50 cursor-not-allowed"
              )}
            >
              Next Step <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Button className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2">
              <Send className="size-3.5" /> Launch Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
