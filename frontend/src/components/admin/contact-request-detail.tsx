import { ArrowLeft, CalendarClock, Mail, MessageSquare, Phone, User } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import type { ContactRequest } from '@/lib/directus';
import { ContactRequestStatusToggle } from './contact-request-status-toggle';

interface ContactRequestDetailProps {
  request: ContactRequest;
  locale: string;
}

export function ContactRequestDetail({ request, locale }: ContactRequestDetailProps) {
  const createdAt = request.created_at
    ? new Date(request.created_at).toLocaleString(locale, {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : '---';
  const status = request.status ?? 'unread';
  const statusLabel = status === 'read' ? 'Đã đọc' : 'Chưa đọc';
  const statusClasses = status === 'read'
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-amber-50 text-amber-700';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/contact-requests"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
            Chi tiết liên hệ
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight mt-1">
            {request.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            #{request.id}
          </p>
          <span className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${statusClasses}`}>
            {statusLabel}
          </span>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 w-fit">
            <CalendarClock className="h-3.5 w-3.5" />
            {createdAt}
          </span>
          <ContactRequestStatusToggle id={Number(request.id)} currentStatus={status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Nội dung liên hệ</h2>
          </div>

          <div className="mt-5 space-y-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Chủ đề</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{request.subject}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Nội dung</p>
              <div className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
                {request.message}
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Thông tin người gửi</h2>
          </div>

          <dl className="mt-5 space-y-4 text-sm">
            <InfoRow label="Họ và tên" value={request.full_name} />
            <InfoRow label="Email" value={request.email} icon={<Mail className="h-3.5 w-3.5 text-slate-400" />} />
            <InfoRow label="Số điện thoại" value={request.phone} icon={<Phone className="h-3.5 w-3.5 text-slate-400" />} />
            <InfoRow label="Trạng thái" value={statusLabel} />
            <InfoRow label="Thời gian tạo" value={createdAt} icon={<CalendarClock className="h-3.5 w-3.5 text-slate-400" />} />
          </dl>
        </section>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3">
      <div className="mt-0.5">{icon ?? <span className="inline-block h-3.5 w-3.5" />}</div>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</dd>
      </div>
    </div>
  );
}
