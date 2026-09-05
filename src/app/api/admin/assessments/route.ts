import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const assessments = await prisma.assessment.findMany({
    orderBy: [{ version: "desc" }],
    include: { _count: { select: { attempts: true, questions: true } } },
  });
  return NextResponse.json({ assessments });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json();
  const { name, description } = body;
  if (!name) return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });

  const lastVersion = await prisma.assessment.findFirst({
    where: { name },
    orderBy: { version: "desc" },
  });

  const assessment = await prisma.assessment.create({
    data: {
      name,
      description,
      version: (lastVersion?.version ?? 0) + 1,
      status: "DRAFT",
    },
  });

  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: "assessment.create",
      entityType: "Assessment",
      entityId: assessment.id,
    },
  });

  return NextResponse.json({ assessment });
}
