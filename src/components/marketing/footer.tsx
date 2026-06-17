import Link from "next/link";
import { Shield } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-default-border bg-void py-12 px-6 text-xs text-text-muted">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-6 rounded bg-gradient-to-br from-accent-blue to-accent-purple">
            <Shield className="size-3 text-white" />
          </div>
          <span className="font-semibold text-text-primary">Phishified</span>
        </div>
        <div className="flex gap-6">
          <a href="#features" className="hover:text-text-secondary transition-colors">Features</a>
          <Link href="/dashboard" className="hover:text-text-secondary transition-colors">Dashboard Console</Link>
          <span className="text-text-muted/30">|</span>
          <span>© 2026 Phishified Systems Inc.</span>
        </div>
      </div>
    </footer>
  );
}
