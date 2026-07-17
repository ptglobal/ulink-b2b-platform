import { expect, test, type APIResponse, type APIRequestContext } from '@playwright/test';

const BASE_URL = (process.env.API_BASE_URL ?? process.env.DIRECTUS_URL ?? 'http://103.164.35.132:8055').replace(/\/$/, '');
const FRONTEND_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.FRONTEND_URL ?? 'http://103.164.35.132:3002').replace(/\/$/, '');

const ROLE_IDS = {
  admin: 'a70c67f5-9037-4f6d-812b-09a2f2d311e0',
  customer: 'e11b0e50-3030-410c-9999-000000000003'
} as const;

const ACCOUNTS = {
  admin: { email: 'admin@ulink.com', password: '1da94d36ee70396195b0527d0e4c841a' },
  customerA: { email: 'customer-a-rbac@example.com', password: 'SecureP@ss123!' },
  customerB: { email: 'customer-b-rbac@example.com', password: 'SecureP@ss123!' }
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
  body: any;
  rawBody: string;
  status: number;
};

type JsonObject = Record<string, unknown>;

function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

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

function getIdField(body: unknown, key: string): string | number | undefined {
  if (!isJsonObject(body)) return undefined;
  const value = body[key];
  return typeof value === 'string' || typeof value === 'number' ? value : undefined;
}

function getErrorCode(body: unknown): string | undefined {
  if (!isJsonObject(body)) return undefined;

  const errors = body.errors;
  if (Array.isArray(errors) && errors.length > 0 && isJsonObject(errors[0])) {
    const ext = errors[0].extensions;
    if (isJsonObject(ext) && typeof ext.code === 'string') {
      return ext.code;
    }
  }

  if (isJsonObject(body.error) && typeof body.error.code === 'string') {
    return body.error.code;
  }

  if (typeof body.code === 'string') {
    return body.code;
  }

  return undefined;
}

function getErrorMessage(body: unknown): string | undefined {
  if (!isJsonObject(body)) return undefined;

  const errors = body.errors;
  if (Array.isArray(errors) && errors.length > 0 && isJsonObject(errors[0])) {
    if (typeof errors[0].message === 'string') return errors[0].message;
  }

  if (typeof body.error === 'string') return body.error;
  if (isJsonObject(body.error) && typeof body.error.message === 'string') return body.error.message;
  if (typeof body.message === 'string') return body.message;

  return undefined;
}

function bearerHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

async function requestJson(options: RequestCaseOptions): Promise<RequestCaseResult> {
  const { label, request, method, path, body, headers, expectedStatus } = options;
  const baseUrl = path.startsWith('/api/') ? FRONTEND_URL : BASE_URL;
  const url = new URL(path, baseUrl).toString();

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
  let parsedBody: any = null;
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
  const result = await requestJson({
    label: 'Login lấy token',
    request,
    method: 'POST',
    path: '/auth/login',
    body: { email, password, mode: 'json' },
    expectedStatus: 200
  });

  const data = getData(result.body);
  expect(isJsonObject(data)).toBeTruthy();
  const token = getStringField(data, 'access_token');
  expect(token).toBeTruthy();
  return token ?? '';
}

// Hàm làm giả Signature của JWT
function tamperSignature(token: string): string {
  const parts = token.split('.');
  if (parts.length !== 3) return token;
  // Thay thế ký tự cuối cùng của Signature để làm signature không hợp lệ
  const sig = parts[2];
  const tamperedSig = sig.slice(0, -1) + (sig.slice(-1) === 'A' ? 'B' : 'A');
  return `${parts[0]}.${parts[1]}.${tamperedSig}`;
}

// Hàm giả lập JWT với Algorithm "none"
function createAlgNoneToken(token: string): string {
  const parts = token.split('.');
  if (parts.length !== 3) return token;
  
  // Tạo header mới với alg: "none"
  const newHeaderObj = { alg: 'none', typ: 'JWT' };
  const newHeader = Buffer.from(JSON.stringify(newHeaderObj))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  // Trả về token không có Signature
  return `${newHeader}.${parts[1]}.`;
}

