import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const statusParam = url.searchParams.get('status');
  const status = statusParam ? Number(statusParam) : 200;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = null;
  }

  if (Number.isFinite(status) && status >= 400) {
    return NextResponse.json(
      {
        ok: false,
        status,
        received: body
      },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    status: 200,
    received: body
  });
}
