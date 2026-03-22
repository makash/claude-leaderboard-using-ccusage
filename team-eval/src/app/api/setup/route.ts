import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  try {
    const orgCount = await prisma.organization.count();
    return NextResponse.json({ isSetUp: orgCount > 0 });
  } catch (error) {
    console.error("Setup check failed:", error);
    return NextResponse.json({ error: "Failed to check setup status" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgCount = await prisma.organization.count();
    if (orgCount > 0) {
      return NextResponse.json({ error: "Already set up" }, { status: 400 });
    }

    const body = await request.json();
    const { orgName, orgSlug, orgDomain, adminName, adminEmail, adminPassword } = body;

    if (!orgName?.trim()) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }
    if (!orgSlug?.trim() || !/^[a-z0-9-]+$/.test(orgSlug)) {
      return NextResponse.json({ error: "Valid slug is required" }, { status: 400 });
    }
    if (!adminName?.trim()) {
      return NextResponse.json({ error: "Admin name is required" }, { status: 400 });
    }
    if (!adminEmail?.trim() || !EMAIL_REGEX.test(adminEmail)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!adminPassword || adminPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(adminPassword, 12);

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: orgName.trim(),
          slug: orgSlug.trim().toLowerCase(),
          domain: orgDomain?.trim() || "",
          plan: "FREE",
        },
      });

      const user = await tx.user.create({
        data: {
          name: adminName.trim(),
          email: adminEmail.trim().toLowerCase(),
          passwordHash,
          role: "OWNER",
          orgId: org.id,
          isActive: true,
        },
      });

      return {
        org: { id: org.id, name: org.name, slug: org.slug },
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      };
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error) {
    console.error("Setup failed:", error);
    return NextResponse.json({ error: "Setup failed. Please try again." }, { status: 500 });
  }
}
