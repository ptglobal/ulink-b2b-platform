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

test.describe('Kiểm thử giao diện Đăng ký (UI Register)', () => {

  test.beforeEach(async ({ page }) => {
    // Truy cập trang đăng ký ngôn ngữ Tiếng Việt
    await page.goto(`${BASE_URL}/vi/register`);
    // Đảm bảo trang load hoàn tất và đã hydrate xong trước khi chạy kiểm thử
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveTitle(/Đăng ký tài khoản/);
  });

  test('TC-01: Đăng ký thành công với thông tin hợp lệ (Happy Path)', async ({ page }) => {
    const termsCheckbox = page.locator('input[type="checkbox"]');
    const submitBtn = page.getByRole('button', { name: 'Tạo tài khoản', exact: true });

    // Điền đầy đủ thông tin hợp lệ sử dụng hàm robustFill
    const randomEmail = uniqueEmail('b2b-register');
    await robustFill(page, 'input#company_name', 'Công ty Cổ phần ULink Test');
    await robustFill(page, 'input#contact_name', 'Nguyễn Văn A');
    await robustFill(page, 'input#email', randomEmail);
    await robustFill(page, 'input#phone', '0912345678');
    await robustFill(page, 'input#password', 'SecureP@ssB2B1!');
    await robustFill(page, 'input#confirm_password', 'SecureP@ssB2B1!');

    // Đồng ý điều khoản
    await termsCheckbox.check();

    // Thực hiện Click Tạo tài khoản
    await submitBtn.click();

    // Hệ thống tự động đăng ký và điều hướng sang trang chủ hoặc portal
    await expect(page).not.toHaveURL(/.*\/register/, { timeout: 15000 });
    await expect(page).toHaveURL(/.*(\/vi|\/portal|\/en|\/ja)?$/, { timeout: 5000 });
  });

  test('TC-02: Validate định dạng email (AC01)', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Tạo tài khoản', exact: true });
    const emailError = page.locator('#email-error');

    // Kịch bản A: Email thiếu hậu tố domain (ví dụ: abc)
    await robustFill(page, 'input#email', 'invalid-email');
    await submitBtn.click();
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText('Email không hợp lệ.');

    // Kịch bản B: Email thiếu tên miền cụ thể (ví dụ: abc@)
    await robustFill(page, 'input#email', 'abc@');
    await submitBtn.click();
    await expect(emailError).toBeVisible();
    await expect(emailError).toHaveText('Email không hợp lệ.');
  });

  test('TC-03: Validate độ mạnh của mật khẩu (AC02)', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Tạo tài khoản', exact: true });
    const passwordError = page.locator('#password-error');

    const weakPasswords = [
      'Sh0rt!',             // Dưới 8 ký tự
      'no_uppercase_1!',    // Thiếu chữ hoa
      'NO_LOWERCASE_1!',    // Thiếu chữ thường
      'NoNumberHere!',      // Thiếu số
      'NoSpecialChar1'      // Thiếu ký tự đặc biệt
    ];

    for (const weakPassword of weakPasswords) {
      await robustFill(page, 'input#password', weakPassword);
      await submitBtn.click();
      await expect(passwordError).toBeVisible();
      await expect(passwordError).toHaveText('Mật khẩu phải có tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.');
    }
  });

  test('TC-04: Mật khẩu xác nhận không khớp (Exceptional Handling)', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Tạo tài khoản', exact: true });
    const confirmPasswordError = page.locator('#confirm_password-error');

    // Điền mật khẩu hợp lệ và xác nhận mật khẩu không khớp
    await robustFill(page, 'input#password', 'SecureP@ssB2B1!');
    await robustFill(page, 'input#confirm_password', 'SecureP@ssB2B2!');
    await submitBtn.click();

    // Xác nhận báo lỗi tại trường xác nhận mật khẩu
    await expect(confirmPasswordError).toBeVisible();
    await expect(confirmPasswordError).toHaveText('Mật khẩu xác nhận không khớp.');
  });

  test('TC-05: Đăng ký thất bại - Email đã tồn tại (Exceptional Handling)', async ({ page }) => {
    const termsCheckbox = page.locator('input[type="checkbox"]');
    const submitBtn = page.getByRole('button', { name: 'Tạo tài khoản', exact: true });
    const alertError = page.locator('p[role="alert"]');

    // Điền thông tin với email admin@ulink.com đã tồn tại
    await robustFill(page, 'input#company_name', 'Công ty Cổ phần ULink Test');
    await robustFill(page, 'input#contact_name', 'Nguyễn Văn A');
    await robustFill(page, 'input#email', 'admin@ulink.com');
    await robustFill(page, 'input#phone', '0912345678');
    await robustFill(page, 'input#password', 'SecureP@ssB2B1!');
    await robustFill(page, 'input#confirm_password', 'SecureP@ssB2B1!');
    await termsCheckbox.check();

    // Submit form
    await submitBtn.click();

    // Hệ thống báo lỗi email trùng ở alert form
    await expect(alertError).toBeVisible();
    await expect(alertError).toHaveText('Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.');
  });

  test('TC-06: Để trống các trường dữ liệu bắt buộc (Exceptional Handling)', async ({ page }) => {
    const submitBtn = page.getByRole('button', { name: 'Tạo tài khoản', exact: true });

    // Submit form rỗng
    await submitBtn.click();

    // Kiểm tra lỗi của từng trường
    await expect(page.locator('#company_name-error')).toHaveText('Vui lòng nhập tên công ty.');
    await expect(page.locator('#contact_name-error')).toHaveText('Vui lòng nhập người liên hệ.');
    await expect(page.locator('#email-error')).toHaveText('Vui lòng nhập email.');
    await expect(page.locator('#phone-error')).toHaveText('Vui lòng nhập số điện thoại.');
    await expect(page.locator('#password-error')).toHaveText('Vui lòng nhập mật khẩu.');
    
    // Kiểm tra lỗi đồng ý điều khoản
    const agreeError = page.locator('text=Bạn cần đồng ý với điều khoản để tiếp tục.');
    await expect(agreeError).toBeVisible();
  });
});
