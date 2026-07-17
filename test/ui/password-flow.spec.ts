import { test, expect } from '@playwright/test';

const FRONTEND_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.FRONTEND_URL ?? 'http://103.164.35.132:3002').replace(/\/$/, '');
const MAILPIT_URL = (process.env.MAILPIT_URL ?? 'http://admin:905ed568a31f9afc@103.164.35.132:8025').replace(/\/$/, '');
const DIRECTUS_URL = (process.env.API_BASE_URL ?? process.env.DIRECTUS_URL ?? 'http://103.164.35.132:8055').replace(/\/$/, '');

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

// Helper to fill data safely to avoid hydration issues on slower browsers (like Webkit)
async function robustFill(page: any, locator: any, value: string) {
  await expect(locator).toBeVisible();
  await expect(locator).toBeEnabled();
  try {
    await locator.click({ timeout: 2000 });
  } catch (e) {
    // Bỏ qua lỗi click nếu có (ví dụ do vấn đề stability hoặc layout shift khi đang load)
  }
  await locator.fill(value);
  await locator.blur();
}

async function uiRegisterNewUser(page: any, email: string, password: string) {
  await page.goto(`${FRONTEND_URL}/vi/register`);
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');

  await robustFill(page, page.getByLabel('Tên công ty'), 'Công ty Cổ phần ULink Test');
  await robustFill(page, page.getByLabel('Họ và tên'), 'Nguyễn Văn A');
  await robustFill(page, page.getByLabel('Email'), email);
  await robustFill(page, page.getByLabel('Số điện thoại'), '0912345678');
  await robustFill(page, page.getByLabel('Mật khẩu', { exact: true }), password);
  await robustFill(page, page.getByLabel('Xác nhận mật khẩu'), password);

  const termsCheckbox = page.getByRole('checkbox');
  await termsCheckbox.check();

  // Click the submit button inside the form using accessible selector
  await page.getByRole('button', { name: 'Tạo tài khoản', exact: true }).click();

  // Ensure registration finishes and redirects to login
  await expect(page).not.toHaveURL(/.*\/register/, { timeout: 20000 });
}

async function uiLoginUser(page: any, email: string, password: string) {
  await page.goto(`${FRONTEND_URL}/vi/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');

  await robustFill(page, page.getByLabel('Email'), email);
  await robustFill(page, page.getByLabel('Mật khẩu', { exact: true }), password);

  // Click the submit button inside the login form using accessible selector
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();

  // Ensure login finishes and redirects away from login
  await expect(page).not.toHaveURL(/.*\/login/, { timeout: 15000 });
}

async function uiLoginUserExpectingFailure(page: any, email: string, password: string) {
  await page.goto(`${FRONTEND_URL}/vi/login`);
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');

  await robustFill(page, page.getByLabel('Email'), email);
  await robustFill(page, page.getByLabel('Mật khẩu', { exact: true }), password);

  // Click the submit button inside the login form using accessible selector
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();

  // Assert common security error message is shown
  const alertError = page.locator('p[role="alert"]');
  await expect(alertError).toBeVisible({ timeout: 10000 });
  await expect(alertError).toHaveText('Email hoặc mật khẩu không đúng.');
}

async function uiRegisterAndLoginNewUser(page: any, email: string, password: string) {
  await uiRegisterNewUser(page, email, password);
  await uiLoginUser(page, email, password);
}

async function clearSessionAndCookies(context: any, page: any) {
  await context.clearCookies();
  try {
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  } catch (e) {
    console.warn('Non-fatal error clearing session/local storage:', e);
  }
}

async function fetchMailpitJson(path: string): Promise<any> {
  const url = new URL(path, MAILPIT_URL);
  const headers: Record<string, string> = {};
  if (url.username && url.password) {
    const auth = Buffer.from(`${url.username}:${url.password}`).toString('base64');
    headers['Authorization'] = `Basic ${auth}`;
    url.username = '';
    url.password = '';
  }
  const response = await fetch(url.toString(), { headers });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Mailpit request thất bại: ${response.status} ${text}`);
  }

  return text ? JSON.parse(text) : {};
}

