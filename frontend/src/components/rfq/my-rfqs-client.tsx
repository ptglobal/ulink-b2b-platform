'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Loader2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronRight,
  FileBox,
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Factory,
  MessageSquare,
  Package,
  Truck,
  Calendar
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

interface RfqItem {
  id: number | string;
  company: string;
  contact_name: string;
  email: string;
  phone?: string;
  hub?: { id: number | string; name: string } | null;
  industry?: string;
  message?: string;
  line_items?: Array<{ sku: string; qty: number }>;
  status?: string;
  source?: 'web' | 'portal';
  scheduled_delivery?: boolean;
  requested_delivery_date?: string;
  date_created?: string;
  approval_note?: string | null;
  reject_reason?: string | null;
}

type StatusFilter = 'all' | 'pending' | 'quoted' | 'rejected';

export function MyRfqsClient() {
  const t = useTranslations('myRfqs');

  const [requests, setRequests] = useState<RfqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedRfq, setSelectedRfq] = useState<RfqItem | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rfq/mine');
      if (!res.ok) throw new Error('Failed to fetch');
      const payload = await res.json();
      setRequests(payload.data ?? []);
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }

  function normalizeStatus(s?: string): 'pending' | 'quoted' | 'rejected' {
    if (s === 'quoted' || s === 'won') return 'quoted';
    if (s === 'lost' || s === 'rejected') return 'rejected';
    return 'pending';
  }

  const filtered = useMemo(() => {
    let list = requests;

    if (statusFilter !== 'all') {
      list = list.filter((r) => normalizeStatus(r.status) === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          String(r.id).toLowerCase().includes(q) ||
          r.company?.toLowerCase().includes(q) ||
          r.contact_name?.toLowerCase().includes(q) ||
          r.line_items?.some((li) => li.sku.toLowerCase().includes(q))
      );
    }

    return list;
  }, [requests, statusFilter, searchQuery]);

  const statusConfig: Record<string, { label: string; icon: typeof Clock; classes: string }> = {
    pending: {
      label: t('pending'),
      icon: Clock,
      classes: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    quoted: {
      label: t('quoted'),
      icon: CheckCircle2,
      classes: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    rejected: {
      label: t('rejected'),
      icon: XCircle,
      classes: 'text-rose-700 bg-rose-50 border-rose-200'
    }
  };

  const counts = useMemo(() => {
    const c = { all: requests.length, pending: 0, quoted: 0, rejected: 0 };
    requests.forEach((r) => {
      const ns = normalizeStatus(r.status);
      c[ns]++;
    });
    return c;
  }, [requests]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-brand-deep via-brand-strong to-brand overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat" />
        </div>
        <div className="relative container mx-auto px-4 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">{t('title')}</h1>
              <p className="mt-2 text-indigo-200 text-sm lg:text-base">{t('subtitle')}</p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <Clock className="h-4 w-4 text-amber-300" />
                <div>
                  <p className="text-lg font-bold text-white">{counts.pending}</p>
                  <p className="text-[10px] text-indigo-200">{t('pending')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                <div>
                  <p className="text-lg font-bold text-white">{counts.quoted}</p>
                  <p className="text-[10px] text-indigo-200">{t('quoted')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
                <XCircle className="h-4 w-4 text-rose-300" />
                <div>
                  <p className="text-lg font-bold text-white">{counts.rejected}</p>
                  <p className="text-[10px] text-indigo-200">{t('rejected')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6 bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none transition-[color,background-color,border-color,box-shadow,opacity,transform]"
            />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'pending', 'quoted', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-[color,background-color,border-color,box-shadow,opacity,transform]',
                  statusFilter === s
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {t(s)}
                <span className="ml-1 text-[10px] opacity-60">{counts[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
            <FileBox className="h-14 w-14 text-gray-200 mb-4" />
            <p className="text-gray-600 font-medium">{t('noResults')}</p>
            <p className="text-gray-400 text-sm mt-1">{t('noResultsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => {
              const ns = normalizeStatus(req.status);
              const sc = statusConfig[ns];
              const StatusIcon = sc?.icon ?? Clock;

              return (
                <div
                  key={req.id}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 hover:shadow-md hover:border-blue-200 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
                >
                  {/* Left: icon + info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {req.company}
                        </h3>
                        <span className="text-[11px] font-mono text-gray-400">#{req.id}</span>
                        {req.hub?.name && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            <MapPin className="h-2.5 w-2.5" />
                            {req.hub.name}
                          </span>
                        )}
                        {req.source && (
                          <span
                            className={cn(
                              'text-[10px] font-medium px-1.5 py-0.5 rounded',
                              req.source === 'portal'
                                ? 'bg-blue-50 text-blue-600'
                                : 'bg-gray-100 text-gray-500'
                            )}
                          >
                            {req.source}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        {req.contact_name && <span>{req.contact_name}</span>}
                        {req.date_created && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span>
                              {new Date(req.date_created).toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </span>
                          </>
                        )}
                      </div>
                      {req.line_items && req.line_items.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {req.line_items.slice(0, 3).map((li) => (
                            <span
                              key={li.sku}
                              className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-600"
                            >
                              {li.sku}
                            </span>
                          ))}
                          {req.line_items.length > 3 && (
                            <span className="text-[10px] text-gray-400">
                              +{req.line_items.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: status + action */}
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <div
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
                        sc?.classes
                      )}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{sc?.label}</span>
                    </div>

                    <button
                      onClick={() => setSelectedRfq(req)}
                      className="inline-flex min-h-11 items-center gap-1.5 border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 shadow-sm transition-[color,background-color,border-color,box-shadow,opacity,transform] hover:border-brand/25 hover:bg-brand/10 hover:text-brand"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t('viewDetail')}
                      <ChevronRight className="h-3 w-3 opacity-50" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRfq && <RfqDetailModal rfq={selectedRfq} onClose={() => setSelectedRfq(null)} />}
    </div>
  );
}

function RfqDetailModal({ rfq, onClose }: { rfq: RfqItem; onClose: () => void }) {
  const t = useTranslations('myRfqs.detail');

  const ns =
    rfq.status === 'quoted' || rfq.status === 'won'
      ? 'quoted'
      : rfq.status === 'lost' || rfq.status === 'rejected'
        ? 'rejected'
        : 'pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('title')}</h2>
            <p className="text-xs text-gray-500 mt-0.5">#{rfq.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Contact Info */}
          <section>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {t('contactInfo')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={Building2} label={t('company')} value={rfq.company} />
              <InfoRow icon={User} label={t('contact')} value={rfq.contact_name} />
              <InfoRow icon={Mail} label={t('email')} value={rfq.email} />
              <InfoRow icon={Phone} label={t('phone')} value={rfq.phone} />
            </div>
          </section>

          {/* Hub & Industry */}
          {(rfq.hub?.name || rfq.industry) && (
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rfq.hub?.name && <InfoRow icon={MapPin} label={t('hub')} value={rfq.hub.name} />}
                {rfq.industry && (
                  <InfoRow icon={Factory} label={t('industry')} value={rfq.industry} />
                )}
              </div>
            </section>
          )}

          {/* Message */}
          {rfq.message && (
            <section>
              <div className="flex items-start gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('message')}</p>
                  <p className="text-sm text-gray-700">{rfq.message}</p>
                </div>
              </div>
            </section>
          )}

          {/* Line Items */}
          {rfq.line_items && rfq.line_items.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                {t('lineItems')}
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-gray-500">
                        {t('sku')}
                      </th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 w-16">
                        {t('qty')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rfq.line_items.map((li, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-mono text-xs text-gray-700">{li.sku}</td>
                        <td className="px-3 py-2 text-right text-xs text-gray-600">{li.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Delivery */}
          {rfq.scheduled_delivery && (
            <section>
              <div className="flex items-start gap-2">
                <Truck className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('delivery')}</p>
                  <p className="text-sm text-gray-700">
                    {t('scheduledYes')}
                    {rfq.requested_delivery_date && (
                      <span className="ml-2 inline-flex items-center gap-1 text-blue-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(rfq.requested_delivery_date).toLocaleDateString('vi-VN')}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Status & Notes */}
          <section className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500">{t('status')}:</span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                  ns === 'quoted'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : ns === 'rejected'
                      ? 'text-rose-700 bg-rose-50 border-rose-200'
                      : 'text-amber-700 bg-amber-50 border-amber-200'
                )}
              >
                {ns === 'quoted' && <CheckCircle2 className="h-3 w-3" />}
                {ns === 'rejected' && <XCircle className="h-3 w-3" />}
                {ns === 'pending' && <Clock className="h-3 w-3" />}
                {ns === 'quoted'
                  ? t('//quoted')
                  : ns === 'rejected'
                    ? t('//rejected')
                    : t('//pending')}
              </span>
            </div>

            {rfq.approval_note && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-2">
                <p className="text-xs text-emerald-600 font-medium">{t('approvalNote')}</p>
                <p className="text-sm text-emerald-800 mt-0.5">{rfq.approval_note}</p>
              </div>
            )}

            {rfq.reject_reason && (
              <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 mb-2">
                <p className="text-xs text-rose-600 font-medium">{t('rejectReason')}</p>
                <p className="text-sm text-rose-800 mt-0.5">{rfq.reject_reason}</p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
              {rfq.source && (
                <span>
                  {t('source')}: {rfq.source}
                </span>
              )}
              {rfq.date_created && (
                <span>
                  {t('createdAt')}:{' '}
                  {new Date(rfq.date_created).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Building2;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[10px] text-gray-400 uppercase">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
      </div>
    </div>
  );
}
