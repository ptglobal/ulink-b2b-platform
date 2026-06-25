'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  Package,
  User,
  MapPin,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Mail,
  Phone,
  FileBox,
  Calendar,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SampleRequest } from '@/lib/directus';

interface Props {
  id: string;
  locale: string;
}

export function MySampleRequestDetail({ id, locale }: Props) {
  const t = useTranslations('sampleRequest.myRequests');
  const router = useRouter();

  const [request, setRequest] = useState<SampleRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      try {
        const res = await fetch(`/api/sample-request/mine/${id}`);
        if (!res.ok) throw new Error('Not found');
        const payload = await res.json();
        setRequest(payload.data);
      } catch {
        setError(t('fetchError'));
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-20">
        <FileBox className="h-14 w-14 text-gray-200 mb-4" />
        <p className="text-gray-600 font-medium">{error ?? t('fetchError')}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToList')}
        </button>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; icon: typeof Clock; classes: string; bgClasses: string; borderColor: string }> = {
    pending: {
      label: t('pending'),
      icon: Clock,
      classes: 'text-amber-700',
      bgClasses: 'bg-amber-50 border-amber-200',
      borderColor: 'border-l-amber-400'
    },
    approved: {
      label: t('approved'),
      icon: CheckCircle2,
      classes: 'text-emerald-700',
      bgClasses: 'bg-emerald-50 border-emerald-200',
      borderColor: 'border-l-emerald-400'
    },
    rejected: {
      label: t('rejected'),
      icon: XCircle,
      classes: 'text-rose-700',
      bgClasses: 'bg-rose-50 border-rose-200',
      borderColor: 'border-l-rose-400'
    }
  };

  const status = request.status ?? 'pending';
  const sc = statusConfig[status];
  const StatusIcon = sc?.icon ?? Clock;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat" />
        </div>
        <div className="relative container mx-auto px-4 py-8 lg:py-10">
          {/* Back link */}
          <button
            onClick={() => router.push(`/${locale}/sample-requests`)}
            className="inline-flex items-center gap-2 text-sm text-indigo-200 hover:text-white transition-colors mb-5"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('backToList')}
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                <span>{t('detail')}</span>
                <span className="text-indigo-300 font-mono text-lg">#{request.id}</span>
              </h1>
              {request.date_created && (
                <div className="flex items-center gap-2 mt-2 text-sm text-indigo-200">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    {new Date(request.date_created).toLocaleDateString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Status badge */}
            <div className={cn('inline-flex items-center gap-2 rounded-xl border px-5 py-2.5', sc?.bgClasses)}>
              <StatusIcon className={cn('h-5 w-5', sc?.classes)} />
              <span className={cn('text-sm font-bold', sc?.classes)}>{sc?.label}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 -mt-2">
        <div className="space-y-5">
          {/* Status message (approval note or reject reason) */}
          {status === 'approved' && request.approval_note && (
            <div className={cn('rounded-xl border border-l-4 p-5 bg-emerald-50 border-emerald-200', sc?.borderColor)}>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">{t('approvalNote')}</p>
                  <p className="text-sm text-emerald-700 mt-1 leading-relaxed">{request.approval_note}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'rejected' && request.reject_reason && (
            <div className={cn('rounded-xl border border-l-4 p-5 bg-rose-50 border-rose-200', sc?.borderColor)}>
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-rose-800">{t('rejectReason')}</p>
                  <p className="text-sm text-rose-700 mt-1 leading-relaxed">{request.reject_reason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left column: Product + Contact */}
            <div className="lg:col-span-2 space-y-5">
              {/* Product info card */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <Package className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-semibold text-gray-900">{t('product')}</h2>
                </div>
                <div className="px-5 py-4">
                  <p className="text-base font-semibold text-gray-900">{request.product_slug}</p>
                  {request.skus && request.skus.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {request.skus.map((sku) => (
                        <span
                          key={sku}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-100 px-2.5 py-1 text-xs font-mono text-indigo-700"
                        >
                          <Hash className="h-3 w-3 opacity-50" />
                          {sku}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact info card */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <User className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-semibold text-gray-900">{t('contactInfo')}</h2>
                </div>
                <div className="px-5 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem icon={User} label={t('contactName')} value={request.contact_name} />
                    <InfoItem icon={Mail} label={t('email')} value={request.email} />
                    <InfoItem icon={Building2} label={t('company')} value={request.company} />
                    <InfoItem icon={Phone} label={t('phone')} value={request.phone} />
                  </div>
                </div>
              </div>

              {/* Message card (if present) */}
              {request.message && (
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <MessageSquare className="h-4 w-4 text-indigo-600" />
                    <h2 className="text-sm font-semibold text-gray-900">{t('message')}</h2>
                  </div>
                  <div className="px-5 py-4">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{request.message}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: Address */}
            <div className="space-y-5">
              {/* Address card */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <MapPin className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-semibold text-gray-900">{t('address')}</h2>
                </div>
                <div className="px-5 py-4 space-y-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">{t('province')}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{request.province}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">{t('district')}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{request.district}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">{t('addressDetail')}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{request.address_detail}</p>
                  </div>
                </div>
              </div>

              {/* Quick status timeline (visual) */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                  <Clock className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-semibold text-gray-900">{t('status')}</h2>
                </div>
                <div className="px-5 py-4">
                  <div className="space-y-3">
                    {/* Submitted */}
                    <TimelineStep
                      icon={Package}
                      label={t('submitted')}
                      date={request.date_created}
                      active
                    />
                    {/* Processing */}
                    <TimelineStep
                      icon={Clock}
                      label={t('processing')}
                      active={status === 'pending' || status === 'approved' || status === 'rejected'}
                      current={status === 'pending'}
                    />
                    {/* Result */}
                    {status === 'approved' && (
                      <TimelineStep
                        icon={CheckCircle2}
                        label={t('approved')}
                        active
                        success
                      />
                    )}
                    {status === 'rejected' && (
                      <TimelineStep
                        icon={XCircle}
                        label={t('rejected')}
                        active
                        error
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mt-0.5">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5 break-all">{value}</p>
      </div>
    </div>
  );
}

function TimelineStep({
  icon: Icon,
  label,
  date,
  active,
  current,
  success,
  error
}: {
  icon: typeof Clock;
  label: string;
  date?: string | null;
  active?: boolean;
  current?: boolean;
  success?: boolean;
  error?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn(
        'shrink-0 w-7 h-7 rounded-full flex items-center justify-center border',
        current && 'bg-amber-50 border-amber-300',
        success && 'bg-emerald-50 border-emerald-300',
        error && 'bg-rose-50 border-rose-300',
        !current && !success && !error && active && 'bg-blue-50 border-blue-300',
        !active && 'bg-gray-50 border-gray-200'
      )}>
        <Icon className={cn(
          'h-3.5 w-3.5',
          current && 'text-amber-600',
          success && 'text-emerald-600',
          error && 'text-rose-600',
          !current && !success && !error && active && 'text-blue-600',
          !active && 'text-gray-300'
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-xs font-medium',
          active ? 'text-gray-900' : 'text-gray-400'
        )}>
          {label}
        </p>
        {date && (
          <p className="text-[10px] text-gray-400">
            {new Date(date).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </p>
        )}
      </div>
      {current && (
        <span className="shrink-0 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      )}
    </div>
  );
}
