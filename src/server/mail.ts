import { publicOrigin, smtpConfigured } from './config';

export async function sendMail(
  to: string,
  subject: string,
  text: string,
  extra?: { html?: string; unsubUrl?: string },
): Promise<void> {
  if (!smtpConfigured()) {
    console.log(`[accounts] SMTP unset — mail to ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }
  const nodemailer = await import('nodemailer');
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === '1',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  const headers = extra?.unsubUrl
    ? { 'List-Unsubscribe': `<${extra.unsubUrl}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
    : undefined;
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `R9700 Lab Notes <noreply@${new URL(publicOrigin()).hostname}>`,
    to,
    subject,
    text,
    html: extra?.html,
    headers,
  });
}

export function magicLinkUrl(token: string): string {
  return `${publicOrigin()}/api/auth/verify?token=${encodeURIComponent(token)}`;
}

export function unsubscribeUrl(token: string): string {
  return `${publicOrigin()}/unsubscribe?token=${encodeURIComponent(token)}`;
}
