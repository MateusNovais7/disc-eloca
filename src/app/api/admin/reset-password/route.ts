import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

const Schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token: parsed.data.token } });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "Link inválido ou expirado. Solicite um novo." }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: resetToken.adminUserId },
      data: { passwordHash, mustChangePassword: false },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  await prisma.auditLog.create({
    data: {
      adminUserId: resetToken.adminUserId,
      action: "admin.password_reset_via_email",
      entityType: "AdminUser",
      entityId: resetToken.adminUserId,
    },
  });

  return NextResponse.json({ ok: true });
}
