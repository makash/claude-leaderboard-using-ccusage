import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ExportRecord = Record<string, unknown>;

function toCsv(data: ExportRecord[]): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const lines = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((h) => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      // Escape quotes and wrap in quotes if the value contains commas, quotes, or newlines
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    lines.push(values.join(","));
  }

  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "OWNER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const format = searchParams.get("format") || "json";

    if (!["claude", "codex", "evaluations", "all"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be one of: claude, codex, evaluations, all" },
        { status: 400 }
      );
    }

    if (!["csv", "json"].includes(format)) {
      return NextResponse.json(
        { error: "Invalid format. Must be one of: csv, json" },
        { status: 400 }
      );
    }

    const orgId = session.user.orgId;

    // Fetch users in org for filtering usage/evaluation records
    const orgUsers = await prisma.user.findMany({
      where: { orgId },
      select: { id: true },
    });
    const orgUserIds = orgUsers.map((u) => u.id);

    let data: ExportRecord[] = [];
    let filename = "export";

    if (type === "claude" || type === "all") {
      const claudeUsage = await prisma.claudeUsage.findMany({
        where: { userId: { in: orgUserIds } },
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { date: "desc" },
      });

      const claudeRecords: ExportRecord[] = claudeUsage.map((record) => ({
        id: record.id,
        userName: record.user.name,
        userEmail: record.user.email,
        date: record.date.toISOString().split("T")[0],
        source: record.source,
        inputTokens: record.inputTokens,
        outputTokens: record.outputTokens,
        cacheCreationTokens: record.cacheCreationTokens,
        cacheReadTokens: record.cacheReadTokens,
        totalTokens: record.totalTokens,
        costUsd: record.costUsd,
        modelsUsed: record.modelsUsed,
        createdAt: record.createdAt.toISOString(),
      }));

      if (type === "claude") {
        data = claudeRecords;
        filename = "claude-usage";
      } else {
        data = data.concat(claudeRecords.map((r) => ({ ...r, _type: "claude" })));
      }
    }

    if (type === "codex" || type === "all") {
      const codexUsage = await prisma.codexUsage.findMany({
        where: { userId: { in: orgUserIds } },
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: { date: "desc" },
      });

      const codexRecords: ExportRecord[] = codexUsage.map((record) => ({
        id: record.id,
        userName: record.user.name,
        userEmail: record.user.email,
        date: record.date.toISOString().split("T")[0],
        source: record.source,
        tasksCompleted: record.tasksCompleted,
        tasksFailed: record.tasksFailed,
        tokensUsed: record.tokensUsed,
        costUsd: record.costUsd,
        avgDurationSeconds: record.avgDurationSeconds,
        languagesUsed: record.languagesUsed,
        createdAt: record.createdAt.toISOString(),
      }));

      if (type === "codex") {
        data = codexRecords;
        filename = "codex-usage";
      } else {
        data = data.concat(codexRecords.map((r) => ({ ...r, _type: "codex" })));
      }
    }

    if (type === "evaluations" || type === "all") {
      const evaluations = await prisma.evaluation.findMany({
        where: { userId: { in: orgUserIds } },
        include: {
          user: { select: { name: true, email: true } },
          evaluator: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const evalRecords: ExportRecord[] = evaluations.map((record) => ({
        id: record.id,
        userName: record.user.name,
        userEmail: record.user.email,
        evaluatorName: record.evaluator.name,
        evaluatorEmail: record.evaluator.email,
        periodStart: record.periodStart.toISOString().split("T")[0],
        periodEnd: record.periodEnd.toISOString().split("T")[0],
        claudeScore: record.claudeScore,
        codexScore: record.codexScore,
        productivityScore: record.productivityScore,
        qualityScore: record.qualityScore,
        overallScore: record.overallScore,
        strengths: record.strengths,
        improvements: record.improvements,
        notes: record.notes,
        status: record.status,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      }));

      if (type === "evaluations") {
        data = evalRecords;
        filename = "evaluations";
      } else {
        data = data.concat(evalRecords.map((r) => ({ ...r, _type: "evaluation" })));
        filename = "all-data";
      }
    }

    if (format === "csv") {
      const csv = toCsv(data);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
