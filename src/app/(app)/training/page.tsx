"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { Clock, Users, GraduationCap, Award, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { courses } from "@/data/training";

const categoryFilters = ["All", "Core Training", "Advanced", "Compliance"];
const difficultyColors: Record<string, string> = {
  Beginner: "text-status-success bg-status-success/10 border-status-success/20",
  Intermediate: "text-status-warning bg-status-warning/10 border-status-warning/20",
  Advanced: "text-status-error bg-status-error/10 border-status-error/20",
};

export default function TrainingPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filtered = useMemo(() => {
    let result = [...courses];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.skills.some((s) => s.toLowerCase().includes(q)));
    }
    if (categoryFilter !== "All") {
      result = result.filter((c) => c.category === categoryFilter);
    }
    return result;
  }, [search, categoryFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Awareness Training"
        description="Assign, track, and manage cybersecurity courses and training programs"
        actions={
          <Button className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2">
            <GraduationCap className="size-4" /> Assign Course
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <SearchInput placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-default-border bg-surface p-0.5">
          {categoryFilters.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors",
                categoryFilter === cat ? "bg-accent-purple/10 text-accent-purple-light" : "text-text-muted hover:text-text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-text-muted">{filtered.length} course{filtered.length !== 1 ? "s" : ""}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((course) => {
          const percent = Math.floor((course.completed / course.total) * 100);
          const completedModules = course.modules.filter((m) => m.completed).length;
          return (
            <Link key={course.id} href={`/training/${course.id}`}>
              <div className="relative rounded-xl border border-default-border bg-surface p-5 hover:border-accent-purple/20 transition-all duration-200 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-accent-purple-light uppercase bg-accent-purple/10 border border-accent-purple/20 rounded px-2 py-0.5">
                      {course.category}
                    </span>
                    <span className={cn("text-[10px] font-medium border rounded px-1.5 py-0.5", difficultyColors[course.difficulty])}>
                      {course.difficulty}
                    </span>
                  </div>
                  <span className="text-xs text-text-muted flex items-center gap-1 shrink-0">
                    <Clock className="size-3.5" /> {course.duration}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-text-primary mb-1">{course.name}</h3>
                <p className="text-[10px] text-text-muted line-clamp-2 mb-3">{course.description}</p>

                <div className="flex items-center gap-3 text-[10px] text-text-muted mb-3">
                  <span className="flex items-center gap-1"><Users className="size-3" /> {course.completed.toLocaleString()} enrolled</span>
                  <span className="flex items-center gap-1"><BookOpen className="size-3" /> {completedModules}/{course.modules.length} modules</span>
                  {course.certificateAvailable && (
                    <span className="flex items-center gap-1 text-status-warning"><Award className="size-3" /> Certificate</span>
                  )}
                </div>

                <div className="mt-auto space-y-1.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-text-muted">Completion</span>
                    <span className="font-semibold text-text-secondary">{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-void rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-purple-light transition-all duration-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 border border-dashed border-default-border rounded-xl">
          <p className="text-sm text-text-muted">No courses match your filters</p>
          <button onClick={() => { setSearch(""); setCategoryFilter("All"); }} className="mt-2 text-xs text-accent-purple-light hover:underline">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
