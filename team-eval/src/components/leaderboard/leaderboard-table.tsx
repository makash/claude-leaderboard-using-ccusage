"use client";

import { useState, useMemo } from "react";
import {
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  ChevronUp,
  ChevronDown,
  Flame,
  Medal,
  Crown,
} from "lucide-react";
import { MemberBadge } from "./member-badge";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LeaderboardMember {
  id: string;
  name: string;
  avatarUrl: string | null;
  claudeSpend: number;
  claudeTokens: number;
  codexTasks: number;
  codexSuccessRate: number;
  combinedScore: number;
  trend: "up" | "down" | "neutral";
}

type SortKey =
  | "claudeSpend"
  | "claudeTokens"
  | "outputPerDollar"
  | "cacheRate"
  | "codexTasks"
  | "combinedScore";

type Period = "week" | "month" | "quarter" | "all";

interface LeaderboardTableProps {
  members: LeaderboardMember[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "quarter", label: "This Quarter" },
  { key: "all", label: "All Time" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "combinedScore", label: "Combined Score" },
  { key: "claudeSpend", label: "Total Cost" },
  { key: "claudeTokens", label: "Total Tokens" },
  { key: "outputPerDollar", label: "Output / Dollar" },
  { key: "cacheRate", label: "Cache Rate" },
  { key: "codexTasks", label: "Codex Tasks" },
];

