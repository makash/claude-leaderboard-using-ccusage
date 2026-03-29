import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getPeriodStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "week": {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      return d;
    }
    case "month": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      return d;
    }
    case "quarter": {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return d;
    }
    default:
      return new Date("2000-01-01");
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") ?? "month";
    const sort = searchParams.get("sort") ?? "cost";
    const teamId = searchParams.get("team_id");

    const periodStart = getPeriodStartDate(period);

    // Get users in the org, optionally filtered by team
    let userIds: string[];
    if (teamId) {
      const members = await prisma.teamMember.findMany({
        where: { teamId },
        select: { userId: true },
      });
      userIds = members.map((m) => m.userId);
    } else {
      const users = await prisma.user.findMany({
        where: { orgId: session.user.orgId, isActive: true },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    }

    if (userIds.length === 0) {
      return NextResponse.json({ leaderboard: [] });
    }

    const dateFilter = period !== "all" ? { gte: periodStart } : undefined;

    const [claudeStats, codexStats, evalStats, users] = await Promise.all([
      prisma.claudeUsage.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          ...(dateFilter ? { date: dateFilter } : {}),
        },
        _sum: { totalTokens: true, costUsd: true },
      }),
      prisma.codexUsage.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          ...(dateFilter ? { date: dateFilter } : {}),
        },
        _sum: {
          tasksCompleted: true,
          tasksFailed: true,
          tokensUsed: true,
          costUsd: true,
        },
      }),
      prisma.evaluation.groupBy({
        by: ["userId"],
        where: {
          userId: { in: userIds },
          status: "SUBMITTED",
          ...(dateFilter ? { periodStart: dateFilter } : {}),
        },
        _avg: { overallScore: true },
        _count: true,
      }),
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, email: true, avatarUrl: true },
      }),
    ]);

    const claudeMap = new Map(claudeStats.map((s) => [s.userId, s._sum]));
    const codexMap = new Map(codexStats.map((s) => [s.userId, s._sum]));
    const evalMap = new Map(
      evalStats.map((s) => [s.userId, { avg: s._avg.overallScore, count: s._count }])
    );

    const leaderboard = users.map((user) => {
      const claude = claudeMap.get(user.id);
      const codex = codexMap.get(user.id);
      const evalData = evalMap.get(user.id);

      return {
        user,
        claude: {
          totalTokens: claude?.totalTokens ?? 0,
          totalCost: claude?.costUsd ?? 0,
        },
        codex: {
          tasksCompleted: codex?.tasksCompleted ?? 0,
          tasksFailed: codex?.tasksFailed ?? 0,
          tokensUsed: codex?.tokensUsed ?? 0,
          totalCost: codex?.costUsd ?? 0,
        },
        evaluation: {
          avgScore: evalData?.avg ?? null,
          count: evalData?.count ?? 0,
        },
        totalCost: (claude?.costUsd ?? 0) + (codex?.costUsd ?? 0),
        totalTokens: (claude?.totalTokens ?? 0) + (codex?.tokensUsed ?? 0),
      };
    });

    // Sort
    leaderboard.sort((a, b) => {
      switch (sort) {
        case "tokens":
          return b.totalTokens - a.totalTokens;
        case "tasks":
          return b.codex.tasksCompleted - a.codex.tasksCompleted;
        case "score":
          return (b.evaluation.avgScore ?? 0) - (a.evaluation.avgScore ?? 0);
        case "cost":
        default:
          return b.totalCost - a.totalCost;
      }
    });

    return NextResponse.json({ leaderboard, period, sort });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
