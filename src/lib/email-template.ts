export function getEmailTemplateHtml(
  bodyHtml: string,
  config: Record<string, string>,
  title: string = "SeraHub Notification"
) {
  const siteName = config.site_name || "SeraHub";
  const primaryColor = config.appearance_primary_color || "#00c087";
  const siteUrl = config.appearance_site_url || "https://serahub.com";
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
          <img src="${s.icon}" alt="${s.name}" width="24" height="24" style="display:block; width:24px; height:24px;" />
        </a>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      -webkit-font-smoothing: antialiased;
    }
    .email-wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 0;
    }
    .email-content {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    .email-header {
      background-color: #ffffff;
      padding: 32px 40px;
      text-align: center;
      border-bottom: 2px solid #f1f5f9;
    }
    .email-header img {
      height: 48px;
      width: auto;
    }
    .email-body {
      padding: 40px;
      line-height: 1.6;
      font-size: 16px;
      color: #334155;
    }
    .email-body h1 {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 0;
      margin-bottom: 24px;
    }
    .email-body h2 {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 32px;
      margin-bottom: 16px;
    }
    .email-body p {
      margin-top: 0;
      margin-bottom: 16px;
    }
    .email-body a {
      color: ${primaryColor};
      text-decoration: none;
      font-weight: 600;
    }
    .email-body a:hover {
      text-decoration: underline;
    }
    .btn {
      display: inline-block;
      background-color: ${primaryColor};
      color: #ffffff !important;
      padding: 14px 28px;
      border-radius: 8px;
      font-weight: 700;
      text-decoration: none;
      text-align: center;
      margin: 16px 0;
    }
    .email-footer {
      background-color: #f8fafc;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .social-links {
      margin-bottom: 24px;
    }
    .footer-text {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
      margin: 0 0 8px 0;
    }
    .footer-links a {
      color: #64748b;
      text-decoration: underline;
      margin: 0 8px;
    }
    /* Card Styles for Newsletter Jobs/Bids */
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      background-color: #ffffff;
    }
    .card-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 8px 0;
    }
    .card-company {
      font-size: 14px;
      color: #64748b;
      margin: 0 0 12px 0;
      font-weight: 600;
    }
    .card-details {
      font-size: 14px;
      color: #475569;
      margin: 0 0 16px 0;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background-color: #f1f5f9;
      color: #475569;
      margin-right: 8px;
      margin-bottom: 8px;
    }
    .badge-primary {
      background-color: ${primaryColor}15;
      color: ${primaryColor};
    }
    @media only screen and (max-width: 600px) {
      .email-content {
        border-radius: 0;
      }
      .email-header, .email-body, .email-footer {
        padding: 24px !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <div class="email-content">
            
            <!-- Header -->
            <div class="email-header">
              <a href="${siteUrl}/api/track?url=${encodeURIComponent(siteUrl)}&source=email_header" target="_blank">
                <img src="${logoUrl}" alt="${siteName} Logo" />
              </a>
            </div>

            <!-- Body -->
            <div class="email-body">
              ${bodyHtml}
            </div>

            <!-- Footer -->
            <div class="email-footer">
              <div class="social-links">
                ${socialLinksHtml}
              </div>
              
              <p class="footer-text">
                You are receiving this email because you subscribed to updates from ${siteName}.
              </p>
              
              <div class="footer-links">
                <a href="${siteUrl}/api/track?url=${encodeURIComponent(siteUrl + "/privacy")}&source=email_footer">Privacy Policy</a>
                <a href="${siteUrl}/api/track?url=${encodeURIComponent(siteUrl + "/unsubscribe")}&source=email_footer">Unsubscribe</a>
              </div>
              
              <p class="footer-text" style="margin-top: 16px;">
                &copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.
              </p>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
  `;
}
