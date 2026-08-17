import { NextResponse } from 'next/server';
import type { ZodSchema } from 'zod';
import { ApiError, type ApiErrorBody } from '@/lib/api-error';

/**
 * Route handler utilities — giảm boilerplate cho tất cả API routes.
 *
 * Pattern:
 *   export async function POST(req: Request) {
 *     return handleRoute(req, { schema: rfqSchema }, async (data) => {
 *       const result = await directus.request(createItem('rfq', data));
 *       return { ok: true, id: result.id };
 *     });
 *   }
 */

// ─── Success response ────────────────────────────────────────────────────────

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonCreated<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function jsonNoContent() {
  return new NextResponse(null, { status: 204 });
}

// ─── Error response ──────────────────────────────────────────────────────────

export function jsonError(error: ApiError) {
  return NextResponse.json(error.toJSON(), { status: error.status });
}

export function jsonErrorRaw(
  status: number,
  code: string,
  message?: string,
  details?: Record<string, string[]>
) {
  const body: ApiErrorBody = {
    error: code,
    ...(message && { message }),
    ...(details && { details })
  };
  return NextResponse.json(body, { status });
}

// ─── Unified route handler ───────────────────────────────────────────────────

interface RouteOptions<T> {
  /** Zod schema để validate request body. Bỏ qua cho GET requests. */
  schema?: ZodSchema<T>;
}

/**
 * Wrap một route handler với:
 * - JSON parse (catch malformed body)
 * - Zod validation (nếu có schema)
 * - Error handling nhất quán (ApiError → JSON response)
 * - Unknown errors → 500
 */
export async function handleRoute<T = unknown>(
  req: Request,
  options: RouteOptions<T>,
  handler: (data: T, req: Request) => Promise<NextResponse>
): Promise<NextResponse> {
  const { schema } = options;

  let body: unknown = undefined;

  // Parse body nếu có schema (POST/PUT/PATCH)
  if (schema) {
    try {
      body = await req.json();
    } catch {
      return jsonErrorRaw(400, 'invalid_json', 'Request body must be valid JSON');
    }

    const result = schema.safeParse(body);
    if (!result.success) {
      // Flatten zod errors → { field: [messages] }
      const details: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join('.') || '_root';
        if (!details[path]) details[path] = [];
        details[path].push(issue.message);
      }
      // Build a more descriptive top-level message so the user immediately sees
      // which field failed without having to dig into `details`.
      const firstField = Object.keys(details)[0] ?? '';
      const firstMsg = details[firstField]?.[0] ?? 'validation failed';
      const message =
        firstField && firstField !== '_root' ? `${firstField}: ${firstMsg}` : firstMsg;
      return jsonErrorRaw(422, 'validation_error', message, details);
    }

    body = result.data;
  }

  try {
    return await handler(body as T, req);
  } catch (err) {
    if (err instanceof ApiError) {
      return jsonError(err);
    }
    console.error('[Route Error]', err);
    return jsonErrorRaw(500, 'internal_error', 'Internal server error');
  }
}
