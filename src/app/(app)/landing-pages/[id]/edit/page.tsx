"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { LandingPageStudio } from "@/components/landing-pages/landing-page-studio";

export default function EditLandingPagePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fade-in">
      <Link
        href={`/landing-pages/${id}`}
        className="flex items-center gap-2 text-sm text-accent-blue-light hover:underline w-fit"
      >
        <ArrowLeft className="size-4" /> Back to landing page
      </Link>

      <PageHeader title="Edit Landing Page" description="Update landing page details and content." />

      <LandingPageStudio
        mode="edit"
        id={id}
        onSuccess={(returnId) => router.push(`/landing-pages/${returnId}`)}
        onCancel={() => router.push(`/landing-pages/${id}`)}
      />
    </div>
  );
}
