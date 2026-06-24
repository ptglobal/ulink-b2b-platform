'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  X,
  FileText,
  Eye,
  Loader2,
  Building2,
  User,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  Plus,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RfqRequest } from '@/lib/directus';
import type { AuthUser } from '@/lib/auth-helpers';

// Status labels & styles mapping
type MappedStatus = 'pending' | 'approved' | 'rejected';

function getStatusMapping(status: string | undefined): { label: string; type: MappedStatus; classes: string } {
  const norm = (status || '').toLowerCase();
  if (norm === 'quoted' || norm === 'won') {
    return {
      label: 'Duyệt',
      type: 'approved',
      classes: 'bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
    };
  }
  if (norm === 'lost') {
    return {
      label: 'Từ chối',
      type: 'rejected',
      classes: 'bg-rose-50 text-rose-700 border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
    };
  }
  return {
    label: 'Đang chờ',
    type: 'pending',
    classes: 'bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
  };
}

export function RfqsClient({ user }: { user: AuthUser | null }) {
  const [rfqs, setRfqs] = useState<RfqRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Metadata
  const [customerMeta, setCustomerMeta] = useState<{
    customer: any;
    hubs: Array<{ id: number; name: string; slug: string }>;
    industries: Array<{ id: number; name: string; slug: string }>;
    skus: Array<{ id: number; sku_code: string; unit: string; pack_size: string }>;
  } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MappedStatus>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | '7days' | '30days' | 'thismonth'>('all');

  // Detail Modal
  const [selectedRfq, setSelectedRfq] = useState<RfqRequest | null>(null);

  // Action Modal State
  const [actionModalType, setActionModalType] = useState<'approve' | 'reject' | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Create Request Modal & Form States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formCompany, setFormCompany] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formHub, setFormHub] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formScheduled, setFormScheduled] = useState(false);
  const [formDeliveryDate, setFormDeliveryDate] = useState('');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [formFieldErrors, setFormFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  async function fetchRfqs() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/rfq');
      if (!res.ok) {
        throw new Error('Không thể tải danh sách RFQ. Vui lòng thử lại sau.');
      }
      const json = await res.json();
      setRfqs(json.data || []);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = await fetch('/api/customer');
        if (res.ok) {
          const json = await res.json();
          setCustomerMeta(json);
        }
      } catch (err) {
        console.error('Failed to fetch customer metadata', err);
      }
    }

    fetchRfqs();
    fetchMeta();
  }, []);

  const openCreateModal = () => {
    setFormCompany(customerMeta?.customer?.company_name || '');
    setFormContact(customerMeta?.customer?.contact_name || (user?.last_name || user?.first_name ? `${user.last_name ?? ''} ${user.first_name ?? ''}`.trim() : ''));
    setFormEmail(customerMeta?.customer?.email || user?.email || '');
    setFormPhone(customerMeta?.customer?.phone || '');
    setFormAddress(customerMeta?.customer?.address || '');
    setFormHub(customerMeta?.customer?.hub ? String(customerMeta.customer.hub) : '');
    setFormIndustry(customerMeta?.customer?.industry || '');
    setFormMessage('');
    setFormScheduled(false);
    setFormDeliveryDate('');
    setFormError(null);
    setFormFieldErrors({});
    setIsCreateOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errors: Record<string, string> = {};

    if (!formCompany.trim()) errors.company = 'Tên công ty là bắt buộc.';
    if (!formContact.trim()) errors.contact = 'Người liên hệ là bắt buộc.';
    if (!formEmail.trim()) {
      errors.email = 'Email là bắt buộc.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      errors.email = 'Email không đúng định dạng.';
    }
    if (!formPhone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc.';
    } else if (!/^[0-9+\s()-]{8,20}$/.test(formPhone.trim().replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại phải có độ dài từ 8 đến 20 số.';
    }
    if (!formAddress.trim()) {
      errors.address = 'Địa chỉ là bắt buộc.';
    }
    if (!formHub) {
      errors.hub = 'Hub khu vực là bắt buộc.';
    }
    if (!formIndustry) {
      errors.industry = 'Ngành nghề là bắt buộc.';
    }

    if (formScheduled) {
      if (!formDeliveryDate) {
        errors.requested_delivery_date = 'Ngày giao hàng mong muốn là bắt buộc.';
      } else {
        const dateVal = new Date(formDeliveryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const parsedDate = new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate());
        if (parsedDate.getTime() < today.getTime()) {
          errors.requested_delivery_date = 'Ngày giao hàng mong muốn phải ở hiện tại hoặc tương lai.';
        }
      }
    }


    if (Object.keys(errors).length > 0) {
      setFormFieldErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: formCompany.trim(),
          contact: formContact.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          address: formAddress.trim(),
          hub: parseInt(formHub),
          industry: formIndustry,
          message: formMessage.trim(),
          scheduled_delivery: formScheduled,
          requested_delivery_date: formScheduled ? formDeliveryDate : undefined,
          source: 'portal'
        })
      });

      const json = await res.json();
      if (!res.ok) {
        const errObj = json.error || {};
        const errCode = errObj.code || json.error;
        const errMessage = errObj.message || json.message;
        const errDetails = errObj.details || json.details;

        if (errCode === 'UNPROCESSABLE_ENTITY' && errDetails) {
          const fieldErrs: Record<string, string> = {};
          if (errDetails.missingFields) {
            errDetails.missingFields.forEach((f: string) => {
              fieldErrs[f] = 'Trường này là bắt buộc.';
            });
          }
          if (errDetails.invalidFields) {
            Object.entries(errDetails.invalidFields).forEach(([f, codes]: any) => {
              fieldErrs[f] = `Giá trị không hợp lệ: ${codes.join(', ')}`;
            });
          }
          setFormFieldErrors(fieldErrs);
          throw new Error(errMessage || 'Yêu cầu không hợp lệ.');
        }
        throw new Error(errMessage || 'Có lỗi xảy ra khi gửi yêu cầu.');
      }

      setIsCreateOpen(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 5000);
      try {
        localStorage.removeItem('rfq-cart');
        window.dispatchEvent(new Event('rfq-cart-changed'));
      } catch (e) {
        console.error('Failed to clear rfq-cart', e);
      }
      await fetchRfqs();
    } catch (err: any) {
      setFormError(err.message || 'Gửi yêu cầu báo giá thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;
    
    if (actionModalType === 'reject' && !actionNote.trim()) {
      setActionError('Vui lòng nhập lý do từ chối.');
      return;
    }

    setActionError(null);
    setActionSubmitting(true);

    try {
      const payload: any = {
        status: actionModalType === 'approve' ? 'approved' : 'rejected'
      };
      if (actionModalType === 'approve') {
        payload.approval_note = actionNote.trim() || null;
      } else {
        payload.reject_reason = actionNote.trim();
      }

      const res = await fetch(`/api/rfq/${selectedRfq.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || 'Cập nhật trạng thái thất bại.');
      }

      // Success
      setActionModalType(null);
      setSelectedRfq(null); // Close details modal too
      await fetchRfqs();
    } catch (err: any) {
      setActionError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setActionSubmitting(false);
    }
  };

  // Filter logic
  const filteredRfqs = useMemo(() => {
    return rfqs.filter((rfq) => {
      // 1. Search filter (by ID or Customer Name / Company)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const idStr = String(rfq.id || '');
        const parsedQuery = parseInt(query, 10);
        
        const matchesRaw = idStr.includes(query);
        const matchesNumeric = !isNaN(parsedQuery) && rfq.id === parsedQuery;
        const matchesCompany = (rfq.company || '').toLowerCase().includes(query);
        const matchesContact = (rfq.contact_name || '').toLowerCase().includes(query);
        
        if (!matchesRaw && !matchesNumeric && !matchesCompany && !matchesContact) {
          return false;
        }
      }

      // 2. Status filter
      const mapped = getStatusMapping(rfq.status);
      if (statusFilter !== 'all' && mapped.type !== statusFilter) {
        return false;
      }

      // 3. Time filter
      if (timeFilter !== 'all' && rfq.created_at) {
        const createdAt = new Date(rfq.created_at);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (timeFilter === '7days' && diffDays > 7) {
          return false;
        }
        if (timeFilter === '30days' && diffDays > 30) {
          return false;
        }
        if (timeFilter === 'thismonth') {
          if (createdAt.getMonth() !== now.getMonth() || createdAt.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [rfqs, searchQuery, statusFilter, timeFilter]);

  // Date formatting helper
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  const formatDateOnly = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    try {
      const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Upper header action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <h2 className="text-lg font-semibold text-foreground">Danh sách yêu cầu</h2>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand/90 hover:scale-[1.01] active:scale-[0.99] transition-all shrink-0"
        >
          <Plus className="h-4.5 w-4.5" />
          Tạo yêu cầu mới
        </button>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-emerald-200/50 bg-emerald-50 px-4 py-3 text-emerald-800 shadow-lg animate-in fade-in slide-in-from-bottom-5 duration-300 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-500/20">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          <span className="text-sm font-medium">Gửi yêu cầu báo giá thành công!</span>
        </div>
      )}

      {/* Filters Area */}
      <div className="grid gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm md:grid-cols-12 md:items-center">
        {/* Search Bar */}
        <div className="relative md:col-span-5">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã RFQ, tên khách hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border/80 bg-background/50 py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-brand focus:ring-1 focus:ring-brand"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full rounded-xl border border-border/80 bg-background/50 px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Đang chờ</option>
            <option value="approved">Duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>

        {/* Time Filter */}
        <div className="md:col-span-4">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="w-full rounded-xl border border-border/80 bg-background/50 px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand"
          >
            <option value="all">Mọi thời gian</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="thismonth">Trong tháng này</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-border/70 bg-card/60 backdrop-blur">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
            <p className="text-sm text-muted-foreground">Đang tải danh sách yêu cầu báo giá...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-center dark:bg-rose-950/10 dark:border-rose-900/30">
          <div className="flex flex-col items-center gap-3 max-w-md">
            <AlertCircle className="h-10 w-10 text-rose-500" />
            <p className="text-sm font-medium text-rose-900 dark:text-rose-400">{error}</p>
          </div>
        </div>
      ) : filteredRfqs.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card p-6 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/60" />
          <h3 className="mt-4 text-sm font-semibold text-foreground">Không tìm thấy RFQ nào</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-xs">
            {rfqs.length === 0
              ? 'Doanh nghiệp của bạn chưa tạo yêu cầu báo giá nào trên hệ thống.'
              : 'Không có yêu cầu báo giá nào khớp với bộ lọc hiện tại của bạn.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/70">
                <tr>
                  <th className="px-6 py-4 font-semibold">Mã RFQ</th>
                  <th className="px-6 py-4 font-semibold">Ngày yêu cầu</th>
                  <th className="px-6 py-4 font-semibold">Doanh nghiệp</th>
                  <th className="px-6 py-4 font-semibold">Người liên hệ</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái xử lý</th>
                  <th className="px-6 py-4 font-semibold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRfqs.map((rfq) => {
                  const statusInfo = getStatusMapping(rfq.status);
                  return (
                    <tr
                      key={rfq.id}
                      className="transition-colors hover:bg-muted/20"
                    >
                      <td className="px-6 py-4 font-mono font-medium text-foreground">
                        {rfq.id}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div>{formatDate(rfq.created_at)}</div>
                        {rfq.scheduled_delivery && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-brand">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>Giao: {formatDateOnly(rfq.requested_delivery_date)}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-foreground font-medium">
                        {rfq.company}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {rfq.contact_name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                            statusInfo.classes
                          )}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedRfq(rfq)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand hover:bg-brand/5 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-border/70 px-6 py-4 bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Hiển thị <span className="font-medium text-foreground">{filteredRfqs.length}</span> trên{' '}
              <span className="font-medium text-foreground">{rfqs.length}</span> RFQ
            </p>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedRfq(null)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Chi tiết Yêu cầu báo giá {selectedRfq.id}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tạo ngày {formatDate(selectedRfq.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRfq(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              {/* Status Banner */}
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/25 px-4 py-3">
                <span className="text-sm text-muted-foreground">Trạng thái xử lý:</span>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold',
                    getStatusMapping(selectedRfq.status).classes
                  )}
                >
                  {getStatusMapping(selectedRfq.status).label}
                </span>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b border-border/50 pb-1.5">
                  <Building2 className="h-4 w-4 text-brand" />
                  Thông tin liên hệ
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">Tên doanh nghiệp</span>
                    <span className="font-medium text-foreground">{selectedRfq.company}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">Người đại diện</span>
                    <span className="font-medium text-foreground">{selectedRfq.contact_name}</span>
                  </div>
                  <div className="space-y-1 flex items-start gap-2 pt-1">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Email</span>
                      <a href={`mailto:${selectedRfq.email}`} className="text-brand hover:underline font-medium break-all">
                        {selectedRfq.email}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1 flex items-start gap-2 pt-1">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Số điện thoại</span>
                      <a href={`tel:${selectedRfq.phone}`} className="text-foreground font-medium hover:text-brand transition-colors">
                        {selectedRfq.phone || '—'}
                      </a>
                    </div>
                  </div>
                  {selectedRfq.industry && (
                    <div className="space-y-1 flex items-start gap-2 pt-1 sm:col-span-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-muted-foreground block">Ngành nghề</span>
                        <span className="font-medium text-foreground capitalize">
                          {typeof selectedRfq.industry === 'string'
                            ? selectedRfq.industry
                            : selectedRfq.industry?.name || '—'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sales Rep */}
              {selectedRfq.assigned_sales && typeof selectedRfq.assigned_sales === 'object' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b border-border/50 pb-1.5">
                    <User className="h-4 w-4 text-brand" />
                    Sale phụ trách
                  </h3>
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-brand/10 flex items-center justify-center text-brand font-semibold border border-brand/20">
                      {(selectedRfq.assigned_sales.first_name?.[0] || selectedRfq.assigned_sales.email?.[0] || 'S').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {selectedRfq.assigned_sales.first_name || ''} {selectedRfq.assigned_sales.last_name || ''}
                        {!(selectedRfq.assigned_sales.first_name || selectedRfq.assigned_sales.last_name) && 'Nhân viên Sales'}
                      </div>
                      {selectedRfq.assigned_sales.email && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3" />
                          <a href={`mailto:${selectedRfq.assigned_sales.email}`} className="hover:text-brand hover:underline">
                            {selectedRfq.assigned_sales.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Information */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b border-border/50 pb-1.5">
                  <Calendar className="h-4 w-4 text-brand" />
                  Thông tin giao hàng
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground block">Phương thức giao hàng</span>
                    <span className="font-medium text-foreground">
                      {selectedRfq.scheduled_delivery ? 'Lên lịch giao hàng (Scheduled Delivery)' : 'Giao hàng thông thường'}
                    </span>
                  </div>
                  {selectedRfq.scheduled_delivery && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground block">Ngày giao hàng mong muốn</span>
                      <span className="font-medium text-foreground">
                        {formatDateOnly(selectedRfq.requested_delivery_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Line Items / Products */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b border-border/50 pb-1.5">
                  <FileText className="h-4 w-4 text-brand" />
                  Danh sách sản phẩm yêu cầu
                </h3>
                {selectedRfq.line_items && Array.isArray(selectedRfq.line_items) && selectedRfq.line_items.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-border/60">
                    <table className="w-full border-collapse text-left text-xs sm:text-sm">
                      <thead className="bg-muted/40 text-muted-foreground border-b border-border/60">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">Mã SKU</th>
                          <th className="px-4 py-2.5 font-medium text-right">Số lượng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {selectedRfq.line_items.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-muted/10">
                            <td className="px-4 py-2.5 font-mono text-foreground">{item.sku}</td>
                            <td className="px-4 py-2.5 text-right font-medium text-foreground">{item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Không có thông tin sản phẩm.</p>
                )}
              </div>

              {/* Note / Message */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground border-b border-border/50 pb-1.5">
                  Ghi chú / Yêu cầu thêm
                </h3>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {selectedRfq.message || 'Không có ghi chú thêm.'}
                </div>
              </div>

              {selectedRfq.status === 'approved' && selectedRfq.approval_note && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-emerald-600 border-b border-border/50 pb-1.5">
                    Ghi chú duyệt
                  </h3>
                  <div className="rounded-xl border border-emerald-200/50 bg-emerald-50/50 p-4 text-sm text-emerald-800 whitespace-pre-wrap leading-relaxed dark:bg-emerald-900/10 dark:text-emerald-400">
                    {selectedRfq.approval_note}
                  </div>
                </div>
              )}

              {selectedRfq.status === 'rejected' && selectedRfq.reject_reason && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-rose-600 border-b border-border/50 pb-1.5">
                    Lý do từ chối
                  </h3>
                  <div className="rounded-xl border border-rose-200/50 bg-rose-50/50 p-4 text-sm text-rose-800 whitespace-pre-wrap leading-relaxed dark:bg-rose-900/10 dark:text-rose-400">
                    {selectedRfq.reject_reason}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center border-t border-border/80 px-6 py-4 bg-muted/30">
              <div className="flex gap-2">
                {selectedRfq.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActionModalType('approve');
                        setActionNote('');
                        setActionError(null);
                      }}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-all shadow-sm"
                    >
                      Duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActionModalType('reject');
                        setActionNote('');
                        setActionError(null);
                      }}
                      className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 transition-all shadow-sm"
                    >
                      Từ chối
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedRfq(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal (Approve/Reject) */}
      {actionModalType && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !actionSubmitting && setActionModalType(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30">
              <h2 className={cn("text-lg font-semibold", actionModalType === 'approve' ? 'text-emerald-600' : 'text-rose-600')}>
                {actionModalType === 'approve' ? 'Xác nhận duyệt RFQ' : 'Xác nhận từ chối RFQ'}
              </h2>
              <button type="button" onClick={() => !actionSubmitting && setActionModalType(null)} className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-all">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleActionSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  {actionModalType === 'approve' ? 'Ghi chú duyệt (Không bắt buộc)' : 'Lý do từ chối (Bắt buộc) *'}
                </label>
                <textarea
                  rows={3}
                  required={actionModalType === 'reject'}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder={actionModalType === 'approve' ? 'Nhập ghi chú cho bộ phận liên quan...' : 'Nhập lý do chi tiết...'}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setActionModalType(null)} disabled={actionSubmitting} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all">
                  Hủy
                </button>
                <button type="submit" disabled={actionSubmitting} className={cn("inline-flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-semibold text-white shadow transition-all", actionModalType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700')}>
                  {actionSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {actionModalType === 'approve' ? 'Duyệt RFQ' : 'Từ chối RFQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create RFQ Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsCreateOpen(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30">
              <div>
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-brand" />
                  Tạo yêu cầu báo giá mới
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Điền các thông tin sản phẩm và liên hệ để gửi yêu cầu trực tiếp đến hệ thống ULink.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-xs text-rose-800 flex items-center gap-2 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/30">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Section 1: Contact Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b border-border/50 pb-1.5">
                  <Building2 className="h-4 w-4 text-brand" />
                  Thông tin liên hệ
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground block">Tên công ty *</label>
                    <input
                      type="text"
                      required
                      value={formCompany}
                      onChange={(e) => {
                        setFormCompany(e.target.value);
                        setFormFieldErrors((p) => ({ ...p, company: '' }));
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                        formFieldErrors.company ? "border-rose-500" : "border-border/80"
                      )}
                    />
                    {formFieldErrors.company && (
                      <span className="text-[11px] text-rose-500 block font-medium">{formFieldErrors.company}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground block">Người liên hệ *</label>
                    <input
                      type="text"
                      required
                      value={formContact}
                      onChange={(e) => {
                        setFormContact(e.target.value);
                        setFormFieldErrors((p) => ({ ...p, contact: '' }));
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                        formFieldErrors.contact ? "border-rose-500" : "border-border/80"
                      )}
                    />
                    {formFieldErrors.contact && (
                      <span className="text-[11px] text-rose-500 block font-medium">{formFieldErrors.contact}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground block">Email *</label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => {
                        setFormEmail(e.target.value);
                        setFormFieldErrors((p) => ({ ...p, email: '' }));
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                        formFieldErrors.email ? "border-rose-500" : "border-border/80"
                      )}
                    />
                    {formFieldErrors.email && (
                      <span className="text-[11px] text-rose-500 block font-medium">{formFieldErrors.email}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground block">Số điện thoại *</label>
                    <input
                      type="text"
                      required
                      value={formPhone}
                      onChange={(e) => {
                        setFormPhone(e.target.value);
                        setFormFieldErrors((p) => ({ ...p, phone: '' }));
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                        formFieldErrors.phone ? "border-rose-500" : "border-border/80"
                      )}
                    />
                    {formFieldErrors.phone && (
                      <span className="text-[11px] text-rose-500 block font-medium">{formFieldErrors.phone}</span>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground block">Địa chỉ *</label>
                  <input
                    type="text"
                    required
                    value={formAddress}
                    onChange={(e) => {
                      setFormAddress(e.target.value);
                      setFormFieldErrors((p) => ({ ...p, address: '' }));
                    }}
                    className={cn(
                      "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                      formFieldErrors.address ? "border-rose-500" : "border-border/80"
                    )}
                    placeholder="Số nhà, tên đường, khu công nghiệp..."
                  />
                  {formFieldErrors.address && (
                    <span className="text-[11px] text-rose-500 block font-medium">{formFieldErrors.address}</span>
                  )}
                </div>
              </div>

              {/* Section 2: Region & Industry */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b border-border/50 pb-1.5">
                  <Briefcase className="h-4 w-4 text-brand" />
                  Khu vực & Ngành nghề
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground block">Hub khu vực ưu tiên *</label>
                    <select
                      required
                      value={formHub}
                      onChange={(e) => {
                        setFormHub(e.target.value);
                        setFormFieldErrors((p) => ({ ...p, hub: '' }));
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                        formFieldErrors.hub ? "border-rose-500" : "border-border/80"
                      )}
                    >
                      <option value="">Chọn Regional Hub...</option>
                      {customerMeta?.hubs.map((hub) => (
                        <option key={hub.id} value={hub.id}>
                          {hub.name}
                        </option>
                      ))}
                    </select>
                    {formFieldErrors.hub && (
                      <span className="text-[11px] text-rose-500 block font-medium">{formFieldErrors.hub}</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground block">Ngành nghề *</label>
                    <select
                      required
                      value={formIndustry}
                      onChange={(e) => {
                        setFormIndustry(e.target.value);
                        setFormFieldErrors((p) => ({ ...p, industry: '' }));
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                        formFieldErrors.industry ? "border-rose-500" : "border-border/80"
                      )}
                    >
                      <option value="">Chọn ngành nghề...</option>
                      {customerMeta?.industries.map((ind) => (
                        <option key={ind.slug} value={ind.slug}>
                          {ind.name}
                        </option>
                      ))}
                    </select>
                    {formFieldErrors.industry && (
                      <span className="text-[11px] text-rose-500 block font-medium">{formFieldErrors.industry}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Option */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 border-b border-border/50 pb-1.5">
                  <Calendar className="h-4 w-4 text-brand" />
                  Phương thức giao hàng
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="scheduled_delivery"
                      checked={formScheduled}
                      onChange={(e) => {
                        setFormScheduled(e.target.checked);
                        if (!e.target.checked) {
                          setFormDeliveryDate('');
                          setFormFieldErrors((p) => {
                            const next = { ...p };
                            delete next.requested_delivery_date;
                            return next;
                          });
                        }
                      }}
                      className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                    />
                    <label htmlFor="scheduled_delivery" className="text-sm font-medium text-foreground cursor-pointer select-none">
                      Lên lịch giao hàng (Scheduled Delivery)
                    </label>
                  </div>

                  {formScheduled && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200 max-w-sm">
                      <label className="text-xs font-medium text-muted-foreground block">Ngày giao hàng mong muốn *</label>
                      <input
                        type="date"
                        required={formScheduled}
                        min={new Date().toISOString().split('T')[0]}
                        value={formDeliveryDate}
                        onChange={(e) => {
                          setFormDeliveryDate(e.target.value);
                          setFormFieldErrors((p) => {
                            const next = { ...p };
                            delete next.requested_delivery_date;
                            return next;
                          });
                        }}
                        className={cn(
                          "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand font-medium",
                          formFieldErrors.requested_delivery_date ? "border-rose-500" : "border-border/80"
                        )}
                      />
                      {formFieldErrors.requested_delivery_date && (
                        <span className="text-[11px] text-rose-500 block font-medium">{formFieldErrors.requested_delivery_date}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>



              {/* Section 4: Notes */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground block">Ghi chú</label>
                <textarea
                  rows={3}
                  value={formMessage}
                  onChange={(e) => {
                    setFormMessage(e.target.value);
                    setFormFieldErrors((p) => ({ ...p, message: '' }));
                  }}
                  placeholder="Mô tả chi tiết các yêu cầu đặc thù, quy cách đóng gói, tiến độ mong muốn..."
                  className={cn(
                    "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand resize-none placeholder:text-muted-foreground",
                    formFieldErrors.message ? "border-rose-500" : "border-border/80"
                  )}
                />
                {formFieldErrors.message && (
                  <span className="text-[11px] text-rose-500 block font-medium">{formFieldErrors.message}</span>
                )}
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex justify-end gap-3 border-t border-border/80 pt-4 bg-background">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={submitting}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand/90 transition-all disabled:opacity-75"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
