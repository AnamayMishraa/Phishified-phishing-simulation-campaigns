"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/ui/step-indicator";
import Link from "next/link";
import { Upload, Database, Check, ChevronLeft, FileText, AlertTriangle, Download, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Upload", icon: Upload },
  { id: 2, label: "Preview", icon: FileText },
  { id: 3, label: "Validate", icon: Check },
  { id: 4, label: "Import", icon: Database },
];

const mockPreviewData = [
  { name: "Dwight Schrute", email: "dwight.s@company.com", department: "Sales", title: "Assistant Regional Manager", valid: true, error: null },
  { name: "Jim Halpert", email: "jim.h@company.com", department: "Sales", title: "Sales Representative", valid: true, error: null },
  { name: "Pam Beesly", email: "pam.b@company.com", department: "Sales", title: "Office Administrator", valid: true, error: null },
  { name: "Angela Martin", email: "", department: "Finance", title: "Accountant", valid: false, error: "Missing email" },
  { name: "Oscar Martinez", email: "oscar.m@company.com", department: "Finance", title: "Senior Accountant", valid: true, error: null },
  { name: "Kevin Malone", email: "kevin.m@company.com", department: "", title: "Accountant", valid: false, error: "Missing department" },
  { name: "Stanley Hudson", email: "stanley.h@company.com", department: "Sales", title: "Sales Representative", valid: true, error: null },
  { name: "Phyllis Vance", email: "phyllis.v@company.com", department: "Sales", title: "Sales Representative", valid: true, error: null },
];

const hrisPlatforms = [
  { name: "BambooHR", status: "connected", color: "text-status-success" },
  { name: "Workday", status: "available", color: "text-text-muted" },
  { name: "Rippling", status: "available", color: "text-text-muted" },
];

