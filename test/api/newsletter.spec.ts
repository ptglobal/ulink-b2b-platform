import { expect, test, type APIRequestContext } from '@playwright/test';

const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? 'http://103.164.35.132:8055').replace(/\/$/, '');
const FRONTEND_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://103.164.35.132:3002').replace(/\/$/, '');

const ACCOUNTS = {
  admin: { email: 'admin@ulink.com', password: '1da94d36ee70396195b0527d0e4c841a' },
  customer: { email: 'customer-a-rbac@example.com', password: 'SecureP@ss123!' }
} as const;

type ExpectedStatus = number | number[];

type RequestCaseOptions = {
  label: string;
  request: APIRequestContext;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  expectedStatus: ExpectedStatus;
};

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@example.com`;
}

function bearerHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function requestJson(options: RequestCaseOptions) {
  const { label, request, method, path, body, headers, expectedStatus } = options;
  const baseUrl = path.startsWith('/api/') ? FRONTEND_URL : DIRECTUS_URL;
  const url = new URL(path, baseUrl).toString();

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    ...(headers ?? {})
  };

  console.log(`\n[${label}] ${method} ${url}`);
  const response = await request.fetch(url, {
    method,
    headers: requestHeaders,
    data: body
  });

  const actualStatus = response.status();
  const rawBody = await response.text();
  let parsedBody: any = null;
  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = rawBody;
    }
  }

  console.log(`[${label}] status thực tế: ${actualStatus}`);
  console.log(`[${label}] body trả về:`, parsedBody);

  const statuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  expect(statuses).toContain(actualStatus);

  return {
    response,
    body: parsedBody,
    status: actualStatus
  };
}

async function login(request: APIRequestContext, email: string, password: string): Promise<string> {
  const res = await requestJson({
    label: 'Login',
    request,
    method: 'POST',
    path: '/auth/login',
    body: { email, password, mode: 'json' },
    expectedStatus: 200
  });
  return res.body?.data?.access_token ?? '';
}

test.describe('Kiểm thử API Đăng ký nhận tin (Newsletter API)', () => {
  let adminToken = '';
  let customerToken = '';
  let isFrontendRunning = false;

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    
    // Check if the Next.js frontend is active on FRONTEND_URL
    try {
      const feRes = await request.get(`${FRONTEND_URL}/vi`);
      isFrontendRunning = feRes.status() === 200;
    } catch {
      isFrontendRunning = false;
    }
    console.log(`[INFO] Next.js frontend running status: ${isFrontendRunning}`);

    adminToken = await login(request, ACCOUNTS.admin.email, ACCOUNTS.admin.password);
    customerToken = await login(request, ACCOUNTS.customer.email, ACCOUNTS.customer.password);
  });

  test.describe('1. Kiểm thử Frontend API Route (/api/newsletter)', () => {
    test.beforeEach(async () => {
      test.skip(!isFrontendRunning, 'Frontend Next.js không hoạt động, bỏ qua test frontend API route');
    });

    test('TC-API-NEWS-01: Đăng ký nhận tin thành công với email hợp lệ', async ({ request }) => {
      const email = uniqueEmail('news-signup');
      const res = await requestJson({
        label: 'TC-API-NEWS-01: Đăng ký email mới',
        request,
        method: 'POST',
        path: '/api/newsletter',
        body: { email },
        expectedStatus: 200
      });
      expect(res.body?.success).toBe(true);
      expect(res.body?.data?.message).toBe('Success');
    });

    test('TC-API-NEWS-02: Đăng ký thất bại với email sai định dạng (422)', async ({ request }) => {
      const invalidEmails = ['invalid-email', 'abc@', 'test@domain'];
      for (const email of invalidEmails) {
        const res = await requestJson({
          label: `TC-API-NEWS-02: Định dạng sai: ${email}`,
          request,
          method: 'POST',
          path: '/api/newsletter',
          body: { email },
          expectedStatus: 422
        });
        expect(res.body?.success).toBe(false);
        expect(res.body?.error?.message).toContain('Định dạng email không hợp lệ.');
      }
    });

    test('TC-API-NEWS-03: Đăng ký thất bại với body thiếu email (400)', async ({ request }) => {
      const res = await requestJson({
        label: 'TC-API-NEWS-03: Gửi body rỗng',
        request,
        method: 'POST',
        path: '/api/newsletter',
        body: {},
        expectedStatus: 400
      });
      expect(res.body?.success).toBe(false);
      expect(res.body?.error?.message).toContain('Email is required.');
    });

    test('TC-API-NEWS-04: Đăng ký thất bại với email trùng lặp (409)', async ({ request }) => {
      const email = uniqueEmail('news-dup');

      // Đăng ký lần thứ nhất
      await requestJson({
        label: 'TC-API-NEWS-04: Đăng ký lần 1',
        request,
        method: 'POST',
        path: '/api/newsletter',
        body: { email },
        expectedStatus: 200
      });

      // Đăng ký lần thứ hai (cùng email)
      const res = await requestJson({
        label: 'TC-API-NEWS-04: Đăng ký lần 2 (Trùng lặp)',
        request,
        method: 'POST',
        path: '/api/newsletter',
        body: { email },
        expectedStatus: 409
      });
      expect(res.body?.success).toBe(false);
      expect(res.body?.error?.message).toBe('Email này đã được đăng ký trước đó');
    });
  });

  test.describe('2. Kiểm thử Phân quyền Directus RBAC trên Collection newsletter_subscribers', () => {
    test('TC-API-NEWS-05: Admin có quyền CRUD trên collection newsletter_subscribers', async ({ request }) => {
      const auth = bearerHeaders(adminToken);
      const email = uniqueEmail('news-rbac-admin');

      // 1. POST (Tạo mới)
      const createRes = await requestJson({
        label: 'Admin POST /items/newsletter_subscribers',
        request,
        method: 'POST',
        path: '/items/newsletter_subscribers',
        headers: auth,
        body: { email, status: 'active' },
        expectedStatus: [200, 201]
      });
      const createdId = createRes.body?.data?.id;
      expect(createdId).toBeTruthy();

      // 2. GET (Đọc danh sách)
      const getListRes = await requestJson({
        label: 'Admin GET /items/newsletter_subscribers',
        request,
        method: 'GET',
        path: '/items/newsletter_subscribers',
        headers: auth,
        expectedStatus: 200
      });
      const subscribers = getListRes.body?.data ?? [];
      console.log(`[INFO] Danh sách các email đăng ký nhận tin hiện tại:`, subscribers.map((item: any) => item.email));
      expect(subscribers.length).toBeGreaterThan(0);

      // 3. PATCH (Cập nhật)
      await requestJson({
        label: `Admin PATCH /items/newsletter_subscribers/${createdId}`,
        request,
        method: 'PATCH',
        path: `/items/newsletter_subscribers/${createdId}`,
        headers: auth,
        body: { status: 'inactive' },
        expectedStatus: 200
      });

      // 4. DELETE (Dọn dẹp)
      await requestJson({
        label: `Admin DELETE /items/newsletter_subscribers/${createdId}`,
        request,
        method: 'DELETE',
        path: `/items/newsletter_subscribers/${createdId}`,
        headers: auth,
        expectedStatus: [200, 204]
      });
    });

    test('TC-API-NEWS-06: Khách ẩn danh bị chặn truy cập danh sách newsletter_subscribers (401 hoặc 403)', async ({ request }) => {
      await requestJson({
        label: 'Anonymous GET /items/newsletter_subscribers (Expect Block)',
        request,
        method: 'GET',
        path: '/items/newsletter_subscribers',
        expectedStatus: [401, 403]
      });
    });

    test('TC-API-NEWS-07: Khách hàng B2B bị chặn truy cập danh sách newsletter_subscribers (403)', async ({ request }) => {
      await requestJson({
        label: 'Customer GET /items/newsletter_subscribers (Expect Block)',
        request,
        method: 'GET',
        path: '/items/newsletter_subscribers',
        headers: bearerHeaders(customerToken),
        expectedStatus: [401, 403]
      });
    });
  });
});
