import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { courses, getCourseCertificate, getCertificates } from "@/data/training";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Clock,
  Users,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Award,
  User,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  FileText,
} from "lucide-react";

export function generateStaticParams() {
  return courses.map((c) => ({ courseId: c.id }));
}

export function generateMetadata({ params }: { params: Promise<{ courseId: string }> }) {
  return { title: "Course — Phishified" };
}

const difficultyColors: Record<string, string> = {
  Beginner: "text-status-success bg-status-success/10 border-status-success/20",
  Intermediate: "text-status-warning bg-status-warning/10 border-status-warning/20",
  Advanced: "text-status-error bg-status-error/10 border-status-error/20",
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = courses.find((c) => c.id === courseId);

  if (!course) {
    notFound();
  }

  const percent = Math.floor((course.completed / course.total) * 100);
  const completedModules = course.modules.filter((m) => m.completed).length;
  const certificate = getCourseCertificate(courseId);
  const allCerts = getCertificates();

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
              {course.category}
            </span>
            <span className={cn("text-[10px] font-medium border rounded px-1.5 py-0.5", difficultyColors[course.difficulty])}>
              {course.difficulty}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">{course.name}</h1>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">{course.description}</p>

      <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
        <span className="flex items-center gap-1"><Clock className="size-3.5" /> {course.duration}</span>
        <span className="flex items-center gap-1"><BookOpen className="size-3.5" /> {course.modules.length} modules</span>
        <span className="flex items-center gap-1"><Users className="size-3.5" /> {course.completed.toLocaleString()}/{course.total.toLocaleString()} enrolled</span>
        <span className="flex items-center gap-1"><User className="size-3.5" /> {course.instructor}</span>
        {course.certificateAvailable && (
          <span className="flex items-center gap-1 text-status-warning"><Award className="size-3.5" /> Certificate available</span>
        )}
      </div>

      {course.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {course.skills.map((skill) => (
            <span key={skill} className="text-[10px] text-text-muted bg-white/[0.03] border border-default-border rounded px-2 py-0.5">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <BookOpen className="size-4 text-accent-purple-light" /> Course Modules
            </h3>
            <div className="space-y-2">
              {course.modules.map((mod, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-default-border/40 text-xs hover:border-accent-purple/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "size-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                        mod.completed
                          ? "bg-status-success/20 text-status-success"
                          : "bg-white/[0.03] text-text-muted border border-default-border/40"
                      )}
                    >
                      {mod.completed ? <CheckCircle2 className="size-4" /> : i + 1}
                    </div>
                    <div>
                      <span className={cn("font-medium", mod.completed ? "text-text-muted" : "text-text-primary")}>
                        {mod.name}
                      </span>
                      {mod.completed && <span className="text-[10px] text-status-success ml-2">Completed</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted font-mono">{mod.duration}</span>
                    <Link
                      href={mod.completed ? "#review" : "#continue"}
                      className={cn(
                        "flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md border transition-colors",
                        mod.completed
                          ? "border-default-border bg-surface text-text-secondary hover:text-text-primary"
                          : "bg-accent-purple/10 border-accent-purple/20 text-accent-purple-light hover:bg-accent-purple/20"
                      )}
                    >
                      {mod.completed ? "Review" : "Continue"}
                      <ChevronRight className="size-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {allCerts.length > 0 && (
            <div className="border border-default-border bg-surface rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Award className="size-4 text-status-warning" /> My Certificates
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allCerts.map((cert) => (
                  <div
                    key={cert.credentialId}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      courseId === cert.courseId
                        ? "border-status-warning/30 bg-status-warning/[0.03]"
                        : "border-default-border bg-void"
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center size-8 rounded-lg bg-status-warning/10 shrink-0">
                          <Award className="size-4 text-status-warning" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-text-primary">{cert.courseName}</p>
                          <p className="text-[10px] text-text-muted">Credential: {cert.credentialId}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-status-success bg-status-success/10 border border-status-success/20 rounded px-1.5 py-0.5">
                        {cert.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted mt-2 pt-2 border-t border-default-border/40">
                      <span>Issued: {cert.issuedDate}</span>
                      <span>Expires: {cert.expiryDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  <span className="text-text-primary font-mono font-semibold">{course.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2 rounded-lg bg-void border border-default-border/40">
                  <span className="text-text-muted">Completed</span>
                  <span className="text-text-primary font-mono font-semibold">{course.completed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2 rounded-lg bg-void border border-default-border/40">
                  <span className="text-text-muted">Remaining</span>
                  <span className="text-text-primary font-mono font-semibold">{(course.total - course.completed).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 px-2 rounded-lg bg-void border border-default-border/40">
                  <span className="text-text-muted">Modules Done</span>
                  <span className="text-text-primary font-mono font-semibold">{completedModules}/{course.modules.length}</span>
                </div>
              </div>
            </div>
          </div>

          {course.certificateAvailable && (
            <div className="border border-default-border bg-surface rounded-xl p-6 space-y-3">
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Award className="size-4 text-status-warning" /> Certificate
              </h3>
              {certificate ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-status-success/10 border border-status-success/20">
                    <ShieldCheck className="size-4 text-status-success shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-status-success">Earned on {certificate.issuedDate}</p>
                      <p className="text-[10px] text-text-muted">Credential: {certificate.credentialId}</p>
                    </div>
                  </div>
                  <Link
                    href="#"
                    className="flex items-center justify-center w-full rounded-lg border border-default-border bg-surface hover:border-accent-purple/30 text-text-secondary hover:text-text-primary text-xs font-medium h-8 transition-all gap-1"
                  >
                    <FileText className="size-3.5" /> View Certificate
                    <ExternalLink className="size-3" />
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-text-muted">Complete all modules to earn your certificate</p>
              )}
            </div>
          )}

          <div className="border border-default-border bg-surface rounded-xl p-6 space-y-2">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Actions</h3>
            <Link
              href="/training"
              className="flex items-center justify-center w-full rounded-lg border border-default-border bg-accent-purple/10 hover:bg-accent-purple/20 text-accent-purple-light text-xs font-medium h-8 transition-colors"
            >
              Continue Learning
            </Link>
            <Link
              href="/training"
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
