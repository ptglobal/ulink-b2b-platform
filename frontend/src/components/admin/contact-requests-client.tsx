'use client';

import React, { useMemo, useState } from 'react';
import { Search, Mail, CalendarClock, ArrowRight } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import type { ContactRequest } from '@/lib/directus';

interface ContactRequestsClientProps {
  initialRequests: ContactRequest[];
  error?: string;
}

export function ContactRequestsClient({ initialRequests, error }: ContactRequestsClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return initialRequests;

    return initialRequests.filter((request) => {
      const haystack = [
        request.full_name,
        request.email,
        request.phone,
        request.subject,
        request.message
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [initialRequests, searchQuery]);

  const openDetail = (id: number | string | undefined) => {
    if (id === undefined || id === null) return;
    router.push(`/admin/contact-requests/${id}`);
  };

  const getStatusMeta = (status?: ContactRequest['status']) => {
    if (status === 'read') {
      return { label: 'Đã đọc', classes: 'bg-emerald-50 text-emerald-700' };
    }
    return { label: 'Chưa đọc', classes: 'bg-amber-50 text-amber-700' };
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
            Hộp thư chăm sóc khách hàng
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight mt-1">
            Liên hệ gửi về
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Xem toàn bộ thông tin khách hàng gửi từ form liên hệ trên website.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-sm">
          <div className="flex-1">
            <span className="font-extrabold text-rose-900 block mb-1">
              Đã xảy ra lỗi khi tải danh sách liên hệ
            </span>
            <pre className="font-mono text-[11px] bg-white/60 p-2.5 rounded-lg mt-2 overflow-x-auto border border-rose-100/50 max-h-40 whitespace-pre-wrap select-all">
              {error}
            </pre>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại, chủ đề..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          {filteredRequests.length} liên hệ
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="h-12 w-12 text-slate-300 mb-3" />
            <span className="text-sm font-extrabold text-[#0F1E36]">
              Chưa có liên hệ nào
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Hệ thống sẽ hiển thị các tin nhắn khách gửi về tại đây.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Người gửi</th>
                  <th className="px-6 py-4">Liên hệ</th>
                  <th className="px-6 py-4">Chủ đề</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4 text-right">Xem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => openDetail(request.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openDetail(request.id);
                      }
                    }}
                    className="cursor-pointer hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-[#0F1E36] leading-tight">
                          {request.full_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1">
                          #{request.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-650 font-medium">{request.email}</span>
                        <span className="text-slate-400 font-medium text-[11px]">{request.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex max-w-[260px] rounded-full bg-cyan-50 px-2.5 py-0.5 text-[10px] font-bold text-cyan-700">
                        {request.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                          getStatusMeta(request.status).classes
                        )}
                      >
                        {getStatusMeta(request.status).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                        {request.created_at ? new Date(request.created_at).toLocaleString('vi-VN') : '---'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                        Đọc chi tiết
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
