"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { api, ApiError, getErrorMessage } from "@/lib/api/client";
import type { Department, EmployeeDetail } from "@/lib/api/types";
import { cn } from "@/lib/utils";

type Step = "form" | "submitting" | "success" | "error";

export default function NewEmployeePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdEmployee, setCreatedEmployee] = useState<EmployeeDetail | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showCreateDept, setShowCreateDept] = useState(false);

  useEffect(() => {
    api<{ results: Department[] }>("/organizations/departments/")
      .then((d) => setDepartments(d.results))
      .catch(() => {});
  }, []);

  const existingDept = departments.find(
    (d) => d.name.toLowerCase() === departmentName.toLowerCase()
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStep("submitting");
    setErrorMsg(null);

    try {
      let deptId: string | null = null;

      if (departmentName.trim()) {
        if (existingDept) {
          deptId = existingDept.id;
        } else {
          const newDept = await api<Department>("/organizations/departments/", {
            method: "POST",
            body: { name: departmentName.trim() },
          });
          deptId = newDept.id;
          setDepartments((prev) => [...prev, newDept]);
        }
      }

      const employee = await api<EmployeeDetail>("/employees/", {
        method: "POST",
        body: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          position: position.trim() || undefined,
          department: deptId,
        },
      });

      setCreatedEmployee(employee);
      setStep("success");
    } catch (err: unknown) {
      setErrorMsg(err instanceof ApiError ? getErrorMessage(err, "Failed to create employee") : "Failed to create employee");
      setStep("error");
    }
  }

  const isValid = firstName.trim() && lastName.trim() && email.trim();

  if (step === "success" && createdEmployee) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            href="/employees"
            className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <PageHeader title="Employee Created" description="The employee has been added successfully" />
        </div>
        <div className="border border-status-success/20 bg-status-success/5 rounded-xl p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="size-16 rounded-full bg-status-success/10 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-status-success" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{createdEmployee.first_name} {createdEmployee.last_name}</h3>
            <p className="text-sm text-text-muted mt-1">{createdEmployee.email}</p>
            <p className="text-xs text-text-muted mt-0.5">{createdEmployee.department_name} &middot; {createdEmployee.position}</p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/employees/new">
              <Button className="bg-accent-blue hover:bg-accent-blue-dim text-white">Add Another</Button>
            </Link>
            <Link href={`/employees/${createdEmployee.id}`}>
              <Button variant="outline">View Profile</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/employees"
          className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <PageHeader title="Add Employee" description="Create a new employee record" />
      </div>

      {errorMsg && (
        <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-4 text-sm text-status-danger">
          {errorMsg}
          <button onClick={() => { setStep("form"); setErrorMsg(null); }} className="ml-2 underline hover:no-underline">Try again</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-text-primary">Employee Information</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-secondary">First Name *</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-text-secondary">Last Name *</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-text-secondary">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@company.com"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-text-secondary">Position</label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Software Engineer"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-text-secondary">Department</label>
            <div className="relative">
              <input
                value={departmentName}
                onChange={(e) => {
                  setDepartmentName(e.target.value);
                  setShowCreateDept(false);
                }}
                placeholder="Search or type a new department..."
                className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/30"
              />
              {departmentName && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-default-border bg-surface shadow-xl max-h-40 overflow-y-auto">
                  {existingDept ? (
                    <div className="px-3 py-2 text-xs text-status-success flex items-center gap-2">
                      <CheckCircle2 className="size-3" />
                      {existingDept.name} ({existingDept.employee_count} employees)
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCreateDept(true)}
                      className="w-full text-left px-3 py-2 text-xs text-accent-blue-light hover:bg-white/[0.03] transition-colors"
                    >
                      + Create new department &quot;{departmentName}&quot;
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={!isValid || step === "submitting"}
            className={cn(
              "bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2",
              (!isValid || step === "submitting") && "opacity-50 cursor-not-allowed"
            )}
          >
            {step === "submitting" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create Employee"
            )}
          </Button>
          <Link href="/employees">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
