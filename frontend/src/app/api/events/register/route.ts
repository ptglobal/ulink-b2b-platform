import { randomInt } from 'node:crypto';
import { createItem } from '@directus/sdk';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createWriteDirectusClient } from '@/lib/directus';
import { loadEventsContent } from '@/lib/events-content';

const registrationSchema = z.object({
  eventSlug: z.string().trim().min(1).max(120),
  eventTitle: z.string().trim().min(1).max(240),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(8).max(24),
  company: z.string().trim().min(2).max(180),
  jobTitle: z.string().trim().max(120).optional().or(z.literal('')),
  discoverySource: z.string().trim().max(120).optional().or(z.literal('')),
  note: z.string().trim().max(2000).optional().or(z.literal('')),
  consent: z.literal(true)
});

function createReferenceCode() {
  return `REG-${new Date().getFullYear()}-${String(randomInt(0, 100000)).padStart(5, '0')}`;
}

export async function POST(request: Request) {
  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Thông tin đăng ký chưa hợp lệ. Vui lòng kiểm tra các trường bắt buộc.' },
      { status: 400 }
    );
  }

  const content = await loadEventsContent();
  if (
    !content ||
    content.detail.slug !== parsed.data.eventSlug ||
    content.detail.title !== parsed.data.eventTitle
  ) {
    return NextResponse.json({ error: 'Sự kiện không tồn tại hoặc đã thay đổi.' }, { status: 404 });
  }

  const referenceCode = createReferenceCode();
  try {
    const client = createWriteDirectusClient();
    await client.request(
      createItem('event_registrations', {
        reference_code: referenceCode,
        event_slug: parsed.data.eventSlug,
        event_title: parsed.data.eventTitle,
        full_name: parsed.data.fullName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        company: parsed.data.company,
        job_title: parsed.data.jobTitle || null,
        discovery_source: parsed.data.discoverySource || null,
        note: parsed.data.note || null,
        consent: true,
        registration_status: 'pending',
        payment_status: 'pending'
      })
    );
  } catch (error) {
    console.error('Unable to create event registration', error);
    return NextResponse.json(
      { error: 'Hệ thống chưa thể tiếp nhận đăng ký. Vui lòng thử lại sau.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ referenceCode, status: 'pending' }, { status: 201 });
}
