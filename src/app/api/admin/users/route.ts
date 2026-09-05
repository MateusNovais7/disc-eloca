import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { getAdminSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("E-mail inválido."),
  role: z.enum(["admin", "usuario"]).default("usuario"),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, isActive: true,
      mustChangePassword: true, createdAt: true,
    },
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  if (session.role !== "admin") {
    return NextResponse.json({ error: "Apenas administradores podem criar usuários." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const existing = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "Já existe um usuário com esse e-mail." }, { status: 409 });
  }

  // Senha inicial é um valor aleatório inutilizável (ninguém a conhece);
  // o usuário só consegue acessar definindo sua própria senha pelo link
  // enviado por e-mail — mesmo fluxo do "esqueci minha senha".
  const unusableInitialHash = await hashPassword(crypto.randomBytes(32).toString("hex"));

  const user = await prisma.adminUser.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash: unusableInitialHash,
      mustChangePassword: true,
    },
  });

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h para o primeiro acesso
  await prisma.passwordResetToken.create({ data: { adminUserId: user.id, token, expiresAt } });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`;
  const setPasswordUrl = `${appUrl}/admin/redefinir-senha?token=${token}`;

  const emailResult = await sendEmail({
    to: user.email,
    subject: "Bem-vindo(a) ao DISC Eloca — defina sua senha",
    html: `
      <p>Olá, ${user.name}.</p>
      <p>Uma conta foi criada para você no painel administrativo do DISC Eloca.</p>
      <p><a href="${setPasswordUrl}">Clique aqui para definir sua senha de acesso</a>. Este link expira em 24 horas.</p>
    `,
  });

  await prisma.auditLog.create({
    data: { adminUserId: session.sub, action: "admin_user.create", entityType: "AdminUser", entityId: user.id },
  });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    emailSent: emailResult.sent,
    // Só exposto para o admin usar como fallback manual se o e-mail não sair
    // (ex: Resend ainda não configurado) — nunca é uma senha, é um link de convite.
    setPasswordUrl,
  });
}
