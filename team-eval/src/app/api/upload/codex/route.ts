import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

async function authenticateRequest(
  req: NextRequest
): Promise<{ userId: string; orgId: string } | NextResponse> {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const apiToken = await prisma.apiToken.findFirst({
      where: { tokenHash, revokedAt: null },
      include: { user: { select: { id: true, orgId: true } } },
    });

    if (!apiToken) {
      return NextResponse.json({ error: "Invalid API token" }, { status: 401 });
    }

    await prisma.apiToken.update({
      where: { id: apiToken.id },
      data: { lastUsedAt: new Date() },
    });

    return { userId: apiToken.user.id, orgId: apiToken.user.orgId };
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return { userId: session.user.id, orgId: session.user.orgId };
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (auth instanceof NextResponse) return auth;

    const { userId } = auth;
    const body = await req.json();

    const {
      date,
      tasks_completed,
      tasks_failed,
      tokens_used,
      cost_usd,
      avg_duration_seconds,
      languages_used,
      source = "codex_cli",
    } = body;

    if (!date || tasks_completed == null || tasks_failed == null || tokens_used == null || cost_usd == null) {
      return NextResponse.json(
        { error: "Missing required fields: date, tasks_completed, tasks_failed, tokens_used, cost_usd" },
        { status: 400 }
      );
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    await prisma.codexUsage.upsert({
      where: {
        userId_date_source: { userId, date: parsedDate, source },
      },
      create: {
        userId,
        date: parsedDate,
        source,
        tasksCompleted: tasks_completed,
        tasksFailed: tasks_failed,
        tokensUsed: tokens_used,
        costUsd: cost_usd,
        avgDurationSeconds: avg_duration_seconds ?? null,
        languagesUsed: languages_used ?? [],
      },
      update: {
        tasksCompleted: tasks_completed,
        tasksFailed: tasks_failed,
        tokensUsed: tokens_used,
        costUsd: cost_usd,
        avgDurationSeconds: avg_duration_seconds ?? null,
        languagesUsed: languages_used ?? [],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload codex usage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
