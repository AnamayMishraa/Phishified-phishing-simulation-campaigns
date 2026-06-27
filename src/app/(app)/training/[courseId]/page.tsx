"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { api, ApiError, getErrorMessage } from "@/lib/api/client";
import type { CourseDetail } from "@/lib/api/types";

const difficultyColors: Record<string, string> = {
  beginner: "text-status-success bg-status-success/10 border-status-success/20",
  intermediate: "text-status-warning bg-status-warning/10 border-status-warning/20",
  advanced: "text-status-error bg-status-error/10 border-status-error/20",
};

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api<CourseDetail>(`/training/courses/${courseId}/`)
      .then((d) => setCourse(d))
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 404 || (err as unknown as Record<string, unknown>).status === 404)) {
          notFound();
        }
        setError(err instanceof ApiError ? getErrorMessage(err, "Failed to load course") : "Failed to load course");
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="size-8 rounded-lg bg-void" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-20 bg-void rounded" />
            <div className="h-6 w-64 bg-void rounded" />
          </div>
        </div>
        <div className="h-4 w-3/4 bg-void rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-void rounded-xl" />
          <div className="h-64 bg-void rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-status-danger/20 bg-status-danger/5 rounded-xl p-4 text-sm text-status-danger">
        {error}
      </div>
    );
  }

  if (!course) return null;

  const percent = course.enrollment_count > 0
    ? Math.floor((course.completed_count / course.enrollment_count) * 100)
    : 0;
  const durationStr = `${course.total_duration_minutes} min`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link
          href="/training"
          className="flex items-center justify-center size-8 rounded-lg border border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-all"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-semibold text-accent-purple-light uppercase bg-accent-purple/10 border border-accent-purple/20 rounded px-2 py-0.5">
              {course.category_display}
            </span>
            <span className={cn("text-[10px] font-medium border rounded px-1.5 py-0.5", difficultyColors[course.difficulty_level])}>
              {course.difficulty_display}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">{course.name}</h1>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{course.description}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1"><Clock className="size-3.5" /> {durationStr}</span>
        <span className="flex items-center gap-1"><BookOpen className="size-3.5" /> {course.total_modules} modules</span>
        <span className="flex items-center gap-1"><Users className="size-3.5" /> {course.enrollment_count.toLocaleString()} enrolled</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <BookOpen className="size-4 text-accent-purple-light" /> Course Modules
            </h3>
            <div className="space-y-2">
              {course.modules.map((mod, i) => (
                <div
                  key={mod.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-default-border/40 text-xs hover:border-accent-purple/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-white/[0.03] text-text-muted border border-default-border/40">
                      {i + 1}
                    </div>
                    <div>
                      <span className="font-medium text-text-primary">{mod.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted font-mono">{mod.duration_minutes} min</span>
                    <Link
                      href="#"
                      className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md border transition-colors border-default-border bg-surface text-text-secondary hover:text-text-primary"
                    >
                      View
                      <ChevronRight className="size-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <GraduationCap className="size-4 text-accent-purple-light" /> Enrollment Progress
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-muted">Completion Rate</span>
                  <span className="font-semibold text-text-secondary">{percent}%</span>
                </div>
                <div className="w-full h-2 bg-void rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-purple-light transition-all duration-500 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 px-2 rounded-lg bg-void border border-default-border/40">
                  <span className="text-text-muted">Total Enrolled</span>
                  <span className="text-text-primary font-mono font-semibold">{course.enrollment_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2 rounded-lg bg-void border border-default-border/40">
                  <span className="text-text-muted">Completed</span>
                  <span className="text-text-primary font-mono font-semibold">{course.completed_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2 rounded-lg bg-void border border-default-border/40">
                  <span className="text-text-muted">Remaining</span>
                  <span className="text-text-primary font-mono font-semibold">{(course.enrollment_count - course.completed_count).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2 rounded-lg bg-void border border-default-border/40">
                  <span className="text-text-muted">Modules</span>
                  <span className="text-text-primary font-mono font-semibold">{course.total_modules}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-default-border bg-surface rounded-xl p-6 space-y-2">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Actions</h3>
            <Link
              href="/training"
              className="flex items-center justify-center w-full rounded-lg border border-default-border bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple-light text-xs font-medium h-8 transition-colors"
            >
              Continue Learning
            </Link>
            <Link
              href="#"
              className="flex items-center justify-center w-full rounded-lg border border-default-border bg-surface hover:border-accent-blue/30 text-text-secondary hover:text-text-primary text-xs font-medium h-8 transition-colors"
            >
              Assign to Department
            </Link>
            <Link
              href="/reports"
              className="flex items-center justify-center w-full rounded-lg border border-default-border bg-surface hover:border-accent-blue/30 text-text-secondary hover:text-text-primary text-xs font-medium h-8 transition-colors"
            >
              View Completion Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
