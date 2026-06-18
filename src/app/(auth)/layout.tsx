import { Shield } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-void px-4 py-12">
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple shadow-[0_0_16px_rgba(59,130,246,0.3)]">
          <Shield className="size-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-text-primary">
            Phishified
          </span>
          <span className="text-[10px] font-medium text-text-muted uppercase tracking-widest">
            Security Platform
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
