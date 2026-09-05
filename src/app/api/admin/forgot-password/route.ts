import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

const Schema = z.object({ email: z.string().email() });

// Rate limiting básico em memória (mesma limitação do login: trocar por
// store compartilhado em produção com múltiplas réplicas).
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  // Resposta sempre genérica, independentemente de rate limit ou de o
  // e-mail existir — evita confirmar quais e-mails estão cadastrados.
  const genericResponse = NextResponse.json({
    message: "Se esse e-mail estiver cadastrado, você vai receber um link de redefinição em instantes.",
  });

  if (isRateLimited(ip)) return genericResponse;

  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return genericResponse;

  const user = await prisma.adminUser.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isActive) return genericResponse;

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await prisma.passwordResetToken.create({
    data: { adminUserId: user.id, token, expiresAt },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`;
  const resetUrl = `${appUrl}/admin/redefinir-senha?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Redefinição de senha — DISC Eloca",
    html: `
      <p>Olá, ${user.name}.</p>
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no DISC Eloca.</p>
      <p><a href="${resetUrl}">Clique aqui para definir uma nova senha</a>. Este link expira em 1 hora.</p>
      <p>Se você não solicitou isso, pode ignorar este e-mail.</p>
    `,
  });

  return genericResponse;
}
