import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import {
  ArrowLeft,
  User,
  DollarSign,
  Coins,
  Database,
  ListChecks,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

interface Member {
  id: string;
  name: string;
  role: string;
  title: string;
  teams: string[];
  joinedAt: string;
  claude: {
    totalSpend: number;
    totalTokens: number;
    cacheHitRate: number;
  };
  codex: {
    totalTasks: number;
    successRate: number;
    avgDuration: string;
  };
  evaluations: {
    id: string;
    period: string;
    overall: number;
    status: "Draft" | "Submitted" | "Acknowledged";
    date: string;
  }[];
}

const MEMBERS: Record<string, Member> = {
  "1": {
    id: "1",
    name: "Sarah Chen",
    role: "Senior Engineer",
    title: "AI Architect",
    teams: ["Platform", "AI Core"],
    joinedAt: "2024-06-15",
    claude: { totalSpend: 1240.5, totalTokens: 8_420_000, cacheHitRate: 72.3 },
    codex: { totalTasks: 156, successRate: 94.2, avgDuration: "2m 18s" },
    evaluations: [
      { id: "eval-1", period: "Feb 2026", overall: 8.5, status: "Submitted", date: "2026-03-15" },
      { id: "eval-7", period: "Jan 2026", overall: 8.0, status: "Acknowledged", date: "2026-02-12" },
      { id: "eval-10", period: "Dec 2025", overall: 7.5, status: "Acknowledged", date: "2026-01-10" },
    ],
  },
  "2": {
    id: "2",
    name: "Alex Rivera",
    role: "Staff Engineer",
    title: "Power User",
    teams: ["Backend", "Infrastructure"],
    joinedAt: "2024-03-20",
    claude: { totalSpend: 680.0, totalTokens: 4_150_000, cacheHitRate: 65.8 },
    codex: { totalTasks: 89, successRate: 91.0, avgDuration: "3m 05s" },
    evaluations: [
      { id: "eval-8", period: "Feb 2026", overall: 7.2, status: "Acknowledged", date: "2026-03-10" },
      { id: "eval-11", period: "Jan 2026", overall: 6.8, status: "Acknowledged", date: "2026-02-08" },
    ],
  },
  "3": {
    id: "3",
    name: "Mika Tanaka",
    role: "Engineering Manager",
    title: "Heavy Hitter",
    teams: ["Frontend", "Design Systems"],
    joinedAt: "2024-01-10",
    claude: { totalSpend: 320.0, totalTokens: 2_080_000, cacheHitRate: 58.1 },
    codex: { totalTasks: 42, successRate: 88.5, avgDuration: "4m 12s" },
    evaluations: [
      { id: "eval-9", period: "Feb 2026", overall: 6.0, status: "Submitted", date: "2026-03-12" },
    ],
  },
};

function getMember(id: string): Member {
  return MEMBERS[id] ?? MEMBERS["1"];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function scoreColor(score: number): string {
  if (score >= 8) return "text-emerald-400";
  if (score >= 6) return "text-amber-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 8) return "bg-emerald-950/60 border-emerald-800/40";
  if (score >= 6) return "bg-amber-950/60 border-amber-800/40";
  if (score >= 4) return "bg-orange-950/60 border-orange-800/40";
  return "bg-red-950/60 border-red-800/40";
}

function titleBadgeColor(title: string): string {
  switch (title) {
    case "AI Architect":
      return "bg-indigo-950/70 text-indigo-300 border-indigo-800/50";
    case "Power User":
      return "bg-violet-950/70 text-violet-300 border-violet-800/50";
    case "Heavy Hitter":
      return "bg-amber-950/70 text-amber-300 border-amber-800/50";
    default:
      return "bg-gray-800 text-gray-300 border-gray-700";
  }
}

/* ------------------------------------------------------------------ */
/*  Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10">
        <Icon className="h-5 w-5 text-indigo-400" />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-100">{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = getMember(id);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/leaderboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Members
        </Link>

        {/* ── Member Header ─────────────────────────────────────── */}
        <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/40 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar placeholder */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-xl font-bold text-indigo-400">
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-50">
                    {member.name}
                  </h1>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${titleBadgeColor(member.title)}`}
                  >
                    {member.title}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-gray-400">{member.role}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {member.teams.map((team) => (
                    <span
                      key={team}
                      className="rounded-md bg-gray-800 px-2 py-0.5 text-xs text-gray-400 border border-gray-700"
                    >
                      {team}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Member since {member.joinedAt}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* ── Claude Usage ──────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Claude Usage
            </h2>
            <div className="space-y-4">
              <StatItem
                icon={DollarSign}
                label="Total Spend"
                value={`$${member.claude.totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              />
              <StatItem
                icon={Coins}
                label="Total Tokens"
                value={member.claude.totalTokens.toLocaleString()}
              />
              <StatItem
                icon={Database}
                label="Cache Hit Rate"
                value={`${member.claude.cacheHitRate}%`}
              />
            </div>
            <div className="mt-6 rounded-lg border border-dashed border-gray-700 bg-gray-800/30 px-4 py-6 text-center">
              <BarChart3 className="mx-auto mb-2 h-8 w-8 text-gray-600" />
              <p className="text-sm text-gray-500">
                Daily trend chart coming soon
              </p>
            </div>
          </div>

          {/* ── Codex Usage ───────────────────────────────────────── */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-400">
              Codex Usage
            </h2>
            <div className="space-y-4">
              <StatItem
                icon={ListChecks}
                label="Total Tasks"
                value={member.codex.totalTasks.toLocaleString()}
              />
              <StatItem
                icon={CheckCircle2}
                label="Success Rate"
                value={`${member.codex.successRate}%`}
              />
              <StatItem
                icon={Clock}
                label="Avg Duration"
                value={member.codex.avgDuration}
              />
            </div>
          </div>
        </div>

        {/* ── Evaluation History ────────────────────────────────── */}
        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/40 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Evaluation History
            </h2>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </div>

          {member.evaluations.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No evaluations yet.
            </p>
          ) : (
            <div className="space-y-3">
              {member.evaluations.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/evaluations/${ev.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-800/30 px-4 py-3 transition-colors hover:bg-gray-800/60"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex items-center justify-center rounded-md border px-2.5 py-1 text-sm font-bold tabular-nums ${scoreColor(ev.overall)} ${scoreBg(ev.overall)}`}
                    >
                      {ev.overall.toFixed(1)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-200">
                        {ev.period}
                      </p>
                      <p className="text-xs text-gray-500">{ev.date}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      ev.status === "Acknowledged"
                        ? "bg-emerald-950/70 text-emerald-300 border-emerald-800/50"
                        : ev.status === "Submitted"
                          ? "bg-blue-950/70 text-blue-300 border-blue-800/50"
                          : "bg-amber-950/70 text-amber-300 border-amber-800/50"
                    }`}
                  >
                    {ev.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
