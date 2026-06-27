"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { LandingPageStudio } from "@/components/landing-pages/landing-page-studio";

export default function NewLandingPagePage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="New Landing Page"
        description="Design a new phishing simulation landing page"
      />
      <LandingPageStudio
        mode="create"
        onSuccess={(id) => router.push(`/landing-pages/${id}`)}
        onCancel={() => router.push("/landing-pages")}
      />
    </div>
  );
}
