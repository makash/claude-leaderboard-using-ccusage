import { DollarSign, ListChecks, Users, Star } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { CodexChart } from "@/components/dashboard/codex-chart";
import { TopPerformers } from "@/components/dashboard/top-performers";
import { RecentEvaluations } from "@/components/dashboard/recent-evaluations";

// TODO: Replace with real data fetching
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { prisma } from "@/lib/prisma";

async function getDashboardStats() {
  // Placeholder stats — replace with Prisma queries once DB is wired up
  return {
    totalSpend: 9532.65,
    totalSpendTrend: { value: 12.3, positive: true },
    totalTasks: 323,
    totalTasksTrend: { value: 8.1, positive: true },
    teamMembers: 24,
    teamMembersTrend: { value: 4.2, positive: true },
    avgScore: 85.4,
    avgScoreTrend: { value: -2.1, positive: false },
  };
}

export default async function DashboardPage() {
  // const session = await getServerSession(authOptions);
  // TODO: redirect if not authenticated
  const stats = await getDashboardStats();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Team performance overview and usage analytics
          </p>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Claude Spend"
            value={`$${stats.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            subtitle="Sum of all API costs"
            icon={DollarSign}
            trend={stats.totalSpendTrend}
          />
          <StatCard
            title="Total Codex Tasks"
            value={stats.totalTasks.toLocaleString()}
            subtitle="Tasks completed to date"
            icon={ListChecks}
            trend={stats.totalTasksTrend}
          />
          <StatCard
            title="Team Members"
            value={stats.teamMembers.toString()}
            subtitle="Active in your organization"
            icon={Users}
            trend={stats.teamMembersTrend}
          />
          <StatCard
            title="Avg Evaluation Score"
            value={stats.avgScore.toFixed(1)}
            subtitle="Across all evaluations"
            icon={Star}
            trend={stats.avgScoreTrend}
          />
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <UsageChart />
          <CodexChart />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TopPerformers />
          <RecentEvaluations />
        </div>
      </div>
    </div>
  );
}
