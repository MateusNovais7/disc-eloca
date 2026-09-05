import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const StartAttemptSchema = z.object({
  assessmentId: z.string().min(1),
  resumeToken: z.string().optional(), // permite recuperar tentativa em andamento
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = StartAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const { assessmentId, resumeToken } = parsed.data;

  // Tenta recuperar tentativa em andamento (reload de página)
  if (resumeToken) {
    const existing = await prisma.assessmentAttempt.findUnique({
      where: { resumeToken },
      include: { answers: true },
    });
    if (existing && existing.status === "IN_PROGRESS" && existing.assessmentId === assessmentId) {
      return NextResponse.json({ attempt: existing });
    }
  }

  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Teste não encontrado." }, { status: 404 });
  }
  if (assessment.status !== "ACTIVE") {
    return NextResponse.json({ error: "Este teste não está ativo no momento." }, { status: 409 });
  }

  const attempt = await prisma.assessmentAttempt.create({
    data: { assessmentId },
  });

  return NextResponse.json({ attempt });
}