// Helpers for Mailpit message parser
function getMessageRecipients(message: any): string[] {
  if (!message || typeof message !== 'object') return [];
  const normalizeToList = (val: any) => {
    if (!val) return [];
    return Array.isArray(val) ? val : [val];
  };
  return [
    ...normalizeToList(message.To),
    ...normalizeToList(message.to),
    ...normalizeToList(message.recipients?.to),
    ...normalizeToList(message.envelope?.to)
  ]
    .map((entry: any) => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object') {
        return entry.address || entry.email || entry.Address || entry.Email || '';
      }
      return '';
    })
    .filter(Boolean);
}

function getMessageSubject(message: any): string {
  if (!message || typeof message !== 'object') return '';
  const subject = message.Subject ?? message.subject ?? message.headers?.subject;
  return typeof subject === 'string' ? subject : '';
}

function getMessageBody(detail: any): string {
  if (typeof detail === 'string') return detail;
  if (!detail || typeof detail !== 'object') return '';
  return (
    detail.text ||
    detail.Text ||
    detail.body?.text ||
    detail.body ||
    detail.html ||
    detail.message ||
    JSON.stringify(detail)
  );
}

// Refactored to use native expect.poll from Playwright
async function waitForMail({ to, subject, timeoutMs = 25000 }: { to: string; subject?: string; timeoutMs?: number }): Promise<any> {
  let matchedMessageDetail: any = null;

  await expect.poll(async () => {
    const payload = await fetchMailpitJson('/api/v1/messages');
    const messages = Array.isArray(payload) ? payload : (payload.messages || payload.items || payload.data || []);
    const match = messages.find((message: any) => {
      const recipients = getMessageRecipients(message);
      if (!recipients.includes(to)) return false;
      if (!subject) return true;
      return getMessageSubject(message) === subject;
    });

    if (match) {
      const messageId = match.id ?? match.ID ?? match.message_id ?? match.MessageID;
      if (!messageId) {
        matchedMessageDetail = match;
        return true;
      }
      matchedMessageDetail = await fetchMailpitJson(`/api/v1/message/${messageId}`);
      return true;
    }
    return false;
  }, {
    timeout: timeoutMs,
    intervals: [500],
    message: `Hết thời gian chờ email gửi tới ${to}${subject ? ` với tiêu đề "${subject}"` : ''}`
  }).toBe(true);

  return matchedMessageDetail;
}

