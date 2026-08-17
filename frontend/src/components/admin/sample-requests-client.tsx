'use client';

import React, { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  Loader2,
  Package,
  Eye,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Building,
  Clock,
  X,
  AlertTriangle,
  Plus,
  Trash2,
  Edit,
  Save,
  PlusCircle
} from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  updateSampleRequestStatus,
  assignSampleRequestSales,
  saveSampleRequest,
  deleteSampleRequest
} from '@/app/[locale]/admin/sample-requests/actions';

interface SalesUser {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
}

interface SkuOption {
  id: number;
  sku_code: string;
}

interface SampleRequestItem {
  id: number;
  contact_name: string;
  email: string;
  company: string;
  phone: string;
  province: string;
  district: string;
  address_detail: string;
  product_slug: string;
  skus?: string[];
  message?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approval_note?: string | null;
  reject_reason?: string | null;
  assigned_sales?: { id: string; first_name?: string | null; last_name?: string | null } | null;
  created_at: string;
}

interface SampleRequestsClientProps {
  initialRequests: SampleRequestItem[];
  salesTeam: SalesUser[];
  skus: SkuOption[];
  locale: string;
  error?: string;
}

export function SampleRequestsClient({
  initialRequests,
  salesTeam,
  skus,
  locale,
  error
}: SampleRequestsClientProps) {
  const [requests, setRequests] = useState<SampleRequestItem[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  // Detail Modal State
  const [selectedReq, setSelectedReq] = useState<SampleRequestItem | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  // Handling inputs for details modal
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedSalesId, setSelectedSalesId] = useState<string>('');

  // CRUD Form Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [activeReq, setActiveReq] = useState<any | null>(null);
  const [formError, setFormError] = useState('');
  const [detailError, setDetailError] = useState('');

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const company = req.company.toLowerCase();
    const contact = req.contact_name.toLowerCase();
    const email = req.email.toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = company.includes(q) || contact.includes(q) || email.includes(q);
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle Quick Re-assign Salesman
  const handleAssignSales = async (requestId: number, salesId: string) => {
    const parsedSalesId = salesId === '' ? null : salesId;

    startTransition(async () => {
      const res = await assignSampleRequestSales(requestId, parsedSalesId);
      if (res.success) {
        setRequests((prev) =>
          prev.map((r) => {
            if (r.id === requestId) {
              const salesObj = salesTeam.find((s) => s.id === salesId);
              return {
                ...r,
                assigned_sales: salesObj
                  ? {
                      id: salesObj.id,
                      first_name: salesObj.first_name,
                      last_name: salesObj.last_name
                    }
                  : null
              };
            }
            return r;
          })
        );
        if (selectedReq && selectedReq.id === requestId) {
          const salesObj = salesTeam.find((s) => s.id === salesId);
          setSelectedReq((prev) =>
            prev
              ? {
                  ...prev,
                  assigned_sales: salesObj
                    ? {
                        id: salesObj.id,
                        first_name: salesObj.first_name,
                        last_name: salesObj.last_name
                      }
                    : null
                }
              : null
          );
        }
        toast.success('Đã gán nhân viên phụ trách thành công.');
      } else {
        toast.error('Không thể gán nhân viên phụ trách: ' + res.error);
      }
    });
  };

  // Submit Process Sample Request
  const handleProcessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;

    setDetailError('');
    if (actionType === 'reject' && !rejectReason.trim()) {
      setDetailError('Vui lòng nhập lý do từ chối yêu cầu hàng mẫu.');
      return;
    }

    startTransition(async () => {
      const statusValue = actionType === 'approve' ? 'approved' : 'rejected';
      const res = await updateSampleRequestStatus({
        id: selectedReq.id,
        status: statusValue,
        approval_note: actionType === 'approve' ? approvalNote : undefined,
        reject_reason: actionType === 'reject' ? rejectReason : undefined,
        assigned_sales_id: actionType === 'approve' && selectedSalesId ? selectedSalesId : undefined
      });

      if (res.success) {
        setDetailError('');
        window.location.reload();
      } else {
        setDetailError(res.error || 'Thao tác thất bại. Vui lòng thử lại.');
      }
    });
  };

  // CRUD actions handlers
  const handleOpenCreateForm = () => {
    setActiveReq({
      company: '',
      contact_name: '',
      email: '',
      phone: '',
      province: '',
      district: '',
      address_detail: '',
      product_slug: 'sample-general',
      skus: [skus[0]?.sku_code || ''],
      message: '',
      status: 'pending',
      assigned_sales_id: ''
    });
    setFormOpen(true);
    setFormError('');
  };

  const handleOpenEditForm = (req: SampleRequestItem) => {
    setActiveReq({
      id: req.id,
      company: req.company,
      contact_name: req.contact_name,
      email: req.email,
      phone: req.phone,
      province: req.province,
      district: req.district,
      address_detail: req.address_detail,
      product_slug: req.product_slug || 'sample-general',
      skus: req.skus && req.skus.length > 0 ? [...req.skus] : [skus[0]?.sku_code || ''],
      message: req.message || '',
      status: req.status,
      assigned_sales_id: req.assigned_sales?.id || ''
    });
    setFormOpen(true);
    setFormError('');
  };

  const handleDeleteReq = async (id: number) => {
    if (
      !confirm('Bạn có chắc chắn muốn xóa yêu cầu hàng mẫu này? Thao tác này không thể hoàn tác.')
    )
      return;

    startTransition(async () => {
      const res = await deleteSampleRequest(id);
      if (res.success) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        toast.success('Đã xóa yêu cầu hàng mẫu thành công.');
      } else {
        toast.error('Không thể xóa yêu cầu hàng mẫu: ' + res.error);
      }
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReq) return;

    setFormError('');
    if (
      !activeReq.company ||
      !activeReq.contact_name ||
      !activeReq.email ||
      !activeReq.phone ||
      !activeReq.province ||
      !activeReq.district ||
      !activeReq.address_detail
    ) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    // Filter empty skus
    const skuList = (activeReq.skus || []).filter(Boolean);

    startTransition(async () => {
      const res = await saveSampleRequest({
        id: activeReq.id,
        company: activeReq.company,
        contact_name: activeReq.contact_name,
        email: activeReq.email,
        phone: activeReq.phone,
        province: activeReq.province,
        district: activeReq.district,
        address_detail: activeReq.address_detail,
        product_slug: activeReq.product_slug,
        skus: skuList,
        message: activeReq.message || null,
        status: activeReq.status || 'pending',
        assigned_sales_id: activeReq.assigned_sales_id || null
      });

      if (res.success) {
        setFormOpen(false);
        setActiveReq(null);
        setFormError('');
        window.location.reload();
      } else {
        setFormError(res.error || 'Không thể lưu yêu cầu hàng mẫu. Vui lòng thử lại.');
      }
    });
  };

  const handleAddFormItem = () => {
    if (!activeReq) return;
    const newItems = [...(activeReq.skus || [])];
    newItems.push(skus[0]?.sku_code || '');
    setActiveReq({ ...activeReq, skus: newItems });
  };

  const handleRemoveFormItem = (idx: number) => {
    if (!activeReq) return;
    const newItems = (activeReq.skus || []).filter((_: any, i: number) => i !== idx);
    setActiveReq({ ...activeReq, skus: newItems });
  };

  const handleUpdateFormItem = (idx: number, val: string) => {
    if (!activeReq) return;
    const newItems = (activeReq.skus || []).map((item: any, i: number) => {
      if (i === idx) return val;
      return item;
    });
    setActiveReq({ ...activeReq, skus: newItems });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
            Hệ thống quản lý mẫu test
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Yêu cầu Hàng mẫu (Sample Requests)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Phê duyệt mẫu thử sản phẩm tĩnh điện, găng tay phòng sạch của doanh nghiệp và bàn giao
            nhân viên sales theo sát.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateForm}
          className="inline-flex h-10 items-center justify-center gap-1.5 px-4 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0 animate-fade-in"
        >
          <Plus className="h-4 w-4" />
          Tạo yêu cầu hàng mẫu
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-extrabold text-rose-900 block mb-1">
              Đã xảy ra lỗi khi tải dữ liệu hàng mẫu từ API
            </span>
            <pre className="font-mono text-[11px] bg-white/60 p-2.5 rounded-lg mt-2 overflow-x-auto border border-rose-100/50 max-h-40 whitespace-pre-wrap select-all">
              {error}
            </pre>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên người liên hệ, doanh nghiệp, email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
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

      {/* List Table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-slate-300 mb-3" />
            <span className="text-sm font-extrabold text-foreground">
              Không có yêu cầu hàng mẫu nào
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
                  <th className="px-6 py-4">Doanh nghiệp / Người nhận</th>
                  <th className="px-6 py-4">Thông tin liên hệ</th>
                  <th className="px-6 py-4">Tỉnh / Thành phố</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Sales phụ trách</th>
                  <th className="px-6 py-4">Ngày gửi</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                {filteredRequests.map((req) => {
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Company & Contact Name */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-foreground leading-tight">
                            {req.company}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold mt-1">
                            Người nhận: {req.contact_name}
                          </span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-650 font-medium">{req.email}</span>
                          <span className="text-slate-400 font-medium text-[11px]">
                            {req.phone}
                          </span>
                        </div>
                      </td>

                      {/* Province */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600">
                          {req.province}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold',
                            req.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : req.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                          )}
                        >
                          {req.status === 'approved'
                            ? 'Đã duyệt'
                            : req.status === 'rejected'
                              ? 'Đã từ chối'
                              : 'Đang chờ'}
                        </span>
                      </td>

                      {/* Assigned Sales dropdown */}
                      <td className="px-6 py-4">
                        {req.status === 'rejected' ? (
                          <span className="text-slate-400 italic text-xs">---</span>
                        ) : (
                          <select
                            value={req.assigned_sales?.id || ''}
                            onChange={(e) => handleAssignSales(req.id, e.target.value)}
                            disabled={isPending}
                            className="px-2 py-1 rounded border border-slate-200 text-xs font-semibold focus:outline-none bg-white max-w-[150px] truncate"
                          >
                            <option value="">-- Chưa gán --</option>
                            {salesTeam.map((sales) => (
                              <option key={sales.id} value={sales.id}>
                                {`${sales.first_name || ''} ${sales.last_name || ''}`.trim() ||
                                  sales.email}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {req.created_at
                          ? new Date(req.created_at).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '---'}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedReq(req);
                              setActionType(null);
                              setApprovalNote(req.approval_note || '');
                              setRejectReason(req.reject_reason || '');
                              setSelectedSalesId(req.assigned_sales?.id || '');
                            }}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(req)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-foreground transition-colors"
                            title="Sửa yêu cầu"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteReq(req.id)}
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

      {/* Modal: View Details & Approve/Reject */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  Chi tiết Yêu cầu hàng mẫu #{selectedReq.id}
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Sản phẩm gốc yêu cầu mẫu:{' '}
                  <span className="text-slate-500 font-bold">{selectedReq.product_slug}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedReq(null);
                  setActionType(null);
                  setDetailError('');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-655"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto flex flex-col gap-6">
              {detailError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs font-bold text-rose-600 flex items-center gap-2 animate-in fade-in duration-200">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{detailError}</span>
                </div>
              )}
              {/* Information grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-150 pb-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    Thông tin người nhận mẫu
                  </h3>
                  <div className="grid grid-cols-3 gap-y-2 text-xs">
                    <span className="text-slate-400 font-bold">Doanh nghiệp:</span>
                    <span className="col-span-2 text-foreground font-extrabold">
                      {selectedReq.company}
                    </span>

                    <span className="text-slate-400 font-bold">Người nhận:</span>
                    <span className="col-span-2 text-slate-700 font-semibold">
                      {selectedReq.contact_name}
                    </span>

                    <span className="text-slate-400 font-bold">Địa chỉ giao:</span>
                    <span className="col-span-2 text-slate-600 font-semibold flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-450 shrink-0 mt-0.5" />
                      {`${selectedReq.address_detail}, ${selectedReq.district}, ${selectedReq.province}`}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-150 pb-2">
                    <Phone className="h-4 w-4 text-blue-500" />
                    Thông tin liên hệ
                  </h3>
                  <div className="grid grid-cols-3 gap-y-2 text-xs">
                    <span className="text-slate-400 font-bold">Điện thoại:</span>
                    <span className="col-span-2 text-slate-700 font-semibold flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {selectedReq.phone}
                    </span>

                    <span className="text-slate-400 font-bold">Email:</span>
                    <span className="col-span-2 text-slate-700 font-semibold flex items-center gap-1 select-all">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {selectedReq.email}
                    </span>

                    <span className="text-slate-400 font-bold">Ngày đăng ký:</span>
                    <span className="col-span-2 text-slate-600 font-semibold flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {selectedReq.created_at
                        ? new Date(selectedReq.created_at).toLocaleString('vi-VN')
                        : '---'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items (SKUs) */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  Danh sách sản phẩm mẫu yêu cầu test
                </h3>

                {selectedReq.skus && selectedReq.skus.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedReq.skus.map((skuCode, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-150 text-xs font-mono font-extrabold text-foreground select-all shadow-sm"
                      >
                        {skuCode}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 italic">
                    Không có danh sách sản phẩm mẫu.
                  </div>
                )}
              </div>

              {/* Message from client */}
              {selectedReq.message && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                    Tin nhắn / Yêu cầu thêm của khách hàng
                  </span>
                  <div className="px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 text-xs sm:text-sm text-slate-650 leading-relaxed whitespace-pre-wrap">
                    {selectedReq.message}
                  </div>
                </div>
              )}

              {/* Status handling */}
              <div className="border-t border-slate-100 pt-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Trạng thái hiện tại:
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold',
                        selectedReq.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                          : selectedReq.status === 'rejected'
                            ? 'bg-rose-50 text-rose-800 border border-rose-100'
                            : 'bg-amber-50 text-amber-800 border border-amber-100'
                      )}
                    >
                      {selectedReq.status === 'approved'
                        ? 'Đã duyệt gửi mẫu'
                        : selectedReq.status === 'rejected'
                          ? 'Đã từ chối gửi'
                          : 'Đang chờ xử lý'}
                    </span>
                  </div>

                  {selectedReq.status === 'pending' && !actionType && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActionType('reject')}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-rose-200 px-4 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors shadow-sm bg-white"
                      >
                        <XCircle className="h-4 w-4" />
                        Từ chối gửi mẫu
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionType('approve');
                          setSelectedSalesId(selectedReq.assigned_sales?.id || '');
                        }}
                        className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Duyệt & Phân công Sales
                      </button>
                    </div>
                  )}
                </div>

                {/* Approve/Reject Form */}
                {actionType && (
                  <form
                    onSubmit={handleProcessSubmit}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200"
                  >
                    <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-1">
                      <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                        {actionType === 'approve'
                          ? 'Phê duyệt gửi hàng mẫu'
                          : 'Từ chối gửi mẫu thử'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setActionType(null)}
                        className="text-xs text-slate-400 hover:text-slate-650 font-bold"
                      >
                        Hủy
                      </button>
                    </div>

                    {actionType === 'approve' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Assigned Sales */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                            Gán nhân viên Sales chăm sóc *
                          </label>
                          <select
                            required
                            value={selectedSalesId}
                            onChange={(e) => setSelectedSalesId(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white"
                          >
                            <option value="">-- Chọn Salesman --</option>
                            {salesTeam.map((sales) => (
                              <option key={sales.id} value={sales.id}>
                                {`${sales.first_name || ''} ${sales.last_name || ''}`.trim() ||
                                  sales.email}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Approval Note */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                            Ghi chú duyệt
                          </label>
                          <input
                            type="text"
                            value={approvalNote}
                            onChange={(e) => setApprovalNote(e.target.value)}
                            placeholder="Ghi chú đóng gói hoặc gửi hàng..."
                            className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                          />
                        </div>
                      </div>
                    )}

                    {actionType === 'reject' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                          Lý do từ chối gửi mẫu *
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Nhập lý do từ chối (ví dụ: Không thể gửi hạt nhựa mẫu khối lượng lớn, thông tin doanh nghiệp không khớp)..."
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
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className={cn(
                          'px-4 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-colors',
                          actionType === 'approve'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                        )}
                      >
                        {isPending
                          ? 'Đang thực hiện...'
                          : actionType === 'approve'
                            ? 'Xác nhận duyệt'
                            : 'Xác nhận từ chối'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Display resolved info */}
                {selectedReq.status === 'approved' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50 text-xs animate-fade-in">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        Ghi chú gửi mẫu:
                      </span>
                      <span className="text-emerald-900 font-semibold">
                        {selectedReq.approval_note || 'Không có ghi chú.'}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        Sales theo sát:
                      </span>
                      <span className="text-emerald-900 font-extrabold flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-emerald-600" />
                        {selectedReq.assigned_sales
                          ? `${selectedReq.assigned_sales.first_name || ''} ${selectedReq.assigned_sales.last_name || ''}`.trim() ||
                            'Salesperson'
                          : 'Chưa phân công'}
                      </span>
                    </div>
                  </div>
                )}

                {selectedReq.status === 'rejected' && (
                  <div className="bg-rose-50/30 p-4 rounded-xl border border-rose-100/50 text-xs flex flex-col gap-1 animate-fade-in">
                    <span className="text-[10px] font-bold text-rose-700 uppercase">
                      Lý do từ chối:
                    </span>
                    <span className="text-rose-900 font-semibold">
                      {selectedReq.reject_reason || 'Không có lý do rõ ràng.'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setSelectedReq(null);
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

      {/* Modal: Create or Edit Sample Request Form */}
      {formOpen && activeReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  {activeReq.id
                    ? `Cập nhật yêu cầu hàng mẫu #${activeReq.id}`
                    : 'Tạo yêu cầu hàng mẫu mới'}
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Nhập thông tin người nhận, địa chỉ vận chuyển và sản phẩm mẫu yêu cầu test.
                </p>
              </div>
              <button
                onClick={() => {
                  setFormOpen(false);
                  setActiveReq(null);
                  setFormError('');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-655"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col max-h-[70vh] overflow-hidden"
            >
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs font-bold text-rose-600 flex items-center gap-2 animate-in fade-in duration-200 mb-6">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Column: Customer details */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-1">
                    <Building className="h-4 w-4 text-blue-500" />
                    Thông tin giao nhận
                  </h3>

                  {/* Company */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                      Tên doanh nghiệp *
                    </label>
                    <input
                      type="text"
                      required
                      value={activeReq.company || ''}
                      onChange={(e) => setActiveReq({ ...activeReq, company: e.target.value })}
                      placeholder="Công ty TNHH ULink Việt Nam"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650 shadow-sm"
                    />
                  </div>

                  {/* Contact Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                      Người nhận mẫu *
                    </label>
                    <input
                      type="text"
                      required
                      value={activeReq.contact_name || ''}
                      onChange={(e) => setActiveReq({ ...activeReq, contact_name: e.target.value })}
                      placeholder="Nguyễn Văn B"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                    />
                  </div>

                  {/* Email & Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={activeReq.email || ''}
                        onChange={(e) => setActiveReq({ ...activeReq, email: e.target.value })}
                        placeholder="recipient@company.com"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Điện thoại *
                      </label>
                      <input
                        type="text"
                        required
                        value={activeReq.phone || ''}
                        onChange={(e) => setActiveReq({ ...activeReq, phone: e.target.value })}
                        placeholder="0912345678"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                      />
                    </div>
                  </div>

                  {/* Address Details (divided fields) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Tỉnh / Thành phố *
                      </label>
                      <input
                        type="text"
                        required
                        value={activeReq.province || ''}
                        onChange={(e) => setActiveReq({ ...activeReq, province: e.target.value })}
                        placeholder="Hà Nội"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Quận / Huyện *
                      </label>
                      <input
                        type="text"
                        required
                        value={activeReq.district || ''}
                        onChange={(e) => setActiveReq({ ...activeReq, district: e.target.value })}
                        placeholder="Đông Anh"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                      Địa chỉ chi tiết *
                    </label>
                    <input
                      type="text"
                      required
                      value={activeReq.address_detail || ''}
                      onChange={(e) =>
                        setActiveReq({ ...activeReq, address_detail: e.target.value })
                      }
                      placeholder="Lô C4, KCN Thăng Long"
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                    />
                  </div>

                  {/* Product slug reference */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                      Đường dẫn sản phẩm gốc *
                    </label>
                    <input
                      type="text"
                      required
                      value={activeReq.product_slug || ''}
                      onChange={(e) => setActiveReq({ ...activeReq, product_slug: e.target.value })}
                      placeholder="gang-tay-nitrile-chong-tinh-dien"
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                    />
                  </div>

                  {/* Status & Assigned Sales */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-1">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Trạng thái
                      </label>
                      <select
                        value={activeReq.status || 'pending'}
                        onChange={(e) => setActiveReq({ ...activeReq, status: e.target.value })}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white shadow-sm"
                      >
                        <option value="pending">Đang chờ (Pending)</option>
                        <option value="approved">Đã duyệt (Approved)</option>
                        <option value="rejected">Từ chối (Rejected)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Sales phụ trách
                      </label>
                      <select
                        value={activeReq.assigned_sales_id || ''}
                        onChange={(e) =>
                          setActiveReq({ ...activeReq, assigned_sales_id: e.target.value || null })
                        }
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white shadow-sm"
                      >
                        <option value="">-- Chưa gán --</option>
                        {salesTeam.map((sales) => (
                          <option key={sales.id} value={sales.id}>
                            {`${sales.first_name || ''} ${sales.last_name || ''}`.trim() ||
                              sales.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                      Yêu cầu đính kèm
                    </label>
                    <textarea
                      rows={3}
                      value={activeReq.message || ''}
                      onChange={(e) => setActiveReq({ ...activeReq, message: e.target.value })}
                      placeholder="Lời nhắn từ khách hàng..."
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                    />
                  </div>
                </div>

                {/* Right Column: Skus list configuration */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                    <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="h-4 w-4 text-blue-500" />
                      Mẫu sản phẩm đăng ký ({activeReq.skus?.length || 0})
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddFormItem}
                      className="inline-flex h-7 items-center justify-center gap-1 px-3.5 rounded-lg border border-blue-200 text-[10px] font-extrabold text-blue-600 hover:bg-blue-50 bg-white transition-all shadow-sm"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Thêm SKU mẫu
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto pr-1">
                    {(activeReq.skus || []).map((skuCode: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 border border-slate-150 rounded-xl bg-slate-50/30 flex items-center justify-between gap-3 relative animate-in fade-in duration-150"
                      >
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-[9px] font-bold text-slate-450 uppercase">
                            Chọn mã SKU mẫu *
                          </label>
                          <select
                            required
                            value={skuCode}
                            onChange={(e) => handleUpdateFormItem(idx, e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-foreground bg-white focus:outline-none"
                          >
                            <option value="">-- Chọn sản phẩm --</option>
                            {skus.map((skuOption) => (
                              <option key={skuOption.id} value={skuOption.sku_code}>
                                {skuOption.sku_code}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFormItem(idx)}
                          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors mt-4"
                          title="Xóa dòng"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {(activeReq.skus || []).length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        Chưa chọn sản phẩm mẫu nào. Nhấp &quot;+ Thêm SKU mẫu&quot; để chọn hàng.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setActiveReq(null);
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
