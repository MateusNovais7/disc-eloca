import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, verifyPassword, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).optional(), // opcional apenas na primeira troca forçada
  newPassword: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres."),
});

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = ChangePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const user = await prisma.adminUser.findUnique({ where: { id: session.sub } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

  // Se o usuário NÃO está em troca obrigatória, a senha atual é exigida.
  if (!user.mustChangePassword) {
    if (!parsed.data.currentPassword) {
      return NextResponse.json({ error: "Informe a senha atual." }, { status: 400 });
    }
    const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Senha atual incorreta." }, { status: 401 });
    }
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  await prisma.auditLog.create({
    data: { adminUserId: user.id, action: "admin.password_changed", entityType: "AdminUser", entityId: user.id },
  });

  return NextResponse.json({ ok: true });
}
