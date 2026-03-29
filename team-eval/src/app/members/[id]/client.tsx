"use client";

import { useState } from "react";
import {
  DollarSign,
  Cpu,
  Zap,
  Database,
  CheckCircle2,
  Clock,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Calendar,
  ChevronDown,
} from "lucide-react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { UsageHeatmap } from "@/components/members/usage-heatmap";
import { ScoreRadar } from "@/components/members/score-radar";

// ── Types ──────────────────────────────────────────────────────────────

interface MemberData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  title: string;
  teams: string[];
  joinedAt: string;
  totalSpend: number;
}

type Period = "7d" | "30d" | "90d" | "all";

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All Time" },
];

// ── Tier Badge Config ──────────────────────────────────────────────────

const TITLE_STYLES: Record<string, { bg: string; text: string; ring: string }> =
  {
    "AI Architect": {
      bg: "bg-amber-500/15",
      text: "text-amber-400",
      ring: "ring-amber-500/30",
    },
    "Power User": {
      bg: "bg-purple-500/15",
      text: "text-purple-400",
      ring: "ring-purple-500/30",
    },
    "Heavy Hitter": {
      bg: "bg-cyan-500/15",
      text: "text-cyan-400",
      ring: "ring-cyan-500/30",
    },
    "Active User": {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      ring: "ring-emerald-500/30",
    },
    "Getting Started": {
      bg: "bg-zinc-500/15",
      text: "text-zinc-400",
      ring: "ring-zinc-500/30",
    },
  };

// ── Mock Chart Data ────────────────────────────────────────────────────

const dailyUsageData = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    cost: Math.round((Math.random() * 40 + 10) * 100) / 100,
  };
});

const modelBreakdown = [
  { name: "Claude 3.5 Sonnet", value: 52, color: "#818cf8" },
  { name: "Claude 3.5 Haiku", value: 28, color: "#6366f1" },
  { name: "Claude 3 Opus", value: 15, color: "#4f46e5" },
  { name: "Claude 3 Haiku", value: 5, color: "#3730a3" },
];

const codexTasksData = Array.from({ length: 14 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (13 - i));
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    tasks: Math.floor(Math.random() * 8 + 1),
    success: Math.floor(Math.random() * 6 + 1),
  };
});

const languageBreakdown = [
  { language: "TypeScript", pct: 42, color: "bg-indigo-500" },
  { language: "Python", pct: 28, color: "bg-emerald-500" },
  { language: "Rust", pct: 16, color: "bg-amber-500" },
  { language: "Go", pct: 9, color: "bg-cyan-500" },
  { language: "Other", pct: 5, color: "bg-zinc-500" },
];

const evaluationHistory = [
  {
    id: 1,
    date: "2025-03-15",
    evaluator: "Team Lead",
    overallScore: 92,
    strengths: ["Excellent prompt engineering", "High code quality"],
    areas: ["Could share more with the team"],
  },
  {
    id: 2,
    date: "2025-02-12",
    evaluator: "Peer Review",
    overallScore: 88,
    strengths: ["Consistent output", "Good documentation"],
    areas: ["Explore more model capabilities"],
  },
  {
    id: 3,
    date: "2025-01-10",
    evaluator: "Team Lead",
    overallScore: 85,
    strengths: ["Fast adoption", "Creative solutions"],
    areas: ["Optimize token usage", "More caching"],
  },
];

const scoreTrendData = evaluationHistory
  .slice()
  .reverse()
  .map((e) => ({
    date: new Date(e.date).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    }),
    score: e.overallScore,
  }));

// ── Comparison mock data ───────────────────────────────────────────────

const comparisonMetrics = [
  { label: "Daily Spend", member: "$41.33", org: "$28.50", better: true },
  { label: "Cache Rate", member: "34%", org: "22%", better: true },
  { label: "Output/Dollar", member: "2.4k tok", org: "1.8k tok", better: true },
  { label: "Eval Score", member: "92", org: "74", better: true },
  { label: "Codex Success", member: "87%", org: "79%", better: true },
  { label: "Avg Task Duration", member: "4.2m", org: "5.8m", better: true },
];

// ── Recharts tooltip style ─────────────────────────────────────────────

const tooltipStyle = {
  backgroundColor: "#18181b",
  border: "1px solid #3f3f46",
  borderRadius: "8px",
  color: "#fafafa",
  fontSize: "13px",
};

