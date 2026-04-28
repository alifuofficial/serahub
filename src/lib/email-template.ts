export type EmailType = "NEWSLETTER" | "TRANSACTIONAL";

export function getEmailTemplateHtml(
  bodyHtml: string,
  config: Record<string, string>,
  title: string = "SeraHub Notification",
  type: EmailType = "NEWSLETTER"
) {
  const siteName = config.site_name || "SeraHub";
  const primaryColor = config.appearance_primary_color || "#00c087";
  const siteUrl = config.appearance_site_url || "https://serahub.click";
  const logoUrl = config.appearance_logo_url || `${siteUrl}/logo.png`;

  const socialLinksHtml = [
    { url: config.social_link_facebook, name: "Facebook", icon: "https://cdn-icons-png.flaticon.com/512/733/733547.png" },
    { url: config.social_link_instagram, name: "Instagram", icon: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png" },
    { url: config.social_link_linkedin, name: "LinkedIn", icon: "https://cdn-icons-png.flaticon.com/512/3536/3536505.png" },
    { url: config.social_link_telegram, name: "Telegram", icon: "https://cdn-icons-png.flaticon.com/512/2111/2111646.png" },
    { url: config.social_link_tiktok, name: "TikTok", icon: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png" },
    { url: config.social_link_youtube, name: "YouTube", icon: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png" },
  ]
    .filter((s) => s.url)
    .map(
      (s) =>
        `<a href="${siteUrl}/api/track?url=${encodeURIComponent(
          s.url!
        )}&source=email_social" style="display:inline-block; margin: 0 8px;">
          <img src="${s.icon}" alt="${s.name}" width="20" height="20" style="display:block; width:20px; height:20px; opacity: 0.8;" />
        </a>`
    )
    .join("");

  const headerHtml = type === "NEWSLETTER" 
    ? `<!-- NEWSLETTER HEADER -->
        <tr>
          <td class="header" style="background: linear-gradient(135deg, #022c22 0%, #0a5c42 100%); padding: 44px 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td>
                  <div style="background-color: rgba(255,255,255,0.2); display: inline-block; padding: 4px 12px; border-radius: 20px; color: #d1fae5; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 12px;">AI • CURATED</div>
                  <span style="color: #a7f3d0; font-size: 12px; margin-left: 8px;">weekly digest</span>
                  <h1 style="color: #ffffff; font-size: 42px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">
                    ${siteName.toLowerCase()}<span style="color: #a7f3d0; font-weight: 300;">/jobs</span>
                  </h1>
                  <p style="color: #d1fae5; font-size: 16px; line-height: 1.5; margin: 12px 0 0 0; max-width: 320px; opacity: 0.9;">
                    Smart aggregated jobs & bids — fresh opportunities, delivered weekly to your inbox.
                  </p>
                  <div style="width: 64px; height: 4px; background-color: #34d399; border-radius: 2px; margin-top: 24px;"></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    : `<!-- TRANSACTIONAL HEADER -->
        <tr>
          <td class="header" style="background: #ffffff; padding: 32px; border-bottom: 1px solid #f1f5f9;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td align="center">
                  <div style="margin-bottom: 8px;">
                    <span style="font-weight: 800; color: #1e293b; font-size: 24px; letter-spacing: -0.02em;">${siteName}<span style="color: #047857;">/jobs</span></span>
                  </div>
                  <div style="width: 40px; height: 3px; background-color: #34d399; border-radius: 2px;"></div>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;

  const curatedBadgeHtml = type === "NEWSLETTER"
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px;">
        <tr>
          <td>
            <div style="display: flex; align-items: center; justify-content: space-between;">
               <span style="font-size: 20px;">🤖</span>
               <span style="color: #374151; font-size: 14px; font-weight: 600; margin-left: 8px;">Curated by <span style="background-color: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 12px; font-size: 12px;">Smart Match 2.0</span></span>
            </div>
          </td>
        </tr>
      </table>`
    : "";

  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="x-apple-disable-message-reformatting">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      background-color: #ecfdf5;
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      margin: 0;
      padding: 0;
    }
    .ai-gradient-bg {
      background: linear-gradient(135deg, #022c22 0%, #064e3b 100%);
    }
    .card {
      margin-bottom: 24px;
      padding: 24px;
      border-radius: 24px;
      border: 1px solid #f1f5f9;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .card-title {
      font-size: 20px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 8px;
      letter-spacing: -0.01em;
      text-decoration: none;
    }
    .card-company {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 12px;
      font-weight: 500;
    }
    .card-desc {
      font-size: 15px;
      color: #475569;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(105deg, #047857, #059669);
      color: #ffffff !important;
      padding: 12px 28px;
      border-radius: 60px;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      text-align: center;
    }
    @media only screen and (max-width: 600px) {
      .container {
        border-radius: 0 !important;
        margin: 0 !important;
      }
      .header, .body, .footer {
        padding: 24px !important;
      }
    }
  </style>
</head>
<body style="background-color: #ecfdf5; margin: 0; padding: 0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #ecfdf5;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); border: 1px solid #d1fae5;">
          
          ${headerHtml}

          <!-- BODY -->
          <tr>
            <td class="body" style="padding: 40px 32px; background-color: #ffffff;">
              ${curatedBadgeHtml}

              <div class="email-body" style="color: #334155;">
                ${bodyHtml}
              </div>

              ${type === "NEWSLETTER" ? `
              <div style="text-align: center; margin-top: 40px;">
                <p style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px;">Curated by ${siteName} engine • Updated every week</p>
                <div style="border-top: 1px solid #f1f5f9;"></div>
              </div>
              ` : ""}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer" style="background-color: #fafef9; padding: 40px 32px; border-top: 1px solid #d1fae5;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-bottom: 32px;">
                    <div style="margin-bottom: 12px;">
                      <span style="font-weight: 800; color: #1e293b; font-size: 20px; letter-spacing: -0.02em;">${siteName}<span style="color: #047857;">/jobs</span></span>
                    </div>
                    <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0; max-width: 240px;">AI-powered weekly insights for job seekers and businesses in Ethiopia.</p>
                  </td>
                </tr>
                <tr>
                  <td style="border-top: 1px solid #e2e8f0; padding-top: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="color: #94a3b8; font-size: 11px;">
                          © ${new Date().getFullYear()} ${siteName} • Innovation Hub<br>
                          Addis Ababa, Ethiopia
                        </td>
                        <td align="right">
                          <a href="${siteUrl}/unsubscribe" style="color: #059669; text-decoration: none; font-size: 11px; font-weight: 700; margin-left: 16px;">Unsubscribe</a>
                          <a href="${siteUrl}/privacy" style="color: #059669; text-decoration: none; font-size: 11px; font-weight: 700; margin-left: 16px;">Privacy</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
