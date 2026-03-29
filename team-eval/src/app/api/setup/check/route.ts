import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orgCount = await prisma.organization.count();
    return NextResponse.json({ needsSetup: orgCount === 0 });
  } catch {
    return NextResponse.json({ needsSetup: true });
  }
}
