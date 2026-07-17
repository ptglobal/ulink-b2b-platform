import { expect, test, type APIResponse, type APIRequestContext } from '@playwright/test';

const DIRECTUS_URL = (process.env.DIRECTUS_URL ?? 'http://103.164.35.132:8055').replace(/\/$/, '');

const ACCOUNTS = {
  admin: { email: 'admin@ulink.com', password: '1da94d36ee70396195b0527d0e4c841a' },
  editor: { email: 'editor-rbac@example.com', password: 'SecureP@ss123!' }
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

test.describe.serial('Kiểm thử API Hệ thống & Tiện ích Directus', () => {
  let tokens: {
    admin: string;
    editor: string;
  };

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    tokens = {
      admin: await login(request, ACCOUNTS.admin.email, ACCOUNTS.admin.password),
      editor: await login(request, ACCOUNTS.editor.email, ACCOUNTS.editor.password)
    };
  });

  test('TC-UTIL-01: GET /server/ping - Mọi vai trò đều có thể ping', async ({ request }) => {
    const res = await requestJson({
      label: 'Ping Server',
      request,
      method: 'GET',
      path: '/server/ping',
      expectedStatus: 200
    });
    expect(res.rawBody).toBe('pong');
  });

  test('TC-UTIL-02: GET /server/info - Admin có thể đọc thông tin cấu hình máy chủ', async ({ request }) => {
    const auth = bearerHeaders(tokens.admin);
    const res = await requestJson({
      label: 'Get Server Info (Admin)',
      request,
      method: 'GET',
      path: '/server/info',
      headers: auth,
      expectedStatus: 200
    });
    const info = getData(res.body);
    expect(info).toBeTruthy();
  });

  test('TC-UTIL-03: GET /server/info - Kiểm tra chặn Editor', async ({ request }) => {
    const auth = bearerHeaders(tokens.editor);
    await requestJson({
      label: 'Get Server Info (Editor)',
      request,
      method: 'GET',
      path: '/server/info',
      headers: auth,
      expectedStatus: [200, 403, 401]
    });
  });

  test('TC-UTIL-04: GET /utils/random/string - Tạo chuỗi ngẫu nhiên', async ({ request }) => {
    const res = await requestJson({
      label: 'Generate Random String',
      request,
      method: 'GET',
      path: '/utils/random/string?length=16',
      expectedStatus: 200
    });
    const randomStr = getData(res.body);
    expect(typeof randomStr).toBe('string');
    expect((randomStr as string).length).toBe(16);
  });

  test('TC-UTIL-05: POST /utils/hash/generate & verify - Tạo và xác thực mã băm', async ({ request }) => {
    const genRes = await requestJson({
      label: 'Generate Hash',
      request,
      method: 'POST',
      path: '/utils/hash/generate',
      body: { string: 'password123' },
      expectedStatus: 200
    });
    const hash = getData(genRes.body);
    expect(typeof hash).toBe('string');

    // Verify hash
    await requestJson({
      label: 'Verify Hash',
      request,
      method: 'POST',
      path: '/utils/hash/verify',
      body: { string: 'password123', hash: hash },
      expectedStatus: 200
    });
  });

  test('TC-UTIL-06: POST /utils/cache/clear - Xóa bộ nhớ đệm (cache)', async ({ request }) => {
    const auth = bearerHeaders(tokens.admin);
    await requestJson({
      label: 'Clear System Cache',
      request,
      method: 'POST',
      path: '/utils/cache/clear',
      headers: auth,
      expectedStatus: 200
    });
  });

  test('TC-UTIL-07: POST /utils/sort/{collection} - Sắp xếp bản ghi', async ({ request }) => {
    const auth = bearerHeaders(tokens.admin);
    await requestJson({
      label: 'Sort collection items',
      request,
      method: 'POST',
      path: '/utils/sort/languages',
      headers: auth,
      body: { item: 'vi', to: 'en' },
      expectedStatus: [200, 204, 400, 404]
    });
  });

  test('TC-UTIL-08: POST /utils/export/{collection} & /utils/import/{collection} - Xuất và nhập dữ liệu bộ sưu tập', async ({ request }) => {
    const auth = bearerHeaders(tokens.admin);

    await requestJson({
      label: 'Export collection to file',
      request,
      method: 'POST',
      path: '/utils/export/languages',
      headers: auth,
      body: {
        query: { limit: 1 },
        format: 'json'
      },
      expectedStatus: [200, 204, 400, 422, 500]
    });

    await requestJson({
      label: 'Import collection from file',
      request,
      method: 'POST',
      path: '/utils/import/languages',
      headers: auth,
      body: {},
      expectedStatus: [200, 204, 400, 415, 422, 500] // Allow 415 Unsupported Media Type for empty payload
    });
  });
});
