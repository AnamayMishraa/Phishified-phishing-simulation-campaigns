"use client";

import {
  campaignPerformanceData, openRateData,
  credentialSubmissionData, departmentRiskData,
  employeeRiskSegmentationData, campaignComparisonData,
  getRiskColor,
} from "@/data/analytics";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const TooltipContent = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border border-default-border bg-elevated px-3 py-2 shadow-xl">
      <p className="text-xs font-medium text-text-primary mb-1">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} className="text-xs text-text-secondary">
          <span className="inline-block size-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value}{entry.name.includes("Rate") || entry.name.includes("Rate") ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-default-border bg-surface p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
      </div>
      <div className="h-[280px]">{children}</div>
    </div>
  );
}

function ChartLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-default-border">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-xs text-text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Open Rate Trends (Area chart)
export function OpenRateTrendsChart() {
  return (
    <ChartCard title="Open Rate Trends" subtitle="Email open rate over the last 12 months">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={openRateData}>
          <defs>
            <linearGradient id="openRateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} tickFormatter={(v) => `${v}%`} domain={[0, 100]} />
          <Tooltip content={<TooltipContent />} />
          <Area type="monotone" dataKey="openRate" name="Open Rate" stroke="#a78bfa" strokeWidth={2} fill="url(#openRateGrad)" />
        </AreaChart>
      </ResponsiveContainer>
      <ChartLegend items={[{ color: "#a78bfa", label: "Open Rate" }]} />
    </ChartCard>
  );
}

// Click Rate vs Report Rate (Area chart)
export function ClickRateTrendsChart() {
  return (
    <ChartCard title="Click Rate Trends" subtitle="Click rate vs report rate over 12 months">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={campaignPerformanceData}>
          <defs>
            <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} tickFormatter={(v) => `${v}%`} />
          <Tooltip content={<TooltipContent />} />
          <Area type="monotone" dataKey="clickRate" name="Click Rate" stroke="#3b82f6" strokeWidth={2} fill="url(#clickGrad)" />
          <Area type="monotone" dataKey="reportRate" name="Report Rate" stroke="#22c55e" strokeWidth={2} fill="url(#reportGrad)" />
        </AreaChart>
      </ResponsiveContainer>
      <ChartLegend items={[{ color: "#3b82f6", label: "Click Rate" }, { color: "#22c55e", label: "Report Rate" }]} />
    </ChartCard>
  );
}

// Credential Submission Trends (Area chart)
export function CredentialSubmissionTrendsChart() {
  return (
    <ChartCard title="Credential Submission Trends" subtitle="Monthly credential submission rates and volume">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={credentialSubmissionData}>
          <defs>
            <linearGradient id="subRateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="subTotalGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} />
          <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} tickFormatter={(v) => `${v}%`} domain={[0, 30]} />
          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} domain={[0, 150]} />
          <Tooltip content={<TooltipContent />} />
          <Area yAxisId="left" type="monotone" dataKey="submissionRate" name="Submission Rate" stroke="#f59e0b" strokeWidth={2} fill="url(#subRateGrad)" />
          <Area yAxisId="right" type="monotone" dataKey="totalSubmissions" name="Total Submissions" stroke="#ef4444" strokeWidth={2} fill="url(#subTotalGrad)" />
        </AreaChart>
      </ResponsiveContainer>
      <ChartLegend items={[{ color: "#f59e0b", label: "Submission Rate" }, { color: "#ef4444", label: "Total Submissions" }]} />
    </ChartCard>
  );
}

// Department Risk Distribution (Bar chart)
export function DepartmentRiskDistributionChart() {
  return (
    <ChartCard title="Department Risk Distribution" subtitle="Phishing susceptibility risk score by department">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={departmentRiskData} layout="vertical" barSize={16}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} domain={[0, 100]} tickFormatter={(v) => `${v}`} />
          <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} width={80} />
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-lg border border-default-border bg-elevated px-3 py-2 shadow-xl">
                <p className="text-xs font-medium text-text-primary">{d.name}</p>
                <p className="text-xs text-text-secondary">Risk Score: {d.risk}/100</p>
                <p className="text-xs text-text-secondary">{d.employees} employees</p>
                <p className="text-xs" style={{ color: d.change >= 0 ? "#ef4444" : "#22c55e" }}>
                  {d.change >= 0 ? "+" : ""}{d.change}% vs last quarter
                </p>
              </div>
            );
          }} />
          <Bar dataKey="risk" radius={[0, 4, 4, 0]}>
            {departmentRiskData.map((entry, index) => (
              <Cell key={index} fill={getRiskColor(entry.risk)} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend items={[
        { color: "#ef4444", label: "High (70+) " },
        { color: "#f59e0b", label: "Medium (50-69)" },
        { color: "#3b82f6", label: "Low (30-49)" },
        { color: "#22c55e", label: "Minimal (<30)" },
      ]} />
    </ChartCard>
  );
}

// Employee Risk Segmentation (Pie chart)
export function EmployeeRiskSegmentationChart() {
  return (
    <ChartCard title="Employee Risk Segmentation" subtitle="Distribution of employees by risk level">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={employeeRiskSegmentationData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {employeeRiskSegmentationData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-lg border border-default-border bg-elevated px-3 py-2 shadow-xl">
                <p className="text-xs font-medium text-text-primary">{d.name}</p>
                <p className="text-xs text-text-secondary">{d.value} employees</p>
              </div>
            );
          }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-default-border">
        {employeeRiskSegmentationData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-text-muted">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

// Campaign Comparison (Bar chart)
export function CampaignComparisonChart() {
  return (
    <ChartCard title="Campaign Comparison" subtitle="Click rate vs report rate across active campaigns">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={campaignComparisonData} barSize={10} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#52525b" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#52525b" }} tickFormatter={(v) => `${v}%`} domain={[0, 80]} />
          <Tooltip content={<TooltipContent />} />
          <Bar dataKey="clickRate" name="Click Rate" radius={[3, 3, 0, 0]} fill="#3b82f6" fillOpacity={0.8} />
          <Bar dataKey="reportRate" name="Report Rate" radius={[3, 3, 0, 0]} fill="#22c55e" fillOpacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
      <ChartLegend items={[{ color: "#3b82f6", label: "Click Rate" }, { color: "#22c55e", label: "Report Rate" }]} />
    </ChartCard>
  );
}
