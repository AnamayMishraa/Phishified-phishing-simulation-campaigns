"use client";

import type { RiskTrendPoint } from "@/lib/api/types";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RiskTrendTimelineProps {
  data: RiskTrendPoint[] | null;
  loading: boolean;
}

export function RiskTrendTimeline({ data, loading }: RiskTrendTimelineProps) {
  if (loading) return <div className="rounded-xl border border-default-border bg-surface p-5"><div className="h-[280px] bg-white/5 rounded animate-pulse" /></div>;
  if (!data?.length) return null;

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-1">Risk Trend Timeline</h3>
      <p className="text-xs text-text-muted mb-4">Average risk score over time</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="riskTrendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={(v) => v.slice(0, 7)} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} domain={[0, 100]} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-default-border bg-elevated px-3 py-2 shadow-xl">
                  <p className="text-xs font-medium text-text-primary">{d.date}</p>
                  <p className="text-xs text-text-secondary">Avg Risk: {d.avg_risk}/100</p>
                </div>
              );
            }} />
            <Area type="monotone" dataKey="avg_risk" stroke="#ef4444" strokeWidth={2} fill="url(#riskTrendGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
