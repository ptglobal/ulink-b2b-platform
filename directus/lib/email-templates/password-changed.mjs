// Password-changed confirmation — sent after a successful password update,
// either via the OTP path (forgot/change) or via the Directus reset link.
//
// Plain, factual body. We highlight the time of change and the device /
// location placeholder so the user can spot suspicious activity.

import { paragraph, renderShell } from './base.mjs';

export function renderPasswordChangedEmail({ contactName, changeTime, ipHint }) {
  const greeting = contactName ? `Chào ${contactName},` : 'Chào bạn,';
  const time = changeTime ? new Date(changeTime) : new Date();
  const timeText = formatViDate(time);
  const ipLine = ipHint ? ` từ <strong>${escapeHtml(ipHint)}</strong>` : '';

  const bodyHtml = `
    <h1 style="margin:0 0 16px 0;font-family:'Inter',system-ui,sans-serif;font-size:22px;font-weight:700;line-height:1.3;color:#1A2D49;">
      Mật khẩu đã được thay đổi
    </h1>
    <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#141414;">${escapeHtml(greeting)}</p>
    ${paragraph(`Mật khẩu tài khoản ULINK của bạn vừa được cập nhật${ipLine} vào lúc <strong>${timeText}</strong>.`)}
    ${paragraph('Nếu đó là bạn, bạn có thể bỏ qua email này. Nếu bạn không thực hiện thay đổi này, hãy liên hệ ngay với đội ngũ ULINK để được hỗ trợ.')}
    <p style="margin:24px 0 0 0;font-size:13px;line-height:1.6;color:#5A6473;">
      Liên hệ khẩn cấp:
      <a href="mailto:security@ulink.com" style="color:#1769E2;text-decoration:none;">security@ulink.com</a>
    </p>
  `;

  return renderShell({
    preheader: 'Mật khẩu ULINK của bạn vừa được thay đổi — xác nhận ngay.',
    bodyHtml
  });
}

function formatViDate(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
