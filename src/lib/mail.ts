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

import { getEmailTemplateHtml, EmailType } from "./email-template";

export async function sendMail({ to, subject, text, html, type = "TRANSACTIONAL" }: { to: string, subject: string, text: string, html?: string, type?: EmailType }) {
  const transporter = await getTransporter();
  const configRows = await prisma.siteConfig.findMany();
  const config = configRows.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const fromEmail = config.smtp_from || "noreply@serahub.click";
  const siteName = config.site_name || "SeraHub";
  const siteUrl = config.appearance_site_url || "https://serahub.click";

  const finalHtml = html ? getEmailTemplateHtml(html, config, subject, type) : undefined;

  return transporter.sendMail({
    from: `"${siteName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html: finalHtml,
    headers: {
      "List-Unsubscribe": `<${siteUrl}/unsubscribe?email=${encodeURIComponent(to)}>`,
      "Precedence": type === "NEWSLETTER" ? "bulk" : "transactional",
      "X-Auto-Response-Suppress": "OOF, AutoReply"
    }
  });
}
