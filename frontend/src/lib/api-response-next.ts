import { NextResponse } from 'next/server';
import { buildErrorPayload, buildSuccessPayload } from './api-response';

export interface SuccessJsonOptions<M = unknown> {
  meta?: M;
  init?: ResponseInit;
}

export function successJson<T = unknown, M = unknown>(
  data: T,
  options: SuccessJsonOptions<M> = {}
): NextResponse {
  const { meta, init } = options;
  return NextResponse.json(buildSuccessPayload(data, meta), init);
}

export function errorJson<D = unknown>(
  status: number,
  code: string,
  message: string,
  details?: D
): NextResponse {
  return NextResponse.json(buildErrorPayload(code, message, details), { status });
}
