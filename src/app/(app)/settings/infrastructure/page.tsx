"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api, ApiError } from "@/lib/api/client";
import type { InfrastructureSetting, InfrastructureSettingWrite } from "@/lib/api/types";
import {
  CheckCircle2, XCircle, Loader2, Mail, Globe, Server,
  Send, ShieldCheck, AlertTriangle, Save,
} from "lucide-react";

const EMAIL_PROVIDERS = [
  { value: "microsoft_365", label: "Microsoft 365" },
  { value: "google_workspace", label: "Google Workspace" },
  { value: "sendgrid", label: "SendGrid" },
  { value: "ses", label: "Amazon SES" },
  { value: "other", label: "Other SMTP" },
];

interface StatusIndicatorProps {
  ok: boolean;
  label: string;
}

function StatusIndicator({ ok, label }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      {ok ? (
        <CheckCircle2 className="size-3.5 text-status-success" />
      ) : (
        <XCircle className="size-3.5 text-text-muted" />
      )}
      <span className={ok ? "text-status-success font-medium" : "text-text-muted"}>
        {label}
      </span>
    </div>
  );
}

interface SectionCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SectionCard({ icon: Icon, title, description, children }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-default-border bg-surface p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center size-9 rounded-lg bg-accent-blue/10 shrink-0">
          <Icon className="size-4.5 text-accent-blue-light" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <p className="text-xs text-text-muted mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function HelpText({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] text-text-muted/70 mt-1">{children}</p>;
}