function formatUsd(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function sortValue(m: LeaderboardMember, key: SortKey): number {
  switch (key) {
    case "claudeSpend":
      return m.claudeSpend;
    case "claudeTokens":
      return m.claudeTokens;
    case "outputPerDollar":
      return m.claudeSpend > 0 ? m.claudeTokens / m.claudeSpend : 0;
    case "cacheRate":
      return m.combinedScore * 0.4; // mock proxy
    case "codexTasks":
      return m.codexTasks;
    case "combinedScore":
      return m.combinedScore;
  }
}

const RANK_STYLES: Record<number, { ring: string; bg: string; icon: React.ReactNode }> = {
  1: {
    ring: "ring-2 ring-amber-400/60",
    bg: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent",
    icon: <Crown className="h-5 w-5 text-amber-400" />,
  },
  2: {
    ring: "ring-2 ring-zinc-300/40",
    bg: "bg-gradient-to-r from-zinc-400/10 via-zinc-400/5 to-transparent",
    icon: <Medal className="h-5 w-5 text-zinc-300" />,
  },
  3: {
    ring: "ring-2 ring-orange-400/40",
    bg: "bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent",
    icon: <Medal className="h-5 w-5 text-orange-400" />,
  },
};

const TrendIcon = ({ trend }: { trend: "up" | "down" | "neutral" }) => {
  if (trend === "up")
    return <ArrowUpRight className="h-4 w-4 text-emerald-400" />;
  if (trend === "down")
    return <ArrowDownRight className="h-4 w-4 text-red-400" />;
  return <Minus className="h-4 w-4 text-zinc-500" />;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LeaderboardTable({ members }: LeaderboardTableProps) {
  const [period, setPeriod] = useState<Period>("month");
  const [sortKey, setSortKey] = useState<SortKey>("combinedScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const arr = [...members];
    arr.sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      return sortDir === "desc" ? vb - va : va - vb;
    });
    return arr;
  }, [members, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const SortIndicator = ({ col }: { col: SortKey }) => {
    if (col !== sortKey) return null;
    return sortDir === "desc" ? (
      <ChevronDown className="ml-1 inline h-3 w-3 text-indigo-400" />
    ) : (
      <ChevronUp className="ml-1 inline h-3 w-3 text-indigo-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Period tabs */}
        <div className="inline-flex rounded-lg bg-zinc-800/60 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                period === p.key
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/25"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Sort by</span>
          <select
            value={sortKey}
            onChange={(e) => handleSort(e.target.value as SortKey)}
            className="rounded-md border border-zinc-700 bg-zinc-800/80 px-3 py-1.5 text-xs font-medium text-zinc-200 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Member</th>
              <th
                className="cursor-pointer px-4 py-3 font-medium hover:text-zinc-300"
                onClick={() => handleSort("claudeSpend")}
              >
                Claude Spend
                <SortIndicator col="claudeSpend" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 font-medium hover:text-zinc-300"
                onClick={() => handleSort("claudeTokens")}
              >
                Claude Tokens
                <SortIndicator col="claudeTokens" />
              </th>
              <th
                className="cursor-pointer px-4 py-3 font-medium hover:text-zinc-300"
                onClick={() => handleSort("codexTasks")}
              >
                Codex Tasks
                <SortIndicator col="codexTasks" />
              </th>
              <th className="px-4 py-3 font-medium">Success Rate</th>
              <th
                className="cursor-pointer px-4 py-3 font-medium hover:text-zinc-300"
                onClick={() => handleSort("combinedScore")}
              >
                Score
                <SortIndicator col="combinedScore" />
              </th>
              <th className="px-4 py-3 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {sorted.map((member, idx) => {
              const rank = idx + 1;
              const rs = RANK_STYLES[rank];
              return (
                <tr
                  key={member.id}
                  className={`group transition-colors hover:bg-zinc-800/40 ${
                    rs ? rs.bg : ""
                  } ${rs ? rs.ring : ""}`}
                >
                  {/* Rank */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center">
                      {rs ? (
                        rs.icon
                      ) : (
                        <span className="text-sm font-semibold text-zinc-500">
                          {rank}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Member */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className={`h-9 w-9 rounded-full object-cover ${
                            rank === 1
                              ? "ring-2 ring-amber-400/60"
                              : rank === 2
                              ? "ring-2 ring-zinc-300/40"
                              : rank === 3
                              ? "ring-2 ring-orange-400/40"
                              : "ring-1 ring-zinc-700"
                          }`}
                        />
                      ) : (
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600/20 text-sm font-bold text-indigo-400 ${
                            rank <= 3 ? "ring-2 ring-indigo-500/40" : ""
                          }`}
                        >
                          {member.name
                            .split(" ")
                            .map((w) => w[0])
                            .join("")}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-100">
                          {member.name}
                          {rank === 1 && (
                            <Flame className="ml-1.5 inline h-3.5 w-3.5 text-amber-400" />
                          )}
                        </p>
                        <MemberBadge spend={member.claudeSpend} />
                      </div>
                    </div>
                  </td>

                  {/* Spend */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-sm font-medium text-zinc-200">
                      {formatUsd(member.claudeSpend)}
                    </span>
                  </td>

                  {/* Tokens */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-sm text-zinc-300">
                      {formatTokens(member.claudeTokens)}
                    </span>
                  </td>

                  {/* Codex Tasks */}
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-sm text-zinc-300">
                      {member.codexTasks}
                    </span>
                  </td>

                  {/* Success Rate */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${
                            member.codexSuccessRate >= 80
                              ? "bg-emerald-500"
                              : member.codexSuccessRate >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${member.codexSuccessRate}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-zinc-400">
                        {member.codexSuccessRate}%
                      </span>
                    </div>
                  </td>

                  {/* Combined Score */}
                  <td className="px-4 py-3.5">
                    <span
                      className={`font-mono text-sm font-bold ${
                        rank === 1
                          ? "text-amber-400"
                          : rank === 2
                          ? "text-zinc-200"
                          : rank === 3
                          ? "text-orange-400"
                          : "text-indigo-400"
                      }`}
                    >
                      {member.combinedScore.toFixed(1)}
                    </span>
                  </td>

                  {/* Trend */}
                  <td className="px-4 py-3.5">
                    <TrendIcon trend={member.trend} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer legend */}
      <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-600">
        <span className="flex items-center gap-1">
          <Crown className="h-3 w-3 text-amber-400" /> 1st Place
        </span>
        <span className="flex items-center gap-1">
          <Medal className="h-3 w-3 text-zinc-300" /> 2nd Place
        </span>
        <span className="flex items-center gap-1">
          <Medal className="h-3 w-3 text-orange-400" /> 3rd Place
        </span>
        <span className="ml-auto">
          Score = weighted sum of spend, tokens, codex tasks, and success rate
        </span>
      </div>
    </div>
  );
}
