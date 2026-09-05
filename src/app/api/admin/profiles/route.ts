import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const profiles = await prisma.profileDescription.findMany({ orderBy: { profile: "asc" } });
  const combinations = await prisma.combinedProfileDescription.findMany({ orderBy: { combination: "asc" } });
  return NextResponse.json({ profiles, combinations });
}
