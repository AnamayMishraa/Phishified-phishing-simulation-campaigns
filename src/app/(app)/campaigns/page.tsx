import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CampaignList } from "@/components/campaigns/campaign-list";

export const metadata = {
  title: "Campaigns — Phishified",
  description: "Create, manage, and monitor phishing simulation campaigns across your organization.",
};

export default function CampaignsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Campaigns"
        description="Create, manage, and monitor phishing simulation campaigns across your organization"
        actions={
          <Link href="/campaigns/new">
            <Button className="bg-accent-blue hover:bg-accent-blue-dim text-white flex items-center gap-2">
              <Plus className="size-4" /> New Campaign
            </Button>
          </Link>
        }
      />

      <CampaignList />
    </div>
  );
}
