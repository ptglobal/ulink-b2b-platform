'use client';

import React, { useState, useTransition } from 'react';
import { Search, FileSpreadsheet, Eye, CheckCircle2, XCircle, User, Calendar, MapPin, Phone, Mail, Building, Clock, X, AlertTriangle, Plus, Trash2, Edit, Save, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateRfqStatus, assignRfqSales, saveRfq, deleteRfq } from '@/app/[locale]/admin/rfqs/actions';

interface SalesUser {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
}

interface HubOption {
  id: number;
  name: string;
}

interface SkuOption {
  id: number;
  sku_code: string;
}

interface RfqLineItem {
  sku: string;
  qty?: number;
  note?: string;
}

interface RfqRequest {
  id: number;
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  address: string;
  industry?: string | null;
  message?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approval_note?: string | null;
  reject_reason?: string | null;
  source: 'web' | 'portal';
  scheduled_delivery?: boolean;
  requested_delivery_date?: string | null;
  created_at: string;
  line_items?: RfqLineItem[];
  hub?: { id: number; name: string } | null;
  assigned_sales?: { id: string; first_name?: string | null; last_name?: string | null } | null;
  user?: string | null;
}

interface RfqsClientProps {
  initialRfqs: RfqRequest[];
  salesTeam: SalesUser[];
  hubs: HubOption[];
  skus: SkuOption[];
  error?: string;
}

