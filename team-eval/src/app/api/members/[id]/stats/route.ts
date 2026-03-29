import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: { id: string };
}

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

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberId = params.id;

    // Verify user exists in the same org
    const member = await prisma.user.findFirst({
      where: { id: memberId, orgId: session.user.orgId },
      select: { id: true, name: true, email: true, avatarUrl: true, role: true },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") ?? "month";
    const periodStart = getPeriodStartDate(period);
    const dateFilter = period !== "all" ? { gte: periodStart } : undefined;

    const [claudeUsage, codexUsage, claudeDaily, codexDaily, evaluations] =
      await Promise.all([
        // Claude summary
        prisma.claudeUsage.aggregate({
          where: {
            userId: memberId,
            ...(dateFilter ? { date: dateFilter } : {}),
          },
          _sum: {
            inputTokens: true,
            outputTokens: true,
            cacheCreationTokens: true,
            cacheReadTokens: true,
            totalTokens: true,
            costUsd: true,
          },
          _count: true,
        }),
        // Codex summary
        prisma.codexUsage.aggregate({
          where: {
            userId: memberId,
            ...(dateFilter ? { date: dateFilter } : {}),
          },
          _sum: {
            tasksCompleted: true,
            tasksFailed: true,
            tokensUsed: true,
            costUsd: true,
          },
          _avg: {
            avgDurationSeconds: true,
          },
          _count: true,
        }),
        // Claude daily breakdown
        prisma.claudeUsage.findMany({
          where: {
            userId: memberId,
            ...(dateFilter ? { date: dateFilter } : {}),
          },
          select: {
            date: true,
            totalTokens: true,
            costUsd: true,
            modelsUsed: true,
            source: true,
          },
          orderBy: { date: "asc" },
        }),
        // Codex daily breakdown
        prisma.codexUsage.findMany({
          where: {
            userId: memberId,
            ...(dateFilter ? { date: dateFilter } : {}),
          },
          select: {
            date: true,
            tasksCompleted: true,
            tasksFailed: true,
            tokensUsed: true,
            costUsd: true,
            languagesUsed: true,
          },
          orderBy: { date: "asc" },
        }),
        // Evaluations
        prisma.evaluation.findMany({
          where: {
            userId: memberId,
            status: "SUBMITTED",
            ...(dateFilter ? { periodStart: dateFilter } : {}),
          },
          select: {
            id: true,
            periodStart: true,
            periodEnd: true,
            claudeScore: true,
            codexScore: true,
            productivityScore: true,
            qualityScore: true,
            overallScore: true,
            evaluator: {
              select: { id: true, name: true },
            },
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

    // Compute evaluation summary
    const evalCount = evaluations.length;
    const evalSummary = evalCount > 0
      ? {
          count: evalCount,
          avgOverall:
            evaluations.reduce((s, e) => s + e.overallScore, 0) / evalCount,
          avgClaude:
            evaluations.reduce((s, e) => s + e.claudeScore, 0) / evalCount,
          avgCodex:
            evaluations.reduce((s, e) => s + e.codexScore, 0) / evalCount,
          avgProductivity:
            evaluations.reduce((s, e) => s + e.productivityScore, 0) / evalCount,
          avgQuality:
            evaluations.reduce((s, e) => s + e.qualityScore, 0) / evalCount,
        }
      : {
          count: 0,
          avgOverall: null,
          avgClaude: null,
          avgCodex: null,
          avgProductivity: null,
          avgQuality: null,
        };

    return NextResponse.json({
      member,
      period,
      claude: {
        summary: claudeUsage._sum,
        days: claudeUsage._count,
      },
      codex: {
        summary: {
          ...codexUsage._sum,
          avgDurationSeconds: codexUsage._avg.avgDurationSeconds,
        },
        days: codexUsage._count,
      },
      evaluations: {
        summary: evalSummary,
        records: evaluations,
      },
      dailyBreakdown: {
        claude: claudeDaily,
        codex: codexDaily,
      },
    });
  } catch (error) {
    console.error("Member stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
