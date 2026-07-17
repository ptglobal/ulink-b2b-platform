import { test, expect } from '@playwright/test';

const BASE_URL = (process.env.FRONTEND_URL ?? 'http://103.164.35.132:3002').replace(/\/$/, '');

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

// Hàm hỗ trợ điền dữ liệu an toàn để tránh lỗi race condition do hydration chậm ở một số trình duyệt (như Webkit)
async function robustFill(page: any, selector: string, value: string) {
  const locator = page.locator(selector);
  await locator.click();
  await locator.fill(value);
  await locator.blur();
}

test.describe('Kiểm thử giao diện Đăng ký nhận tin (UI Newsletter)', () => {

  test.beforeEach(async ({ page }) => {
    // Truy cập trang chủ ngôn ngữ Tiếng Việt (Footer chứa form Newsletter có ở tất cả các trang)
    await page.goto(`${BASE_URL}/vi`);
    // Đảm bảo trang load hoàn tất và đã hydrate xong trước khi chạy kiểm thử
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
  });

  test('TC-UI-NEWS-01: Đăng ký nhận tin thành công với email hợp lệ (Happy Path)', async ({ page }) => {
    const emailInput = page.locator('footer input[type="email"]');
    const submitBtn = page.locator('footer form button[type="submit"]');
    const successMsg = page.locator('text=Đăng ký nhận bản tin thành công');

    const email = uniqueEmail('ui-news-happy');
    
    // Sử dụng robustFill để điền email an toàn
    await emailInput.click();
    await emailInput.fill(email);
    await emailInput.blur();

    // Click gửi
    await submitBtn.click();

    // Xác nhận thông báo thành công hiển thị
    await expect(successMsg).toBeVisible({ timeout: 10000 });
  });

  test('TC-UI-NEWS-02: Validate định dạng email (AC-Newsletter-01)', async ({ page }) => {
    const emailInput = page.locator('footer input[type="email"]');
    const submitBtn = page.locator('footer form button[type="submit"]');
    const errorMsg = page.locator('text=Định dạng email không hợp lệ.');

    // Kịch bản: Nhập email sai định dạng
    await emailInput.click();
    await emailInput.fill('invalid-email');
    await emailInput.blur();

    // Click gửi
    await submitBtn.click();

    // Xác nhận thông báo lỗi hiển thị
    await expect(errorMsg).toBeVisible();
  });

  test('TC-UI-NEWS-03: Báo lỗi khi đăng ký bằng email đã tồn tại (AC-Newsletter-02)', async ({ page }) => {
    const emailInput = page.locator('footer input[type="email"]');
    const submitBtn = page.locator('footer form button[type="submit"]');
    const successMsg = page.locator('text=Đăng ký nhận bản tin thành công');
    const conflictMsg = page.locator('text=Email này đã được đăng ký trước đó');

    const email = uniqueEmail('ui-news-dup');

    // 1. Đăng ký email lần thứ nhất để đảm bảo email tồn tại
    await emailInput.click();
    await emailInput.fill(email);
    await emailInput.blur();
    await submitBtn.click();
    await expect(successMsg).toBeVisible({ timeout: 10000 });

    // Đợi form reset và trạng thái ổn định
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 2. Đăng ký lại chính email đó lần thứ hai
    await emailInput.click();
    await emailInput.fill(email);
    await emailInput.blur();
    await submitBtn.click();

    // Xác nhận thông báo lỗi trùng lặp hiển thị
    await expect(conflictMsg).toBeVisible({ timeout: 10000 });
  });
});
