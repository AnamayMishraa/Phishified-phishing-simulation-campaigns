"use client";

import { campaignPerformanceData, departmentRiskData, getRiskColor } from "@/data/analytics";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-default-border bg-elevated px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-text-primary mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs text-text-secondary">
          <span
            className="inline-block size-2 rounded-full mr-1.5"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {entry.value}%
        </p>
      ))}
    </div>
  );
};

export function CampaignPerformanceChart() {
  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text-primary">
          Campaign Performance
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Click rate vs Report rate over 12 months
        </p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={campaignPerformanceData}>
            <defs>
              <linearGradient id="clickRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="reportRateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#52525b" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#52525b" }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="clickRate"
              name="Click Rate"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#clickRateGradient)"
            />
            <Area
              type="monotone"
              dataKey="reportRate"
              name="Report Rate"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#reportRateGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-5 mt-3 pt-3 border-t border-default-border">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent-blue" />
          <span className="text-xs text-text-muted">Click Rate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-success" />
          <span className="text-xs text-text-muted">Report Rate</span>
        </div>
      </div>
    </div>
  );
}

export function DepartmentRiskChart() {
  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-text-primary">
          Department Risk Scores
        </h3>
        <p className="text-xs text-text-muted mt-0.5">
          Phishing susceptibility by department
        </p>
      </div>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={departmentRiskData} layout="vertical" barSize={16}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              horizontal={false}
            />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#52525b" }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#a1a1aa" }}
              width={80}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                return (
                  <div className="rounded-lg border border-default-border bg-elevated px-3 py-2 shadow-xl">
                    <p className="text-xs font-medium text-text-primary">
                      {payload[0].payload.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      Risk Score: {payload[0].value}/100
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
              {departmentRiskData.map((entry, index) => (
                <Cell key={index} fill={getRiskColor(entry.risk)} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Risk legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-default-border">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-danger" />
          <span className="text-xs text-text-muted">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-warning" />
          <span className="text-xs text-text-muted">Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-accent-blue" />
          <span className="text-xs text-text-muted">Low</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-status-success" />
          <span className="text-xs text-text-muted">Minimal</span>
        </div>
      </div>
    </div>
  );
}
