// Base layout for every transactional email sent by ULINK extensions.
//
// We render a single, inline-styled HTML body because most mail clients
// (Gmail, Outlook web, Apple Mail) strip <style> blocks and only honor
// inline styles. The layout matches the frontend brand:
//
//   ULink Blue   #1769E2   (CTAs, links, accents)
//   Dark Navy   #1A2D49   (headings, brand bar)
//   Deep Onyx   #141414   (body text)
//   Silver      #B8C0CC   (borders, dividers)
//   Off-White   #F5F5F5   (background)
//   White       #FFFFFF   (card surface)
//
// The wrapper takes:
//   { preheader, bodyHtml, footerNote? } and returns an HTML string.
//
// `preheader` is a short teaser shown in inbox previews; it should be 50–90
// characters. It is hidden visually with display:none so it does not break
// the visual layout.

const BRAND = {
  blue: '#1769E2',
  blueStrong: '#1157b8',
  navy: '#1A2D49',
  onyx: '#141414',
  silver: '#B8C0CC',
  offwhite: '#F5F5F5',
  white: '#FFFFFF',
  muted: '#5A6473'
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function escape(value) {
  return escapeHtml(value);
}

function escapeAttr(value) {
  return escapeHtml(value);
}

/**
 * Render a primary CTA button. Centered, full brand blue, white text.
 * Falls back gracefully if the mail client does not support <a> buttons:
 * most clients (Gmail, Outlook, Apple Mail) do, so this is fine.
 */
export function ctaButton({ label, href, align = 'center' }) {
  const safeLabel = escapeHtml(label);
  const safeHref = escapeAttr(href);
  return `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="${align}" style="margin:24px auto;">
    <tr>
      <td align="center" bgcolor="${BRAND.blue}" style="border-radius:6px;">
        <a href="${safeHref}" target="_blank" rel="noopener noreferrer"
           style="display:inline-block;padding:12px 28px;font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:14px;font-weight:600;color:${BRAND.white};text-decoration:none;border-radius:6px;background-color:${BRAND.blue};">
          ${safeLabel}
        </a>
      </td>
    </tr>
  </table>`;
}

/**
 * Render a paragraph block with safe defaults.
 */
export function paragraph(text) {
  return `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${BRAND.onyx};">${escapeHtml(text)}</p>`;
}

/**
 * Render the OTP code box (used by the OTP email and any future
 * code-driven email). Big, monospaced, high-contrast.
 */
export function codeBlock(code) {
  const safeCode = escapeHtml(code);
  return `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="margin:24px 0;">
    <tr>
      <td align="center" bgcolor="#F0F4FA" style="border:1px dashed ${BRAND.blue};border-radius:8px;padding:20px 16px;">
        <span style="display:inline-block;font-family:'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:${BRAND.blue};">${safeCode}</span>
      </td>
    </tr>
  </table>`;
}

/**
 * Render the page shell around a body. Use this for every transactional
 * email so the header / footer are visually consistent.
 */
export function renderShell({ preheader = '', bodyHtml, footerNote }) {
  const safePreheader = escapeHtml(preheader);
  const portalUrl = process.env.FRONTEND_PUBLIC_URL ?? 'http://localhost:3000';
  const year = new Date().getUTCFullYear();
  const defaultFooter = `© ${year} ULINK INDUSTRIES. Mọi quyền được bảo lưu.`;
  const footerHtml = escapeHtml(footerNote ?? defaultFooter);

  return `<!doctype html>
<html lang="vi" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <title>ULINK INDUSTRIES</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.offwhite};-webkit-text-size-adjust:100%;">
  <!-- Hidden preheader -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${BRAND.offwhite};">
    ${safePreheader}
  </div>

  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="${BRAND.offwhite}" style="background-color:${BRAND.offwhite};">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Brand bar — logo image -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
          <tr>
            <td align="left" style="padding:0 0 16px 0;">
              <img src="${escapeAttr(portalUrl)}/images/logo/ulink_logo.png" alt="ULINK INDUSTRIES" width="140" height="40" style="display:block;width:140px;height:auto;border:0;" />
            </td>
          </tr>
        </table>

        <!-- Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:${BRAND.white};border:1px solid ${BRAND.silver};border-radius:8px;">
          <tr>
            <td style="padding:32px 36px 28px 36px;">

              <!-- Accent bar -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px 0;">
                <tr>
                  <td align="left" style="width:48px;height:3px;background-color:${BRAND.blue};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>

              ${bodyHtml}

            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:20px 16px 8px 16px;font-family:'Inter',system-ui,sans-serif;font-size:12px;color:${BRAND.muted};line-height:1.6;">
              ${footerHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 16px 8px 16px;font-family:'Inter',system-ui,sans-serif;font-size:12px;color:${BRAND.muted};">
              <a href="${escapeAttr(portalUrl)}" target="_blank" rel="noopener noreferrer" style="color:${BRAND.blue};text-decoration:none;">${escapeHtml(portalUrl)}</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
