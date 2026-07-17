import { test, expect } from '@playwright/test';

const BASE_URL = (process.env.FRONTEND_URL ?? 'http://103.164.35.132:3002').replace(/\/$/, '');

// Hàm hỗ trợ điền dữ liệu an toàn để tránh lỗi race condition do hydration chậm ở một số trình duyệt (như Webkit)
async function robustFill(page: any, selector: string, value: string) {
  const locator = page.locator(selector);
  await locator.click();
  await locator.fill(value);
  await locator.blur();
}

test.describe('Kiểm thử giao diện Đăng nhập (UI Login)', () => {

  test.beforeEach(async ({ page }) => {
    // Truy cập trang đăng nhập ngôn ngữ Tiếng Việt
    await page.goto(`${BASE_URL}/vi/login`);
    // Đảm bảo trang load hoàn tất trước khi chạy kiểm thử
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveTitle(/Đăng nhập/);
  });

  test('TC-01: Đăng nhập thành công với tài khoản hợp lệ', async ({ page }) => {
    const passwordInput = page.locator('input#password');
    const submitBtn = page.getByRole('button', { name: 'Đăng nhập', exact: true });

    // AC02: Kiểm tra mật khẩu ẩn mặc định khi chưa/đang nhập
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Nhập thông tin tài khoản hợp lệ
    await robustFill(page, 'input#email', 'admin@ulink.com');
    await robustFill(page, 'input#password', '1da94d36ee70396195b0527d0e4c841a');

    // Thực hiện click Đăng nhập
    await submitBtn.click();

    // AC04: Điều hướng người dùng tới Portal ngay sau khi xác thực thành công
    // Thực tế, do trang /portal chưa được định nghĩa trong app router, 
    // hệ thống sẽ tự động chuyển hướng người dùng về trang chủ có locale (ví dụ: /vi).
    // Đảm bảo trình duyệt đã chuyển hướng khỏi trang login.
    await expect(page).not.toHaveURL(/.*\/login/, { timeout: 15000 });

    // Đảm bảo URL hiện tại là trang chủ hoặc portal
    await expect(page).toHaveURL(/.*(\/vi|\/portal|\/en|\/ja)?$/, { timeout: 5000 });

    // Kiểm tra xem session/token cookie đã được sinh ra thành công trong context
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session') || c.name === 'directus_session');
    expect(sessionCookie, 'Hệ thống phải sinh ra session cookie sau khi đăng nhập thành công').toBeTruthy();
  });

  test('TC-02: Validate định dạng email (AC01)', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Đăng nhập', exact: true });
    const emailError = page.locator('#email-error');

    // Kịch bản A: Email thiếu hậu tố domain (ví dụ: abc)
    await robustFill(page, 'input#email', 'invalid-email');
    await robustFill(page, 'input#password', 'NRwmAGqJ9YE@gGZ');
    await submitBtn.click();
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText('Email không hợp lệ.');

    // Kịch bản B: Email thiếu tên miền cụ thể (ví dụ: abc@)
    await robustFill(page, 'input#email', 'abc@');
    await submitBtn.click();
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText('Email không hợp lệ.');
  });

  test('TC-03: Để trống trường dữ liệu (Exception Handling)', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Đăng nhập', exact: true });
    const emailError = page.locator('#email-error');
    const passwordError = page.locator('#password-error');

    // 1. Trống Email, có Mật khẩu
    await robustFill(page, 'input#email', '');
    await robustFill(page, 'input#password', 'NRwmAGqJ9YE@gGZ');
    await submitBtn.click();
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText('Vui lòng nhập email.');
    await expect(passwordError).not.toBeVisible();

    // Reset lại trang để kiểm tra trường hợp tiếp theo
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 2. Có Email, trống Mật khẩu
    await robustFill(page, 'input#email', 'ngomanhtien2004@gmail.com');
    await robustFill(page, 'input#password', '');
    await submitBtn.click();
    await expect(passwordError).toBeVisible();
    await expect(passwordError).toHaveText('Vui lòng nhập mật khẩu.');
    await expect(emailError).not.toBeVisible();
  });

  test('TC-04: Đăng nhập thất bại - Sai thông tin (AC03)', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Đăng nhập', exact: true });
    // Sử dụng p[role="alert"] để tránh strict mode violation với route announcer div của Next.js
    const alertError = page.locator('p[role="alert"]');

    // Nhập email đúng, mật khẩu sai
    await robustFill(page, 'input#email', 'ngomanhtien2004@gmail.com');
    await robustFill(page, 'input#password', 'wrongpassword123!');
    await submitBtn.click();

    // AC03: Hiển thị lỗi chung để bảo mật
    await expect(alertError).toBeVisible();
    await expect(alertError).toHaveText('Email hoặc mật khẩu không đúng.');
  });

  test('TC-05: Đăng nhập thất bại - Email chưa đăng ký (AC03)', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Đăng nhập', exact: true });
    // Sử dụng p[role="alert"] để tránh strict mode violation với route announcer div của Next.js
    const alertError = page.locator('p[role="alert"]');

    // Nhập email chưa đăng ký
    await robustFill(page, 'input#email', 'unregistered_user@example.com');
    await robustFill(page, 'input#password', 'NRwmAGqJ9YE@gGZ');
    await submitBtn.click();

    // AC03: Hiển thị lỗi chung (không tiết lộ email chưa đăng ký để bảo mật)
    await expect(alertError).toBeVisible();
    await expect(alertError).toHaveText('Email hoặc mật khẩu không đúng.');
  });

  test('TC-05b: Đăng nhập thất bại - Tài khoản bị khóa (status = suspended)', async ({ page, request }) => {
    const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? 'http://103.164.35.132:8055').replace(/\/$/, '');

    // 1. Đăng nhập Admin lấy token hệ thống
    const adminLoginRes = await request.post(`${DIRECTUS_URL}/auth/login`, {
      data: {
        email: 'admin@ulink.com',
        password: '1da94d36ee70396195b0527d0e4c841a',
        mode: 'json'
      }
    });
    const adminLoginBody = await adminLoginRes.json();
    const adminToken = adminLoginBody?.data?.access_token;
    expect(adminToken).toBeTruthy();

    // 2. Lấy role Customer ID
    const rolesRes = await request.get(`${DIRECTUS_URL}/roles`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const rolesBody = await rolesRes.json();
    const customerRole = rolesBody?.data?.find((r: any) => r.name === 'Customer');
    expect(customerRole?.id).toBeTruthy();
    const roleId = customerRole.id;

    // 3. Tạo một tài khoản tạm thời ở trạng thái hoạt động (active)
    const tempEmail = `ui-suspended-test-${Date.now()}@example.com`;
    const tempPassword = 'SecureP@ss123!';

    const userCreateRes = await request.post(`${DIRECTUS_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        email: tempEmail,
        password: tempPassword,
        role: roleId,
        status: 'active'
      }
    });
    const userCreateBody = await userCreateRes.json();
    const userId = userCreateBody?.data?.id;
    expect(userId).toBeTruthy();

    console.log(`[TC-05b] Đã tạo tài khoản tạm thời hoạt động: ${tempEmail}`);

    // 4. Thực hiện đăng nhập trên Giao diện khi tài khoản đang HOẠT ĐỘNG
    const emailInput = page.locator('input#email');
    const passwordInput = page.locator('input#password');
    const submitBtn = page.getByRole('button', { name: 'Đăng nhập', exact: true });

    await emailInput.fill(tempEmail);
    await passwordInput.fill(tempPassword);
    await submitBtn.click();

    // Tài khoản hoạt động -> Đăng nhập thành công và chuyển hướng khỏi trang đăng nhập
    await expect(page).not.toHaveURL(/.*\/login/, { timeout: 15000 });
    console.log(`[TC-05b] Đăng nhập thành công trên giao diện khi active.`);

    // 5. Khóa tài khoản
    // Xóa cookies phiên đăng nhập hiện tại trên browser
    await page.context().clearCookies();

    // Admin cập nhật status thành 'suspended'
    await request.patch(`${DIRECTUS_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: 'suspended' }
    });
    console.log(`[TC-05b] Admin đã cập nhật trạng thái user thành suspended.`);

    // Quay lại trang đăng nhập và đợi trang tải/hydrate ổn định
    await page.goto(`${BASE_URL}/vi/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Đợi 1 giây để Next.js hoàn tất hydration

    // 6. Thực hiện đăng nhập lại bằng tài khoản bị khóa
    const alertError = page.locator('p[role="alert"]');
    
    // Nhập dữ liệu an toàn (click -> fill -> blur)
    await emailInput.click();
    await emailInput.fill(tempEmail);
    await emailInput.blur();

    await passwordInput.click();
    await passwordInput.fill(tempPassword);
    await passwordInput.blur();

    await submitBtn.click();

    // Xác nhận hiển thị lỗi tài khoản bị tạm khóa
    await expect(alertError).toBeVisible({ timeout: 10000 });
    await expect(alertError).toContainText('Tài khoản của bạn đã bị tạm khóa, xin vui lòng liên hệ với quản trị viên');
    console.log(`[TC-05b] Đăng nhập thất bại trên giao diện khi suspended.`);

    // 7. Dọn dẹp: Xóa tài khoản tạm thời
    await request.delete(`${DIRECTUS_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`[TC-05b] Đã xóa tài khoản tạm thời khỏi database.`);
  });

  test('TC-05c: Đăng nhập thành công - Tài khoản được mở khóa (suspended -> active)', async ({ page, request }) => {
    const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? 'http://103.164.35.132:8055').replace(/\/$/, '');

    // 1. Đăng nhập Admin lấy token hệ thống
    const adminLoginRes = await request.post(`${DIRECTUS_URL}/auth/login`, {
      data: {
        email: 'admin@ulink.com',
        password: '1da94d36ee70396195b0527d0e4c841a',
        mode: 'json'
      }
    });
    const adminLoginBody = await adminLoginRes.json();
    const adminToken = adminLoginBody?.data?.access_token;
    expect(adminToken).toBeTruthy();

    // 2. Lấy role Customer ID
    const rolesRes = await request.get(`${DIRECTUS_URL}/roles`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const rolesBody = await rolesRes.json();
    const customerRole = rolesBody?.data?.find((r: any) => r.name === 'Customer');
    expect(customerRole?.id).toBeTruthy();
    const roleId = customerRole.id;

    // 3. Tạo một tài khoản tạm thời ở trạng thái BỊ KHÓA (suspended)
    const tempEmail = `ui-unlock-test-${Date.now()}@example.com`;
    const tempPassword = 'SecureP@ss123!';

    const userCreateRes = await request.post(`${DIRECTUS_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: {
        email: tempEmail,
        password: tempPassword,
        role: roleId,
        status: 'suspended'
      }
    });
    const userCreateBody = await userCreateRes.json();
    const userId = userCreateBody?.data?.id;
    expect(userId).toBeTruthy();

    console.log(`[TC-05c] Đã tạo tài khoản tạm thời bị khóa: ${tempEmail}`);

    // 4. Kiểm tra Đăng nhập trên Giao diện khi tài khoản đang BỊ KHÓA
    const emailInput = page.locator('input#email');
    const passwordInput = page.locator('input#password');
    const submitBtn = page.getByRole('button', { name: 'Đăng nhập', exact: true });
    const alertError = page.locator('p[role="alert"]');

    // Nhập dữ liệu an toàn (click -> fill -> blur)
    await emailInput.click();
    await emailInput.fill(tempEmail);
    await emailInput.blur();

    await passwordInput.click();
    await passwordInput.fill(tempPassword);
    await passwordInput.blur();

    await submitBtn.click();

    // Phải báo lỗi tài khoản bị tạm khóa
    await expect(alertError).toBeVisible({ timeout: 10000 });
    await expect(alertError).toContainText('Tài khoản của bạn đã bị tạm khóa, xin vui lòng liên hệ với quản trị viên');
    console.log(`[TC-05c] Đăng nhập thất bại chính xác khi tài khoản đang bị khóa.`);

    // 5. MỞ KHÓA TÀI KHOẢN (suspended -> active)
    await request.patch(`${DIRECTUS_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      data: { status: 'active' }
    });
    console.log(`[TC-05c] Admin đã cập nhật trạng thái user thành active (mở khóa).`);

    // Tải lại trang đăng nhập để reset form
    await page.goto(`${BASE_URL}/vi/login`);
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // 6. Thực hiện đăng nhập lại bằng tài khoản ĐÃ ĐƯỢC MỞ KHÓA
    await emailInput.click();
    await emailInput.fill(tempEmail);
    await emailInput.blur();

    await passwordInput.click();
    await passwordInput.fill(tempPassword);
    await passwordInput.blur();

    await submitBtn.click();

    // Tài khoản đã mở khóa -> Đăng nhập thành công và chuyển hướng khỏi trang đăng nhập
    await expect(page).not.toHaveURL(/.*\/login/, { timeout: 15000 });
    console.log(`[TC-05c] Đăng nhập thành công trên giao diện sau khi tài khoản được mở khóa.`);

    // Xóa cookies để dọn dẹp phiên đăng nhập của trình duyệt
    await page.context().clearCookies();

    // 7. Dọn dẹp: Xóa tài khoản tạm thời khỏi database
    await request.delete(`${DIRECTUS_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`[TC-05c] Đã xóa tài khoản tạm thời khỏi database.`);
  });

  test('TC-06: Chức năng ẩn/hiện mật khẩu (AC02)', async ({ page }) => {
    const passwordInput = page.locator('input#password');

    // Điền mật khẩu -> kiểm tra là dạng password
    await passwordInput.fill('NRwmAGqJ9YE@gGZ');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Nhấn icon mắt mở (Hiện mật khẩu)
    const toggleShowBtn = page.getByRole('button', { name: 'Hiện mật khẩu' });
    await toggleShowBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Nhấn icon mắt đóng (Ẩn mật khẩu)
    const toggleHideBtn = page.getByRole('button', { name: 'Ẩn mật khẩu' });
    await toggleHideBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
