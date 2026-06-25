'use client';

import { useEffect, useState, useMemo } from 'react';
import { Search, Loader2, Package, Clock, CheckCircle2, XCircle, Eye, ChevronRight, FileBox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import type { SampleRequest } from '@/lib/directus';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export function MySampleRequestsClient() {
  const t = useTranslations('sampleRequest.myRequests');
  const locale = useLocale();
  const router = useRouter();

  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sample-request/mine');
      if (!res.ok) throw new Error('Failed to fetch');
      const payload = await res.json();
      setRequests(payload.data ?? []);
    } catch {
      setError(t('fetchError'));
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let list = requests;

    if (statusFilter !== 'all') {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          String(r.id).toLowerCase().includes(q) ||
          r.product_slug.toLowerCase().includes(q) ||
          r.contact_name?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [requests, statusFilter, searchQuery]);

  const statusConfig: Record<string, { label: string; icon: typeof Clock; classes: string; dotColor: string }> = {
    pending: {
      label: t('pending'),
      icon: Clock,
      classes: 'text-amber-700 bg-amber-50 border-amber-200',
      dotColor: 'bg-amber-400'
    },
    approved: {
      label: t('approved'),
      icon: CheckCircle2,
      classes: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      dotColor: 'bg-emerald-400'
    },
    rejected: {
      label: t('rejected'),
      icon: XCircle,
      classes: 'text-rose-700 bg-rose-50 border-rose-200',
      dotColor: 'bg-rose-400'
    }
  };

  // Count by status
  const counts = useMemo(() => {
    const c = { all: requests.length, pending: 0, approved: 0, rejected: 0 };
    requests.forEach((r) => {
      if (r.status === 'pending') c.pending++;
      else if (r.status === 'approved') c.approved++;
      else if (r.status === 'rejected') c.rejected++;
    });
    return c;
  }, [requests]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-repeat" />
        </div>
        <div className="relative container mx-auto px-4 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {t('title')}
              </h1>
              <p className="mt-2 text-indigo-200 text-sm lg:text-base">
                {t('subtitle')}
              </p>
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
                  <p className="text-lg font-bold text-white">{counts.approved}</p>
                  <p className="text-[10px] text-indigo-200">{t('approved')}</p>
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
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  statusFilter === s
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {s === 'all' ? t('all') : t(s)}
                <span className="ml-1 text-[10px] opacity-60">
                  {counts[s]}
                </span>
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
              const status = req.status ?? 'pending';
              const sc = statusConfig[status];
              const StatusIcon = sc?.icon ?? Clock;

              return (
                <div
                  key={req.id}
                  className="group flex flex-col sm:flex-row sm:items-center gap-4 bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 hover:shadow-md hover:border-blue-200 transition-all"
                >
                  {/* Left: icon + info */}
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                      <Package className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {req.product_slug}
                        </h3>
                        <span className="text-[11px] font-mono text-gray-400">
                          #{req.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                        {req.contact_name && (
                          <span>{req.contact_name}</span>
                        )}
                        {req.company && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                            <span>{req.company}</span>
                          </>
                        )}
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
                      {req.skus && req.skus.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {req.skus.slice(0, 3).map((sku) => (
                            <span
                              key={sku}
                              className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono text-gray-600"
                            >
                              {sku}
                            </span>
                          ))}
                          {req.skus.length > 3 && (
                            <span className="text-[10px] text-gray-400">
                              +{req.skus.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: status + action */}
                  <div className="flex items-center gap-3 sm:shrink-0">
                    {/* Status badge */}
                    <div className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1',
                      sc?.classes
                    )}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{sc?.label}</span>
                    </div>

                    {/* View detail button */}
                    <button
                      onClick={() => router.push(`/${locale}/sample-requests/${req.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all shadow-sm"
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
    </div>
  );
}
