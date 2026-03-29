import {
  DollarSign,
  Activity,
  Users,
  Zap,
  Clock,
  CheckCircle2,
  TrendingUp,
  Star,
  AlertTriangle,
  Download,
  FileText,
  BarChart3,
  BrainCircuit,
} from "lucide-react";
import { SummaryCard } from "@/components/reports/summary-card";
import { TeamBreakdown } from "@/components/reports/team-breakdown";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const orgOverview = {
  totalClaudeSpend: 14_832.45,
  totalCodexCost: 6_215.8,
  combinedBudgetUsed: 72.4,
  activeUsers: 47,
  usageTrendPercent: 8.3,
  usageTrendUp: true,
};

const claudeAnalytics = {
  totalInputTokens: 128_450_000,
  totalOutputTokens: 41_230_000,
  totalCacheTokens: 86_120_000,
  totalCost: 14_832.45,
  avgCostPerUser: 315.58,
  mostUsedModels: [
    { model: "claude-opus-4-6", pct: 42 },
    { model: "claude-sonnet-4-20250514", pct: 35 },
    { model: "claude-haiku-4-20250414", pct: 23 },
  ],
};

const claudeTeamData = [
  { team: "Platform Eng", members: 12, tokens: "48.2M", cost: "$5,240.30", avgPerUser: "$436.69" },
  { team: "Frontend", members: 9, tokens: "31.7M", cost: "$3,412.15", avgPerUser: "$379.13" },
  { team: "Data Science", members: 8, tokens: "26.1M", cost: "$2,988.60", avgPerUser: "$373.58" },
  { team: "Backend", members: 10, tokens: "18.5M", cost: "$2,014.20", avgPerUser: "$201.42" },
  { team: "DevOps", members: 5, tokens: "6.8M", cost: "$812.40", avgPerUser: "$162.48" },
  { team: "QA", members: 3, tokens: "2.4M", cost: "$364.80", avgPerUser: "$121.60" },
];

const codexAnalytics = {
  totalTasks: 1_284,
  successRate: 87.3,
  avgDuration: "4m 32s",
  costPerTask: 4.84,
};

const codexTeamData = [
  { team: "Platform Eng", members: 12, tasks: 412, successRate: "91.2%", avgDuration: "3m 48s", cost: "$1,994.08" },
  { team: "Backend", members: 10, tasks: 298, successRate: "89.6%", avgDuration: "4m 12s", cost: "$1,442.32" },
  { team: "Frontend", members: 9, tasks: 241, successRate: "85.1%", avgDuration: "4m 55s", cost: "$1,166.44" },
  { team: "Data Science", members: 8, tasks: 178, successRate: "84.3%", avgDuration: "5m 10s", cost: "$861.52" },
  { team: "DevOps", members: 5, tasks: 102, successRate: "90.2%", avgDuration: "3m 22s", cost: "$493.68" },
  { team: "QA", members: 3, tasks: 53, successRate: "82.7%", avgDuration: "6m 15s", cost: "$256.52" },
];

const evalSummary = {
  dimensions: [
    { label: "Claude Usage", avg: 82.4 },
    { label: "Codex Efficiency", avg: 78.9 },
    { label: "Productivity", avg: 85.1 },
    { label: "Code Quality", avg: 80.6 },
    { label: "Overall", avg: 81.8 },
  ],
  topRated: [
    { name: "Sarah Chen", score: 94.2, team: "Platform Eng" },
    { name: "Marcus Johnson", score: 92.8, team: "Backend" },
    { name: "Aisha Patel", score: 91.5, team: "Data Science" },
    { name: "Erik Lindberg", score: 90.1, team: "Frontend" },
    { name: "Yuki Tanaka", score: 89.7, team: "Platform Eng" },
  ],
  needsImprovement: [
    { name: "Tom Rivera", score: 58.3, team: "QA", area: "Codex Efficiency" },
    { name: "Nina Kowalski", score: 61.2, team: "Frontend", area: "Code Quality" },
    { name: "Derek Walsh", score: 63.8, team: "DevOps", area: "Productivity" },
  ],
};

// Placeholder chart bars for daily spending
const dailySpendBars = [
  420, 510, 390, 580, 640, 470, 530, 610, 480, 560,
  620, 490, 710, 650, 580, 430, 520, 590, 670, 540,
  610, 580, 500, 460, 550, 630, 690, 570, 480, 520,
];