export default function ImportEmployeesPage() {
  const [step, setStep] = useState(1);
  const [uploaded, setUploaded] = useState(false);
  const [imported, setImported] = useState(false);

  const validCount = mockPreviewData.filter((r) => r.valid).length;
  const invalidCount = mockPreviewData.filter((r) => !r.valid).length;

  const handleUpload = () => {
    setUploaded(true);
    setStep(2);
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleImport = () => {
    setImported(true);
    setStep(4);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        title="Import Employees"
        description="Add employees via CSV upload or HRIS integration"
      />

      <StepIndicator steps={steps} currentStep={step} onStepClick={(id) => { if (id < step) setStep(id); }} />

      {/* Step 1: Upload */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 border border-default-border bg-surface rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-accent-blue/10">
                <Upload className="size-5 text-accent-blue-light" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">CSV Upload</h3>
                <p className="text-xs text-text-muted">Import employees from a CSV file</p>
              </div>
            </div>

            {!uploaded ? (
              <>
                <div
                  onClick={handleUpload}
                  className="border-2 border-dashed border-default-border rounded-lg p-10 text-center cursor-pointer hover:border-accent-blue/30 transition-colors"
                >
                  <Upload className="size-10 text-text-muted mx-auto mb-3" />
                  <p className="text-sm text-text-muted mb-1">Drop CSV file here or click to browse</p>
                  <p className="text-[10px] text-text-muted mb-4">Supports .csv files up to 10MB</p>
                  <Button variant="outline" size="sm">Select File</Button>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Download className="size-3.5 text-accent-blue-light" />
                    <span className="text-xs text-text-muted">Need a template?</span>
                  </div>
                  <button className="text-[11px] text-accent-blue-light hover:underline">
                    Download sample CSV template
                  </button>
                </div>
                <p className="text-[10px] text-text-muted bg-void rounded-lg px-3 py-2 border border-default-border/40">
                  Expected columns: <span className="font-mono text-text-secondary">name, email, department, title</span>
                </p>
              </>
            ) : (
              <div className="bg-status-success/5 border border-status-success/20 rounded-lg p-4 text-center">
                <Check className="size-8 text-status-success mx-auto mb-2" />
                <p className="text-sm font-medium text-status-success">employees.csv uploaded</p>
                <p className="text-xs text-text-muted mt-1">8 records detected — proceed to preview</p>
              </div>
            )}
          </div>

          {/* HRIS Integration */}
          <div className="lg:col-span-2 border border-default-border bg-surface rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-accent-purple/10">
                <Database className="size-5 text-accent-purple-light" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">HRIS Integration</h3>
                <p className="text-xs text-text-muted">Sync with your HR system</p>
              </div>
            </div>
            <div className="space-y-2">
              {hrisPlatforms.map((platform) => (
                <div key={platform.name} className="border border-default-border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="size-3.5 text-text-muted" />
                    <span className="text-xs text-text-secondary">{platform.name}</span>
                  </div>
                  <span className={cn("text-[10px] font-medium", platform.color)}>
                    {platform.status === "connected" ? "Connected" : "Connect"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Preview */}
      {step === 2 && (
        <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Preview Import Data</h3>
              <p className="text-xs text-text-muted mt-0.5">{mockPreviewData.length} records from employees.csv</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-default-border/40 text-text-muted text-[10px] font-medium uppercase tracking-wider">
                  <th className="text-left px-3 py-2 font-medium">Name</th>
                  <th className="text-left px-3 py-2 font-medium">Email</th>
                  <th className="text-left px-3 py-2 font-medium">Department</th>
                  <th className="text-left px-3 py-2 font-medium">Title</th>
                  <th className="text-center px-3 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockPreviewData.map((row, idx) => (
                  <tr key={idx} className="border-b border-default-border/20 last:border-0">
                    <td className="px-3 py-2.5 text-text-primary font-medium">{row.name}</td>
                    <td className="px-3 py-2.5 text-text-muted font-mono text-[10px]">{row.email || <span className="text-status-danger/60 italic">missing</span>}</td>
                    <td className="px-3 py-2.5 text-text-secondary">{row.department || <span className="text-status-danger/60 italic">missing</span>}</td>
                    <td className="px-3 py-2.5 text-text-secondary">{row.title}</td>
                    <td className="px-3 py-2.5 text-center">
                      {row.valid ? (
                        <Check className="size-3.5 text-status-success inline" />
                      ) : (
                        <span className="text-[10px] text-status-danger flex items-center justify-center gap-1">
                          <AlertTriangle className="size-3" /> {row.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 3: Validate */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Validation Results</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-void rounded-lg p-4 text-center border border-default-border/40">
                <span className="text-2xl font-bold font-mono text-text-primary">{mockPreviewData.length}</span>
                <p className="text-[10px] text-text-muted mt-1">Total Records</p>
              </div>
              <div className="bg-void rounded-lg p-4 text-center border border-status-success/20">
                <span className="text-2xl font-bold font-mono text-status-success">{validCount}</span>
                <p className="text-[10px] text-text-muted mt-1">Valid</p>
              </div>
              <div className="bg-void rounded-lg p-4 text-center border border-status-danger/20">
                <span className="text-2xl font-bold font-mono text-status-danger">{invalidCount}</span>
                <p className="text-[10px] text-text-muted mt-1">Errors</p>
              </div>
            </div>

            {invalidCount > 0 && (
              <div className="bg-status-danger/5 border border-status-danger/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="size-4 text-status-danger" />
                  <span className="text-xs font-medium text-status-danger">Issues found</span>
                </div>
                <ul className="space-y-1 text-[11px] text-text-secondary">
                  {mockPreviewData.filter((r) => !r.valid).map((row, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-text-primary">{row.name}:</span>
                      <span className="text-status-danger">{row.error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {invalidCount === 0 && (
              <div className="bg-status-success/5 border border-status-success/20 rounded-lg p-4 text-center">
                <Check className="size-6 text-status-success mx-auto mb-1" />
                <p className="text-xs font-medium text-status-success">All records are valid — ready to import</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Import */}
      {step === 4 && (
        <div className="border border-default-border bg-surface rounded-xl p-6 text-center">
          {!imported ? (
            <div className="space-y-4">
              <Database className="size-12 text-accent-blue-light mx-auto" />
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Ready to Import</h3>
                <p className="text-xs text-text-muted mt-1">
                  Importing {validCount} employee records into the system
                </p>
              </div>
              <div className="bg-void rounded-lg p-4 border border-default-border/40 max-w-sm mx-auto space-y-2 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">New employees</span>
                  <span className="text-text-primary font-mono">{validCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Duplicates skipped</span>
                  <span className="text-text-primary font-mono">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Errors to review</span>
                  <span className="text-status-danger font-mono">{invalidCount}</span>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <Button variant="outline" size="sm" onClick={handleBack}>Cancel</Button>
                <Button
                  size="sm"
                  onClick={handleImport}
                  className="bg-accent-blue hover:bg-accent-blue-dim text-white"
                >
                  <Database className="size-3.5 mr-1" /> Start Import
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center size-16 rounded-full bg-status-success/10 mx-auto">
                <Check className="size-8 text-status-success" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-text-primary">Import Complete</h3>
                <p className="text-xs text-text-muted mt-1">
                  Successfully imported {validCount} employees
                </p>
              </div>
              <div className="bg-void rounded-lg p-4 border border-default-border/40 max-w-sm mx-auto space-y-2 text-left text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted">Imported</span>
                  <span className="text-status-success font-mono">{validCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Skipped (duplicates)</span>
                  <span className="text-text-muted font-mono">2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Failed</span>
                  <span className="text-status-danger font-mono">{invalidCount}</span>
                </div>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => { setStep(1); setUploaded(false); setImported(false); }}>
                  Import Another
                </Button>
                <Link href="/employees" className="inline-flex items-center px-4 py-2 rounded-lg bg-accent-blue hover:bg-accent-blue-dim text-white text-xs font-medium transition-colors">
                  View Employees <ArrowRight className="size-3 ml-1" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation (steps 1-3) */}
      {step < 4 && (
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={handleBack} className="flex items-center gap-1.5">
              <ChevronLeft className="size-3.5" /> Back
            </Button>
          ) : <div />}
          <div className="flex gap-3">
            {step < 3 && (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={step === 1 && !uploaded}
                className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2"
              >
                Next Step <ArrowRight className="size-3.5" />
              </Button>
            )}
            {step === 3 && (
              <Button
                size="sm"
                onClick={() => setStep(4)}
                className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2"
              >
                Continue to Import <ArrowRight className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
