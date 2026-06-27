"use client";

import type { DeptComparison } from "@/lib/api/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DepartmentComparisonProps {
  data: DeptComparison[] | null;
  loading: boolean;
}

export function DepartmentComparison({ data, loading }: DepartmentComparisonProps) {
  if (loading) return <div className="rounded-xl border border-default-border bg-surface p-5"><div className="h-[280px] bg-white/5 rounded animate-pulse" /></div>;
  if (!data?.length) return null;

  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-1">Department Comparison</h3>
      <p className="text-xs text-text-muted mb-4">Click rate vs report rate by department</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barSize={8} barGap={3}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="department" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#52525b" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} tickFormatter={(v) => `${v}%`} />
            <Tooltip content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-lg border border-default-border bg-elevated px-3 py-2 shadow-xl">
                  <p className="text-xs font-medium text-text-primary mb-1">{label}</p>
                  {payload.map((p) => (
                    <p key={p.name} className="text-xs text-text-secondary">
                      {p.name}: {p.value}%
                    </p>
                  ))}
                </div>
              );
            }} />
            <Legend wrapperStyle={{ fontSize: "10px", color: "#a1a1aa" }} />
            <Bar dataKey="click_rate" name="Click Rate" radius={[3, 3, 0, 0]} fill="#ef4444" fillOpacity={0.8} />
            <Bar dataKey="report_rate" name="Report Rate" radius={[3, 3, 0, 0]} fill="#22c55e" fillOpacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
