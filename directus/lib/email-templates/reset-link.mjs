// Password-reset link email — sent by the password-reset-request-endpoint.
//
// Supports two purposes:
//   - 'forgot': user requested a password reset (default)
//   - 'change': user explicitly wants to change their current password
//
// The user clicks the CTA button to land on /reset-password?token=... and
// enters a new password there. The link is single-use and expires in 15
// minutes (enforced by Redis TTL in the endpoint).

import { ctaButton, paragraph, renderShell, escape } from './base.mjs';

const COPY = {
  forgot: {
    heading: 'Đặt lại mật khẩu',
    preheader: 'Đặt lại mật khẩu ULINK — liên kết có hiệu lực 15 phút.',
    greeting: (name) => name ? `Chào ${name},` : 'Chào bạn,',
    intro: 'Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản ULINK của bạn. Nhấn nút bên dưới để chọn mật khẩu mới:',
    cta: 'Đặt mật khẩu mới',
    ignore: 'Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này — tài khoản của bạn vẫn an toàn.'
  },
  change: {
    heading: 'Thay đổi mật khẩu',
    preheader: 'Xác nhận thay đổi mật khẩu ULINK — liên kết có hiệu lực 15 phút.',
    greeting: (name) => name ? `Chào ${name},` : 'Chào bạn,',
    intro: 'Chúng tôi nhận được yêu cầu thay đổi mật khẩu cho tài khoản ULINK của bạn. Nhấn nút bên dưới để đặt mật khẩu mới:',
    cta: 'Đặt mật khẩu mới',
    ignore: 'Nếu bạn không thực hiện yêu cầu này, vui lòng đổi mật khẩu ngay lập tức và liên hệ đội ngũ hỗ trợ.'
  }
};

export function renderResetLinkEmail({ purpose = 'forgot', contactName, resetUrl, ttlMinutes }) {
  const copy = COPY[purpose] ?? COPY.forgot;
  const minutes = Math.max(1, Number(ttlMinutes) || 15);
  const safeUrl = escape(resetUrl);
  const greeting = escape(copy.greeting(contactName));

  const bodyHtml = `
    <h1 style="margin:0 0 16px 0;font-family:'Inter',system-ui,sans-serif;font-size:22px;font-weight:700;line-height:1.3;color:#1A2D49;">
      ${escape(copy.heading)}
    </h1>
    <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#141414;">${greeting}</p>
    ${paragraph(copy.intro)}
    ${ctaButton({ label: copy.cta, href: resetUrl })}
    <p style="margin:8px 0 0 0;font-size:13px;line-height:1.6;color:#5A6473;text-align:center;">
      Liên kết có hiệu lực trong <strong>${minutes} phút</strong>.
    </p>

    <!-- Steps -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 0 0;">
      <tr>
        <td style="padding:16px 20px;background-color:#F0F4FA;border-radius:8px;">
          <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;color:#1A2D49;">Bước tiếp theo:</p>
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:4px 0;font-size:13px;line-height:1.5;color:#141414;">
                <span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background-color:#1769E2;color:#FFFFFF;border-radius:50%;font-size:11px;font-weight:600;margin-right:8px;">1</span>
                Nhấn nút "Đặt mật khẩu mới" ở trên
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;line-height:1.5;color:#141414;">
                <span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background-color:#1769E2;color:#FFFFFF;border-radius:50%;font-size:11px;font-weight:600;margin-right:8px;">2</span>
                Nhập mật khẩu mới (tối thiểu 8 ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt)
              </td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;line-height:1.5;color:#141414;">
                <span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;background-color:#1769E2;color:#FFFFFF;border-radius:50%;font-size:11px;font-weight:600;margin-right:8px;">3</span>
                Xác nhận mật khẩu và đăng nhập lại
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0 0;font-size:13px;line-height:1.6;color:#5A6473;">
      Nếu nút không hoạt động, sao chép liên kết sau vào trình duyệt:<br>
      <a href="${safeUrl}" style="color:#1769E2;word-break:break-all;">${safeUrl}</a>
    </p>

    <!-- Security note -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0 0 0;">
      <tr>
        <td style="padding:12px 16px;border-left:3px solid #B8C0CC;background-color:#FAFAFA;">
          <p style="margin:0;font-size:12px;line-height:1.5;color:#5A6473;">
            &#128274; <strong>Lưu ý bảo mật:</strong> ${escape(copy.ignore)}
            ULINK sẽ không bao giờ yêu cầu bạn cung cấp mật khẩu qua email hoặc tin nhắn.
          </p>
        </td>
      </tr>
    </table>
  `;

  return renderShell({
    preheader: copy.preheader,
    bodyHtml
  });
}