test.describe.serial('Kiểm thử Bảo mật & Phòng thủ API (Security Penetration Tests)', () => {
  let tokens: {
    admin: string;
    customerA: string;
    customerB: string;
  };
  
  let customerAId: string;
  let customerBId: string;

  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext();
    tokens = {
      admin: await login(request, ACCOUNTS.admin.email, ACCOUNTS.admin.password),
      customerA: await login(request, ACCOUNTS.customerA.email, ACCOUNTS.customerA.password),
      customerB: await login(request, ACCOUNTS.customerB.email, ACCOUNTS.customerB.password)
    };

    // Lấy ID của Customer A
    const meA = await requestJson({
      label: 'Lấy ID Customer A',
      request,
      method: 'GET',
      path: '/users/me',
      headers: bearerHeaders(tokens.customerA),
      expectedStatus: 200
    });
    customerAId = meA.body.data.id;

    // Lấy ID của Customer B
    const meB = await requestJson({
      label: 'Lấy ID Customer B',
      request,
      method: 'GET',
      path: '/users/me',
      headers: bearerHeaders(tokens.customerB),
      expectedStatus: 200
    });
    customerBId = meB.body.data.id;
  });

  // =========================================================================
  // 1. INJECTION (SQL INJECTION & XSS)
  // =========================================================================
  test.describe('1. Injection Protection (SQLi & Stored XSS)', () => {
    
    test('TC-SEC-INJ-01: SQL Injection tại endpoint Đăng nhập (email field)', async ({ request }) => {
      // payload SQLi thường dùng để bypass auth hoặc gây crash
      const sqliPayloads = [
        "admin@ulink.com' OR '1'='1",
        "admin@ulink.com' --",
        "admin@ulink.com' UNION SELECT NULL, NULL--"
      ];

      for (const payload of sqliPayloads) {
        const result = await requestJson({
          label: `SQLi Login với email: ${payload}`,
          request,
          method: 'POST',
          path: '/auth/login',
          body: {
            email: payload,
            password: 'any-password',
            mode: 'json'
          },
          // 400 = Directus reject email sai định dạng trước khi kiểm tra credentials
          // 401 = Directus kiểm tra credentials rồi trả về lỗi xác thực
          // KHÔNG ĐƯỢC 200 (bypass) hoặc 500 (crash database)
          expectedStatus: [400, 401]
        });
        
        // Đảm bảo không bao giờ trả về access_token (chứng tỏ SQLi bypass không thành công)
        expect(result.rawBody).not.toContain('access_token');
        expect(result.rawBody).not.toContain('refresh_token');
        // Đảm bảo trả về thông báo lỗi (chứ không phải response trống hay crash)
        expect(getErrorMessage(result.body) || getErrorCode(result.body)).toBeTruthy();
      }
    });

    test('TC-SEC-INJ-02: SQL Injection thông qua bộ lọc filter API', async ({ request }) => {
      const sqliFilters = [
        "test' OR '1'='1",
        "test') OR ('1'='1",
        "test'; DROP TABLE directus_users;--"
      ];

      for (const filter of sqliFilters) {
        // Gửi filter SQLi qua API GET /users với token CustomerA
        const result = await requestJson({
          label: `SQLi Filter: ${filter}`,
          request,
          method: 'GET',
          path: `/users?filter[email][_eq]=${encodeURIComponent(filter)}`,
          headers: bearerHeaders(tokens.customerA),
          expectedStatus: [200, 400, 403] // 200 (không trả về data), 400 (lỗi filter cú pháp), 403 (không đủ quyền). KHÔNG ĐƯỢC 500 (crash database)
        });

        if (result.status === 200) {
          const list = getData(result.body);
          expect(Array.isArray(list)).toBeTruthy();
          expect((list as unknown[]).length).toBe(0); // Không được trả về bất cứ record nào (chứng tỏ SQLi không thành công)
        }
      }
    });

    test('TC-SEC-INJ-03: Stored XSS Protection tại luồng đăng ký', async ({ request }) => {
      const xssEmail = `xss-${Date.now()}@test.com`;
      // Payload script nguy hại chèn vào company_name và contact_name
      const xssPayload = "<script>alert('XSS')</script>";

      // 1. Thực hiện đăng ký thông qua API B2B onboarding
      const regResult = await requestJson({
        label: 'Đăng ký B2B chứa payload XSS',
        request,
        method: 'POST',
        path: '/customer-onboarding/register',
        body: {
          company_name: xssPayload,
          contact_name: xssPayload,
          email: xssEmail,
          phone: '0901112222',
          password: 'SecureP@ss123!',
          confirm_password: 'SecureP@ss123!',
          agree: true,
          agree_at: '2026-06-19T12:00:00.000Z'
        },
        // 201 = Server chấp nhận dữ liệu (escape/lưu thô, phía client sẽ escape khi render)
        // 400/422 = Server chủ động chặn XSS payload trước khi lưu (cũng là hành vi bảo mật tốt)
        expectedStatus: [201, 400, 422]
      });

      if (regResult.status === 201) {
        // Server chấp nhận → kiểm tra dữ liệu lưu trữ có an toàn
        const data = getData(regResult.body);
        const customerId = getIdField(data, 'customer_id');
        expect(customerId).toBeTruthy();

        // 2. Đăng nhập Admin và lấy dữ liệu của khách hàng vừa tạo
        const getResult = await requestJson({
          label: 'Admin GET thông tin customer chứa XSS',
          request,
          method: 'GET',
          path: `/items/customers/${customerId}`,
          headers: bearerHeaders(tokens.admin),
          expectedStatus: 200
        });

        const customer = getData(getResult.body) as JsonObject;
        expect(customer).toBeTruthy();
        
        // Kiểm tra giá trị lưu trữ: dữ liệu phải là chuỗi hợp lệ (không gây crash JSON parser)
        expect(typeof customer.company_name).toBe('string');
        
        // Dọn dẹp: Xóa customer và user tạm để sạch DB
        const userId = customer.user;
        expect(userId).toBeTruthy();
        
        await requestJson({
          label: 'Dọn dẹp: Xóa customer chứa XSS',
          request,
          method: 'DELETE',
          path: `/items/customers/${customerId}`,
          headers: bearerHeaders(tokens.admin),
          expectedStatus: 204
        });

        await requestJson({
          label: 'Dọn dẹp: Xóa user chứa XSS',
          request,
          method: 'DELETE',
          path: `/users/${userId}`,
          headers: bearerHeaders(tokens.admin),
          expectedStatus: 204
        });
      } else {
        // Server chặn XSS payload trước khi lưu → đây là hành vi bảo mật tốt
        console.log(`[TC-SEC-INJ-03] Server chủ động chặn XSS payload (status ${regResult.status}). ✅ An toàn.`);
        expect(getErrorMessage(regResult.body) || getErrorCode(regResult.body)).toBeTruthy();
      }
    });
  });

  // =========================================================================
  // 2. BROKEN OBJECT-LEVEL AUTHORIZATION (BOLA / IDOR)
  // =========================================================================
  test.describe('2. Broken Object-Level Authorization (BOLA / IDOR) Protection', () => {

    test('TC-SEC-BOLA-01: IDOR - Customer A không được phép xem Profile (directus_users) của Customer B', async ({ request }) => {
      // Customer A cố truy cập chi tiết thông tin của Customer B
      const result = await requestJson({
        label: 'Customer A GET profile Customer B',
        request,
        method: 'GET',
        path: `/users/${customerBId}`,
        headers: bearerHeaders(tokens.customerA),
        expectedStatus: 403 // Phải bị cấm (Forbidden)
      });

      expect(getErrorCode(result.body)).toBe('FORBIDDEN');
    });

    test('TC-SEC-BOLA-02: IDOR - Customer A không được phép sửa đổi Profile của Customer B', async ({ request }) => {
      // Customer A cố tình thay đổi thông tin (ví dụ: tên) của Customer B
      const result = await requestJson({
        label: 'Customer A PATCH profile Customer B',
        request,
        method: 'PATCH',
        path: `/users/${customerBId}`,
        headers: bearerHeaders(tokens.customerA),
        body: {
          first_name: 'Hacker Name'
        },
        expectedStatus: 403 // Phải bị cấm
      });

      expect(getErrorCode(result.body)).toBe('FORBIDDEN');
    });

    test('TC-SEC-BOLA-03: IDOR - Customer A không được phép xem bản ghi Customer (items/customers) của Customer B', async ({ request }) => {
      // Lấy ID bản ghi customer của Customer B bằng quyền Admin trước
      const adminGetB = await requestJson({
        label: 'Admin lấy customer record của B',
        request,
        method: 'GET',
        path: `/items/customers?filter[user][_eq]=${customerBId}`,
        headers: bearerHeaders(tokens.admin),
        expectedStatus: 200
      });
      
      const records = getData(adminGetB.body) as JsonObject[];
      expect(records.length).toBeGreaterThan(0);
      const customerRecordBId = records[0].id;

      // Customer A gọi trực tiếp URL chứa ID bản ghi của B
      const result = await requestJson({
        label: 'Customer A GET customer record của B',
        request,
        method: 'GET',
        path: `/items/customers/${customerRecordBId}`,
        headers: bearerHeaders(tokens.customerA),
        expectedStatus: [403, 404] // Có thể là 403 (Cấm) hoặc 404 (Không thấy do bộ lọc quyền truy cập dòng)
      });

      if (result.status === 403) {
        expect(getErrorCode(result.body)).toBe('FORBIDDEN');
      }
    });
  });

  // =========================================================================
  // 3. BROKEN AUTHENTICATION & JWT INTEGRITY
  // =========================================================================
  test.describe('3. Broken Authentication & Token Tampering Defense', () => {

    test('TC-SEC-ATH-01: Đăng nhập bằng JWT Token bị sửa đổi Signature (Signature Tampering)', async ({ request }) => {
      const tamperedToken = tamperSignature(tokens.customerA);

      const result = await requestJson({
        label: 'Truy cập với JWT bị chỉnh sửa Signature',
        request,
        method: 'GET',
        path: '/users/me',
        headers: bearerHeaders(tamperedToken),
        // 401 = INVALID_CREDENTIALS, 403 = INVALID_TOKEN (tuỳ cách Directus xử lý)
        expectedStatus: [401, 403]
      });

      const errorCode = getErrorCode(result.body);
      expect(['INVALID_CREDENTIALS', 'INVALID_TOKEN', 'TOKEN_EXPIRED']).toContain(errorCode);
    });

    test('TC-SEC-ATH-02: Đăng nhập bằng JWT Token sử dụng Algorithm "none" (None Alg Attack)', async ({ request }) => {
      const noneToken = createAlgNoneToken(tokens.customerA);

      const result = await requestJson({
        label: 'Truy cập với JWT alg: none',
        request,
        method: 'GET',
        path: '/users/me',
        headers: bearerHeaders(noneToken),
        expectedStatus: [401, 403]
      });

      const errorCode = getErrorCode(result.body);
      expect(['INVALID_CREDENTIALS', 'INVALID_TOKEN', 'TOKEN_EXPIRED']).toContain(errorCode);
    });

    test('TC-SEC-ATH-03: Truy cập API cần xác thực mà không gửi Token', async ({ request }) => {
      const result = await requestJson({
        label: 'Truy cập /users/me không có Authorization Header',
        request,
        method: 'GET',
        path: '/users/me',
        expectedStatus: [401, 403]
      });

      const errorCode = getErrorCode(result.body);
      expect(['INVALID_CREDENTIALS', 'INVALID_TOKEN']).toContain(errorCode);
    });

    test('TC-SEC-ATH-04: Truy cập API với Authorization Header có định dạng sai', async ({ request }) => {
      const result = await requestJson({
        label: 'Truy cập /users/me với định dạng header "Basic ..." thay vì "Bearer ..."',
        request,
        method: 'GET',
        path: '/users/me',
        headers: { Authorization: `Basic ${Buffer.from('admin:password').toString('base64')}` },
        expectedStatus: [401, 403]
      });

      const errorCode = getErrorCode(result.body);
      expect(['INVALID_CREDENTIALS', 'INVALID_TOKEN']).toContain(errorCode);
    });
  });

  // =========================================================================
  // 4. MASS ASSIGNMENT & PRIVILEGE ESCALATION
  // =========================================================================
  test.describe('4. Mass Assignment & Privilege Escalation Protection', () => {

    test('TC-SEC-MAS-01: Mass Assignment khi Đăng ký - Gửi kèm role Admin', async ({ request }) => {
      const email = `mas-${Date.now()}@test.com`;
      
      // Thử gửi kèm quyền Admin role ID trong API đăng ký B2B
      const result = await requestJson({
        label: 'Đăng ký B2B kèm tham số role Admin',
        request,
        method: 'POST',
        path: '/customer-onboarding/register',
        body: {
          company_name: 'Privilege Test Co',
          contact_name: 'Privilege User',
          email,
          phone: '0902223333',
          password: 'SecureP@ss123!',
          confirm_password: 'SecureP@ss123!',
          agree: true,
          agree_at: '2026-06-19T12:00:00.000Z',
          role: ROLE_IDS.admin // Cố gắng gán quyền Administrator
        },
        expectedStatus: [201, 400, 422] // Cho phép tạo thành công (nhưng bỏ qua role) hoặc báo lỗi tham số thừa
      });

      if (result.status === 201) {
        // Đăng nhập thử với tài khoản vừa tạo và kiểm tra /users/me xem role thực tế là gì
        const loginRes = await login(request, email, 'SecureP@ss123!');
        const meRes = await requestJson({
          label: 'Kiểm tra role thực tế của user vừa tạo',
          request,
          method: 'GET',
          path: '/users/me?fields=id,role.id,role.name',
          headers: bearerHeaders(loginRes),
          expectedStatus: 200
        });

        const userRole = meRes.body.data.role;
        // Role ID không được là admin, phải là role Customer (hoặc tương đương cấu hình mặc định)
        expect(userRole.id).not.toBe(ROLE_IDS.admin);
        expect(userRole.name).toBe('Customer');

        // Dọn dẹp: lấy lại admin token mới (tránh hết hạn)
        const freshAdminToken = await login(request, ACCOUNTS.admin.email, ACCOUNTS.admin.password);
        const userId = meRes.body.data.id;

        // Xóa customer record trước (vì có foreign key tới user)
        const customerSearch = await requestJson({
          label: 'Dọn dẹp: Tìm customer record',
          request,
          method: 'GET',
          path: `/items/customers?filter[user][_eq]=${userId}`,
          headers: bearerHeaders(freshAdminToken),
          expectedStatus: 200
        });
        const customers = getData(customerSearch.body) as JsonObject[];
        if (Array.isArray(customers) && customers.length > 0) {
          await requestJson({
            label: 'Dọn dẹp: Xóa customer record',
            request,
            method: 'DELETE',
            path: `/items/customers/${customers[0].id}`,
            headers: bearerHeaders(freshAdminToken),
            expectedStatus: [204, 403]
          });
        }

        // Sau đó xóa user
        await requestJson({
          label: 'Dọn dẹp: Xóa user Mass Assignment',
          request,
          method: 'DELETE',
          path: `/users/${userId}`,
          headers: bearerHeaders(freshAdminToken),
          expectedStatus: [204, 403]
        });
      }
    });

    test('TC-SEC-MAS-02: Privilege Escalation - Customer cập nhật profile của mình lên Admin', async ({ request }) => {
      // Customer A cố gắng thay đổi quyền của chính mình lên Administrator
      const result = await requestJson({
        label: 'Customer A cập nhật role của mình lên Admin',
        request,
        method: 'PATCH',
        path: '/users/me',
        headers: bearerHeaders(tokens.customerA),
        body: {
          role: ROLE_IDS.admin
        },
        expectedStatus: [200, 403] // 200 (nếu cho phép cập nhật các trường khác nhưng bỏ qua 'role') hoặc 403 (Cấm chỉnh sửa trường role)
      });

      // Nếu trả về 200, kiểm tra chắc chắn vai trò không bị đổi thành Admin
      if (result.status === 200) {
        const meRes = await requestJson({
          label: 'Xác minh role sau khi PATCH',
          request,
          method: 'GET',
          path: '/users/me?fields=role.id',
          headers: bearerHeaders(tokens.customerA),
          expectedStatus: 200
        });
        expect(meRes.body.data.role.id).not.toBe(ROLE_IDS.admin);
        expect(meRes.body.data.role.id).toBe(ROLE_IDS.customer);
      }
    });
  });

  // =========================================================================
  // 5. INFORMATION DISCLOSURE & EMAIL ENUMERATION
  // =========================================================================
  test.describe('5. Information Disclosure & Email Enumeration Prevention', () => {

    test('TC-SEC-ENUM-01: Chống Email Enumeration tại luồng Quên mật khẩu', async ({ request }) => {
      // 1. Quên mật khẩu với email có trong hệ thống
      const resExist = await requestJson({
        label: 'Quên mật khẩu - Email TỒN TẠI',
        request,
        method: 'POST',
        path: '/api/auth/forgot-password',
        body: { email: ACCOUNTS.customerA.email },
        expectedStatus: 200
      });

      // 2. Quên mật khẩu với email giả mạo không tồn tại
      const resNotExist = await requestJson({
        label: 'Quên mật khẩu - Email KHÔNG TỒN TẠI',
        request,
        method: 'POST',
        path: '/api/auth/forgot-password',
        body: { email: 'fake-nonexistent-email@example.com' },
        expectedStatus: 200 // Vẫn phải trả về 200 thành công để tránh phân biệt
      });

      // BẢO MẬT: Response trả về phải giống hệt nhau
      expect(resExist.body).toEqual(resNotExist.body);
    });

    test('TC-SEC-ENUM-02: Chống Email Enumeration tại luồng Đổi mật khẩu qua email link', async ({ request }) => {
      // 1. Đổi mật khẩu với email tồn tại
      const resExist = await requestJson({
        label: 'Yêu cầu đổi mật khẩu - Email TỒN TẠI',
        request,
        method: 'POST',
        path: '/api/auth/change-password',
        body: { email: ACCOUNTS.customerA.email },
        expectedStatus: 200
      });

      // 2. Đổi mật khẩu với email không tồn tại
      const resNotExist = await requestJson({
        label: 'Yêu cầu đổi mật khẩu - Email KHÔNG TỒN TẠI',
        request,
        method: 'POST',
        path: '/api/auth/change-password',
        body: { email: 'fake-nonexistent-email@example.com' },
        expectedStatus: 200 // Vẫn phải trả về 200
      });

      // BẢO MẬT: Response phải giống hệt nhau
      expect(resExist.body).toEqual(resNotExist.body);
    });
  });

  // =========================================================================
  // 6. BROKEN FUNCTION LEVEL AUTHORIZATION (BFLA)
  // =========================================================================
  test.describe('6. Broken Function Level Authorization (BFLA) Defense', () => {

    test('TC-SEC-BFLA-01: Customer thử gọi chức năng Invite User chỉ dành cho Admin', async ({ request }) => {
      const result = await requestJson({
        label: 'Customer A cố gắng mời user mới via /users/invite',
        request,
        method: 'POST',
        path: '/users/invite',
        headers: bearerHeaders(tokens.customerA),
        body: {
          email: uniqueEmail('invited'),
          role: ROLE_IDS.customer
        },
        expectedStatus: 403 // Phải trả về 403 Forbidden
      });

      expect(getErrorCode(result.body)).toBe('FORBIDDEN');
    });

    test('TC-SEC-BFLA-02: Customer thử xóa vai trò (roles) trong hệ thống', async ({ request }) => {
      const result = await requestJson({
        label: 'Customer A cố gắng xóa role Customer',
        request,
        method: 'DELETE',
        path: `/roles/${ROLE_IDS.customer}`,
        headers: bearerHeaders(tokens.customerA),
        expectedStatus: 403
      });

      expect(getErrorCode(result.body)).toBe('FORBIDDEN');
    });

    test('TC-SEC-BFLA-03: Customer thử cập nhật cấu hình hệ thống (settings)', async ({ request }) => {
      const result = await requestJson({
        label: 'Customer A cố gắng PATCH /settings',
        request,
        method: 'PATCH',
        path: '/settings',
        headers: bearerHeaders(tokens.customerA),
        body: {
          project_name: 'Hacked Project Name'
        },
        expectedStatus: 403
      });

      expect(getErrorCode(result.body)).toBe('FORBIDDEN');
    });
  });
});
