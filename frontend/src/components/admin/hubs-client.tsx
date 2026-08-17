'use client';

import React, { useState, useTransition } from 'react';
import toast from 'react-hot-toast';
import {
  Search,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  BarChart2,
  Shield,
  X,
  AlertTriangle,
  Navigation,
  Box,
  Zap,
  CheckCircle2,
  Building2
} from '@/components/icons';
import { cn } from '@/lib/utils';
import { saveHub, deleteHub } from '@/app/[locale]/admin/hubs/actions';

interface ProvinceOption {
  id: number;
  name: string;
  abbr: string;
}

interface HubItem {
  id: number;
  status: 'published' | 'draft' | 'archived';
  hub_code: string;
  name: string;
  slug: string;
  province?: { id: number; name: string } | null;
  detail_address: string;
  operating_status: 'active' | 'stopped' | 'maintenance' | 'full' | 'temporarily_closed';
  coordinates?: string | null;
  warehouse_total_area?: number | null;
  warehouse_utilized_area?: number | null;
  warehouse_available_area?: number | null;
  warehouse_storage_tons?: number | null;
  warehouse_pallets?: number | null;
  standard_delivery_time?: string | null;
  on_time_rate?: number | null;
  orders_today?: number | null;
}

interface HubsClientProps {
  initialHubs: HubItem[];
  provinces: ProvinceOption[];
  error?: string;
}

const OPERATING_STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  active: { label: 'Đang hoạt động', classes: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  stopped: { label: 'Dừng hoạt động', classes: 'bg-rose-50 text-rose-700 border-rose-100' },
  maintenance: { label: 'Đang bảo trì', classes: 'bg-amber-50 text-amber-700 border-amber-100' },
  full: { label: 'Đầy hàng', classes: 'bg-slate-100 text-slate-700 border-slate-200' },
  temporarily_closed: {
    label: 'Đóng cửa tạm thời',
    classes: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  }
};