export default function InfrastructureSettingsPage() {
  const [settings, setSettings] = useState<InfrastructureSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [testSending, setTestSending] = useState(false);
  const [verifySmtpLoading, setVerifySmtpLoading] = useState(false);
  const [validateDomainLoading, setValidateDomainLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await api<InfrastructureSetting>("/organizations/infrastructure/");
      setSettings(data);
    } catch {
      setSettings(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const updateField = <K extends keyof InfrastructureSettingWrite>(
    key: K,
    value: InfrastructureSettingWrite[K],
  ) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const body: InfrastructureSettingWrite = {
        company_name: settings.company_name,
        sender_name: settings.sender_name,
        sender_email: settings.sender_email,
        landing_domain: settings.landing_domain,
        email_provider: settings.email_provider,
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_username: settings.smtp_username,
      };
      // Only send password if user changed it (not masked)
      if (settings.smtp_password && settings.smtp_password !== "••••••••") {
        body.smtp_password = settings.smtp_password;
      }
      const updated = await api<InfrastructureSetting>(
        "/organizations/infrastructure/",
        { method: "PUT", body },
      );
      setSettings(updated);
      setSaveMessage({ type: "success", text: "Settings saved successfully." });
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? String(err.body ?? err.message) : "Failed to save settings.";
      setSaveMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifySmtp = async () => {
    setVerifySmtpLoading(true);
    try {
      const data = await api<{ detail: string; smtp_verified: boolean }>(
        "/organizations/infrastructure/verify-smtp/",
        { method: "POST" },
      );
      setSaveMessage({ type: "success", text: data.detail });
      if (settings) setSettings({ ...settings, smtp_verified: true });
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? String(err.body ?? err.message) : "Verification failed.";
      setSaveMessage({ type: "error", text: msg });
    } finally {
      setVerifySmtpLoading(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) return;
    setTestSending(true);
    try {
      const data = await api<{ detail: string }>(
        "/organizations/infrastructure/send-test-email/",
        { method: "POST", body: { to_email: testEmail } },
      );
      setSaveMessage({ type: "success", text: data.detail });
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? String(err.body ?? err.message) : "Failed to send test email.";
      setSaveMessage({ type: "error", text: msg });
    } finally {
      setTestSending(false);
    }
  };

  const handleValidateDomain = async () => {
    if (!settings?.landing_domain) return;
    setValidateDomainLoading(true);
    try {
      const data = await api<{ detail: string; landing_domain_verified: boolean }>(
        "/organizations/infrastructure/validate-domain/",
        { method: "POST", body: { domain: settings.landing_domain } },
      );
      setSaveMessage({ type: "success", text: data.detail });
      if (settings) setSettings({ ...settings, landing_domain_verified: true });
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? String(err.body ?? err.message) : "Domain validation failed.";
      setSaveMessage({ type: "error", text: msg });
      if (settings) setSettings({ ...settings, landing_domain_verified: false });
    } finally {
      setValidateDomainLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Infrastructure" description="Email delivery and landing page configuration" />
        <div className="text-center py-12 text-sm text-text-muted">Loading settings...</div>
      </div>
    );
  }

  const hasSmtp = !!settings?.smtp_host;
  const hasSender = !!(settings?.sender_name && settings?.sender_email);
  const hasLandingDomain = !!settings?.landing_domain;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Infrastructure Settings"
        description="Configure email delivery, sender identity, and landing page domain"
      />

      {/* Health indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border border-default-border bg-surface p-3 space-y-1.5">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Sender</p>
          <StatusIndicator ok={hasSender} label={hasSender ? "Configured" : "Not set"} />
        </div>
        <div className="rounded-lg border border-default-border bg-surface p-3 space-y-1.5">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">SMTP</p>
          <StatusIndicator ok={hasSmtp} label={hasSmtp ? "Configured" : "Not set"} />
        </div>
        <div className="rounded-lg border border-default-border bg-surface p-3 space-y-1.5">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">SMTP Status</p>
          <StatusIndicator ok={!!settings?.smtp_verified} label={settings?.smtp_verified ? "Verified" : "Unverified"} />
        </div>
        <div className="rounded-lg border border-default-border bg-surface p-3 space-y-1.5">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Domain</p>
          <StatusIndicator ok={hasLandingDomain} label={hasLandingDomain ? "Set" : "Not set"} />
        </div>
      </div>

      {/* Save message */}
      {saveMessage && (
        <div className={cn(
          "rounded-xl p-3 text-sm flex items-center gap-2",
          saveMessage.type === "success"
            ? "border border-status-success/20 bg-status-success/5 text-status-success"
            : "border border-status-danger/20 bg-status-danger/5 text-status-danger",
        )}>
          {saveMessage.type === "success"
            ? <CheckCircle2 className="size-4 shrink-0" />
            : <AlertTriangle className="size-4 shrink-0" />}
          {saveMessage.text}
        </div>
      )}

      <SectionCard icon={Mail} title="Sender Identity" description="Name and email address used as the sender in phishing simulation emails">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">Company Name</label>
            <input
              type="text"
              value={settings?.company_name ?? ""}
              onChange={(e) => updateField("company_name", e.target.value)}
              placeholder="Acme Corp"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-blue/30"
            />
            <HelpText>Display name used in reports and system emails</HelpText>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">Sender Name</label>
            <input
              type="text"
              value={settings?.sender_name ?? ""}
              onChange={(e) => updateField("sender_name", e.target.value)}
              placeholder="IT Security Team"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-blue/30"
            />
            <HelpText>Shown as the "from" name in phishing emails</HelpText>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">Sender Email</label>
            <input
              type="email"
              value={settings?.sender_email ?? ""}
              onChange={(e) => updateField("sender_email", e.target.value)}
              placeholder="security@acme.com"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-blue/30"
            />
            <HelpText>Used as the reply-to and from address</HelpText>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Server} title="SMTP Configuration" description="Email delivery server settings">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">Email Provider</label>
            <select
              value={settings?.email_provider ?? "other"}
              onChange={(e) => updateField("email_provider", e.target.value)}
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-accent-blue/30"
            >
              {EMAIL_PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <HelpText>Presets port and security settings for common providers</HelpText>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">SMTP Host</label>
            <input
              type="text"
              value={settings?.smtp_host ?? ""}
              onChange={(e) => updateField("smtp_host", e.target.value)}
              placeholder="smtp.office365.com"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-blue/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">SMTP Port</label>
            <input
              type="number"
              value={settings?.smtp_port ?? 587}
              onChange={(e) => updateField("smtp_port", parseInt(e.target.value, 10) || 587)}
              placeholder="587"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-blue/30"
            />
            <HelpText>587 (STARTTLS), 465 (SSL), or 25 (plain)</HelpText>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">SMTP Username</label>
            <input
              type="text"
              value={settings?.smtp_username ?? ""}
              onChange={(e) => updateField("smtp_username", e.target.value)}
              placeholder="user@acme.com"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-blue/30"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">SMTP Password / API Key</label>
            <input
              type="password"
              value={settings?.smtp_password ?? ""}
              onChange={(e) => updateField("smtp_password", e.target.value)}
              placeholder="Enter password or API key"
              className="w-full rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-blue/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleVerifySmtp}
            disabled={!hasSmtp || verifySmtpLoading}
            className="flex items-center gap-2"
          >
            {verifySmtpLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="size-3.5" />
            )}
            Verify SMTP Connection
          </Button>

          <div className="flex items-center gap-2">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-48 rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-blue/30"
            />
            <Button
              variant="outline"
              onClick={handleSendTestEmail}
              disabled={!testEmail || testSending || !hasSmtp}
              className="flex items-center gap-2"
            >
              {testSending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Send Test Email
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={Globe} title="Landing Page Domain" description="Custom domain for phishing simulation landing pages">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1">Landing Domain</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={settings?.landing_domain ?? ""}
                onChange={(e) => updateField("landing_domain", e.target.value)}
                placeholder="phish-sim.acme.com"
                className="flex-1 rounded-lg border border-default-border bg-void px-3 py-2 text-xs text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-accent-blue/30"
              />
              <Button
                variant="outline"
                onClick={handleValidateDomain}
                disabled={!settings?.landing_domain || validateDomainLoading}
                className="flex items-center gap-2 shrink-0"
              >
                {validateDomainLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Globe className="size-3.5" />
                )}
                Validate
              </Button>
            </div>
            <HelpText>Tracking links and landing pages will use this domain. Must point to the Phishified server.</HelpText>
          </div>
          <div className="flex items-start pt-6">
            {settings?.landing_domain_verified ? (
              <div className="flex items-center gap-1.5 text-xs text-status-success">
                <CheckCircle2 className="size-4" />
                Domain verified — DNS resolves correctly
              </div>
            ) : settings?.landing_domain ? (
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <AlertTriangle className="size-4" />
                Domain not yet validated
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      {/* Save bar */}
      <div className="sticky bottom-4 rounded-xl border border-default-border bg-surface/95 backdrop-blur-sm p-4 flex items-center justify-between">
        <div className="text-[11px] text-text-muted">
          All changes are saved to your organization
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || !settings}
          className="flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
