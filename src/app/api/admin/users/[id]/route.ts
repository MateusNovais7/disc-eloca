import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "usuario"]).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem editar usuários." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  if (params.id === session.sub && (parsed.data.isActive === false || parsed.data.role === "usuario")) {
    return NextResponse.json({ error: "Você não pode remover seu próprio acesso de administrador." }, { status: 400 });
  }

  const user = await prisma.adminUser.update({ where: { id: params.id }, data: parsed.data });

  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: "admin_user.update",
      entityType: "AdminUser",
      entityId: user.id,
      metadata: parsed.data,
    },
  });

  return NextResponse.json({ user });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem excluir usuários." }, { status: 403 });
  }
  if (params.id === session.sub) {
    return NextResponse.json({ error: "Você não pode excluir sua própria conta." }, { status: 400 });
  }

  await prisma.adminUser.delete({ where: { id: params.id } });

  await prisma.auditLog.create({
    data: { adminUserId: session.sub, action: "admin_user.delete", entityType: "AdminUser", entityId: params.id },
  });

  return NextResponse.json({ ok: true });
}
