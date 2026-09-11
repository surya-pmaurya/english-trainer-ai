import nodemailer from "nodemailer";
import { env } from "../config/env.js";

function getTransport() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.password) return null;
  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.password },
  });
}
async function deliver({ to, subject, title, intro, url, cta }) {
  const html = `<main style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px;color:#172033"><h1 style="font-size:24px">${title}</h1><p style="line-height:1.6">${intro}</p><p style="margin:28px 0"><a href="${url}" style="display:inline-block;background:#7469ee;color:#fff;text-decoration:none;border-radius:10px;padding:13px 18px;font-weight:700">${cta}</a></p><p style="font-size:13px;color:#64748b;line-height:1.5">If you didn’t request this, you can safely ignore this email. The link expires soon for your security.</p></main>`;
  const transport = getTransport();
  if (!transport) {
    if (env.nodeEnv !== "production")
      console.info(`[Email preview for ${to}] ${url}`);
    return;
  }
  try {
    await transport.sendMail({ from: env.smtp.from, to, subject, html });
    console.info(`[Email sent to ${to}] ${subject}`);
  } catch (err) {
    console.error(`[Email delivery failed to ${to}]:`, err.message);
    if (env.nodeEnv !== "production") {
      console.info(`[Email preview fallback for ${to}] ${url}`);
    }
    throw err;
  }
}
export const sendVerificationEmail = (email, token) =>
  deliver({
    to: email,
    subject: "Verify your English Trainer AI email",
    title: "Verify your email",
    intro:
      "One quick step and your personal English trainer will be ready for you.",
    url: `${env.clientUrl}/verify-email?token=${encodeURIComponent(token)}`,
    cta: "Verify email",
  });
export const sendPasswordResetEmail = (email, token) =>
  deliver({
    to: email,
    subject: "Reset your English Trainer AI password",
    title: "Reset your password",
    intro:
      "We received a request to reset your password. Use the button below to choose a new one.",
    url: `${env.clientUrl}/reset-password?token=${encodeURIComponent(token)}`,
    cta: "Reset password",
  });
