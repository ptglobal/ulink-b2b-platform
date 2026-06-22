import { ApiError, type ApiErrorBody } from '@/lib/api-error';

/**
 * Centralized HTTP client cho frontend → backend communication.
 *
 * Tất cả API calls đi qua đây:
 * - Base URL tự động resolve (client gọi /api/*, server gọi Directus)
 * - Error handling nhất quán → ApiError
 * - Dễ swap backend sau (ADR-0003: ERP-ready interface)
 * - Credentials included cho session cookies
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  /** HTTP method — default GET */
  method?: HttpMethod;
  /** Request body (auto JSON.stringify) */
  body?: unknown;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Include credentials (cookies) — default true */
  credentials?: RequestCredentials;
  /** Custom signal for abort */
  signal?: AbortSignal;
  /** Cache strategy */
  cache?: RequestCache;
  /** Next.js revalidation */
  next?: { revalidate?: number | false; tags?: string[] };
}

/**
 * Fetch wrapper với error handling chuẩn.
 * Trả về parsed JSON hoặc throw ApiError.
 */
export async function api<T = unknown>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, credentials = 'include', signal, cache, next } = options;

  const fetchOptions: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {
    method,
    credentials,
    signal,
    cache,
    next,
    headers: {
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers
    },
    ...(body !== undefined && { body: JSON.stringify(body) })
  };

  let res: Response;
  try {
    res = await fetch(url, fetchOptions);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError(0, 'network_error', 'Network request failed');
  }

  if (!res.ok) {
    let errorBody: ApiErrorBody | null = null;
    try {
      errorBody = await res.json();
    } catch {
      // Response không phải JSON — dùng status text
    }

    throw new ApiError(
      res.status,
      errorBody?.error ?? `http_${res.status}`,
      errorBody?.message ?? res.statusText,
      errorBody?.details,
      errorBody?.payload
    );
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// ─── Convenience methods ─────────────────────────────────────────────────────

api.get = <T = unknown>(url: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
  api<T>(url, { ...opts, method: 'GET' });

api.post = <T = unknown>(url: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
  api<T>(url, { ...opts, method: 'POST', body });

api.put = <T = unknown>(url: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
  api<T>(url, { ...opts, method: 'PUT', body });

api.patch = <T = unknown>(url: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
  api<T>(url, { ...opts, method: 'PATCH', body });

api.delete = <T = unknown>(url: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
  api<T>(url, { ...opts, method: 'DELETE' });
