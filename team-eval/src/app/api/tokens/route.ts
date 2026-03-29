import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokens = await prisma.apiToken.findMany({
      where: { userId: session.user.id, revokedAt: null },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error("List tokens error:", error);
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
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Token name is required" },
        { status: 400 }
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenPrefix = rawToken.slice(0, 8);
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const apiToken = await prisma.apiToken.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        tokenHash,
        tokenPrefix,
      },
      select: {
        id: true,
        name: true,
        tokenPrefix: true,
        createdAt: true,
      },
    });

    // Return the raw token only on creation - it cannot be retrieved again
    return NextResponse.json(
      { token: rawToken, ...apiToken },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Token id is required" },
        { status: 400 }
      );
    }

    const apiToken = await prisma.apiToken.findFirst({
      where: { id, userId: session.user.id, revokedAt: null },
    });

    if (!apiToken) {
      return NextResponse.json(
        { error: "Token not found" },
        { status: 404 }
      );
    }

    await prisma.apiToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
