export interface SuccessPayload<T = unknown, M = unknown> {
  success: true;
  data: T;
  meta?: M;
}

export interface ErrorPayload<D = unknown> {
  success: false;
  error: {
    code: string;
    message: string;
    details?: D;
    timestamp: string;
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function buildSuccessPayload<T = unknown, M = unknown>(
  data: T,
  meta?: M
): SuccessPayload<T, M> | T {
  if (isObject(data) && typeof data.success === 'boolean') {
    return data;
  }

  const payload: SuccessPayload<T, M> = {
    success: true,
    data
  };

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return payload;
}

export function buildErrorPayload<D = unknown>(
  code: string,
  message: string,
  details?: D
): ErrorPayload<D> {
  const error: ErrorPayload<D>['error'] = {
    code,
    message,
    timestamp: new Date().toISOString()
  };

  if (details !== undefined) {
    error.details = details;
  }

  return {
    success: false,
    error
  };
}