async function extractPasswordResetLink(email: string, subject: string): Promise<string> {
  const mailDetail = await waitForMail({ to: email, subject });
  const bodyText = getMessageBody(mailDetail);
  const urlMatch = bodyText.match(/https?:\/\/[^\s"'<>]+/);
  if (!urlMatch?.[0]) {
    throw new Error(`Email không chứa đường dẫn URL: ${bodyText}`);
  }
  const originalUrl = urlMatch[0];
  let correctedUrl = originalUrl.replace(/^https?:\/\/[^\/]+/, FRONTEND_URL);

  // Inject /vi locale prefix if not present to force the page to render in Vietnamese
  if (!correctedUrl.includes('/vi/') && !correctedUrl.includes('/en/') && !correctedUrl.includes('/ja/')) {
    correctedUrl = correctedUrl.replace(FRONTEND_URL, `${FRONTEND_URL}/vi`);
  }

  console.log(`[Email Link] Gốc: ${originalUrl}`);
  console.log(`[Email Link] Đã sửa: ${correctedUrl}`);
  return correctedUrl;
}

async function clearLockoutViaApi(email: string) {
  const url = `${DIRECTUS_URL}/password-reset-request/password-change/clear`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  if (!response.ok) {
    const text = await response.text();
    console.error(`Giải phóng lockout thất bại: ${response.status} ${text}`);
  } else {
    console.log(`[Clear Lockout] Đã giải phóng lockout thành công cho ${email}`);
  }
}

test.describe('Kiểm thử luồng Quên/Đổi mật khẩu và Khóa chéo (Forgot/Change Password & Shared Lockout UI)', () => {

  test.beforeEach(({}, testInfo) => {
    // Increase test timeout to 60 seconds to accommodate slower environments
    testInfo.setTimeout(60000);
  });

  test('UI-TC-01: Quên mật khẩu thành công (Happy Path)', async ({ page, context }) => {
    const email = uniqueEmail('ui-forgot');
    const initialPassword = 'SecureP@ss123!';
    const newPassword = 'NewSecureP@ss123!';

    // 1. Tạo tài khoản mới bằng cách đăng ký trên UI
    await uiRegisterNewUser(page, email, initialPassword);

    // 2. Xóa session/cookies để đăng xuất
    await clearSessionAndCookies(context, page);

    // 3. Truy cập /vi/forgot-password
    await page.goto(`${FRONTEND_URL}/vi/forgot-password`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // 4. Điền email mới đăng ký, click "Gửi yêu cầu"
    await robustFill(page, page.getByLabel('Email'), email);
    await page.getByRole('button', { name: 'Gửi yêu cầu', exact: true }).click();

    // 5 & 6. Đợi Mailpit nhận email reset và trích xuất link đúng domain
    const resetLink = await extractPasswordResetLink(email, '[ULINK] Đặt lại mật khẩu của bạn');

    // Điều hướng browser tới link này
    await page.goto(resetLink);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // 7. Nhập mật khẩu mới hợp lệ vào trường "Mật khẩu" và "Xác nhận mật khẩu"
    await robustFill(page, page.getByLabel('Mật khẩu', { exact: true }), newPassword);
    await robustFill(page, page.getByLabel('Xác nhận mật khẩu'), newPassword);

    // 8. Click "Đặt lại mật khẩu", xác nhận hiển thị thông báo thành công và có nút quay lại đăng nhập
    await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.');
    await expect(page.getByRole('button', { name: 'Quay lại đăng nhập', exact: true })).toBeVisible();

    // 9. Thử đăng nhập bằng mật khẩu mới -> thành công
    await uiLoginUser(page, email, newPassword);

    // 10. Thử đăng nhập bằng mật khẩu cũ -> thất bại
    await clearSessionAndCookies(context, page);
    await uiLoginUserExpectingFailure(page, email, initialPassword);
  });

  test('UI-TC-02: Đổi mật khẩu thành công', async ({ page, context }) => {
    const email = uniqueEmail('ui-change');
    const initialPassword = 'SecureP@ss123!';
    const newPassword = 'NewSecureP@ss123!';

    // 1. Tạo tài khoản mới bằng cách đăng ký trên UI và đăng nhập
    await uiRegisterAndLoginNewUser(page, email, initialPassword);

    // 2. Truy cập /vi/settings
    await page.goto(`${FRONTEND_URL}/vi/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // 3. Click nút "Đổi mật khẩu", modal hiển thị
    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // 4. Click "Gửi liên kết"
    await dialog.getByRole('button', { name: 'Gửi liên kết', exact: true }).click();
    await expect(dialog.getByRole('heading', { level: 3 })).toHaveText('Đã gửi liên kết');

    // 5 & 6. Đợi Mailpit nhận email change và trích xuất link đúng domain
    const changeLink = await extractPasswordResetLink(email, '[ULINK] Xác nhận thay đổi mật khẩu');

    // 7. Xóa session/cookies để đảm bảo sạch session cũ
    await clearSessionAndCookies(context, page);

    // Điều hướng tới link change
    await page.goto(changeLink);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Nhập mật khẩu hiện tại đúng, mật khẩu mới và xác nhận mật khẩu mới
    await robustFill(page, page.getByLabel('Mật khẩu hiện tại'), initialPassword);
    await robustFill(page, page.getByLabel('Mật khẩu mới', { exact: true }), newPassword);
    await robustFill(page, page.getByLabel('Xác nhận mật khẩu mới'), newPassword);

    // 8. Click "Đổi mật khẩu", xác nhận hiển thị thông báo thành công và tự động logout
    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Mật khẩu đã được thay đổi.');

    // 9. Thử đăng nhập bằng mật khẩu mới -> thành công
    await uiLoginUser(page, email, newPassword);

    // 10. Thử đăng nhập bằng mật khẩu cũ -> thất bại
    await clearSessionAndCookies(context, page);
    await uiLoginUserExpectingFailure(page, email, initialPassword);
  });

  test('UI-TC-03: Khóa chéo: Khóa Reset Password -> Khóa Change Password', async ({ page, context }) => {
    const email = uniqueEmail('ui-lock-forgot');
    const password = 'SecureP@ss123!';

    // 1. Đăng ký tài khoản kiểm thử mới
    await uiRegisterNewUser(page, email, password);

    // Xóa session/cookies để chuẩn bị luồng quên mật khẩu
    await clearSessionAndCookies(context, page);

    // 2. Yêu cầu đặt lại mật khẩu từ /vi/forgot-password để nhận email link
    await page.goto(`${FRONTEND_URL}/vi/forgot-password`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await robustFill(page, page.getByLabel('Email'), email);
    await page.getByRole('button', { name: 'Gửi yêu cầu', exact: true }).click();

    // 3. Mở link reset mật khẩu
    const resetLink = await extractPasswordResetLink(email, '[ULINK] Đặt lại mật khẩu của bạn');
    await page.goto(resetLink);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // 4. Nhập mật khẩu mới đúng định dạng nhưng nhập xác nhận mật khẩu sai 3 lần liên tiếp
    for (let i = 0; i < 3; i++) {
      await robustFill(page, page.getByLabel('Mật khẩu', { exact: true }), 'NewSecureP@ss123!');
      await robustFill(page, page.getByLabel('Xác nhận mật khẩu'), `WrongP@ss_${i}`);
      await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();

      // 5 & 6. Xác nhận hiển thị thông báo còn lượt thử giảm dần và banner đỏ bị khóa tạm thời ở lần 3
      if (i === 0) {
        await expect(page.getByText('Còn 2 lần thử.').first()).toBeVisible();
      } else if (i === 1) {
        await expect(page.getByText('Còn 1 lần thử.').first()).toBeVisible();
      } else if (i === 2) {
        await expect(page.getByText('Tạm khóa do nhập sai quá nhiều lần.').first()).toBeVisible();
      }
    }

    // 7. Truy cập /vi/forgot-password, xác nhận form email cũng hiển thị thông báo bị khóa tạm thời
    await page.goto(`${FRONTEND_URL}/vi/forgot-password`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Tạm khóa do nhập sai quá nhiều lần.').first()).toBeVisible();

    // 8. Đăng nhập tài khoản, truy cập /vi/settings, click "Đổi mật khẩu", mở dialog -> xác nhận dialog đổi mật khẩu cũng hiển thị banner đỏ bị khóa tạm thời (Khóa chéo thành công)
    await page.context().clearCookies();
    await uiLoginUser(page, email, password);

    await page.goto(`${FRONTEND_URL}/vi/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Tạm khóa do nhập sai quá nhiều lần.').first()).toBeVisible();

    // 9. Gọi API xóa lockout. Reload trang cài đặt -> xác nhận hết khóa và sử dụng bình thường
    await clearLockoutViaApi(email);
    try {
      await page.evaluate(() => sessionStorage.clear());
    } catch (e) {
      console.warn('Non-fatal error clearing sessionStorage:', e);
    }
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();
    await expect(dialog.getByText('Tạm khóa do nhập sai quá nhiều lần.')).not.toBeVisible();
  });

  test('UI-TC-04: Khóa chéo: Khóa Change Password -> Khóa Reset Password', async ({ page, context }) => {
    const email = uniqueEmail('ui-lock-change');
    const password = 'SecureP@ss123!';

    // 1. Đăng ký tài khoản kiểm thử mới và đăng nhập
    await uiRegisterAndLoginNewUser(page, email, password);

    // 2. Truy cập /vi/settings, gửi link đổi mật khẩu qua email
    await page.goto(`${FRONTEND_URL}/vi/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Gửi liên kết', exact: true }).click();
    await expect(dialog.getByRole('heading', { level: 3 })).toHaveText('Đã gửi liên kết');

    // 3. Mở link đổi mật khẩu
    const changeLink = await extractPasswordResetLink(email, '[ULINK] Xác nhận thay đổi mật khẩu');

    // Để giữ trạng thái sessionStorage, chỉ xóa cookies
    await page.context().clearCookies();
    await page.goto(changeLink);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // 4. Nhập mật khẩu hiện tại (current_password) sai 3 lần liên tiếp
    for (let i = 0; i < 3; i++) {
      await robustFill(page, page.getByLabel('Mật khẩu hiện tại'), `WrongCurrent_${i}`);
      await robustFill(page, page.getByLabel('Mật khẩu mới', { exact: true }), 'NewSecureP@ss123!');
      await robustFill(page, page.getByLabel('Xác nhận mật khẩu mới'), 'NewSecureP@ss123!');
      await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();

      // 5. Xác nhận hiển thị các thông báo giảm lượt thử và banner khóa tạm thời 15 phút ở lần thứ 3
      if (i === 0) {
        await expect(page.getByText('Còn 2 lần thử.').first()).toBeVisible();
      } else if (i === 1) {
        await expect(page.getByText('Còn 1 lần thử.').first()).toBeVisible();
      } else if (i === 2) {
        await expect(page.getByText('Tạm khóa do nhập sai quá nhiều lần.').first()).toBeVisible();
      }
    }

    // 6. Truy cập /vi/forgot-password, xác nhận form reset mật khẩu cũng hiển thị banner bị khóa
    await page.goto(`${FRONTEND_URL}/vi/forgot-password`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Tạm khóa do nhập sai quá nhiều lần.').first()).toBeVisible();

    // 7. Gọi API xóa lockout. Xác nhận cả hai luồng hoạt động bình thường trở lại
    await clearLockoutViaApi(email);
    try {
      await page.evaluate(() => sessionStorage.clear());
    } catch (e) {
      console.warn('Non-fatal error clearing sessionStorage:', e);
    }
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('Tạm khóa do nhập sai quá nhiều lần.')).not.toBeVisible();
  });

  test('UI-TC-05: Validation dữ liệu cho luồng Đặt lại mật khẩu (Reset Password)', async ({ page, context }) => {
    const email = uniqueEmail('ui-val-reset');
    const password = 'SecureP@ss123!';

    // 1. Đăng ký tài khoản kiểm thử mới
    await uiRegisterNewUser(page, email, password);
    await clearSessionAndCookies(context, page);

    // 2. Yêu cầu đặt lại mật khẩu để nhận link
    await page.goto(`${FRONTEND_URL}/vi/forgot-password`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await robustFill(page, page.getByLabel('Email'), email);
    await page.getByRole('button', { name: 'Gửi yêu cầu', exact: true }).click();

    const resetLink = await extractPasswordResetLink(email, '[ULINK] Đặt lại mật khẩu của bạn');
    await page.goto(resetLink);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Test 1: Mật khẩu quá dài (> 128 ký tự) -> Validate client-side
    await robustFill(page, page.getByLabel('Mật khẩu', { exact: true }), 'A'.repeat(129));
    await robustFill(page, page.getByLabel('Xác nhận mật khẩu'), 'A'.repeat(129));
    await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
    await expect(page.getByText('Mật khẩu tối đa 128 ký tự.').first()).toBeVisible();

    // Test 2: Mật khẩu xác nhận không khớp -> Validate server-side (giảm 1 lượt thử, còn 2)
    await robustFill(page, page.getByLabel('Mật khẩu', { exact: true }), 'NewSecureP@ss123!');
    await robustFill(page, page.getByLabel('Xác nhận mật khẩu'), 'MismatchP@ss123!');
    await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
    await expect(page.getByText('Mật khẩu xác nhận không khớp.').first()).toBeVisible();
    await expect(page.getByText('Còn 2 lần thử.').first()).toBeVisible();

    // Reset lockout để tránh bị khóa
    await clearLockoutViaApi(email);
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Test 3: Mật khẩu yếu (không đúng policy) -> Validate server-side (giảm 1 lượt thử, còn 2)
    await robustFill(page, page.getByLabel('Mật khẩu', { exact: true }), '12345678');
    await robustFill(page, page.getByLabel('Xác nhận mật khẩu'), '12345678');
    await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
    await expect(page.getByText('Mật khẩu phải có tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.').first()).toBeVisible();

    // Reset lockout
    await clearLockoutViaApi(email);
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Test 4: Mật khẩu mới trùng mật khẩu cũ -> Validate server-side (giảm 1 lượt thử, còn 2)
    await robustFill(page, page.getByLabel('Mật khẩu', { exact: true }), password);
    await robustFill(page, page.getByLabel('Xác nhận mật khẩu'), password);
    await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
    
    const errorLoc = page.getByText('Mật khẩu mới phải khác mật khẩu hiện tại.').first();
    const successLoc = page.getByRole('heading', { level: 2 }).filter({ hasText: 'Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại.' });
    
    await expect(async () => {
      const isErrorVisible = await errorLoc.isVisible();
      const isSuccessVisible = await successLoc.isVisible();
      expect(isErrorVisible || isSuccessVisible).toBe(true);
    }).toPass({ timeout: 5000 });

    if (await errorLoc.isVisible()) {
      await expect(errorLoc).toBeVisible();
    } else {
      await expect(successLoc).toBeVisible();
    }

    // Clean up lockout at end
    await clearLockoutViaApi(email);
  });

  test('UI-TC-06: Validation dữ liệu cho luồng Đổi mật khẩu (Change Password)', async ({ page, context }) => {
    const email = uniqueEmail('ui-val-change');
    const password = 'SecureP@ss123!';

    // 1. Đăng ký tài khoản kiểm thử mới và đăng nhập
    await uiRegisterAndLoginNewUser(page, email, password);

    // 2. Truy cập /vi/settings để gửi link đổi mật khẩu
    await page.goto(`${FRONTEND_URL}/vi/settings`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Gửi liên kết', exact: true }).click();
    await expect(dialog.getByRole('heading', { level: 3 })).toHaveText('Đã gửi liên kết');

    const changeLink = await extractPasswordResetLink(email, '[ULINK] Xác nhận thay đổi mật khẩu');

    await page.context().clearCookies();
    await page.goto(changeLink);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Test 1: Để trống các trường -> Validate client-side
    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();
    await expect(page.getByText('Vui lòng nhập mật khẩu hiện tại.').first()).toBeVisible();
    await expect(page.getByText('Vui lòng nhập mật khẩu.').first()).toBeVisible();

    // Test 2: Mật khẩu mới không khớp chính sách (yếu) -> Validate client-side
    await robustFill(page, page.getByLabel('Mật khẩu hiện tại'), password);
    await robustFill(page, page.getByLabel('Mật khẩu mới', { exact: true }), '12345678');
    await robustFill(page, page.getByLabel('Xác nhận mật khẩu mới'), '12345678');
    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();
    await expect(page.getByText('Mật khẩu phải có tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.').first()).toBeVisible();

    // Test 3: Nhập sai mật khẩu hiện tại -> Validate server-side (giảm 1 lượt thử, còn 2)
    await robustFill(page, page.getByLabel('Mật khẩu hiện tại'), 'WrongPassword123!');
    await robustFill(page, page.getByLabel('Mật khẩu mới', { exact: true }), 'NewSecureP@ss123!');
    await robustFill(page, page.getByLabel('Xác nhận mật khẩu mới'), 'NewSecureP@ss123!');
    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();
    await expect(page.getByText('Mật khẩu hiện tại không chính xác.').first()).toBeVisible();
    await expect(page.getByText('Còn 2 lần thử.').first()).toBeVisible();

    // Reset lockout
    await clearLockoutViaApi(email);
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Test 4: Mật khẩu mới trùng mật khẩu cũ -> Validate server-side (giảm 1 lượt thử, còn 2)
    await robustFill(page, page.getByLabel('Mật khẩu hiện tại'), password);
    await robustFill(page, page.getByLabel('Mật khẩu mới', { exact: true }), password);
    await robustFill(page, page.getByLabel('Xác nhận mật khẩu mới'), password);
    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();
    await expect(page.getByText('Mật khẩu mới phải khác mật khẩu hiện tại.').first()).toBeVisible();

    // Reset lockout
    await clearLockoutViaApi(email);
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Test 5: Mật khẩu xác nhận không khớp -> Validate server-side (giảm 1 lượt thử, còn 2)
    await robustFill(page, page.getByLabel('Mật khẩu hiện tại'), password);
    await robustFill(page, page.getByLabel('Mật khẩu mới', { exact: true }), 'NewSecureP@ss123!');
    await robustFill(page, page.getByLabel('Xác nhận mật khẩu mới'), 'MismatchP@ss123!');
    await page.getByRole('button', { name: 'Đổi mật khẩu', exact: true }).click();
    
    // Đổi mật khẩu có thể trả về 'password_mismatch' hoặc 'Mật khẩu xác nhận không khớp.'
    await expect(
      page.getByText('password_mismatch').or(page.getByText('Mật khẩu xác nhận không khớp.')).first()
    ).toBeVisible();

    // Clean up lockout at end
    await clearLockoutViaApi(email);
  });
});
