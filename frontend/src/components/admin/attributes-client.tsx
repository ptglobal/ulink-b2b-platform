'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Search, Edit, Trash, Settings2, Sliders, X, Tag, ListChecks, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  saveAttribute,
  deleteAttribute,
  saveAttributeOption,
  deleteAttributeOption
} from '@/app/[locale]/admin/attributes/actions';

interface Option {
  id: number;
  value: string;
  sku_suffix: string;
  sort: number;
}

interface Attribute {
  id: number;
  name: string;
  slug: string;
  sort: number;
  options?: Option[];
}

interface AttributesClientProps {
  initialAttributes: Attribute[];
  error?: string;
}

export function AttributesClient({ initialAttributes, error }: AttributesClientProps) {
  const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes);
  const [selectedAttrId, setSelectedAttrId] = useState<number | null>(
    initialAttributes.length > 0 ? initialAttributes[0].id : null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [attrModalOpen, setAttrModalOpen] = useState(false);
  const [activeAttr, setActiveAttr] = useState<Partial<Attribute> | null>(null);

  const [optModalOpen, setOptModalOpen] = useState(false);
  const [activeOpt, setActiveOpt] = useState<Partial<Option> & { attributeId: number } | null>(null);

  const selectedAttr = attributes.find((a) => a.id === selectedAttrId);

  // Filter attributes by search
  const filteredAttributes = attributes.filter((attr) => {
    const q = searchQuery.toLowerCase();
    return (
      attr.name.toLowerCase().includes(q) ||
      attr.slug.toLowerCase().includes(q)
    );
  });

  // Handle Attribute Submit
  const handleAttrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAttr?.name || !activeAttr?.slug) {
      alert('Vui lòng điền tên thuộc tính và slug.');
      return;
    }

    startTransition(async () => {
      const res = await saveAttribute({
        id: activeAttr.id,
        name: activeAttr.name!,
        slug: activeAttr.slug!,
        sort: activeAttr.sort
      });

      if (res.success) {
        setAttrModalOpen(false);
        setActiveAttr(null);
        window.location.reload();
      } else {
        alert('Không thể lưu thuộc tính: ' + res.error);
      }
    });
  };

  // Handle Delete Attribute
  const handleDeleteAttr = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa thuộc tính này? Toàn bộ tùy chọn liên quan sẽ bị xóa.')) {
      startTransition(async () => {
        const res = await deleteAttribute(id);
        if (res.success) {
          setAttributes((prev) => prev.filter((a) => a.id !== id));
          if (selectedAttrId === id) {
            const remaining = attributes.filter((a) => a.id !== id);
            setSelectedAttrId(remaining.length > 0 ? remaining[0].id : null);
          }
        } else {
          alert(res.error);
        }
      });
    }
  };

  // Handle Option Submit
  const handleOptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOpt?.value || !activeOpt?.sku_suffix) {
      alert('Vui lòng điền giá trị tùy chọn và hậu tố SKU.');
      return;
    }

    startTransition(async () => {
      const res = await saveAttributeOption({
        id: activeOpt.id,
        attributeId: activeOpt.attributeId,
        value: activeOpt.value!,
        sku_suffix: activeOpt.sku_suffix!,
        sort: activeOpt.sort
      });

      if (res.success) {
        setOptModalOpen(false);
        setActiveOpt(null);
        window.location.reload();
      } else {
        alert('Không thể lưu tùy chọn: ' + res.error);
      }
    });
  };

  // Handle Delete Option
  const handleDeleteOpt = async (optId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa tùy chọn này?')) {
      startTransition(async () => {
        const res = await deleteAttributeOption(optId);
        if (res.success) {
          window.location.reload();
        } else {
          alert(res.error);
        }
      });
    }
  };

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      {/* Header */}
      <div className="border-b border-slate-100 pb-6 mb-8">
        <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
          Cơ cấu sản phẩm
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight mt-1">
          Quản lý Thuộc tính & Tùy chọn (Attributes & Options)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
          Định nghĩa các thuộc tính phân loại (Size, Color...) và thiết lập bộ giá trị tương ứng để tự sinh SKU.
        </p>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-extrabold text-rose-900 block mb-1">
              Đã xảy ra lỗi khi tải dữ liệu thuộc tính từ API
            </span>
            <pre className="font-mono text-[11px] bg-white/60 p-2.5 rounded-lg mt-2 overflow-x-auto border border-rose-100/50 max-h-40 whitespace-pre-wrap select-all">
              {error}
            </pre>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Attributes List */}
        <div className="lg:col-span-1 bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden p-5">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-sm font-extrabold text-[#0F1E36] uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-blue-500" />
              Thuộc tính toàn cục
            </h2>
            <button
              onClick={() => {
                setActiveAttr({ sort: 1 });
                setAttrModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              title="Thêm thuộc tính"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm thuộc tính..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          {/* Attributes List */}
          <div className="flex flex-col gap-1.5 max-h-[500px] overflow-y-auto">
            {filteredAttributes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                Không tìm thấy thuộc tính nào.
              </div>
            ) : (
              filteredAttributes.map((attr) => (
                <div
                  key={attr.id}
                  onClick={() => setSelectedAttrId(attr.id)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border text-xs sm:text-sm font-bold cursor-pointer transition-all",
                    selectedAttrId === attr.id
                      ? "bg-blue-50/50 border-blue-200 text-blue-700 shadow-sm"
                      : "bg-white border-slate-100 text-[#0F1E36] hover:bg-slate-50/60"
                  )}
                >
                  <div className="flex flex-col">
                    <span>{attr.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono font-normal mt-0.5">
                      slug: {attr.slug}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveAttr(attr);
                        setAttrModalOpen(true);
                      }}
                      className="p-1 rounded hover:bg-slate-200/50 text-slate-500"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAttr(attr.id);
                      }}
                      className="p-1 rounded hover:bg-slate-200/50 text-slate-500 hover:text-rose-600"
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Attribute Options Detail */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl shadow-sm p-6 min-h-[400px]">
          {selectedAttr ? (
            <div>
              {/* Selected Attribute Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-extrabold text-[#0F1E36]">
                      Tùy chọn cho thuộc tính: {selectedAttr.name}
                    </h2>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-650">
                      key: {selectedAttr.slug}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    Cập nhật danh sách các giá trị phân loại để hiển thị dạng dropdown.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setActiveOpt({ attributeId: selectedAttr.id, sort: 1 });
                    setOptModalOpen(true);
                  }}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm tùy chọn mới
                </button>
              </div>

              {/* Options Table */}
              {!selectedAttr.options || selectedAttr.options.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ListChecks className="h-10 w-10 text-slate-300 mb-2" />
                  <span className="text-xs font-bold text-slate-500">
                    Thuộc tính này chưa có giá trị tùy chọn nào
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Nhấp vào nút ở trên để bắt đầu thêm tùy chọn (Ví dụ: Trắng, Xanh, S, M, L).
                  </span>
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-100 rounded-lg">
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                        <th className="px-5 py-3.5">Giá trị hiển thị</th>
                        <th className="px-5 py-3.5">Hậu tố SKU Code</th>
                        <th className="px-5 py-3.5">Thứ tự</th>
                        <th className="px-5 py-3.5 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-650">
                      {selectedAttr.options
                        .sort((a, b) => a.sort - b.sort)
                        .map((opt) => (
                          <tr key={opt.id} className="hover:bg-slate-50/20 transition-colors">
                            {/* Value */}
                            <td className="px-5 py-3.5 font-extrabold text-[#0F1E36]">
                              {opt.value}
                            </td>

                            {/* SKU Suffix */}
                            <td className="px-5 py-3.5 font-mono text-slate-500">
                              -{opt.sku_suffix}
                            </td>

                            {/* Sort */}
                            <td className="px-5 py-3.5 font-medium text-slate-400">
                              {opt.sort}
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setActiveOpt({
                                      id: opt.id,
                                      attributeId: selectedAttr.id,
                                      value: opt.value,
                                      sku_suffix: opt.sku_suffix,
                                      sort: opt.sort
                                    });
                                    setOptModalOpen(true);
                                  }}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-500"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOpt(opt.id)}
                                  className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-rose-600"
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Settings2 className="h-12 w-12 text-slate-200 mb-3" />
              <span className="text-sm font-bold text-slate-400">
                Hãy chọn hoặc tạo một thuộc tính ở cột trái để quản lý tùy chọn.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create or Edit Attribute */}
      {attrModalOpen && activeAttr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-extrabold text-[#0F1E36]">
                {activeAttr.id ? 'Cập nhật thuộc tính' : 'Tạo thuộc tính mới'}
              </h2>
              <button
                onClick={() => {
                  setAttrModalOpen(false);
                  setActiveAttr(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAttrSubmit} className="p-6 flex flex-col gap-4.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Tên thuộc tính *</label>
                <input
                  type="text"
                  required
                  value={activeAttr.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = activeAttr.id
                      ? activeAttr.slug || ''
                      : name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '');
                    setActiveAttr({ ...activeAttr, name, slug });
                  }}
                  placeholder="Ví dụ: Kích cỡ, Màu sắc, Chất liệu..."
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Slug Key (Dùng trong SKU JSON) *</label>
                <input
                  type="text"
                  required
                  readOnly={!!activeAttr.id}
                  value={activeAttr.slug || ''}
                  onChange={(e) => setActiveAttr({ ...activeAttr, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="size, color, material"
                  className={cn(
                    "px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600",
                    activeAttr.id && "bg-slate-100 cursor-not-allowed text-slate-400"
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Thứ tự hiển thị</label>
                <input
                  type="number"
                  value={activeAttr.sort || 1}
                  onChange={(e) => setActiveAttr({ ...activeAttr, sort: Number(e.target.value) })}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setAttrModalOpen(false);
                    setActiveAttr(null);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu thuộc tính'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Option */}
      {optModalOpen && activeOpt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-extrabold text-[#0F1E36]">
                {activeOpt.id ? 'Cập nhật tùy chọn' : 'Thêm tùy chọn mới'}
              </h2>
              <button
                onClick={() => {
                  setOptModalOpen(false);
                  setActiveOpt(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleOptSubmit} className="p-6 flex flex-col gap-4.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Giá trị hiển thị *</label>
                <input
                  type="text"
                  required
                  value={activeOpt.value || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const suffix = activeOpt.id
                      ? activeOpt.sku_suffix || ''
                      : value.toUpperCase().replace(/[^A-Z0-9]+/g, '');
                    setActiveOpt({ ...activeOpt, value, sku_suffix: suffix });
                  }}
                  placeholder="Ví dụ: Size S, Đỏ, Nhám..."
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Hậu tố SKU Code *</label>
                <input
                  type="text"
                  required
                  value={activeOpt.sku_suffix || ''}
                  onChange={(e) => setActiveOpt({ ...activeOpt, sku_suffix: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                  placeholder="Ví dụ: S, RED, MATT"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Thứ tự sắp xếp</label>
                <input
                  type="number"
                  value={activeOpt.sort || 1}
                  onChange={(e) => setActiveOpt({ ...activeOpt, sort: Number(e.target.value) })}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOptModalOpen(false);
                    setActiveOpt(null);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu tùy chọn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
