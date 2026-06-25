import { NextResponse } from 'next/server';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';

/**
 * GET /api/files/[id]
 * Proxy Directus file assets through Next.js to avoid exposing tokens
 * and to handle Directus auth requirements for file access.
 * Supports ?download query param to trigger browser download.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing file ID' }, { status: 400 });
  }

  const directusUrl = getDirectusUrl();
  const token = process.env.DIRECTUS_TOKEN;
  const url = new URL(req.url);
  const isDownload = url.searchParams.has('download');

  // Build Directus asset URL with access_token for reliable public access
  const assetUrlObj = new URL(`/assets/${id}`, directusUrl);
  if (token) {
    assetUrlObj.searchParams.set('access_token', token);
  }
  if (isDownload) {
    assetUrlObj.searchParams.set('download', '');
  }
  const assetUrl = assetUrlObj.toString();

  try {
    const response = await fetch(assetUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: 'File not found or inaccessible' },
        { status: response.status }
      );
    }

    // Read full body as buffer for reliable delivery
    const buffer = await response.arrayBuffer();

    const responseHeaders = new Headers();
    const contentType = response.headers.get('content-type');
    const contentDisposition = response.headers.get('content-disposition');

    if (contentType) responseHeaders.set('Content-Type', contentType);
    if (contentDisposition) responseHeaders.set('Content-Disposition', contentDisposition);
    responseHeaders.set('Content-Length', String(buffer.byteLength));
    responseHeaders.set('Cache-Control', 'public, max-age=3600, immutable');

    return new NextResponse(buffer, {
      status: 200,
      headers: responseHeaders
    });
  } catch (err) {
    console.error('File proxy failed:', err);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 502 }
    );
  }
}
