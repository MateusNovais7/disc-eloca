import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const assessment = await prisma.assessment.findUnique({
    where: { id: params.id },
    include: {
      questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } },
    },
  });
  if (!assessment) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });
  return NextResponse.json({ assessment });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json();
  const { status } = body as { status?: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED" };
  if (!status) return NextResponse.json({ error: "status é obrigatório." }, { status: 400 });

  // Ao ativar um teste, desativa os demais com o mesmo nome para não
  // termos dois testes "ativos" simultaneamente na landing page.
  const assessment = await prisma.assessment.findUnique({ where: { id: params.id } });
  if (!assessment) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  if (status === "ACTIVE") {
    await prisma.assessment.updateMany({
      where: { name: assessment.name, status: "ACTIVE" },
      data: { status: "INACTIVE" },
    });
  }

  const updated = await prisma.assessment.update({ where: { id: params.id }, data: { status } });

  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: `assessment.status.${status.toLowerCase()}`,
      entityType: "Assessment",
      entityId: updated.id,
    },
  });

  return NextResponse.json({ assessment: updated });
}
