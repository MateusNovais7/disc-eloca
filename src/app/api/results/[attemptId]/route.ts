import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { attemptId: string } }) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: params.attemptId },
    include: { participant: true, result: true },
  });

  if (!attempt || !attempt.result) {
    return NextResponse.json({ error: "Resultado não encontrado." }, { status: 404 });
  }

  const [primaryDesc, secondaryDesc, combinedDesc] = await Promise.all([
    prisma.profileDescription.findUnique({ where: { profile: attempt.result.primaryProfile } }),
    prisma.profileDescription.findUnique({ where: { profile: attempt.result.secondaryProfile } }),
    prisma.combinedProfileDescription.findUnique({ where: { combination: attempt.result.combination } }),
  ]);

  return NextResponse.json({
    participantName: attempt.participant?.name ?? "",
    result: attempt.result,
    primaryDesc,
    secondaryDesc,
    combinedDesc,
  });
}
