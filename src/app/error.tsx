"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex items-center justify-center size-16 rounded-2xl bg-status-danger/10 border border-status-danger/20">
        <span className="text-2xl">⚠</span>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-text-primary">
          Something went wrong
        </h2>
        <p className="text-sm text-text-muted max-w-md">
          An unexpected error occurred. Please try again or contact your
          administrator if the problem persists.
        </p>
        {error.digest && (
          <p className="text-xs text-text-muted/50 font-mono mt-2">
            Error ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-medium px-3 py-1.5 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-accent-blue hover:bg-accent-blue-dim text-white text-xs font-medium px-3 py-1.5 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
