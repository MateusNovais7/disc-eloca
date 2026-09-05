/**
 * Envio de e-mail via Resend (https://resend.com). Requer RESEND_API_KEY e
 * EMAIL_FROM nas variáveis de ambiente. Se não configurado, registra o
 * conteúdo nos logs (via console) em vez de falhar — assim o fluxo de
 * "esqueci minha senha" continua funcionando estruturalmente em ambientes
 * sem e-mail configurado, apenas sem o envio real.
 */
import { Resend } from "resend";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "DISC Eloca <naoresponda@eloca.com.br>";

  if (!apiKey) {
    console.warn(
      `[mailer] RESEND_API_KEY não configurado. E-mail NÃO enviado. Destinatário: ${to}, assunto: ${subject}`
    );
    return { sent: false, reason: "not_configured" as const };
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({ from, to, subject, html });
  if (result.error) {
    console.error("[mailer] Falha ao enviar e-mail:", result.error);
    return { sent: false, reason: "send_error" as const };
  }
  return { sent: true as const };
}