// ── Component ──────────────────────────────────────────────────────────

export function MemberProfileClient({ member }: { member: MemberData }) {
  const [period, setPeriod] = useState<Period>("30d");
  const [periodOpen, setPeriodOpen] = useState(false);

  const titleStyle = TITLE_STYLES[member.title] ?? TITLE_STYLES["Getting Started"];

  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="h-20 w-20 rounded-2xl border-2 border-zinc-700 object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-zinc-700 bg-indigo-500/20 text-2xl font-bold text-indigo-400">
              {initials}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-50">{member.name}</h1>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ring-1 ring-inset ${titleStyle.bg} ${titleStyle.text} ${titleStyle.ring}`}
              >
                {member.title}
              </span>
            </div>
            <p className="text-sm text-zinc-400">{member.role}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {member.teams.join(", ")}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Member since{" "}
                {new Date(member.joinedAt).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="relative">
          <button
            onClick={() => setPeriodOpen(!periodOpen)}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/70 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700/70"
          >
            {PERIOD_OPTIONS.find((p) => p.value === period)?.label}
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>
          {periodOpen && (
            <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setPeriod(opt.value);
                    setPeriodOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-zinc-700/60 ${
                    period === opt.value
                      ? "text-indigo-400 font-medium"
                      : "text-zinc-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Layout: Content + Sidebar ──────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* ── Left Column ───────────────────────────────────────────── */}
        <div className="space-y-8">
          {/* ═══ Claude Usage Section ═══════════════════════════════ */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-indigo-400" />
              Claude Usage
            </h2>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MiniStat
                label="Total Spend"
                value={`$${member.totalSpend.toLocaleString()}`}
                icon={DollarSign}
                trend={{ value: 12, positive: true }}
              />
              <MiniStat
                label="Total Tokens"
                value="3.2M"
                icon={Database}
                trend={{ value: 8, positive: true }}
              />
              <MiniStat
                label="Output/Dollar"
                value="2.4k tok"
                icon={Zap}
                trend={{ value: 5, positive: true }}
              />
              <MiniStat
                label="Cache Rate"
                value="34%"
                icon={TrendingUp}
                trend={{ value: 3, positive: true }}
              />
            </div>

            {/* Usage Heatmap */}
            <div className="mt-4">
              <UsageHeatmap weeks={20} />
            </div>

            {/* Charts Row: Model Breakdown + Daily Trend */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Model Breakdown */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <h3 className="text-base font-semibold text-zinc-50 mb-1">
                  Model Breakdown
                </h3>
                <p className="text-sm text-zinc-500 mb-4">Spend by model</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modelBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {modelBreakdown.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 space-y-1.5">
                  {modelBreakdown.map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="flex items-center gap-2 text-zinc-400">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: m.color }}
                        />
                        {m.name}
                      </span>
                      <span className="text-zinc-300 font-medium">{m.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Usage Trend */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <h3 className="text-base font-semibold text-zinc-50 mb-1">
                  Daily Usage Trend
                </h3>
                <p className="text-sm text-zinc-500 mb-4">
                  Spend over last 30 days
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyUsageData}>
                      <defs>
                        <linearGradient
                          id="memberCostGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#818cf8"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#818cf8"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis
                        dataKey="date"
                        stroke="#52525b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        interval={6}
                      />
                      <YAxis
                        stroke="#52525b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value: number) => [
                          `$${value.toFixed(2)}`,
                          "Spend",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        stroke="#818cf8"
                        strokeWidth={2}
                        fill="url(#memberCostGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>

          {/* ═══ Codex Usage Section ════════════════════════════════ */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-400" />
              Codex Usage
            </h2>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <MiniStat
                label="Total Tasks"
                value="64"
                icon={CheckCircle2}
                trend={{ value: 18, positive: true }}
              />
              <MiniStat
                label="Success Rate"
                value="87%"
                icon={TrendingUp}
                trend={{ value: 4, positive: true }}
              />
              <MiniStat
                label="Avg Duration"
                value="4.2m"
                icon={Clock}
                trend={{ value: 8, positive: true }}
              />
              <MiniStat
                label="Total Cost"
                value="$182"
                icon={DollarSign}
                trend={{ value: 6, positive: false }}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Tasks Trend */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <h3 className="text-base font-semibold text-zinc-50 mb-1">
                  Tasks Trend
                </h3>
                <p className="text-sm text-zinc-500 mb-4">
                  Daily tasks over last 2 weeks
                </p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={codexTasksData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis
                        dataKey="date"
                        stroke="#52525b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        interval={2}
                      />
                      <YAxis
                        stroke="#52525b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar
                        dataKey="tasks"
                        name="Total"
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="success"
                        name="Success"
                        fill="#34d399"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Language Breakdown */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <h3 className="text-base font-semibold text-zinc-50 mb-1">
                  Language Breakdown
                </h3>
                <p className="text-sm text-zinc-500 mb-4">
                  Codex tasks by language
                </p>
                <div className="space-y-3 mt-6">
                  {languageBreakdown.map((lang) => (
                    <div key={lang.language}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-zinc-300">
                          {lang.language}
                        </span>
                        <span className="text-xs font-medium text-zinc-400">
                          {lang.pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-800">
                        <div
                          className={`h-2 rounded-full ${lang.color} transition-all`}
                          style={{ width: `${lang.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══ Evaluation History ═════════════════════════════════ */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-amber-400" />
              Evaluation History
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Score trend */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
                <h3 className="text-base font-semibold text-zinc-50 mb-1">
                  Score Trend
                </h3>
                <p className="text-sm text-zinc-500 mb-4">
                  Overall evaluation scores over time
                </p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scoreTrendData}>
                      <defs>
                        <linearGradient
                          id="scoreGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#f59e0b"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#f59e0b"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis
                        dataKey="date"
                        stroke="#52525b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#52525b"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={[60, 100]}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fill="url(#scoreGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Radar chart */}
              <ScoreRadar />
            </div>

            {/* Evaluation List */}
            <div className="mt-4 space-y-3">
              {evaluationHistory.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-300">
                          {ev.evaluator}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(ev.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                            Strengths
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.strengths.map((s) => (
                              <span
                                key={s}
                                className="inline-flex rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
                            Areas to Improve
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {ev.areas.map((a) => (
                              <span
                                key={a}
                                className="inline-flex rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400 ring-1 ring-inset ring-amber-500/20"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-lg font-bold text-indigo-400">
                      {ev.overallScore}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Right Sidebar: Comparison ─────────────────────────────── */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm sticky top-24">
            <h3 className="text-base font-semibold text-zinc-50 mb-1">
              vs. Org Averages
            </h3>
            <p className="text-sm text-zinc-500 mb-5">
              How {member.name.split(" ")[0]} compares to the organization
            </p>

            <div className="space-y-4">
              {comparisonMetrics.map((m) => (
                <div key={m.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-zinc-500">{m.label}</span>
                    {m.better ? (
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                    )}
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-lg font-bold text-zinc-100">
                      {m.member}
                    </span>
                    <span className="text-sm text-zinc-500">{m.org} avg</span>
                  </div>
                  <div className="mt-1.5 h-1 w-full rounded-full bg-zinc-800">
                    <div
                      className="h-1 rounded-full bg-indigo-500"
                      style={{
                        width: `${Math.min(
                          (parseFloat(m.member.replace(/[^0-9.]/g, "")) /
                            parseFloat(m.org.replace(/[^0-9.]/g, ""))) *
                            50,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Current Strengths Summary */}
            <div className="mt-6 pt-5 border-t border-zinc-800">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                Current Top Strengths
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Prompt Craft", "Innovation", "Code Quality"].map((s) => (
                  <span
                    key={s}
                    className="inline-flex rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] text-indigo-400 ring-1 ring-inset ring-indigo-500/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
                Focus Areas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Knowledge Sharing", "Token Optimization"].map((a) => (
                  <span
                    key={a}
                    className="inline-flex rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-400 ring-1 ring-inset ring-amber-500/20"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Mini Stat Card ─────────────────────────────────────────────────────

function MiniStat({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500">{label}</span>
        <Icon className="h-4 w-4 text-zinc-600" />
      </div>
      <p className="text-xl font-bold text-zinc-50">{value}</p>
      {trend && (
        <div className="mt-1 flex items-center gap-1">
          <span
            className={`text-[11px] font-medium ${
              trend.positive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {trend.positive ? "+" : "-"}{trend.value}%
          </span>
          <span className="text-[11px] text-zinc-600">vs last period</span>
        </div>
      )}
    </div>
  );
}
