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
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, string[]>;

  constructor(status: number, code: string, message?: string, details?: Record<string, string[]>) {
    super(message ?? code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Serialize cho JSON response trong route handlers. */
  toJSON(): ApiErrorBody {
    return {
      error: this.code,
      ...(this.message !== this.code && { message: this.message }),
      ...(this.details && { details: this.details })
    };
  }
}

// ─── Predefined errors ───────────────────────────────────────────────────────

export const ERRORS = {
  VALIDATION: (details: Record<string, string[]>) =>
    new ApiError(422, 'validation_error', 'Input validation failed', details),

  NOT_FOUND: (resource = 'resource') =>
    new ApiError(404, 'not_found', `${resource} not found`),

  UNAUTHORIZED: () =>
    new ApiError(401, 'unauthorized', 'Authentication required'),

  FORBIDDEN: () =>
    new ApiError(403, 'forbidden', 'Insufficient permissions'),

  NETWORK: () =>
    new ApiError(0, 'network_error', 'Network request failed'),

  INTERNAL: (message = 'Internal server error') =>
    new ApiError(500, 'internal_error', message)
} as const;
