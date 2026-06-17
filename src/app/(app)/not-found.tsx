"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function AppNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex items-center justify-center size-16 rounded-2xl bg-accent-blue/10 border border-accent-blue/20">
        <Shield className="size-8 text-accent-blue-light" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-text-primary">Page Not Found</h2>
        <p className="text-sm text-text-muted max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <div className="flex gap-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-lg bg-accent-blue hover:bg-accent-blue-dim text-white text-xs font-medium px-3 py-1.5 transition-colors"
        >
          <ArrowLeft className="size-3.5 mr-1" /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
