import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UpdateOptionSchema = z.object({
  text: z.string().min(1).optional(),
  scoreD: z.number().int().min(-10).max(10).optional(),
  scoreI: z.number().int().min(-10).max(10).optional(),
  scoreS: z.number().int().min(-10).max(10).optional(),
  scoreC: z.number().int().min(-10).max(10).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateOptionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });

  const before = await prisma.option.findUnique({ where: { id: params.id } });
  if (!before) return NextResponse.json({ error: "Alternativa não encontrada." }, { status: 404 });

  const updated = await prisma.option.update({ where: { id: params.id }, data: parsed.data });

  // IMPORTANTE: esta alteração NÃO afeta tentativas já respondidas, pois
  // o cálculo usa sempre o snapshot salvo em `answers`, nunca a Option atual.
  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: "option.score_update",
      entityType: "Option",
      entityId: updated.id,
      metadata: { before, after: updated },
    },
  });

  return NextResponse.json({ option: updated });
}