export function HubsClient({ initialHubs, provinces, error }: HubsClientProps) {
  const [hubs, setHubs] = useState<HubItem[]>(initialHubs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  // Form Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [activeHub, setActiveHub] = useState<any | null>(null);
  const [formError, setFormError] = useState('');
  const [selectedHub, setSelectedHub] = useState<HubItem | null>(null);

  // Filter hubs
  const filteredHubs = hubs.filter((h) => {
    const name = (h.name || '').toLowerCase();
    const code = (h.hub_code || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = name.includes(q) || code.includes(q);
    const matchesStatus = statusFilter === 'all' || h.operating_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenCreateForm = () => {
    const selectedProv = provinces[0];
    const provAbbr = selectedProv ? selectedProv.abbr : 'TEMP';
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const codeVal = `HUB-${provAbbr.toUpperCase()}-${randomSeq}`;

    setActiveHub({
      status: 'published',
      hub_code: codeVal,
      name: '',
      slug: '',
      provinceId: selectedProv?.id || 0,
      detail_address: '',
      operating_status: 'active',
      coordinates: '',
      warehouse_total_area: '',
      warehouse_utilized_area: '',
      warehouse_available_area: '',
      warehouse_storage_tons: '',
      warehouse_pallets: '',
      standard_delivery_time: '24h - 48h',
      on_time_rate: 98,
      orders_today: 0
    });
    setFormOpen(true);
    setFormError('');
  };

  const handleOpenEditForm = (h: HubItem) => {
    const selectedProv = provinces.find((p) => p.id === (h.province?.id || provinces[0]?.id));
    const provAbbr = selectedProv ? selectedProv.abbr : 'TEMP';
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const generatedCode = h.hub_code || `HUB-${provAbbr.toUpperCase()}-${randomSeq}`;

    setActiveHub({
      id: h.id,
      status: h.status,
      hub_code: generatedCode,
      name: h.name,
      slug: h.slug,
      provinceId: h.province?.id || provinces[0]?.id || 0,
      detail_address: h.detail_address,
      operating_status: h.operating_status,
      coordinates: h.coordinates || '',
      warehouse_total_area: h.warehouse_total_area || '',
      warehouse_utilized_area: h.warehouse_utilized_area || '',
      warehouse_available_area: h.warehouse_available_area || '',
      warehouse_storage_tons: h.warehouse_storage_tons || '',
      warehouse_pallets: h.warehouse_pallets || '',
      standard_delivery_time: h.standard_delivery_time || '',
      on_time_rate: h.on_time_rate || '',
      orders_today: h.orders_today || ''
    });
    setFormOpen(true);
    setFormError('');
  };

  // Auto generate hub code & slug when typing name
  const handleNameChange = (nameVal: string) => {
    if (!activeHub) return;
    if (activeHub.id) {
      // Edit mode: only change name
      setActiveHub({ ...activeHub, name: nameVal });
      return;
    }

    // Create mode: generate slug & hub code
    const slugVal = nameVal
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    const selectedProv = provinces.find((p) => p.id === activeHub.provinceId);
    const provAbbr = selectedProv ? selectedProv.abbr : 'TEMP';
    const randomSeq = Math.floor(100 + Math.random() * 900); // Sequence ngẫu nhiên 3 chữ số để tránh trùng lặp
    const codeVal = `HUB-${provAbbr.toUpperCase()}-${randomSeq}`;

    setActiveHub({
      ...activeHub,
      name: nameVal,
      slug: slugVal,
      hub_code: codeVal
    });
  };

  const handleProvinceChange = (pId: number) => {
    if (!activeHub) return;
    const selectedProv = provinces.find((p) => p.id === pId);
    const provAbbr = selectedProv ? selectedProv.abbr : 'TEMP';

    if (activeHub.id) {
      // Edit mode: only change province
      setActiveHub({ ...activeHub, provinceId: pId });
    } else {
      // Create mode: regenerate hub code
      const currentCode = activeHub.hub_code || '';
      const parts = currentCode.split('-');
      const seq = parts.length > 2 ? parts[2] : '001';
      const codeVal = `HUB-${provAbbr.toUpperCase()}-${seq}`;

      setActiveHub({
        ...activeHub,
        provinceId: pId,
        hub_code: codeVal
      });
    }
  };

  const handleDeleteHub = async (id: number) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa chi nhánh Hub này không? Thao tác này có thể ảnh hưởng đến dữ liệu RFQ và Hàng mẫu liên quan.'
      )
    )
      return;

    startTransition(async () => {
      const res = await deleteHub(id);
      if (res.success) {
        setHubs((prev) => prev.filter((h) => h.id !== id));
        toast.success('Đã xóa chi nhánh Hub thành công.');
      } else {
        toast.error('Không thể xóa chi nhánh: ' + res.error);
      }
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHub) return;

    setFormError('');
    if (
      !activeHub.name ||
      !activeHub.slug ||
      !activeHub.hub_code ||
      !activeHub.detail_address ||
      !activeHub.provinceId
    ) {
      setFormError('Vui lòng nhập đầy đủ các thông tin bắt buộc.');
      return;
    }

    startTransition(async () => {
      const res = await saveHub({
        id: activeHub.id,
        status: activeHub.status,
        hub_code: activeHub.hub_code,
        name: activeHub.name,
        slug: activeHub.slug,
        provinceId: Number(activeHub.provinceId),
        detail_address: activeHub.detail_address,
        operating_status: activeHub.operating_status,
        coordinates: activeHub.coordinates || null,
        warehouse_total_area: activeHub.warehouse_total_area
          ? Number(activeHub.warehouse_total_area)
          : null,
        warehouse_utilized_area: activeHub.warehouse_utilized_area
          ? Number(activeHub.warehouse_utilized_area)
          : null,
        warehouse_available_area: activeHub.warehouse_available_area
          ? Number(activeHub.warehouse_available_area)
          : null,
        warehouse_storage_tons: activeHub.warehouse_storage_tons
          ? Number(activeHub.warehouse_storage_tons)
          : null,
        warehouse_pallets: activeHub.warehouse_pallets ? Number(activeHub.warehouse_pallets) : null,
        standard_delivery_time: activeHub.standard_delivery_time || null,
        on_time_rate: activeHub.on_time_rate ? Number(activeHub.on_time_rate) : null,
        orders_today: activeHub.orders_today ? Number(activeHub.orders_today) : null
      });

      if (res.success) {
        setFormOpen(false);
        setActiveHub(null);
        setFormError('');
        window.location.reload();
      } else {
        setFormError(res.error || 'Thao tác thất bại. Vui lòng thử lại.');
      }
    });
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
            Hệ thống kho vận & Địa lý
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Chi nhánh & Regional Hubs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Quản lý mạng lưới chi nhánh, tổng kho hàng và phân tích năng lực vận kho, SLA giao nhận
            trên toàn quốc.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateForm}
          className="inline-flex h-10 items-center justify-center gap-1.5 px-4 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0 animate-fade-in"
        >
          <Plus className="h-4 w-4" />
          Thêm chi nhánh mới
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-extrabold text-rose-900 block mb-1">
              Đã xảy ra lỗi khi tải dữ liệu chi nhánh Hubs
            </span>
            <pre className="font-mono text-[11px] bg-white/60 p-2.5 rounded-lg mt-2 overflow-x-auto border border-rose-100/50 max-h-40 whitespace-pre-wrap select-all">
              {error}
            </pre>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên chi nhánh, mã Hub code..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
          />
        </div>

        {/* Operating status filter */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white shadow-sm"
          >
            <option value="all">Tất cả trạng thái vận hành</option>
            <option value="active">Đang hoạt động</option>
            <option value="stopped">Dừng hoạt động</option>
            <option value="maintenance">Đang bảo trì</option>
            <option value="full">Đầy hàng</option>
            <option value="temporarily_closed">Đóng cửa tạm thời</option>
          </select>
        </div>
      </div>

      {/* Hub Table */}
      <div className="bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden mb-10">
        {filteredHubs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Home className="h-12 w-12 text-slate-300 mb-3" />
            <span className="text-sm font-extrabold text-foreground">
              Không tìm thấy chi nhánh nào
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Mã Hub</th>
                  <th className="px-6 py-4">Tên chi nhánh</th>
                  <th className="px-6 py-4">Tỉnh / Thành</th>
                  <th className="px-6 py-4">Địa chỉ chi tiết</th>
                  <th className="px-6 py-4">Trạng thái vận hành</th>
                  <th className="px-6 py-4">Trạng thái phát hành</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHubs.map((hub) => {
                  const osc = OPERATING_STATUS_CONFIG[hub.operating_status] || {
                    label: hub.operating_status,
                    classes: 'bg-slate-100 text-slate-800 border-slate-200'
                  };
                  return (
                    <tr
                      key={hub.id}
                      onClick={() => setSelectedHub(hub)}
                      className="hover:bg-slate-50/30 cursor-pointer transition-colors"
                    >
                      {/* Code */}
                      <td className="px-6 py-4 font-mono font-extrabold text-blue-650">
                        {hub.hub_code || (
                          <span className="text-amber-500 font-bold text-xs italic">
                            Chưa có mã (Click để sửa)
                          </span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4 font-extrabold text-foreground">{hub.name}</td>

                      {/* Province */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-650">
                          {hub.province?.name || '---'}
                        </span>
                      </td>

                      {/* Address */}
                      <td className="px-6 py-4 text-slate-500 font-medium truncate max-w-[250px]">
                        {hub.detail_address}
                      </td>

                      {/* Operating Status */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center border px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                            osc.classes
                          )}
                        >
                          {osc.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center border border-slate-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white">
                          {hub.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(hub)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-foreground transition-colors"
                            title="Sửa chi nhánh"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHub(hub.id)}
                            className="p-1.5 rounded hover:bg-slate-100 text-rose-500 hover:text-rose-700 transition-colors"
                            title="Xóa chi nhánh"
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

      {/* Modal: Create or Edit Hub Form */}
      {formOpen && activeHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-500" />
                  {activeHub.id
                    ? `Cập nhật chi nhánh: ${activeHub.name}`
                    : 'Thêm chi nhánh Hub mới'}
                </h2>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Điền các thông số địa lý, năng lực kho vận và tiêu chuẩn dịch vụ SLA của chi nhánh
                  Hub.
                </p>
              </div>
              <button
                onClick={() => {
                  setFormOpen(false);
                  setActiveHub(null);
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
                {/* Left Column: Basic Geo settings */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-1">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Thông tin địa lý & hành chính
                  </h3>

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                      Tên chi nhánh Hub *
                    </label>
                    <input
                      type="text"
                      required
                      value={activeHub.name || ''}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Hub Hà Nội (Đông Anh)"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650 shadow-sm"
                    />
                  </div>

                  {/* Slug & Hub Code */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Slug định danh *
                      </label>
                      <input
                        type="text"
                        required
                        value={activeHub.slug || ''}
                        onChange={(e) => setActiveHub({ ...activeHub, slug: e.target.value })}
                        placeholder="hub-ha-noi-dong-anh"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Mã Hub code *
                      </label>
                      <input
                        type="text"
                        required
                        value={activeHub.hub_code || ''}
                        onChange={(e) => setActiveHub({ ...activeHub, hub_code: e.target.value })}
                        placeholder="HUB-HN-001"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-foreground focus:outline-none bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Provinces selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                      Tỉnh / Thành phố *
                    </label>
                    <select
                      value={activeHub.provinceId || ''}
                      onChange={(e) => handleProvinceChange(Number(e.target.value))}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white shadow-sm"
                    >
                      {provinces.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Detail Address */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                      Địa chỉ chi tiết kho *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={activeHub.detail_address || ''}
                      onChange={(e) =>
                        setActiveHub({ ...activeHub, detail_address: e.target.value })
                      }
                      placeholder="Lô C4, Khu công nghiệp Thăng Long, Huyện Đông Anh..."
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                    />
                  </div>

                  {/* Coordinates */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                      Tọa độ GPS (lat,lng)
                    </label>
                    <input
                      type="text"
                      value={activeHub.coordinates || ''}
                      onChange={(e) => setActiveHub({ ...activeHub, coordinates: e.target.value })}
                      placeholder="21.1345,105.8234"
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                    />
                  </div>

                  {/* Status & Operating Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Trạng thái vận hành *
                      </label>
                      <select
                        value={activeHub.operating_status || 'active'}
                        onChange={(e) =>
                          setActiveHub({ ...activeHub, operating_status: e.target.value })
                        }
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white shadow-sm"
                      >
                        <option value="active">Đang hoạt động</option>
                        <option value="stopped">Dừng hoạt động</option>
                        <option value="maintenance">Đang bảo trì</option>
                        <option value="full">Đầy hàng</option>
                        <option value="temporarily_closed">Đóng cửa tạm thời</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Trạng thái phát hành *
                      </label>
                      <select
                        value={activeHub.status || 'published'}
                        onChange={(e) => setActiveHub({ ...activeHub, status: e.target.value })}
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white shadow-sm"
                      >
                        <option value="published">Đã xuất bản (Published)</option>
                        <option value="draft">Bản nháp (Draft)</option>
                        <option value="archived">Lưu trữ (Archived)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Warehouse capacity & SLA metrics */}
                <div className="flex flex-col gap-4">
                  {/* Warehouse Capacity */}
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-1">
                    <Box className="h-4 w-4 text-blue-500" />
                    Thông số năng lực kho hàng
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Tổng diện tích kho (m²)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={activeHub.warehouse_total_area || ''}
                        onChange={(e) =>
                          setActiveHub({ ...activeHub, warehouse_total_area: e.target.value })
                        }
                        placeholder="1000"
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Diện tích đã sử dụng (m²)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={activeHub.warehouse_utilized_area || ''}
                        onChange={(e) =>
                          setActiveHub({ ...activeHub, warehouse_utilized_area: e.target.value })
                        }
                        placeholder="700"
                        className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        DT khả dụng (m²)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={activeHub.warehouse_available_area || ''}
                        onChange={(e) =>
                          setActiveHub({ ...activeHub, warehouse_available_area: e.target.value })
                        }
                        placeholder="300"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Tấn hàng chứa tối đa
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={activeHub.warehouse_storage_tons || ''}
                        onChange={(e) =>
                          setActiveHub({ ...activeHub, warehouse_storage_tons: e.target.value })
                        }
                        placeholder="50"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Số vị trí Pallets
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={activeHub.warehouse_pallets || ''}
                        onChange={(e) =>
                          setActiveHub({ ...activeHub, warehouse_pallets: e.target.value })
                        }
                        placeholder="500"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* SLA metrics */}
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-1 mt-4">
                    <BarChart2 className="h-4 w-4 text-blue-500" />
                    Hiệu suất vận hành & SLA dịch vụ
                  </h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                      Thời gian giao hàng tiêu chuẩn
                    </label>
                    <input
                      type="text"
                      value={activeHub.standard_delivery_time || ''}
                      onChange={(e) =>
                        setActiveHub({ ...activeHub, standard_delivery_time: e.target.value })
                      }
                      placeholder="24h - 48h hoặc Trong ngày"
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Tỉ lệ giao đúng giờ (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        value={activeHub.on_time_rate || ''}
                        onChange={(e) =>
                          setActiveHub({ ...activeHub, on_time_rate: e.target.value })
                        }
                        placeholder="98"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Đơn hàng trong hôm nay
                      </label>
                      <input
                        type="number"
                        value={activeHub.orders_today || ''}
                        onChange={(e) =>
                          setActiveHub({ ...activeHub, orders_today: e.target.value })
                        }
                        placeholder="12"
                        className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setActiveHub(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-550 hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu chi nhánh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Hub Details */}
      {selectedHub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                  <Home className="h-5 w-5 text-blue-500" />
                  Chi tiết chi nhánh: {selectedHub.name}
                </h2>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="font-mono text-[10px] font-extrabold text-slate-400 bg-slate-100 border border-slate-200/50 px-1.5 py-0.5 rounded">
                    {selectedHub.hub_code}
                  </span>
                  <span className="text-[10px] text-slate-450 font-bold">
                    slug: {selectedHub.slug}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedHub(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto flex flex-col gap-6">
              {/* Address details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 text-xs sm:text-sm">
                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-150 pb-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    Địa chỉ kho hàng
                  </h3>
                  <div className="grid grid-cols-3 gap-y-2 text-xs">
                    <span className="text-slate-400 font-bold">Tỉnh / Thành:</span>
                    <span className="col-span-2 text-foreground font-extrabold">
                      {selectedHub.province?.name || '---'}
                    </span>

                    <span className="text-slate-400 font-bold">Địa chỉ chi tiết:</span>
                    <span className="col-span-2 text-slate-700 font-semibold">
                      {selectedHub.detail_address}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-150 pb-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Cấu hình trạng thái
                  </h3>
                  <div className="grid grid-cols-3 gap-y-2 text-xs">
                    <span className="text-slate-400 font-bold">Vận hành:</span>
                    <span className="col-span-2">
                      <span
                        className={cn(
                          'inline-flex items-center border px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider',
                          OPERATING_STATUS_CONFIG[selectedHub.operating_status]?.classes
                        )}
                      >
                        {OPERATING_STATUS_CONFIG[selectedHub.operating_status]?.label ||
                          selectedHub.operating_status}
                      </span>
                    </span>

                    <span className="text-slate-400 font-bold">Xuất bản:</span>
                    <span className="col-span-2">
                      <span className="inline-flex items-center border border-slate-200 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white">
                        {selectedHub.status === 'published'
                          ? 'Đã xuất bản (Published)'
                          : 'Bản nháp (Draft)'}
                      </span>
                    </span>

                    {selectedHub.coordinates && (
                      <>
                        <span className="text-slate-400 font-bold">Tọa độ GPS:</span>
                        <span className="col-span-2 text-slate-600 font-mono font-semibold">
                          {selectedHub.coordinates}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Capacity details block */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Box className="h-4 w-4 text-blue-500" />
                  Năng lực & Sức chứa kho hàng
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1">
                      TỔNG DIỆN TÍCH
                    </span>
                    <span className="text-foreground font-extrabold text-sm sm:text-base">
                      {selectedHub.warehouse_total_area
                        ? `${selectedHub.warehouse_total_area} m²`
                        : '---'}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1">
                      ĐÃ SỬ DỤNG
                    </span>
                    <span className="text-slate-700 font-extrabold text-sm sm:text-base">
                      {selectedHub.warehouse_utilized_area
                        ? `${selectedHub.warehouse_utilized_area} m²`
                        : '---'}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1">
                      KHẢ DỤNG
                    </span>
                    <span className="text-emerald-600 font-extrabold text-sm sm:text-base">
                      {selectedHub.warehouse_available_area
                        ? `${selectedHub.warehouse_available_area} m²`
                        : '---'}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center shadow-sm">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1">
                      TỐI ĐA (TẤN)
                    </span>
                    <span className="text-foreground font-extrabold text-sm sm:text-base">
                      {selectedHub.warehouse_storage_tons
                        ? `${selectedHub.warehouse_storage_tons} tấn`
                        : '---'}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-center shadow-sm col-span-2 sm:col-span-1">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1">
                      SỐ PALLETS
                    </span>
                    <span className="text-blue-600 font-extrabold text-sm sm:text-base">
                      {selectedHub.warehouse_pallets
                        ? `${selectedHub.warehouse_pallets} pallets`
                        : '---'}
                    </span>
                  </div>
                </div>
              </div>

              {/* SLA Metrics block */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  SLA Dịch vụ & Đơn hàng
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1">
                      THỜI GIAN GIAO TIÊU CHUẨN
                    </span>
                    <span className="text-foreground font-extrabold text-sm sm:text-base">
                      {selectedHub.standard_delivery_time || '24h - 48h'}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1">
                      TỈ LỆ GIAO ĐÚNG GIỜ
                    </span>
                    <span className="text-emerald-600 font-extrabold text-sm sm:text-base">
                      {selectedHub.on_time_rate ? `${selectedHub.on_time_rate}%` : '98%'}
                    </span>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 flex flex-col items-center justify-center">
                    <span className="text-slate-400 text-[10px] font-bold block mb-1">
                      ĐƠN HÀNG HÔM NAY
                    </span>
                    <span className="text-blue-600 font-extrabold text-sm sm:text-base">
                      {selectedHub.orders_today ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedHub(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-550 hover:bg-slate-100 transition-colors"
              >
                Đóng lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
