// OTP email — single template handles every purpose: register / forgot /
// reset / change / login-2fa. Body copy differs per purpose via PURPOSE_BODY.
//
// The OTP code is rendered in a high-contrast monospaced block (codeBlock
// from base.mjs) so it can be read at a glance on mobile. A small "valid
// for N minutes" hint is shown underneath. We intentionally do NOT
// promise the exact minute count twice — once under the code, once at the
// bottom — to keep the design tight.

import { codeBlock, paragraph, renderShell } from './base.mjs';

const PURPOSE_BODY = {
  register:
    'Cảm ơn bạn đã đăng ký tài khoản ULINK. Vui lòng dùng mã bên dưới để xác nhận email và hoàn tất đăng ký:',
  forgot:
    'Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản ULINK của bạn. Dùng mã dưới đây để tiếp tục:',
  reset: 'Mã xác nhận cuối cùng trước khi đặt mật khẩu mới:',
  change:
    'Chúng tôi nhận được yêu cầu đổi mật khẩu cho tài khoản ULINK của bạn. Vui lòng xác nhận bằng mã bên dưới:',
  'login-2fa': 'Để hoàn tất đăng nhập, vui lòng nhập mã xác nhận bên dưới:'
};

const DEFAULT_BODY =
  'Mã xác nhận của bạn được liệt kê bên dưới. Vui lòng nhập mã này vào biểu mẫu xác thực để tiếp tục:';

const PURPOSE_HEADING = {
  register: 'Xác nhận email đăng ký',
  forgot: 'Khôi phục mật khẩu',
  reset: 'Đặt lại mật khẩu',
  change: 'Đổi mật khẩu',
  'login-2fa': 'Xác thực đăng nhập'
};

export function renderOtpEmail({ purpose, code, ttlMinutes, contactName }) {
  const safePurpose = PURPOSE_BODY[purpose] ? purpose : 'register';
  const intro = PURPOSE_BODY[safePurpose] ?? DEFAULT_BODY;
  const heading = PURPOSE_HEADING[safePurpose] ?? 'Mã xác nhận';
  const minutes = Math.max(1, Number(ttlMinutes) || 10);
  const greeting = contactName
    ? `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#141414;">Chào <strong>${escapeHtml(contactName)}</strong>,</p>`
    : '';

  const bodyHtml = `
    <h1 style="margin:0 0 16px 0;font-family:'Inter',system-ui,sans-serif;font-size:22px;font-weight:700;line-height:1.3;color:#1A2D49;">
      ${escapeHtml(heading)}
    </h1>
    ${greeting}
    ${paragraph(intro)}
    ${codeBlock(code)}
    <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#5A6473;text-align:center;">
      Mã có hiệu lực trong <strong>${minutes} phút</strong>.
    </p>
    <p style="margin:16px 0 0 0;font-size:13px;line-height:1.6;color:#5A6473;">
      Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email — tài khoản của bạn vẫn an toàn.
    </p>
  `;

  return renderShell({
    preheader: `${heading} — mã xác nhận của bạn`,
    bodyHtml
  });
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
