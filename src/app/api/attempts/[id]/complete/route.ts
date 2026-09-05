import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateDiscResult } from "@/lib/disc-engine";

const CompleteSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = CompleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { name, email, department, jobTitle } = parsed.data;

  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: params.id },
    include: { answers: true, assessment: { include: { questions: true } } },
  });
  if (!attempt) {
    return NextResponse.json({ error: "Tentativa não encontrada." }, { status: 404 });
  }
  if (attempt.status === "COMPLETED") {
    return NextResponse.json({ error: "Esta tentativa já foi concluída." }, { status: 409 });
  }

  const totalQuestions = attempt.assessment.questions.filter((q) => q.active).length;
  if (attempt.answers.length < totalQuestions) {
    return NextResponse.json(
      { error: "Ainda existem perguntas sem resposta." },
      { status: 422 }
    );
  }

  const result = calculateDiscResult(
    attempt.answers.map((a) => ({
      scoreD: a.scoreDSnapshot,
      scoreI: a.scoreISnapshot,
      scoreS: a.scoreSSnapshot,
      scoreC: a.scoreCSnapshot,
    }))
  );

  const participant = await prisma.participant.create({
    data: { name, email, department, jobTitle },
  });

  const [, updatedAttempt] = await prisma.$transaction([
    prisma.result.create({
      data: {
        attemptId: attempt.id,
        rawD: result.raw.D,
        rawI: result.raw.I,
        rawS: result.raw.S,
        rawC: result.raw.C,
        percentageD: result.percentage.D,
        percentageI: result.percentage.I,
        percentageS: result.percentage.S,
        percentageC: result.percentage.C,
        primaryProfile: result.primaryProfile,
        secondaryProfile: result.secondaryProfile,
        combination: result.combination,
        tieBreakApplied: result.tieBreakApplied,
      },
    }),
    prisma.assessmentAttempt.update({
      where: { id: attempt.id },
      data: { status: "COMPLETED", completedAt: new Date(), participantId: participant.id },
    }),
  ]);

  return NextResponse.json({ attemptId: updatedAttempt.id });
}
