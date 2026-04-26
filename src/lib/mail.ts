import nodemailer from "nodemailer";
import { prisma } from "./prisma";

export async function getTransporter() {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: {
        in: ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_from", "smtp_secure"]
      }
    }
  });

  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  if (!configMap.smtp_host || !configMap.smtp_user || !configMap.smtp_pass) {
    throw new Error("SMTP is not fully configured.");
  }

  return nodemailer.createTransport({
    host: configMap.smtp_host,
    port: parseInt(configMap.smtp_port || "587"),
    secure: configMap.smtp_secure === "true",
    auth: {
      user: configMap.smtp_user,
      pass: configMap.smtp_pass,
    },
  });
}

export async function sendMail({ to, subject, text, html }: { to: string, subject: string, text: string, html?: string }) {
  const transporter = await getTransporter();
  const fromEmail = (await prisma.siteConfig.findUnique({ where: { key: "smtp_from" } }))?.value || "noreply@serahub.com";
  const siteName = (await prisma.siteConfig.findUnique({ where: { key: "site_name" } }))?.value || "SeraHub";

  return transporter.sendMail({
    from: `"${siteName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });
}