const dailyTaskBars = [
  38, 45, 32, 52, 61, 44, 48, 55, 41, 50,
  58, 43, 66, 59, 52, 37, 47, 53, 62, 49,
  56, 51, 44, 40, 50, 57, 64, 52, 42, 48,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function usd(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ReportsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ----------------------------------------------------------------- */}
        {/* Header & Period Selector                                          */}
        {/* ----------------------------------------------------------------- */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
              Reports &amp; Analytics
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Comprehensive AI usage metrics and team evaluation insights
            </p>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/60 p-1">
            {["Last 7 days", "Last 30 days", "Last Quarter", "Custom Range"].map(
              (period, idx) => (
                <button
                  key={period}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    idx === 1
                      ? "bg-zinc-700 text-zinc-50 shadow-sm"
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  {period}
                </button>
              ),
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* A. Organization Overview                                          */}
        {/* ================================================================= */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-violet-500/10 p-2">
              <BarChart3 className="h-4 w-4 text-violet-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Organization Overview</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard
              title="Claude Spend"
              value={usd(orgOverview.totalClaudeSpend)}
              subtitle="API usage costs"
              trend={{ value: 12.3, direction: "up", positive: false }}
            />
            <SummaryCard
              title="Codex Cost"
              value={usd(orgOverview.totalCodexCost)}
              subtitle="Task execution costs"
              trend={{ value: 5.7, direction: "up", positive: false }}
            />
            <SummaryCard
              title="AI Budget Used"
              value={`${orgOverview.combinedBudgetUsed}%`}
              subtitle={usd(orgOverview.totalClaudeSpend + orgOverview.totalCodexCost) + " of $29,000"}
              trend={{ value: 3.1, direction: "up", positive: false }}
            />
            <SummaryCard
              title="Active Users"
              value={orgOverview.activeUsers.toString()}
              subtitle="In current period"
              trend={{ value: 4.2, direction: "up", positive: true }}
            />
            <SummaryCard
              title="Usage Trend"
              value={`${orgOverview.usageTrendPercent}%`}
              subtitle="Period-over-period growth"
              trend={{
                value: orgOverview.usageTrendPercent,
                direction: orgOverview.usageTrendUp ? "up" : "down",
                positive: orgOverview.usageTrendUp,
              }}
            />
          </div>
        </section>

        {/* ================================================================= */}
        {/* B. Claude Usage Analytics                                         */}
        {/* ================================================================= */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-sky-500/10 p-2">
              <BrainCircuit className="h-4 w-4 text-sky-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Claude Usage Analytics</h2>
          </div>

          {/* Metric cards */}
          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              title="Input Tokens"
              value={formatTokens(claudeAnalytics.totalInputTokens)}
              subtitle="Prompt tokens sent"
            />
            <SummaryCard
              title="Output Tokens"
              value={formatTokens(claudeAnalytics.totalOutputTokens)}
              subtitle="Completion tokens"
            />
            <SummaryCard
              title="Cache Tokens"
              value={formatTokens(claudeAnalytics.totalCacheTokens)}
              subtitle="Cached prompt tokens"
            />
            <SummaryCard
              title="Total Cost"
              value={usd(claudeAnalytics.totalCost)}
              subtitle={`Avg ${usd(claudeAnalytics.avgCostPerUser)} / user`}
              trend={{ value: 12.3, direction: "up", positive: false }}
            />
          </div>

          {/* Most used models */}
          <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
            <h3 className="mb-3 text-sm font-semibold text-zinc-200">Most Used Models</h3>
            <div className="space-y-3">
              {claudeAnalytics.mostUsedModels.map((m) => (
                <div key={m.model} className="flex items-center gap-3">
                  <span className="w-56 text-sm font-mono text-zinc-300">{m.model}</span>
                  <div className="flex-1">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-sky-500/80"
                        style={{ width: `${m.pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-right text-xs font-medium text-zinc-400">
                    {m.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Usage by Team table */}
          <div className="mb-4">
            <TeamBreakdown
              title="Usage by Team"
              columns={[
                { key: "team", label: "Team" },
                { key: "members", label: "Members", align: "right" },
                { key: "tokens", label: "Tokens", align: "right" },
                { key: "cost", label: "Cost", align: "right" },
                { key: "avgPerUser", label: "Avg / User", align: "right" },
              ]}
              data={claudeTeamData}
            />
          </div>

          {/* Daily spending trend (placeholder chart) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-zinc-200">Daily Spending Trend</h3>
            <div className="flex h-40 items-end gap-[3px]">
              {dailySpendBars.map((val, i) => {
                const max = Math.max(...dailySpendBars);
                const height = (val / max) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-sky-500/60 transition-colors hover:bg-sky-400/80"
                    style={{ height: `${height}%` }}
                    title={`Day ${i + 1}: $${val}`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
              <span>Day 1</span>
              <span>Day 15</span>
              <span>Day 30</span>
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              Replace with Recharts &lt;BarChart&gt; / &lt;AreaChart&gt; component
            </p>
          </div>
        </section>

        {/* ================================================================= */}
        {/* C. Codex Analytics                                                */}
        {/* ================================================================= */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-amber-500/10 p-2">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Codex Analytics</h2>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <SummaryCard
              title="Tasks Completed"
              value={codexAnalytics.totalTasks.toLocaleString()}
              subtitle="In selected period"
              trend={{ value: 8.1, direction: "up", positive: true }}
            />
            <SummaryCard
              title="Success Rate"
              value={`${codexAnalytics.successRate}%`}
              subtitle="Tasks passing validation"
              trend={{ value: 2.4, direction: "up", positive: true }}
            />
            <SummaryCard
              title="Avg Duration"
              value={codexAnalytics.avgDuration}
              subtitle="Per task execution"
              trend={{ value: 6.2, direction: "down", positive: true }}
            />
            <SummaryCard
              title="Cost / Task"
              value={usd(codexAnalytics.costPerTask)}
              subtitle="Average across all tasks"
              trend={{ value: 1.8, direction: "down", positive: true }}
            />
          </div>

          {/* Tasks by Team */}
          <div className="mb-4">
            <TeamBreakdown
              title="Tasks by Team"
              columns={[
                { key: "team", label: "Team" },
                { key: "members", label: "Members", align: "right" },
                { key: "tasks", label: "Tasks", align: "right" },
                { key: "successRate", label: "Success Rate", align: "right" },
                { key: "avgDuration", label: "Avg Duration", align: "right" },
                { key: "cost", label: "Cost", align: "right" },
              ]}
              data={codexTeamData}
            />
          </div>

          {/* Task completion trend (placeholder chart) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-zinc-200">Task Completion Trend</h3>
            <div className="flex h-40 items-end gap-[3px]">
              {dailyTaskBars.map((val, i) => {
                const max = Math.max(...dailyTaskBars);
                const height = (val / max) * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-amber-500/60 transition-colors hover:bg-amber-400/80"
                    style={{ height: `${height}%` }}
                    title={`Day ${i + 1}: ${val} tasks`}
                  />
                );
              })}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
              <span>Day 1</span>
              <span>Day 15</span>
              <span>Day 30</span>
            </div>
            <p className="mt-2 text-center text-[10px] text-zinc-600">
              Replace with Recharts &lt;BarChart&gt; / &lt;LineChart&gt; component
            </p>
          </div>
        </section>

        {/* ================================================================= */}
        {/* D. Evaluation Summary                                             */}
        {/* ================================================================= */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <Star className="h-4 w-4 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Evaluation Summary</h2>
          </div>

          {/* Dimension avg scores */}
          <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-zinc-200">
              Average Scores by Dimension
            </h3>
            <div className="space-y-4">
              {evalSummary.dimensions.map((d) => (
                <div key={d.label} className="flex items-center gap-4">
                  <span className="w-36 text-sm text-zinc-300">{d.label}</span>
                  <div className="flex-1">
                    <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          d.avg >= 85
                            ? "bg-emerald-500/80"
                            : d.avg >= 75
                              ? "bg-sky-500/80"
                              : d.avg >= 65
                                ? "bg-amber-500/80"
                                : "bg-red-500/80"
                        }`}
                        style={{ width: `${d.avg}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-sm font-semibold text-zinc-200">
                    {d.avg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Score distribution histogram placeholder */}
          <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
            <h3 className="mb-4 text-sm font-semibold text-zinc-200">Score Distribution</h3>
            <div className="flex h-32 items-end justify-center gap-2">
              {[
                { range: "0-20", count: 1 },
                { range: "21-40", count: 2 },
                { range: "41-60", count: 5 },
                { range: "61-80", count: 18 },
                { range: "81-100", count: 21 },
              ].map((bucket) => {
                const max = 21;
                const height = (bucket.count / max) * 100;
                return (
                  <div key={bucket.range} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-zinc-500">{bucket.count}</span>
                    <div
                      className="w-14 rounded-t bg-emerald-500/60 transition-colors hover:bg-emerald-400/80"
                      style={{ height: `${height}%`, minHeight: "4px" }}
                    />
                    <span className="text-[10px] text-zinc-600">{bucket.range}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-[10px] text-zinc-600">
              Replace with Recharts &lt;BarChart&gt; histogram component
            </p>
          </div>

          {/* Top rated & needs improvement side by side */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Top Rated */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Top Rated Members</h3>
              </div>
              <div className="space-y-3">
                {evalSummary.topRated.map((m, i) => (
                  <div key={m.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-400">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{m.name}</p>
                        <p className="text-xs text-zinc-500">{m.team}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-400">{m.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Improvement */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-200">Needs Improvement</h3>
              </div>
              <div className="space-y-3">
                {evalSummary.needsImprovement.map((m) => (
                  <div key={m.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{m.name}</p>
                      <p className="text-xs text-zinc-500">
                        {m.team} &middot; Focus: {m.area}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-amber-400">{m.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* E. Export Section                                                  */}
        {/* ================================================================= */}
        <section className="mb-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 backdrop-blur-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">Export Reports</h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Download usage data and evaluation reports for further analysis
                </p>
              </div>
              <div className="flex gap-3">
                <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-zinc-50">
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-zinc-50">
                  <FileText className="h-4 w-4" />
                  Export PDF Report
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
