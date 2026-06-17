"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-default-border bg-surface text-xs text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="size-3.5" />
        Prev
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1.5 rounded-lg border border-default-border bg-surface text-xs text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-colors"
          >
            1
          </button>
          {start > 2 && <span className="text-xs text-text-muted px-1">...</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
            page === currentPage
              ? "border-accent-blue/30 bg-accent-blue/10 text-accent-blue-light"
              : "border-default-border bg-surface text-text-muted hover:text-text-primary hover:border-accent-blue/30"
          )}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-xs text-text-muted px-1">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1.5 rounded-lg border border-default-border bg-surface text-xs text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-default-border bg-surface text-xs text-text-muted hover:text-text-primary hover:border-accent-blue/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next
        <ChevronRight className="size-3.5" />
      </button>
    </div>
  );
}
