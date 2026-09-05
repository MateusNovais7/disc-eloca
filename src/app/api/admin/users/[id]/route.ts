import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  if (params.id === session.sub) {
    return NextResponse.json({ error: "Você não pode desativar sua própria conta." }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  if (typeof body.isActive !== "boolean") {
    return NextResponse.json({ error: "isActive é obrigatório." }, { status: 400 });
  }

  const user = await prisma.adminUser.update({
    where: { id: params.id },
    data: { isActive: body.isActive },
  });

  await prisma.auditLog.create({
    data: {
      adminUserId: session.sub,
      action: body.isActive ? "admin_user.activate" : "admin_user.deactivate",
      entityType: "AdminUser",
      entityId: user.id,
    },
  });

  return NextResponse.json({ user });
}
