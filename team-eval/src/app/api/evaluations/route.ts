import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createEvaluationBody = z.object({
  userId: z.string().min(1),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  claudeScore: z.number().int().min(1).max(10),
  codexScore: z.number().int().min(1).max(10),
  productivityScore: z.number().int().min(1).max(10),
  qualityScore: z.number().int().min(1).max(10),
  overallScore: z.number().int().min(1).max(10),
  strengths: z.string().max(2000).optional(),
  improvements: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const periodStart = searchParams.get("periodStart");
    const periodEnd = searchParams.get("periodEnd");

    const where: Record<string, unknown> = {};

    // Filter by user - show evaluations the current user gave or received
    if (userId) {
      where.userId = userId;
    } else {
      where.OR = [
        { evaluatorId: session.user.id },
        { userId: session.user.id },
      ];
    }

    if (status) {
      where.status = status.toUpperCase();
    }

    if (periodStart) {
      where.periodStart = { gte: new Date(periodStart) };
    }
    if (periodEnd) {
      where.periodEnd = { lte: new Date(periodEnd) };
    }

    const evaluations = await prisma.evaluation.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        evaluator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ evaluations });
  } catch (error) {
    console.error("List evaluations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = createEvaluationBody.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    if (data.periodStart >= data.periodEnd) {
      return NextResponse.json(
        { error: "periodStart must be before periodEnd" },
        { status: 400 }
      );
    }

    // Verify target user exists in the same org
    const targetUser = await prisma.user.findFirst({
      where: { id: data.userId, orgId: session.user.orgId },
    });
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        userId: data.userId,
        evaluatorId: session.user.id,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        claudeScore: data.claudeScore,
        codexScore: data.codexScore,
        productivityScore: data.productivityScore,
        qualityScore: data.qualityScore,
        overallScore: data.overallScore,
        strengths: data.strengths,
        improvements: data.improvements,
        notes: data.notes,
        status: "DRAFT",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        evaluator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ evaluation }, { status: 201 });
  } catch (error) {
    console.error("Create evaluation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