export function RfqsClient({ initialRfqs, salesTeam, hubs, skus, error }: RfqsClientProps) {
  const [rfqs, setRfqs] = useState<RfqRequest[]>(initialRfqs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  // Detail Modal State
  const [selectedRfq, setSelectedRfq] = useState<RfqRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  
  // Handling inputs for details modal
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedSalesId, setSelectedSalesId] = useState<string>('');

  // CRUD Form Modal State
  const [rfqFormOpen, setRfqFormOpen] = useState(false);
  const [activeRfq, setActiveRfq] = useState<any | null>(null);

  // Filter RFQs
  const filteredRfqs = rfqs.filter((rfq) => {
    const company = rfq.company.toLowerCase();
    const contact = rfq.contact_name.toLowerCase();
    const email = rfq.email.toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = company.includes(q) || contact.includes(q) || email.includes(q);
    const matchesStatus = statusFilter === 'all' || rfq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle Quick Re-assign Salesman
  const handleAssignSales = async (rfqId: number, salesId: string) => {
    const parsedSalesId = salesId === '' ? null : salesId;
    
    startTransition(async () => {
      const res = await assignRfqSales(rfqId, parsedSalesId);
      if (res.success) {
        // Update local state
        setRfqs((prev) =>
          prev.map((r) => {
            if (r.id === rfqId) {
              const salesObj = salesTeam.find((s) => s.id === salesId);
              return {
                ...r,
                assigned_sales: salesObj
                  ? { id: salesObj.id, first_name: salesObj.first_name, last_name: salesObj.last_name }
                  : null
              };
            }
            return r;
          })
        );
        // Sync selectedRfq if open
        if (selectedRfq && selectedRfq.id === rfqId) {
          const salesObj = salesTeam.find((s) => s.id === salesId);
          setSelectedRfq((prev) => prev ? {
            ...prev,
            assigned_sales: salesObj
              ? { id: salesObj.id, first_name: salesObj.first_name, last_name: salesObj.last_name }
              : null
          } : null);
        }
      } else {
        alert('Không thể gán nhân viên phụ trách: ' + res.error);
      }
    });
  };

  // Submit Process RFQ
  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRfq) return;

    if (actionType === 'reject' && !rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối yêu cầu.');
      return;
    }

    startTransition(async () => {
      const statusValue = actionType === 'approve' ? 'approved' : 'rejected';
      const res = await updateRfqStatus({
        id: selectedRfq.id,
        status: statusValue,
        approval_note: actionType === 'approve' ? approvalNote : undefined,
        reject_reason: actionType === 'reject' ? rejectReason : undefined,
        assigned_sales_id: actionType === 'approve' && selectedSalesId ? selectedSalesId : undefined
      });

      if (res.success) {
        // Update state locally or reload
        window.location.reload();
      } else {
        alert('Thao tác thất bại: ' + res.error);
      }
    });
  };

  // CRUD handlers
  const handleOpenCreateRfq = () => {
    setActiveRfq({
      company: '',
      contact_name: '',
      email: '',
      phone: '',
      address: '',
      industry: '',
      hubId: hubs[0]?.id || null,
      line_items: [{ sku: skus[0]?.sku_code || '', qty: 1, note: '' }],
      message: '',
      status: 'pending',
      assigned_sales_id: '',
      scheduled_delivery: false,
      requested_delivery_date: ''
    });
    setRfqFormOpen(true);
  };

  const handleOpenEditRfq = (rfq: RfqRequest) => {
    setActiveRfq({
      id: rfq.id,
      company: rfq.company,
      contact_name: rfq.contact_name,
      email: rfq.email,
      phone: rfq.phone,
      address: rfq.address,
      industry: rfq.industry || '',
      hubId: rfq.hub?.id || null,
      line_items: rfq.line_items && rfq.line_items.length > 0
        ? rfq.line_items.map(li => ({ sku: li.sku, qty: li.qty || 1, note: li.note || '' }))
        : [{ sku: skus[0]?.sku_code || '', qty: 1, note: '' }],
      message: rfq.message || '',
      status: rfq.status,
      assigned_sales_id: rfq.assigned_sales?.id || '',
      scheduled_delivery: !!rfq.scheduled_delivery,
      requested_delivery_date: rfq.requested_delivery_date || ''
    });
    setRfqFormOpen(true);
  };

  const handleDeleteRfq = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa yêu cầu báo giá này? Thao tác này không thể hoàn tác.')) return;

    startTransition(async () => {
      const res = await deleteRfq(id);
      if (res.success) {
        setRfqs((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert('Không thể xóa yêu cầu báo giá: ' + res.error);
      }
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRfq) return;

    if (!activeRfq.company || !activeRfq.contact_name || !activeRfq.email || !activeRfq.phone || !activeRfq.address) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    // Filter out items with empty sku
    const lineItems = (activeRfq.line_items || []).filter((item: any) => item.sku);

    startTransition(async () => {
      const res = await saveRfq({
        id: activeRfq.id,
        company: activeRfq.company,
        contact_name: activeRfq.contact_name,
        email: activeRfq.email,
        phone: activeRfq.phone,
        address: activeRfq.address,
        industry: activeRfq.industry || null,
        hubId: activeRfq.hubId ? Number(activeRfq.hubId) : null,
        line_items: lineItems,
        message: activeRfq.message || null,
        status: activeRfq.status || 'pending',
        assigned_sales_id: activeRfq.assigned_sales_id || null,
        requested_delivery_date: activeRfq.requested_delivery_date || null,
        scheduled_delivery: !!activeRfq.scheduled_delivery
      });

      if (res.success) {
        setRfqFormOpen(false);
        setActiveRfq(null);
        window.location.reload();
      } else {
        alert('Không thể lưu yêu cầu báo giá: ' + res.error);
      }
    });
  };

  const handleAddFormItem = () => {
    if (!activeRfq) return;
    const newItems = [...(activeRfq.line_items || [])];
    newItems.push({ sku: skus[0]?.sku_code || '', qty: 1, note: '' });
    setActiveRfq({ ...activeRfq, line_items: newItems });
  };

  const handleRemoveFormItem = (idx: number) => {
    if (!activeRfq) return;
    const newItems = (activeRfq.line_items || []).filter((_: any, i: number) => i !== idx);
    setActiveRfq({ ...activeRfq, line_items: newItems });
  };

  const handleUpdateFormItem = (idx: number, field: string, val: any) => {
    if (!activeRfq) return;
    const newItems = (activeRfq.line_items || []).map((item: any, i: number) => {
      if (i === idx) {
        return { ...item, [field]: val };
      }
      return item;
    });
    setActiveRfq({ ...activeRfq, line_items: newItems });
  };

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
            Chăm sóc khách hàng B2B
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight mt-1">
            Xử lý Yêu cầu Báo giá (RFQs)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Xem và xử lý thông tin yêu cầu báo giá hàng loạt của doanh nghiệp, phê duyệt và điều phối nhân viên sales chăm sóc.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateRfq}
          className="inline-flex h-10 items-center justify-center gap-1.5 px-4 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0 animate-fade-in"
        >
          <Plus className="h-4 w-4" />
          Tạo yêu cầu báo giá
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-extrabold text-rose-900 block mb-1">
              Đã xảy ra lỗi khi tải dữ liệu RFQ từ API
            </span>
            <pre className="font-mono text-[11px] bg-white/60 p-2.5 rounded-lg mt-2 overflow-x-auto border border-rose-100/50 max-h-40 whitespace-pre-wrap select-all">
              {error}
            </pre>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên doanh nghiệp, người liên hệ, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white shadow-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Đang chờ xử lý</option>
            <option value="approved">Đã phê duyệt</option>
            <option value="rejected">Đã từ chối</option>
          </select>
        </div>
      </div>

      {/* RFQ Requests List Table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredRfqs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileSpreadsheet className="h-12 w-12 text-slate-300 mb-3" />
            <span className="text-sm font-extrabold text-[#0F1E36]">
              Không có yêu cầu báo giá nào
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Doanh nghiệp / Người liên hệ</th>
                  <th className="px-6 py-4">Thông tin liên hệ</th>
                  <th className="px-6 py-4">Khu vực (Hub)</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Phụ trách (Sales)</th>
                  <th className="px-6 py-4">Ngày gửi</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                {filteredRfqs.map((rfq) => {
                  const salesName = rfq.assigned_sales
                    ? `${rfq.assigned_sales.first_name || ''} ${rfq.assigned_sales.last_name || ''}`.trim() || 'Salesperson'
                    : 'Chưa phân công';

                  return (
                    <tr key={rfq.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Company & Name */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#0F1E36] leading-tight">
                            {rfq.company}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold mt-1">
                            Người liên hệ: {rfq.contact_name}
                          </span>
                        </div>
                      </td>

                      {/* Contact Contact */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-650 font-medium">{rfq.email}</span>
                          <span className="text-slate-400 font-medium text-[11px]">{rfq.phone}</span>
                        </div>
                      </td>

                      {/* Hub */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600">
                          {rfq.hub?.name || '---'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold",
                            rfq.status === 'approved'
                              ? "bg-emerald-50 text-emerald-700"
                              : rfq.status === 'rejected'
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {rfq.status === 'approved' ? 'Đã duyệt' : rfq.status === 'rejected' ? 'Đã từ chối' : 'Đang chờ'}
                        </span>
                      </td>

                      {/* Assigned Sales Dropdown */}
                      <td className="px-6 py-4">
                        {rfq.status === 'rejected' ? (
                          <span className="text-slate-400 italic text-xs">---</span>
                        ) : (
                          <select
                            value={rfq.assigned_sales?.id || ''}
                            onChange={(e) => handleAssignSales(rfq.id, e.target.value)}
                            disabled={isPending}
                            className="px-2 py-1 rounded border border-slate-200 text-xs font-semibold focus:outline-none bg-white max-w-[150px] truncate"
                          >
                            <option value="">-- Chưa gán --</option>
                            {salesTeam.map((sales) => (
                              <option key={sales.id} value={sales.id}>
                                {`${sales.first_name || ''} ${sales.last_name || ''}`.trim() || sales.email}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(rfq.created_at).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRfq(rfq);
                              setActionType(null);
                              setApprovalNote(rfq.approval_note || '');
                              setRejectReason(rfq.reject_reason || '');
                              setSelectedSalesId(rfq.assigned_sales?.id || '');
                            }}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditRfq(rfq)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-[#0F1E36] transition-colors"
                            title="Sửa yêu cầu"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRfq(rfq.id)}
                            className="p-1 rounded hover:bg-slate-100 text-rose-500 hover:text-rose-700 transition-colors"
                            title="Xóa yêu cầu"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: RFQ Details and Action Form */}
      {selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#0F1E36] flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  Chi tiết Yêu cầu báo giá #{selectedRfq.id}
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Gửi từ nguồn: <span className="uppercase text-slate-500 font-bold">{selectedRfq.source}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedRfq(null);
                  setActionType(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto flex flex-col gap-6">
              
              {/* Top Section: Information grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-150 pb-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    Thông tin doanh nghiệp
                  </h3>
                  <div className="grid grid-cols-3 gap-y-2 text-xs">
                    <span className="text-slate-400 font-bold">Doanh nghiệp:</span>
                    <span className="col-span-2 text-[#0F1E36] font-extrabold">{selectedRfq.company}</span>

                    <span className="text-slate-400 font-bold">Liên hệ:</span>
                    <span className="col-span-2 text-slate-700 font-semibold">{selectedRfq.contact_name}</span>

                    <span className="text-slate-400 font-bold">Địa chỉ:</span>
                    <span className="col-span-2 text-slate-600 font-semibold flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-450 shrink-0" />
                      {selectedRfq.address}
                    </span>

                    {selectedRfq.industry && (
                      <>
                        <span className="text-slate-400 font-bold">Ngành nghề:</span>
                        <span className="col-span-2 text-slate-600 font-semibold">{selectedRfq.industry}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-150 pb-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    Liên hệ & Giao hàng
                  </h3>
                  <div className="grid grid-cols-3 gap-y-2 text-xs">
                    <span className="text-slate-400 font-bold">Điện thoại:</span>
                    <span className="col-span-2 text-slate-700 font-semibold flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {selectedRfq.phone}
                    </span>

                    <span className="text-slate-400 font-bold">Email:</span>
                    <span className="col-span-2 text-slate-700 font-semibold flex items-center gap-1 select-all">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {selectedRfq.email}
                    </span>

                    <span className="text-slate-400 font-bold">Khu vực (Hub):</span>
                    <span className="col-span-2 text-blue-600 font-bold">{selectedRfq.hub?.name || 'Chưa chọn'}</span>

                    <span className="text-slate-400 font-bold">Giao hàng:</span>
                    <span className="col-span-2 text-slate-700 font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {selectedRfq.scheduled_delivery
                        ? `Đặt lịch giao: ${selectedRfq.requested_delivery_date ? new Date(selectedRfq.requested_delivery_date).toLocaleDateString('vi-VN') : '---'}`
                        : 'Giao hàng ngay'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Middle Section: Line Items list */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                  Danh sách sản phẩm yêu cầu báo giá
                </h3>
                
                {selectedRfq.line_items && selectedRfq.line_items.length > 0 ? (
                  <div className="overflow-hidden border border-slate-100 rounded-xl">
                    <table className="w-full border-collapse text-left text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                          <th className="px-5 py-3">Mã SKU</th>
                          <th className="px-5 py-3">Số lượng yêu cầu</th>
                          <th className="px-5 py-3">Ghi chú mặt hàng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-650">
                        {selectedRfq.line_items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/20">
                            <td className="px-5 py-3 font-mono font-extrabold text-blue-650 select-all">
                              {item.sku}
                            </td>
                            <td className="px-5 py-3 font-extrabold text-[#0F1E36]">
                              {item.qty || 1}
                            </td>
                            <td className="px-5 py-3 text-slate-500 italic">
                              {item.note || '---'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 italic">
                    Không có danh sách sản phẩm.
                  </div>
                )}
              </div>

              {/* Message from client */}
              {selectedRfq.message && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Tin nhắn từ khách hàng</span>
                  <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-650 leading-relaxed whitespace-pre-wrap">
                    {selectedRfq.message}
                  </div>
                </div>
              )}

              {/* Bottom Section: Status handling */}
              <div className="border-t border-slate-100 pt-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Trạng thái hiện tại:</span>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold",
                        selectedRfq.status === 'approved'
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                          : selectedRfq.status === 'rejected'
                          ? "bg-rose-50 text-rose-800 border border-rose-100"
                          : "bg-amber-50 text-amber-800 border border-amber-100"
                      )}
                    >
                      {selectedRfq.status === 'approved' ? 'Đã phê duyệt' : selectedRfq.status === 'rejected' ? 'Đã từ chối' : 'Đang chờ xử lý'}
                    </span>
                  </div>

                  {/* Render processing buttons if pending */}
                  {selectedRfq.status === 'pending' && !actionType && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActionType('reject')}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-rose-200 px-4 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors shadow-sm bg-white"
                      >
                        <XCircle className="h-4 w-4" />
                        Từ chối yêu cầu
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionType('approve');
                          setSelectedSalesId(selectedRfq.assigned_sales?.id || '');
                        }}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Phê duyệt & Điều phối
                      </button>
                    </div>
                  )}
                </div>

                {/* Status-specific processing form */}
                {actionType && (
                  <form onSubmit={handleProcessSubmit} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-1">
                      <h4 className="text-xs font-extrabold text-[#0F1E36] uppercase tracking-wider">
                        {actionType === 'approve' ? 'Phê duyệt & Gán nhân viên sales' : 'Từ chối yêu cầu báo giá'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                      >
                        Hủy
                      </button>
                    </div>

                    {actionType === 'approve' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Assigned Sales dropdown */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Chọn nhân viên Sales phụ trách *</label>
                          <select
                            required
                            value={selectedSalesId}
                            onChange={(e) => setSelectedSalesId(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white"
                          >
                            <option value="">-- Chọn Salesman --</option>
                            {salesTeam.map((sales) => (
                              <option key={sales.id} value={sales.id}>
                                {`${sales.first_name || ''} ${sales.last_name || ''}`.trim() || sales.email}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Approval Note */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Ghi chú phê duyệt</label>
                          <input
                            type="text"
                            value={approvalNote}
                            onChange={(e) => setApprovalNote(e.target.value)}
                            placeholder="Ghi chú phản hồi (ví dụ: Chuyển sales phụ trách)..."
                            className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {actionType === 'reject' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Lý do từ chối yêu cầu *</label>
                        <textarea
                          required
                          rows={2}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Lý do từ chối (ví dụ: Không thể cung cấp mặt hàng này, thông tin liên hệ không đúng)..."
                          className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="px-3 py-1.5 rounded-lg border border-slate-250 text-xs font-bold text-slate-550 hover:bg-slate-100"
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-colors",
                          actionType === 'approve' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                        )}
                      >
                        {isPending ? 'Đang thực hiện...' : actionType === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Display resolved note if approved or rejected */}
                {selectedRfq.status === 'approved' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Ghi chú phê duyệt:</span>
                      <span className="text-emerald-900 font-semibold">{selectedRfq.approval_note || 'Không có ghi chú.'}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Sales chăm sóc:</span>
                      <span className="text-emerald-900 font-extrabold flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-emerald-600" />
                        {selectedRfq.assigned_sales
                          ? `${selectedRfq.assigned_sales.first_name || ''} ${selectedRfq.assigned_sales.last_name || ''}`.trim() || 'Salesperson'
                          : 'Chưa phân công'}
                      </span>
                    </div>
                  </div>
                )}

                {selectedRfq.status === 'rejected' && (
                  <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100/50 text-xs flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">Lý do từ chối:</span>
                    <span className="text-rose-900 font-semibold">{selectedRfq.reject_reason || 'Không có lý do rõ ràng.'}</span>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setSelectedRfq(null);
                  setActionType(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-550 hover:bg-slate-100 transition-colors"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit RFQ Form */}
      {rfqFormOpen && activeRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#0F1E36] flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  {activeRfq.id ? `Cập nhật yêu cầu báo giá #${activeRfq.id}` : 'Tạo yêu cầu báo giá mới'}
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Điền các thông tin liên hệ và danh sách sản phẩm yêu cầu báo giá.
                </p>
              </div>
              <button
                onClick={() => {
                  setRfqFormOpen(false);
                  setActiveRfq(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col max-h-[70vh] overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 bg-white grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                
                {/* Left Column: Customer Details */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-1">
                    <Building className="h-4 w-4 text-blue-500" />
                    Thông tin liên hệ
                  </h3>

                  {/* Company */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Tên doanh nghiệp *</label>
                    <input
                      type="text"
                      required
                      value={activeRfq.company || ''}
                      onChange={(e) => setActiveRfq({ ...activeRfq, company: e.target.value })}
                      placeholder="Công ty TNHH ULink Việt Nam"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650 shadow-sm"
                    />
                  </div>

                  {/* Contact Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Người liên hệ *</label>
                    <input
                      type="text"
                      required
                      value={activeRfq.contact_name || ''}
                      onChange={(e) => setActiveRfq({ ...activeRfq, contact_name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Email *</label>
                      <input
                        type="email"
                        required
                        value={activeRfq.email || ''}
                        onChange={(e) => setActiveRfq({ ...activeRfq, email: e.target.value })}
                        placeholder="example@company.com"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Điện thoại *</label>
                      <input
                        type="text"
                        required
                        value={activeRfq.phone || ''}
                        onChange={(e) => setActiveRfq({ ...activeRfq, phone: e.target.value })}
                        placeholder="0987654321"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Địa chỉ giao hàng *</label>
                    <input
                      type="text"
                      required
                      value={activeRfq.address || ''}
                      onChange={(e) => setActiveRfq({ ...activeRfq, address: e.target.value })}
                      placeholder="Lô B2, KCN Thăng Long, Đông Anh, Hà Nội"
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                    />
                  </div>

                  {/* Industry & Hub */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Ngành nghề</label>
                      <input
                        type="text"
                        value={activeRfq.industry || ''}
                        onChange={(e) => setActiveRfq({ ...activeRfq, industry: e.target.value })}
                        placeholder="Thiết bị điện tử, bán dẫn"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Khu vực (Hub) *</label>
                      <select
                        required
                        value={activeRfq.hubId || ''}
                        onChange={(e) => setActiveRfq({ ...activeRfq, hubId: e.target.value ? Number(e.target.value) : null })}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white"
                      >
                        <option value="">-- Chọn Hub --</option>
                        {hubs.map((hub) => (
                          <option key={hub.id} value={hub.id}>
                            {hub.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Scheduled Delivery */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="scheduled_delivery"
                      checked={!!activeRfq.scheduled_delivery}
                      onChange={(e) => setActiveRfq({ ...activeRfq, scheduled_delivery: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <label htmlFor="scheduled_delivery" className="text-xs font-bold text-slate-700 select-none">
                      Lên lịch giao hàng (Scheduled Delivery)
                    </label>
                  </div>

                  {activeRfq.scheduled_delivery && (
                    <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Ngày giao hàng mong muốn</label>
                      <input
                        type="date"
                        value={activeRfq.requested_delivery_date || ''}
                        onChange={(e) => setActiveRfq({ ...activeRfq, requested_delivery_date: e.target.value })}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650 bg-white"
                      />
                    </div>
                  )}

                  {/* Status & Assigned Sales */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Trạng thái xử lý</label>
                      <select
                        value={activeRfq.status || 'pending'}
                        onChange={(e) => setActiveRfq({ ...activeRfq, status: e.target.value })}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white shadow-sm"
                      >
                        <option value="pending">Đang chờ (Pending)</option>
                        <option value="approved">Đã duyệt (Approved)</option>
                        <option value="rejected">Từ chối (Rejected)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Sales phụ trách</label>
                      <select
                        value={activeRfq.assigned_sales_id || ''}
                        onChange={(e) => setActiveRfq({ ...activeRfq, assigned_sales_id: e.target.value || null })}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white shadow-sm"
                      >
                        <option value="">-- Chưa gán --</option>
                        {salesTeam.map((sales) => (
                          <option key={sales.id} value={sales.id}>
                            {`${sales.first_name || ''} ${sales.last_name || ''}`.trim() || sales.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message / Customer Request */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Tin nhắn đính kèm</label>
                    <textarea
                      rows={3}
                      value={activeRfq.message || ''}
                      onChange={(e) => setActiveRfq({ ...activeRfq, message: e.target.value })}
                      placeholder="Yêu cầu thêm từ phía doanh nghiệp..."
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                    />
                  </div>
                </div>

                {/* Right Column: Line Items configuration */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                    <h3 className="text-xs font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-1.5">
                      <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                      Danh sách sản phẩm ({activeRfq.line_items?.length || 0})
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddFormItem}
                      className="inline-flex h-7 items-center justify-center gap-1 px-3.5 rounded-lg border border-blue-200 text-[10px] font-extrabold text-blue-600 hover:bg-blue-50 bg-white transition-all shadow-sm"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Thêm sản phẩm
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto pr-1">
                    {(activeRfq.line_items || []).map((item: any, idx: number) => (
                      <div key={idx} className="p-4 border border-slate-150 rounded-xl bg-slate-50/30 flex flex-col gap-3 relative animate-in fade-in duration-150">
                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFormItem(idx)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-0.5 rounded-md hover:bg-rose-50 transition-colors"
                          title="Xóa dòng"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Sản phẩm #{idx + 1}
                        </span>

                        <div className="grid grid-cols-3 gap-3">
                          {/* SKU select */}
                          <div className="col-span-2 flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-450 uppercase">Mã SKU *</label>
                            <select
                              required
                              value={item.sku}
                              onChange={(e) => handleUpdateFormItem(idx, 'sku', e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-[#0F1E36] bg-white focus:outline-none"
                            >
                              <option value="">-- Chọn sản phẩm --</option>
                              {skus.map((skuOption) => (
                                <option key={skuOption.id} value={skuOption.sku_code}>
                                  {skuOption.sku_code}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Quantity */}
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold text-slate-450 uppercase">Số lượng *</label>
                            <input
                              type="number"
                              required
                              min={1}
                              value={item.qty || 1}
                              onChange={(e) => handleUpdateFormItem(idx, 'qty', Number(e.target.value))}
                              className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-[#0F1E36] focus:outline-none text-center"
                            />
                          </div>
                        </div>

                        {/* Item note */}
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-450 uppercase">Ghi chú mặt hàng</label>
                          <input
                            type="text"
                            value={item.note || ''}
                            onChange={(e) => handleUpdateFormItem(idx, 'note', e.target.value)}
                            placeholder="Màu sắc, kích thước hoặc yêu cầu đóng gói..."
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}

                    {(activeRfq.line_items || []).length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        Chưa có sản phẩm nào. Nhấp "+ Thêm sản phẩm" ở trên để tiếp tục.
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setRfqFormOpen(false);
                    setActiveRfq(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-550 hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
