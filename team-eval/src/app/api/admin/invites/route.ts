import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generateDummyPassword(): string {
  // Generate a readable 12-char password: 3 words + digits
  const words = ["blue", "red", "green", "fast", "cool", "bright", "dark", "swift", "bold", "keen"];
  const w1 = words[Math.floor(Math.random() * words.length)];
  const w2 = words[Math.floor(Math.random() * words.length)];
  const digits = Math.floor(100 + Math.random() * 900);
  return `${w1}-${w2}-${digits}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!admin || !["OWNER", "ADMIN"].includes(admin.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email, name, role, teamId } = await req.json();
    if (!email || !name || !role) {
      return NextResponse.json({ error: "Email, name, and role are required" }, { status: 400 });
    }

    if (!["MEMBER", "MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
    }

    // Generate a dummy password for the new member
    const dummyPassword = generateDummyPassword();
    const passwordHash = await bcrypt.hash(dummyPassword, 12);

    // Create the user directly with the dummy password
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        role,
        orgId: admin.orgId,
        passwordHash,
        isActive: true,
      },
    });

    // Optionally add to a team
    if (teamId) {
      await prisma.teamMember.create({
        data: {
          teamId,
          userId: newUser.id,
          role: "MEMBER",
        },
      });
    }

    return NextResponse.json({
      success: true,
      member: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        // Return the plain-text password so admin can share it with the member
        temporaryPassword: dummyPassword,
      },
    });
  } catch (error) {
    console.error("Failed to create member:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || !["OWNER", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Return all members in the org
    const members = await prisma.user.findMany({
      where: { orgId: user.orgId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
