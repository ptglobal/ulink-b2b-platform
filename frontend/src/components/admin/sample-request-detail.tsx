'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, CheckCircle, XCircle, User, MapPin, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { DISTRICTS, getProvinceName } from '@/data/vietnam-provinces';
import type { SampleRequest } from '@/lib/directus';

interface SampleRequestDetailProps {
  id: string;
  locale: string;
}

export function SampleRequestDetail({ id, locale }: SampleRequestDetailProps) {
  const t = useTranslations('sampleRequest.admin');
  const router = useRouter();

  const [request, setRequest] = useState<SampleRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [actionModal, setActionModal] = useState<'approve' | 'reject' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  async function fetchDetail() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sample-request/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const payload = await res.json();
      setRequest(payload.data ?? payload);
    } catch {
      setError('Failed to load sample request');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction() {
    if (!actionModal) return;
    if (actionModal === 'reject' && !actionNote.trim()) {
      setActionError(t('rejectReasonRequired'));
      return;
    }

    setActionLoading(true);
    setActionError(null);
    try {
      const body: Record<string, string> = { status: actionModal === 'approve' ? 'approved' : 'rejected' };
      if (actionModal === 'approve' && actionNote.trim()) {
        body.approval_note = actionNote.trim();
      }
      if (actionModal === 'reject') {
        body.reject_reason = actionNote.trim();
      }

      const res = await fetch(`/api/sample-request/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error('Failed to update');

      // Refresh
      await fetchDetail();
      setActionModal(null);
      setActionNote('');
    } catch {
      setActionError('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  }

  const provinceName = request?.province
    ? getProvinceName(request.province) ?? request.province
    : '';
  const districtName = request?.district
    ? DISTRICTS.find((d) => d.code === request.district)?.name ?? request.district
    : '';

  const statusConfig: Record<string, { label: string; classes: string }> = {
    pending: { label: t('pending'), classes: 'bg-yellow-100 text-yellow-800' },
    approved: { label: t('approved'), classes: 'bg-green-100 text-green-800' },
    rejected: { label: t('rejected'), classes: 'bg-red-100 text-red-800' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-600">
        <p>{error ?? 'Not found'}</p>
      </div>
    );
  }

  const sc = statusConfig[request.status ?? 'pending'];

  return (
    <div className="space-y-6">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/admin/sample-requests`)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToList')}
        </button>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('detail')}</h1>
          <p className="text-sm text-muted-foreground font-mono">#{request.id}</p>
        </div>
        <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-sm font-medium', sc?.classes)}>
          {sc?.label}
        </span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info */}
        <div className="rounded-xl border bg-white dark:bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b bg-muted/30">
            <User className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">{t('contactInfo')}</h3>
          </div>
          <dl className="p-5 space-y-3 text-sm">
            <InfoRow label={t('customerName')} value={request.contact_name} />
            <InfoRow label="Email" value={request.email} />
            <InfoRow label={t('customerName').replace('Tên', 'Công ty')} value={request.company} />
            <InfoRow label="Phone" value={request.phone} />
            {request.date_created && (
              <InfoRow
                label={t('createdAt')}
                value={new Date(request.date_created).toLocaleString(locale)}
              />
            )}
          </dl>
        </div>

        {/* Shipping Address */}
        <div className="rounded-xl border bg-white dark:bg-card shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b bg-muted/30">
            <MapPin className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">{t('shippingAddress')}</h3>
          </div>
          <dl className="p-5 space-y-3 text-sm">
            <InfoRow label="Tỉnh/Thành" value={provinceName} />
            <InfoRow label="Quận/Huyện" value={districtName} />
            <InfoRow label="Địa chỉ" value={request.address_detail} />
          </dl>
        </div>

        {/* Product Info */}
        <div className="rounded-xl border bg-white dark:bg-card shadow-sm overflow-hidden md:col-span-2">
          <div className="flex items-center gap-2 px-5 py-3 border-b bg-muted/30">
            <Box className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">{t('productInfo')}</h3>
          </div>
          <dl className="p-5 space-y-3 text-sm">
            <InfoRow label="Product Slug" value={request.product_slug} />
            {request.skus && request.skus.length > 0 && (
              <InfoRow label="SKUs" value={request.skus.join(', ')} />
            )}
            {request.message && (
              <InfoRow label="Message" value={request.message} />
            )}
          </dl>
        </div>

        {/* Notes */}
        {request.approval_note && (
          <div className="rounded-xl border bg-green-50 dark:bg-green-900/10 shadow-sm p-5 md:col-span-2">
            <p className="text-sm font-medium text-green-800 dark:text-green-400">
              {t('approveNote')}: {request.approval_note}
            </p>
          </div>
        )}
        {request.reject_reason && (
          <div className="rounded-xl border bg-red-50 dark:bg-red-900/10 shadow-sm p-5 md:col-span-2">
            <p className="text-sm font-medium text-red-800 dark:text-red-400">
              {t('rejectReason')}: {request.reject_reason}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons (only for pending) */}
      {request.status === 'pending' && (
        <div className="flex items-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => { setActionModal('approve'); setActionNote(''); setActionError(null); }}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            {t('approve')}
          </button>
          <button
            type="button"
            onClick={() => { setActionModal('reject'); setActionNote(''); setActionError(null); }}
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition-colors"
          >
            <XCircle className="h-4 w-4" />
            {t('reject')}
          </button>
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActionModal(null)} />
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-card shadow-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">
              {actionModal === 'approve' ? t('confirmApprove') : t('confirmReject')}
            </h3>

            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              rows={3}
              placeholder={actionModal === 'approve' ? t('approveNote') : t('rejectReason')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors resize-y mt-2"
            />

            {actionError && (
              <p className="mt-2 text-sm text-red-600">{actionError}</p>
            )}

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={actionLoading}
                className={cn(
                  'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors',
                  actionModal === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700',
                  actionLoading && 'opacity-50'
                )}
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {actionModal === 'approve' ? t('approve') : t('reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <dt className="w-1/3 text-muted-foreground font-medium shrink-0">{label}</dt>
      <dd className="w-2/3 break-words">{value}</dd>
    </div>
  );
}
