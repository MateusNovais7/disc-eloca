import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const AnswerSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const parsed = AnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { questionId, optionId } = parsed.data;

  const attempt = await prisma.assessmentAttempt.findUnique({ where: { id: params.id } });
  if (!attempt) {
    return NextResponse.json({ error: "Tentativa não encontrada." }, { status: 404 });
  }
  if (attempt.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Esta tentativa já foi concluída." }, { status: 409 });
  }

  const option = await prisma.option.findUnique({ where: { id: optionId } });
  if (!option || option.questionId !== questionId) {
    return NextResponse.json({ error: "Alternativa inválida para esta pergunta." }, { status: 400 });
  }

  // Snapshot da pontuação NO MOMENTO da resposta — nunca recalculado depois.
  const answer = await prisma.answer.upsert({
    where: { attemptId_questionId: { attemptId: attempt.id, questionId } },
    update: {
      optionId,
      scoreDSnapshot: option.scoreD,
      scoreISnapshot: option.scoreI,
      scoreSSnapshot: option.scoreS,
      scoreCSnapshot: option.scoreC,
    },
    create: {
      attemptId: attempt.id,
      questionId,
      optionId,
      scoreDSnapshot: option.scoreD,
      scoreISnapshot: option.scoreI,
      scoreSSnapshot: option.scoreS,
      scoreCSnapshot: option.scoreC,
    },
  });

  return NextResponse.json({ answer });
}
