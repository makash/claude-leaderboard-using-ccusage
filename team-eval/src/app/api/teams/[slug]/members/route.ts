import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: { slug: string };
}

async function getTeamBySlug(slug: string, orgId: string) {
  return prisma.team.findUnique({
    where: { orgId_slug: { orgId, slug } },
  });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const team = await getTeamBySlug(params.slug, session.user.orgId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const members = await prisma.teamMember.findMany({
      where: { teamId: team.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    // Fetch usage stats for all member user IDs
    const userIds = members.map((m) => m.user.id);

    const [claudeStats, codexStats] = await Promise.all([
      prisma.claudeUsage.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _sum: { totalTokens: true, costUsd: true },
      }),
      prisma.codexUsage.groupBy({
        by: ["userId"],
        where: { userId: { in: userIds } },
        _sum: { tasksCompleted: true, tokensUsed: true, costUsd: true },
      }),
    ]);

    const claudeMap = new Map(
      claudeStats.map((s) => [s.userId, s._sum])
    );
    const codexMap = new Map(
      codexStats.map((s) => [s.userId, s._sum])
    );

    const enrichedMembers = members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user,
      stats: {
        claude: {
          totalTokens: claudeMap.get(m.user.id)?.totalTokens ?? 0,
          totalCost: claudeMap.get(m.user.id)?.costUsd ?? 0,
        },
        codex: {
          tasksCompleted: codexMap.get(m.user.id)?.tasksCompleted ?? 0,
          tokensUsed: codexMap.get(m.user.id)?.tokensUsed ?? 0,
          totalCost: codexMap.get(m.user.id)?.costUsd ?? 0,
        },
      },
    }));

    return NextResponse.json({ members: enrichedMembers });
  } catch (error) {
    console.error("List team members error:", error);
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

    const team = await getTeamBySlug(params.slug, session.user.orgId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check permission: org ADMIN/OWNER or team LEAD
    const isOrgAdmin = ["ADMIN", "OWNER"].includes(session.user.role);
    if (!isOrgAdmin) {
      const membership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: { teamId: team.id, userId: session.user.id },
        },
      });
      if (!membership || membership.role !== "LEAD") {
        return NextResponse.json(
          { error: "Only team leads or admins can add members" },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const { userId, role = "MEMBER" } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Verify user exists in the same org
    const user = await prisma.user.findFirst({
      where: { id: userId, orgId: session.user.orgId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: team.id, userId } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      );
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error("Add team member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const team = await getTeamBySlug(params.slug, session.user.orgId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check permission: org ADMIN/OWNER or team LEAD
    const isOrgAdmin = ["ADMIN", "OWNER"].includes(session.user.role);
    if (!isOrgAdmin) {
      const membership = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: { teamId: team.id, userId: session.user.id },
        },
      });
      if (!membership || membership.role !== "LEAD") {
        return NextResponse.json(
          { error: "Only team leads or admins can remove members" },
          { status: 403 }
        );
      }
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId query parameter is required" },
        { status: 400 }
      );
    }

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId: team.id, userId } },
    });
    if (!membership) {
      return NextResponse.json(
        { error: "Member not found in this team" },
        { status: 404 }
      );
    }

    await prisma.teamMember.delete({
      where: { id: membership.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove team member error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
