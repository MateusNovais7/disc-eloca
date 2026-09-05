import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: {
      questions: {
        where: { active: true },
        orderBy: { position: "asc" },
        include: {
          options: {
            orderBy: { position: "asc" },
            select: { id: true, text: true, position: true }, // sem scores D/I/S/C
          },
        },
      },
    },
  });

  if (!assessment) {
    return NextResponse.json({ error: "Teste não encontrado." }, { status: 404 });
  }
  if (assessment.status !== "ACTIVE") {
    return NextResponse.json({ error: "Este teste não está ativo." }, { status: 409 });
  }

  return NextResponse.json({
    assessment: {
      id: assessment.id,
      name: assessment.name,
      requireDepartment: assessment.requireDepartment,
      requireJobTitle: assessment.requireJobTitle,
      questions: assessment.questions,
    },
  });
}
