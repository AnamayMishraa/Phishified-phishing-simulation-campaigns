import { Bot, LineChart, ShieldCheck, TrendingUp, GraduationCap, FileSpreadsheet } from "lucide-react";

const features = [
  {
    title: "AI Scenario Engine",
    description: "Self-generating custom spearphishing campaigns tailored dynamically to target employee roles.",
    icon: Bot,
    color: "text-accent-blue-light",
    bg: "bg-accent-blue/10 border-accent-blue/20",
  },
  {
    title: "Precision Telemetry",
    description: "Record exact open times, click velocity, credential attempts, and report timestamps.",
    icon: LineChart,
    color: "text-accent-purple-light",
    bg: "bg-accent-purple/10 border-accent-purple/20",
  },
  {
    title: "One-Click Whitelisting",
    description: "Effortless integration protocols for Office 365, Exchange, and G Suite tenants.",
    icon: ShieldCheck,
    color: "text-accent-cyan-light",
    bg: "bg-accent-cyan/10 border-accent-cyan/20",
  },
  {
    title: "Risk Profiling",
    description: "Dynamically calculate vulnerability and threat scores by team, department, or individual.",
    icon: TrendingUp,
    color: "text-status-warning",
    bg: "bg-status-warning/10 border-status-warning/20",
  },
  {
    title: "Micro-Training Loops",
    description: "Serve contextual safety courses on-the-spot to failed targets to reinforce awareness.",
    icon: GraduationCap,
    color: "text-status-success",
    bg: "bg-status-success/10 border-status-success/20",
  },
  {
    title: "Executive Compliance",
    description: "Download board-ready PDFs and reports mapped to SOC 2, HIPAA, and ISO 27001 standards.",
    icon: FileSpreadsheet,
    color: "text-text-primary",
    bg: "bg-white/[0.04] border-white/[0.08]",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-6 border-t border-default-border bg-void/50">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Platform Capabilities
          </h2>
          <p className="text-xs sm:text-sm text-text-muted max-w-xl mx-auto">
            Everything security teams need to launch drills, gauge compliance, and secure employees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="group border border-default-border bg-surface rounded-xl p-5 hover:border-accent-blue/20 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />
                <div className={`flex items-center justify-center size-9 rounded-lg border ${feat.bg} ${feat.color} mb-4`}>
                  <Icon className="size-4" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary mb-2 group-hover:text-accent-blue-light transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
