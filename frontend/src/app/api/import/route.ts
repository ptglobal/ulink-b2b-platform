import { errorJson, successJson } from '@/lib/api-response-next';
import {
  parseCommercialImportRequest,
  type CommercialImportSummary,
  normalizeCommercialImportMode
} from '@/lib/commercial-import';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';

const DIRECTUS_URL = getDirectusUrl();

function readUpstreamError(payload: unknown): {
  message: string;
  details?: Record<string, unknown>;
} {
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (typeof record.error === 'string') {
      return {
        message: record.error,
        ...(record.details && typeof record.details === 'object'
          ? { details: record.details as Record<string, unknown> }
          : {})
      };
    }

    if (typeof record.message === 'string') {
      return {
        message: record.message,
        ...(record.details && typeof record.details === 'object'
          ? { details: record.details as Record<string, unknown> }
          : {})
      };
    }
  }

  return { message: 'Commercial import failed.' };
}

async function proxyCommercialImport(req: Request): Promise<Response> {
  const submission = await parseCommercialImportRequest(req);
  const mode = normalizeCommercialImportMode(submission.mode);
  const cookie = req.headers.get('cookie');
  const authorization = req.headers.get('authorization');

  const response = await fetch(`${DIRECTUS_URL}/commercial-import/${mode}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { cookie } : {}),
      ...(authorization ? { authorization } : {})
    },
    body: JSON.stringify({
      collection: submission.collection,
      csvText: submission.csvText,
      allowPartial: submission.allowPartial === true
    })
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const upstreamError = readUpstreamError(payload);
    return errorJson(
      response.status,
      'COMMERCIAL_IMPORT_FAILED',
      upstreamError.message,
      upstreamError.details
    );
  }

  const data =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data?: CommercialImportSummary }).data
      : payload;
  return successJson(data);
}

export async function POST(req: Request) {
  try {
    return await proxyCommercialImport(req);
  } catch (error) {
    console.error('Commercial import proxy failed', error);
    return errorJson(
      400,
      'BAD_REQUEST',
      error instanceof Error ? error.message : 'Commercial import failed.'
    );
  }
}
