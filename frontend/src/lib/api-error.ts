/**
 * Unified API error model (SPEC-04).
 *
 * Mọi route handler trả lỗi theo format này → client chỉ cần xử lý 1 shape.
 * Client-side cũng dùng ApiError khi gọi fetch wrapper.
 */

export interface ApiErrorBody {
  error: string;
  message?: string;
  details?: Record<string, string[]>;
  /**
   * Optional structured context for the client. Use for things that should
   * drive UI without being squeezed into a localized `message` (e.g. the
   * change-password rate-limit returns `{ remaining, locked, lockedUntil,
   * ttlSeconds }` here so the form can show a live countdown and an
   * attempts-left hint).
   */
  payload?: Record<string, unknown>;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string[]>;
  payload?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message?: string,
    details?: Record<string, string[]>,
    payload?: Record<string, unknown>
  ) {
    super(message ?? code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.payload = payload;
  }

  /** Serialize cho JSON response trong route handlers. */
  toJSON(): ApiErrorBody {
    return {
      error: this.code,
      ...(this.message !== this.code && { message: this.message }),
      ...(this.details && { details: this.details }),
      ...(this.payload && Object.keys(this.payload).length > 0 && { payload: this.payload })
    };
  }
}

// ─── Predefined errors ───────────────────────────────────────────────────────

export const ERRORS = {
  VALIDATION: (details: Record<string, string[]>) =>
    new ApiError(422, 'validation_error', 'Input validation failed', details),

  NOT_FOUND: (resource = 'resource') => new ApiError(404, 'not_found', `${resource} not found`),

  UNAUTHORIZED: () => new ApiError(401, 'unauthorized', 'Authentication required'),

  FORBIDDEN: () => new ApiError(403, 'forbidden', 'Insufficient permissions'),

  NETWORK: () => new ApiError(0, 'network_error', 'Network request failed'),

  INTERNAL: (message = 'Internal server error') => new ApiError(500, 'internal_error', message)
} as const;
