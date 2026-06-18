// Welcome email — sent right after a customer account is created.
//
// The body thanks the user, surfaces the company they registered with, and
// points them at the login page. We never include the plaintext password
// here: it is not in the password reset flow and was given to the user
// during registration.

import { ctaButton, paragraph, renderShell } from './base.mjs';

export function renderWelcomeEmail({ contactName, email, companyName, portalUrl }) {
  const greeting = contactName ? `Chào ${contactName},` : 'Chào bạn,';
  const safeCompany = companyName ? ` cho <strong>${escapeHtml(companyName)}</strong>` : '';
  const safeUrl = escapeAttr(portalUrl);
  const safeEmail = escapeHtml(email);

  const bodyHtml = `
    <h1 style="margin:0 0 16px 0;font-family:'Inter',system-ui,sans-serif;font-size:22px;font-weight:700;line-height:1.3;color:#1A2D49;">
      Chào mừng đến với ULINK INDUSTRIES
    </h1>
    <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#141414;">${escapeHtml(greeting)}</p>
    ${paragraph(`Tài khoản ULINK của bạn (${safeEmail})${safeCompany} đã được tạo và kích hoạt thành công. Bạn có thể đăng nhập ngay để khám phá bảng điều khiển khách hàng.`)}
    ${ctaButton({ label: 'Đăng nhập ngay', href: `${safeUrl}/login` })}
    <p style="margin:24px 0 0 0;font-size:13px;line-height:1.6;color:#5A6473;">
      Cần hỗ trợ? Phản hồi email này hoặc liên hệ đội ngũ ULINK tại
      <a href="mailto:support@ulink.com" style="color:#1769E2;text-decoration:none;">support@ulink.com</a>.
    </p>
  `;

  return renderShell({
    preheader: 'Tài khoản ULINK của bạn đã sẵn sàng — đăng nhập ngay.',
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

function escapeAttr(value) {
  return escapeHtml(value);
}
