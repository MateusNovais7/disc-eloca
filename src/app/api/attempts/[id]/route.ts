import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: params.id },
    include: { answers: true },
  });
  if (!attempt) {
    return NextResponse.json({ error: "Tentativa não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ attempt });
}
