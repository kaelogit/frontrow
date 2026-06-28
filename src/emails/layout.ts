import { SITE_NAME } from "@/lib/constants";
import { escapeHtml } from "@/emails/utils";

const BRAND = {
  primary: "#0284c7",
  primaryDark: "#0369a1",
  accent: "#f97316",
  foreground: "#0f172a",
  muted: "#64748b",
  surface: "#f8fafc",
  border: "#e2e8f0",
  white: "#ffffff",
} as const;

interface EmailLayoutOptions {
  preview: string;
  title: string;
  body: string;
  siteUrl: string;
}

export function emailLayout({
  preview,
  title,
  body,
  siteUrl,
}: EmailLayoutOptions): string {
  const safePreview = escapeHtml(preview);
  const safeTitle = escapeHtml(title);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.surface};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.foreground};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreview}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND.surface};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:${BRAND.white};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;background-color:${BRAND.foreground};">
              <a href="${siteUrl}" style="color:${BRAND.white};font-size:20px;font-weight:700;text-decoration:none;letter-spacing:-0.02em;">${SITE_NAME}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 24px 32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;background-color:${BRAND.surface};border-top:1px solid ${BRAND.border};font-size:13px;line-height:1.5;color:${BRAND.muted};text-align:center;">
              <p style="margin:0 0 8px;">Questions? Reply to this email or visit our <a href="${siteUrl}/contact" style="color:${BRAND.primary};text-decoration:none;">contact page</a>.</p>
              <p style="margin:0;">© ${year} ${SITE_NAME}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;font-weight:700;color:${BRAND.foreground};">${escapeHtml(text)}</h1>`;
}

export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${BRAND.foreground};">${text}</p>`;
}

export function emailMuted(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.muted};">${text}</p>`;
}

export function emailButton(href: string, label: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
      <tr>
        <td style="border-radius:10px;background-color:${BRAND.primary};">
          <a href="${href}" style="display:inline-block;padding:14px 24px;font-size:16px;font-weight:600;color:${BRAND.white};text-decoration:none;border-radius:10px;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}

export function emailEventHero(imageUrl: string, alt: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td>
          <img src="${imageUrl}" alt="${escapeHtml(alt)}" width="552" style="display:block;width:100%;max-width:552px;height:auto;border-radius:12px;border:0;" />
        </td>
      </tr>
    </table>`;
}

export function emailInfoCard(rows: { label: string; value: string }[]): string {
  const content = rows
    .map(
      (row) => `
        <tr>
          <td style="padding:8px 0;font-size:13px;color:${BRAND.muted};width:120px;vertical-align:top;">${escapeHtml(row.label)}</td>
          <td style="padding:8px 0;font-size:15px;color:${BRAND.foreground};font-weight:600;">${row.value}</td>
        </tr>`
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background-color:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:12px;">
      <tr>
        <td style="padding:16px 18px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${content}</table>
        </td>
      </tr>
    </table>`;
}

export function emailTotalRow(total: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr>
        <td align="right" style="padding-top:12px;font-size:18px;font-weight:700;color:${BRAND.foreground};">
          Total <span style="color:${BRAND.primary};">${escapeHtml(total)}</span>
        </td>
      </tr>
    </table>`;
}

export function emailHighlightBox(html: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;background-color:#fff7ed;border:1px solid #fed7aa;border-radius:12px;">
      <tr>
        <td style="padding:16px 18px;font-size:15px;line-height:1.6;color:${BRAND.foreground};">${html}</td>
      </tr>
    </table>`;
}
