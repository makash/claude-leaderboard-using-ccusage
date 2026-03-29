import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface RouteContext {
  params: { id: string };
}

const updateEvaluationBody = z.object({
  claudeScore: z.number().int().min(1).max(10).optional(),
  codexScore: z.number().int().min(1).max(10).optional(),
  productivityScore: z.number().int().min(1).max(10).optional(),
  qualityScore: z.number().int().min(1).max(10).optional(),
  overallScore: z.number().int().min(1).max(10).optional(),
  strengths: z.string().max(2000).optional(),
  improvements: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        evaluator: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 }
      );
    }

    // Verify the user is the evaluator or the evaluated user
    if (
      evaluation.evaluatorId !== session.user.id &&
      evaluation.userId !== session.user.id &&
      !["ADMIN", "OWNER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error("Get evaluation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { id: params.id },
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 }
      );
    }

    if (evaluation.evaluatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the evaluator can update this evaluation" },
        { status: 403 }
      );
    }

    if (evaluation.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT evaluations can be updated" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const result = updateEvaluationBody.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await prisma.evaluation.update({
      where: { id: params.id },
      data: result.data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        evaluator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ evaluation: updated });
  } catch (error) {
    console.error("Update evaluation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { id: params.id },
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 }
      );
    }

    if (evaluation.evaluatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the evaluator can submit this evaluation" },
        { status: 403 }
      );
    }

    if (evaluation.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Only DRAFT evaluations can be submitted" },
        { status: 400 }
      );
    }

    const updated = await prisma.evaluation.update({
      where: { id: params.id },
      data: { status: "SUBMITTED" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        evaluator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ evaluation: updated });
  } catch (error) {
    console.error("Submit evaluation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
