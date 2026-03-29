import { Trophy, Users, Zap, TrendingUp } from "lucide-react";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import type { LeaderboardMember } from "@/components/leaderboard/leaderboard-table";
import { Navbar } from "@/components/ui/navbar";

// ---------------------------------------------------------------------------
// Mock data -- replace with real DB / API calls
// ---------------------------------------------------------------------------

const MOCK_MEMBERS: LeaderboardMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    avatarUrl: null,
    claudeSpend: 1247.5,
    claudeTokens: 18_400_000,
    codexTasks: 142,
    codexSuccessRate: 94,
    combinedScore: 97.2,
    trend: "up",
  },
  {
    id: "2",
    name: "Marcus Johnson",
    avatarUrl: null,
    claudeSpend: 980.0,
    claudeTokens: 14_200_000,
    codexTasks: 118,
    codexSuccessRate: 89,
    combinedScore: 88.5,
    trend: "up",
  },
  {
    id: "3",
    name: "Aisha Patel",
    avatarUrl: null,
    claudeSpend: 875.25,
    claudeTokens: 12_800_000,
    codexTasks: 95,
    codexSuccessRate: 91,
    combinedScore: 82.1,
    trend: "down",
  },
  {
    id: "4",
    name: "Jake Morrison",
    avatarUrl: null,
    claudeSpend: 612.0,
    claudeTokens: 9_100_000,
    codexTasks: 78,
    codexSuccessRate: 85,
    combinedScore: 71.4,
    trend: "up",
  },
  {
    id: "5",
    name: "Lena Kim",
    avatarUrl: null,
    claudeSpend: 430.75,
    claudeTokens: 6_500_000,
    codexTasks: 62,
    codexSuccessRate: 88,
    combinedScore: 63.9,
    trend: "neutral",
  },
  {
    id: "6",
    name: "Daniel Okafor",
    avatarUrl: null,
    claudeSpend: 310.5,
    claudeTokens: 4_700_000,
    codexTasks: 45,
    codexSuccessRate: 82,
    combinedScore: 52.3,
    trend: "down",
  },
  {
    id: "7",
    name: "Priya Sharma",
    avatarUrl: null,
    claudeSpend: 185.0,
    claudeTokens: 2_900_000,
    codexTasks: 34,
    codexSuccessRate: 76,
    combinedScore: 41.7,
    trend: "up",
  },
  {
    id: "8",
    name: "Tom Brennan",
    avatarUrl: null,
    claudeSpend: 92.0,
    claudeTokens: 1_400_000,
    codexTasks: 19,
    codexSuccessRate: 79,
    combinedScore: 30.2,
    trend: "neutral",
  },
  {
    id: "9",
    name: "Sofia Reyes",
    avatarUrl: null,
    claudeSpend: 48.5,
    claudeTokens: 720_000,
    codexTasks: 11,
    codexSuccessRate: 73,
    combinedScore: 19.8,
    trend: "up",
  },
  {
    id: "10",
    name: "Chris Tanaka",
    avatarUrl: null,
    claudeSpend: 15.0,
    claudeTokens: 230_000,
    codexTasks: 4,
    codexSuccessRate: 50,
    combinedScore: 8.1,
    trend: "down",
  },
];

// ---------------------------------------------------------------------------
// Aggregate stats
// ---------------------------------------------------------------------------

function aggregateStats(members: LeaderboardMember[]) {
  const totalSpend = members.reduce((s, m) => s + m.claudeSpend, 0);
  const totalTokens = members.reduce((s, m) => s + m.claudeTokens, 0);
  const totalTasks = members.reduce((s, m) => s + m.codexTasks, 0);
  const avgScore =
    members.length > 0
      ? members.reduce((s, m) => s + m.combinedScore, 0) / members.length
      : 0;
  return { totalSpend, totalTokens, totalTasks, avgScore };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function LeaderboardPage() {
  // In production, fetch from DB here
  const members = MOCK_MEMBERS;
  const stats = aggregateStats(members);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/20">
              <Trophy className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
                Leaderboard
              </h1>
              <p className="text-sm text-zinc-500">
                Org-wide AI usage rankings. Climb the ranks.
              </p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            icon={<Users className="h-4 w-4 text-indigo-400" />}
            label="Active Members"
            value={members.length.toString()}
          />
          <SummaryCard
            icon={<Zap className="h-4 w-4 text-amber-400" />}
            label="Total Spend"
            value={`$${stats.totalSpend.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
          />
          <SummaryCard
            icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
            label="Codex Tasks"
            value={stats.totalTasks.toLocaleString()}
          />
          <SummaryCard
            icon={<Trophy className="h-4 w-4 text-purple-400" />}
            label="Avg Score"
            value={stats.avgScore.toFixed(1)}
          />
        </div>

        {/* Leaderboard */}
        <LeaderboardTable members={members} />
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal summary card (server component)
// ---------------------------------------------------------------------------

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-xl font-bold tracking-tight text-zinc-50">
        {value}
      </p>
    </div>
  );
}
