import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

interface DailyUsageEntry {
  date: string;
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_tokens?: number;
  cache_read_tokens?: number;
  total_tokens?: number;
  total_cost?: number;
  cost_usd?: number;
  models?: string[];
  models_used?: string[];
}

async function authenticateRequest(
  req: NextRequest
): Promise<{ userId: string; orgId: string } | NextResponse> {
  // Try Bearer token first
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

  // Fall back to session auth
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
    const { json, source = "claude_api" } = body;

    if (!json || typeof json !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'json' field" },
        { status: 400 }
      );
    }

    let parsed: DailyUsageEntry[];
    try {
      const data = JSON.parse(json);
      parsed = Array.isArray(data) ? data : [data];
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in 'json' field" },
        { status: 400 }
      );
    }

    let count = 0;

    for (const entry of parsed) {
      if (!entry.date) continue;

      const date = new Date(entry.date);
      if (isNaN(date.getTime())) continue;

      const inputTokens = entry.input_tokens ?? 0;
      const outputTokens = entry.output_tokens ?? 0;
      const cacheCreationTokens = entry.cache_creation_tokens ?? 0;
      const cacheReadTokens = entry.cache_read_tokens ?? 0;
      const totalTokens =
        entry.total_tokens ??
        inputTokens + outputTokens + cacheCreationTokens + cacheReadTokens;
      const costUsd = entry.total_cost ?? entry.cost_usd ?? 0;
      const modelsUsed = entry.models ?? entry.models_used ?? [];

      await prisma.claudeUsage.upsert({
        where: {
          userId_date_source: { userId, date, source },
        },
        create: {
          userId,
          date,
          source,
          inputTokens,
          outputTokens,
          cacheCreationTokens,
          cacheReadTokens,
          totalTokens,
          costUsd,
          modelsUsed,
        },
        update: {
          inputTokens: { increment: inputTokens },
          outputTokens: { increment: outputTokens },
          cacheCreationTokens: { increment: cacheCreationTokens },
          cacheReadTokens: { increment: cacheReadTokens },
          totalTokens: { increment: totalTokens },
          costUsd: { increment: costUsd },
          modelsUsed,
        },
      });

      count++;
    }

    return NextResponse.json({ success: true, records: count });
  } catch (error) {
    console.error("Upload claude usage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
