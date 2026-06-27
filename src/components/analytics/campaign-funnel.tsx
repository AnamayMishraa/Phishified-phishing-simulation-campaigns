"use client";

import type { FunnelStage } from "@/lib/api/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CampaignFunnelProps {
  data: FunnelStage[] | null;
  loading: boolean;
}

const funnelColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#22c55e"];

export function CampaignFunnel({ data, loading }: CampaignFunnelProps) {
  if (loading) return <div className="rounded-xl border border-default-border bg-surface p-5"><div className="h-[280px] bg-white/5 rounded animate-pulse" /></div>;
  if (!data?.length) return null;

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-1">Campaign Funnel</h3>
      <p className="text-xs text-text-muted mb-4">Sent &rarr; Opened &rarr; Clicked &rarr; Submitted &rarr; Reported</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" barSize={28}>
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} />
            <YAxis type="category" dataKey="stage" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} width={90} />
            <Tooltip content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              return (
                <div className="rounded-lg border border-default-border bg-elevated px-3 py-2 shadow-xl">
                  <p className="text-xs font-medium text-text-primary">{d.stage}</p>
                  <p className="text-xs text-text-secondary">{d.count} employees</p>
                </div>
              );
            }} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={funnelColors[i]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
