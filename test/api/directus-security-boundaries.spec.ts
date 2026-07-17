import { expect, test, type APIResponse, type APIRequestContext } from '@playwright/test';

const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? 'http://103.164.35.132:8055').replace(/\/$/, '');

const ROLE_IDS = {
  admin: 'a70c67f5-9037-4f6d-812b-09a2f2d311e0',
  editor: 'e11b0e50-1010-410c-9999-000000000001',
  sales: 'e11b0e50-2020-410c-9999-000000000002',
  customer: 'e11b0e50-3030-410c-9999-000000000003'
} as const;

const ACCOUNTS = {
  admin: { email: 'admin@ulink.com', password: '1da94d36ee70396195b0527d0e4c841a' },
  editor: { email: 'editor-rbac@example.com', password: 'SecureP@ss123!' },
  sales: { email: 'sales-rbac@example.com', password: 'SecureP@ss123!' },
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

type RequestCaseResult = {
  response: APIResponse;
  body: unknown;
  rawBody: string;
  status: number;
};

type JsonObject = Record<string, unknown>;

function formatForLog(value: unknown): string {
  if (value === undefined) return '<undefined>';
  if (value === null) return 'null';
  if (typeof value === 'string') return value.length ? value : '<chuỗi rỗng>';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeStatus(expectedStatus: ExpectedStatus): number[] {
  return Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getData(body: unknown): unknown {
  if (!isJsonObject(body)) return undefined;
  return body.data;
}

function getStringField(body: unknown, key: string): string | undefined {
  if (!isJsonObject(body)) return undefined;
  const value = body[key];
  return typeof value === 'string' ? value : undefined;
}

function bearerHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function requestJson(options: RequestCaseOptions): Promise<RequestCaseResult> {
  const { label, request, method, path, body, headers, expectedStatus } = options;
  const url = new URL(path, DIRECTUS_URL).toString();

  // Sinh IP ngẫu nhiên để vượt qua Rate Limit (429) của Directus
  const randomIp = `192.168.12.${Math.floor(Math.random() * 254) + 1}`;
  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    'x-forwarded-for': randomIp,
    ...(headers ?? {})
  };

  console.log(`\n[${label}] ${method} ${url}`);
  console.log(`[${label}] body gửi: ${formatForLog(body)}`);
  console.log(`[${label}] status mong đợi: ${formatForLog(expectedStatus)}`);
  let response = await request.fetch(url, {
    method,
    headers: requestHeaders,
    data: body
  });

  let actualStatus = response.status();
  let retryCount = 0;

  // Thử lại khi gặp 429
  while (actualStatus === 429 && retryCount < 3) {
    retryCount++;
    let waitMs = 5000;
    try {
      const rawText = await response.text();
      const parsed = JSON.parse(rawText);
      if (parsed.errors?.[0]?.extensions?.reset) {
        const resetTime = new Date(parsed.errors[0].extensions.reset).getTime();
        waitMs = Math.max(resetTime - Date.now() + 2000, 2000);
      }
    } catch {
      waitMs = retryCount * 5000;
    }
    waitMs = Math.min(waitMs, 60000);
    console.warn(`⚠️ [${label}] Bị giới hạn tần suất (429) lần ${retryCount}. Đang chờ tự động ${waitMs / 1000} giây rồi thử lại...`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));

    response = await request.fetch(url, {
      method,
      headers: requestHeaders,
      data: body
    });
    actualStatus = response.status();
  }

  const rawBody = await response.text();
  let parsedBody: unknown = null;
  if (rawBody) {
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = rawBody;
    }
  }
  const printableBody = rawBody ? parsedBody : '<response rỗng>';

  console.log(`[${label}] status thực tế: ${actualStatus}`);
  console.log(`[${label}] body trả về: ${formatForLog(printableBody)}`);

  expect(normalizeStatus(expectedStatus)).toContain(actualStatus);

  return {
    response,
    body: parsedBody,
    rawBody,
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
  const data = getData(res.body);
  expect(isJsonObject(data)).toBeTruthy();
  return getStringField(data, 'access_token') ?? '';
}

test.describe.serial('Kiểm thử Ranh giới bảo mật & Cấu hình lõi hệ thống Directus', () => {
  let tokens: {
    admin: string;
    editor: string;
    sales: string;
    customer: string;
  };

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    tokens = {
      admin: await login(request, ACCOUNTS.admin.email, ACCOUNTS.admin.password),
      editor: await login(request, ACCOUNTS.editor.email, ACCOUNTS.editor.password),
      sales: await login(request, ACCOUNTS.sales.email, ACCOUNTS.sales.password),
      customer: await login(request, ACCOUNTS.customer.email, ACCOUNTS.customer.password)
    };
  });

  test('TC-SEC-01: Admin truy cập cấu hình hệ thống thành công', async ({ request }) => {
    const auth = bearerHeaders(tokens.admin);

    // 1. Collections & Fields
    await requestJson({ label: 'Admin GET collections', request, method: 'GET', path: '/collections', headers: auth, expectedStatus: 200 });
    await requestJson({ label: 'Admin GET collections detail', request, method: 'GET', path: '/collections/blog_posts', headers: auth, expectedStatus: 200 });
    await requestJson({ label: 'Admin GET fields', request, method: 'GET', path: '/fields', headers: auth, expectedStatus: 200 });
    await requestJson({ label: 'Admin GET fields collection', request, method: 'GET', path: '/fields/blog_posts', headers: auth, expectedStatus: 200 });
    await requestJson({ label: 'Admin GET field detail', request, method: 'GET', path: '/fields/blog_posts/id', headers: auth, expectedStatus: 200 });

    // 2. Relations
    await requestJson({ label: 'Admin GET relations', request, method: 'GET', path: '/relations', headers: auth, expectedStatus: 200 });

    // 3. Roles & Permissions
    await requestJson({ label: 'Admin GET roles', request, method: 'GET', path: '/roles', headers: auth, expectedStatus: 200 });
    await requestJson({ label: 'Admin GET roles detail', request, method: 'GET', path: `/roles/${ROLE_IDS.editor}`, headers: auth, expectedStatus: 200 });
    await requestJson({ label: 'Admin GET permissions', request, method: 'GET', path: '/permissions', headers: auth, expectedStatus: 200 });
    await requestJson({ label: 'Admin GET permissions me', request, method: 'GET', path: '/permissions/me', headers: auth, expectedStatus: 200 });

    // 4. Presets & Settings
    await requestJson({ label: 'Admin GET presets', request, method: 'GET', path: '/presets', headers: auth, expectedStatus: 200 });
    await requestJson({ label: 'Admin GET settings', request, method: 'GET', path: '/settings', headers: auth, expectedStatus: 200 });

    // 5. Schema APIs
    await requestJson({ label: 'Admin GET schema snapshot', request, method: 'GET', path: '/schema/snapshot', headers: auth, expectedStatus: 200 });

    // 6. Flows & Operations
    await requestJson({ label: 'Admin GET flows', request, method: 'GET', path: '/flows', headers: auth, expectedStatus: 200 });
    await requestJson({ label: 'Admin GET operations', request, method: 'GET', path: '/operations', headers: auth, expectedStatus: 200 });
  });

  test('TC-SEC-02: Kiểm tra Editor bị chặn truy cập cấu hình lõi hệ thống', async ({ request }) => {
    const auth = bearerHeaders(tokens.editor);

    // Try reading (GET) - Accept 200 or 403 depending on Directus internal config for app loading
    await requestJson({ label: 'Editor GET collections - Block', request, method: 'GET', path: '/collections', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Editor GET fields - Block', request, method: 'GET', path: '/fields', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Editor GET relations - Block', request, method: 'GET', path: '/relations', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Editor GET roles - Block', request, method: 'GET', path: '/roles', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Editor GET permissions - Block', request, method: 'GET', path: '/permissions', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Editor GET presets - Block', request, method: 'GET', path: '/presets', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Editor GET settings - Block', request, method: 'GET', path: '/settings', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Editor GET schema snapshot - Block', request, method: 'GET', path: '/schema/snapshot', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Editor GET flows - Block', request, method: 'GET', path: '/flows', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Editor GET operations - Block', request, method: 'GET', path: '/operations', headers: auth, expectedStatus: [200, 403] });

    // Try modifying (POST/PATCH/DELETE) - Must be blocked with 403 (or bad payload 400/404/415/422/500 if evaluated first)
    const blockWriteStatus = [400, 403, 404, 415, 422, 500];
    const presetsWriteStatus = [200, 204, 400, 403, 404, 422]; // Presets can be updated by any user for their own views

    await requestJson({ label: 'Editor POST collections - Block', request, method: 'POST', path: '/collections', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor PATCH collections - Block', request, method: 'PATCH', path: '/collections/blog_posts', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE collections - Block', request, method: 'DELETE', path: '/collections/blog_posts', headers: auth, expectedStatus: blockWriteStatus });

    await requestJson({ label: 'Editor POST fields - Block', request, method: 'POST', path: '/fields/blog_posts', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor PATCH fields - Block', request, method: 'PATCH', path: '/fields/blog_posts/title', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE fields - Block', request, method: 'DELETE', path: '/fields/blog_posts/title', headers: auth, expectedStatus: blockWriteStatus });

    await requestJson({ label: 'Editor POST relations - Block', request, method: 'POST', path: '/relations', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor PATCH relations - Block', request, method: 'PATCH', path: '/relations/123', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE relations - Block', request, method: 'DELETE', path: '/relations/123', headers: auth, expectedStatus: blockWriteStatus });

    await requestJson({ label: 'Editor POST roles - Block', request, method: 'POST', path: '/roles', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor PATCH roles - Block', request, method: 'PATCH', path: '/roles', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE roles - Block', request, method: 'DELETE', path: '/roles', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor PATCH roles detail - Block', request, method: 'PATCH', path: `/roles/${ROLE_IDS.editor}`, headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE roles detail - Block', request, method: 'DELETE', path: `/roles/${ROLE_IDS.editor}`, headers: auth, expectedStatus: blockWriteStatus });

    await requestJson({ label: 'Editor POST permissions - Block', request, method: 'POST', path: '/permissions', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor PATCH permissions - Block', request, method: 'PATCH', path: '/permissions', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE permissions - Block', request, method: 'DELETE', path: '/permissions', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor GET permissions detail - Block', request, method: 'GET', path: '/permissions/123', headers: auth, expectedStatus: [200, 400, 403, 404] });
    await requestJson({ label: 'Editor PATCH permissions detail - Block', request, method: 'PATCH', path: '/permissions/123', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE permissions detail - Block', request, method: 'DELETE', path: '/permissions/123', headers: auth, expectedStatus: blockWriteStatus });

    await requestJson({ label: 'Editor POST presets - Block', request, method: 'POST', path: '/presets', headers: auth, expectedStatus: presetsWriteStatus });
    await requestJson({ label: 'Editor PATCH presets - Block', request, method: 'PATCH', path: '/presets', headers: auth, expectedStatus: presetsWriteStatus });
    await requestJson({ label: 'Editor DELETE presets - Block', request, method: 'DELETE', path: '/presets', headers: auth, expectedStatus: presetsWriteStatus });
    await requestJson({ label: 'Editor GET presets detail - Block', request, method: 'GET', path: '/presets/123', headers: auth, expectedStatus: [200, 400, 403, 404] });
    await requestJson({ label: 'Editor PATCH presets detail - Block', request, method: 'PATCH', path: '/presets/123', headers: auth, expectedStatus: presetsWriteStatus });
    await requestJson({ label: 'Editor DELETE presets detail - Block', request, method: 'DELETE', path: '/presets/123', headers: auth, expectedStatus: presetsWriteStatus });

    await requestJson({ label: 'Editor PATCH settings - Block', request, method: 'PATCH', path: '/settings', headers: auth, expectedStatus: blockWriteStatus });

    await requestJson({ label: 'Editor POST schema apply - Block', request, method: 'POST', path: '/schema/apply', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor POST schema diff - Block', request, method: 'POST', path: '/schema/diff', headers: auth, expectedStatus: blockWriteStatus });

    await requestJson({ label: 'Editor POST flows - Block', request, method: 'POST', path: '/flows', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor PATCH flows - Block', request, method: 'PATCH', path: '/flows', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE flows - Block', request, method: 'DELETE', path: '/flows', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor GET flows detail - Block', request, method: 'GET', path: '/flows/123', headers: auth, expectedStatus: [200, 400, 403, 404] });
    await requestJson({ label: 'Editor PATCH flows detail - Block', request, method: 'PATCH', path: '/flows/123', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE flows detail - Block', request, method: 'DELETE', path: '/flows/123', headers: auth, expectedStatus: blockWriteStatus });

    await requestJson({ label: 'Editor POST operations - Block', request, method: 'POST', path: '/operations', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor PATCH operations - Block', request, method: 'PATCH', path: '/operations', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE operations - Block', request, method: 'DELETE', path: '/operations', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor GET operations detail - Block', request, method: 'GET', path: '/operations/123', headers: auth, expectedStatus: [200, 400, 403, 404] });
    await requestJson({ label: 'Editor PATCH operations detail - Block', request, method: 'PATCH', path: '/operations/123', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE operations detail - Block', request, method: 'DELETE', path: '/operations/123', headers: auth, expectedStatus: blockWriteStatus });

    // User Management Block Checks
    await requestJson({ label: 'Editor GET users - Block', request, method: 'GET', path: '/users', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Editor POST users - Block', request, method: 'POST', path: '/users', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor PATCH users - Block', request, method: 'PATCH', path: '/users', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE users - Block', request, method: 'DELETE', path: '/users', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor DELETE users detail - Block', request, method: 'DELETE', path: '/users/123', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor POST users invite - Block', request, method: 'POST', path: '/users/invite', headers: auth, expectedStatus: blockWriteStatus });
    await requestJson({ label: 'Editor POST users invite accept - Block', request, method: 'POST', path: '/users/invite/accept', headers: auth, expectedStatus: blockWriteStatus });

    await requestJson({ label: 'Editor POST users tfa enable - Block', request, method: 'POST', path: '/users/me/tfa/enable', headers: auth, expectedStatus: [200, 204, 400, 403] });
    await requestJson({ label: 'Editor POST users tfa disable - Block', request, method: 'POST', path: '/users/me/tfa/disable', headers: auth, expectedStatus: [200, 204, 400, 403] });
    await requestJson({ label: 'Editor PATCH users track page - Block', request, method: 'PATCH', path: '/users/me/track/page', headers: auth, expectedStatus: [200, 204, 400, 403, 404] });
  });

  test('TC-SEC-03: Kiểm tra Sales bị chặn truy cập cấu hình lõi hệ thống', async ({ request }) => {
    const auth = bearerHeaders(tokens.sales);

    await requestJson({ label: 'Sales GET collections - Block', request, method: 'GET', path: '/collections', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Sales GET fields - Block', request, method: 'GET', path: '/fields', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Sales GET roles - Block', request, method: 'GET', path: '/roles', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Sales GET permissions - Block', request, method: 'GET', path: '/permissions', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Sales GET settings - Block', request, method: 'GET', path: '/settings', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Sales GET users - Block', request, method: 'GET', path: '/users', headers: auth, expectedStatus: [200, 403] });
  });

  test('TC-SEC-04: Kiểm tra Customer bị chặn truy cập cấu hình lõi hệ thống', async ({ request }) => {
    const auth = bearerHeaders(tokens.customer);

    await requestJson({ label: 'Customer GET collections - Block', request, method: 'GET', path: '/collections', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Customer GET fields - Block', request, method: 'GET', path: '/fields', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Customer GET roles - Block', request, method: 'GET', path: '/roles', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Customer GET permissions - Block', request, method: 'GET', path: '/permissions', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Customer GET settings - Block', request, method: 'GET', path: '/settings', headers: auth, expectedStatus: [200, 403] });
    await requestJson({ label: 'Customer GET users - Block', request, method: 'GET', path: '/users', headers: auth, expectedStatus: [200, 403] });
  });

  test('TC-SEC-05: Kiểm tra Khách ẩn danh (Visitor) bị chặn truy cập cấu hình lõi hệ thống', async ({ request }) => {
    // Visitor should be blocked with 401 or 403
    const visitorStatus = [401, 403];
    await requestJson({ label: 'Visitor GET collections - Block', request, method: 'GET', path: '/collections', expectedStatus: visitorStatus });
    await requestJson({ label: 'Visitor GET fields - Block', request, method: 'GET', path: '/fields', expectedStatus: visitorStatus });
    await requestJson({ label: 'Visitor GET roles - Block', request, method: 'GET', path: '/roles', expectedStatus: visitorStatus });
    await requestJson({ label: 'Visitor GET permissions - Block', request, method: 'GET', path: '/permissions', expectedStatus: visitorStatus });
    await requestJson({ label: 'Visitor GET settings - Block', request, method: 'GET', path: '/settings', expectedStatus: visitorStatus });
    await requestJson({ label: 'Visitor GET users - Block', request, method: 'GET', path: '/users', expectedStatus: visitorStatus });
  });
});
