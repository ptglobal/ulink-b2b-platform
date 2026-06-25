'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, Package, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { SampleRequest } from '@/lib/directus';

interface SampleRequestsClientProps {
  locale: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export function SampleRequestsClient({ locale }: SampleRequestsClientProps) {
  const t = useTranslations('sampleRequest.admin');
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
      const res = await fetch('/api/sample-request');
      if (!res.ok) throw new Error('Failed to fetch');
      const payload = await res.json();
      setRequests(payload.data ?? []);
    } catch {
      setError('Failed to load sample requests');
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
          r.contact_name.toLowerCase().includes(q) ||
          r.company.toLowerCase().includes(q)
      );
    }

    return list;
  }, [requests, statusFilter, searchQuery]);

  const statusConfig: Record<string, { label: string; classes: string }> = {
    pending: { label: t('pending'), classes: 'bg-yellow-100 text-yellow-800' },
    approved: { label: t('approved'), classes: 'bg-green-100 text-green-800' },
    rejected: { label: t('rejected'), classes: 'bg-red-100 text-red-800' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-primary">Admin</p>
        <h1 className="text-2xl font-bold mt-1">{t('listTitle')}</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full rounded-lg border border-gray-300 bg-white pl-9 pr-8 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-colors appearance-none"
          >
            <option value="all">{t('all')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="approved">{t('approved')}</option>
            <option value="rejected">{t('rejected')}</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16 text-red-600">
          <p>{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mb-3 opacity-50" />
          <p>{t('noResults')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white dark:bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left font-medium">{t('requestId')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('customerName')}</th>
                <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">{t('createdAt')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((req) => {
                const sc = statusConfig[req.status ?? 'pending'];
                return (
                  <tr
                    key={req.id}
                    onClick={() => router.push(`/${locale}/admin/sample-requests/${req.id}`)}
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs">#{req.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{req.contact_name}</div>
                      <div className="text-xs text-muted-foreground">{req.company}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                      {req.date_created
                        ? new Date(req.date_created).toLocaleDateString(locale, {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', sc?.classes)}>
                        {sc?.label ?? req.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
