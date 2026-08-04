'use client';

import React, { useState, useTransition, useMemo } from 'react';
import { Search, Plus, Edit2, Archive, Loader2, Layers, Tag, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product, ProductSku, ProductAttribute } from '@/lib/directus';
import { updateSkuStock, saveSku } from '@/app/[locale]/admin/products/actions';

interface SkusClientProps {
  initialSkus: ProductSku[];
  products: Product[];
}

export function SkusClient({ initialSkus, products }: SkusClientProps) {
  const [skus, setSkus] = useState<ProductSku[]>(initialSkus);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [activeSku, setActiveSku] = useState<Partial<ProductSku> & { productId?: number } | null>(null);

  // Attribute selections state: { [attributeId]: optionId }
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

  // Get the attributes for the currently selected product (unwrap M2M junction)
  const activeProductAttrs = useMemo(() => {
    if (!activeSku?.productId) return [];
    const p = products.find((prod) => prod.id === activeSku.productId);
    if (!p?.assigned_attributes) return [];
    // Unwrap M2M junction: assigned_attributes[].product_attributes_id → ProductAttribute
    const attrs = p.assigned_attributes
      .map((a: any) => {
        const attr = typeof a.product_attributes_id === 'object' ? a.product_attributes_id : null;
        return attr;
      })
      .filter(Boolean) as ProductAttribute[];
    // Sort by sort field
    return attrs.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  }, [activeSku?.productId, products]);

  // Compute SKU code from selected options
  const computeSkuCode = (productId: number, options: Record<number, number>, attrs: ProductAttribute[]) => {
    const p = products.find((prod) => prod.id === productId);
    if (!p) return '';
    const prefix = p.slug.toUpperCase();

    const suffixes: string[] = [];
    for (const attr of attrs) {
      const selectedOptId = options[attr.id];
      if (selectedOptId && attr.options) {
        const opt = attr.options.find((o) => o.id === selectedOptId);
        if (opt) suffixes.push(opt.sku_suffix.toUpperCase());
      }
    }

    return suffixes.length > 0 ? `${prefix}-${suffixes.join('-')}` : prefix;
  };

  // Build attributes JSON from selected options using attr.slug as key
  // e.g. { "size": "M", "color": "Xanh dương" }
  const buildAttributesJson = (options: Record<number, number>, attrs: ProductAttribute[]): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const attr of attrs) {
      const selectedOptId = options[attr.id];
      if (selectedOptId && attr.options) {
        const opt = attr.options.find((o) => o.id === selectedOptId);
        if (opt) result[attr.slug] = opt.value;
      }
    }
    return result;
  };

  // Handle product change in modal
  const handleProductChange = (productId: number) => {
    setSelectedOptions({});
    const p = products.find((prod) => prod.id === productId);
    const prefix = p ? p.slug.toUpperCase() : '';

    setActiveSku((prev) => prev ? { ...prev, productId, sku_code: prefix } : null);
  };

  // Handle option dropdown change
  const handleOptionChange = (attrId: number, optionId: number) => {
    const newOptions = { ...selectedOptions, [attrId]: optionId };
    setSelectedOptions(newOptions);

    if (activeSku?.productId) {
      const code = computeSkuCode(activeSku.productId, newOptions, activeProductAttrs);
      setActiveSku((prev) => prev ? { ...prev, sku_code: code } : null);
    }
  };

  // Inline Stock Update
  const handleSkuStockChange = async (skuId: number, newStock: 'in_stock' | 'low_stock' | 'out_of_stock') => {
    setSkus((prev) =>
      prev.map((s) => (s.id === skuId ? { ...s, stock_status: newStock } : s))
    );

    const res = await updateSkuStock(skuId, newStock);
    if (!res.success) {
      alert('Không thể cập nhật trạng thái kho: ' + res.error);
      window.location.reload();
    }
  };

  // Archive SKU Action
  const handleArchiveSku = async (skuId: number) => {
    if (confirm('Bạn có chắc chắn muốn lưu trữ mã SKU này? Mã SKU sẽ ẩn trên website.')) {
      startTransition(async () => {
        const skuToUpdate = skus.find((s) => s.id === skuId);
        if (!skuToUpdate) return;

        const res = await saveSku({
          id: skuId,
          sku_code: skuToUpdate.sku_code,
          productId: typeof skuToUpdate.product === 'object' ? (skuToUpdate.product as any).id : Number(skuToUpdate.product),
          unit: skuToUpdate.unit || undefined,
          pack_size: skuToUpdate.pack_size || undefined,
          stock_status: skuToUpdate.stock_status || undefined,
          status: 'archived'
        });

        if (res.success) {
          setSkus((prev) => prev.filter((s) => s.id !== skuId));
        } else {
          alert('Không thể lưu trữ SKU: ' + res.error);
        }
      });
    }
  };

  // Submit Add/Edit SKU
  const handleSaveSkuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSku?.sku_code || !activeSku.productId) {
      alert('Vui lòng điền đầy đủ mã SKU và chọn sản phẩm.');
      return;
    }

    // Build attributes JSON from selected options
    const attributesJson = activeProductAttrs.length > 0
      ? buildAttributesJson(selectedOptions, activeProductAttrs)
      : undefined;

    startTransition(async () => {
      const res = await saveSku({
        id: activeSku.id,
        sku_code: activeSku.sku_code!,
        productId: activeSku.productId!,
        unit: activeSku.unit || undefined,
        pack_size: activeSku.pack_size || undefined,
        attributes: attributesJson,
        stock_status: activeSku.stock_status || 'in_stock',
        status: activeSku.status || 'published'
      });

      if (res.success) {
        setSkuModalOpen(false);
        setActiveSku(null);
        setSelectedOptions({});
        window.location.reload();
      } else {
        alert('Không thể lưu mã SKU: ' + res.error);
      }
    });
  };

  // Filter list
  const filteredSkus = skus.filter((sku) => {
    const q = searchQuery.toLowerCase();
    const productName = typeof sku.product === 'object' ? (sku.product as any).name : '';
    const productSlug = typeof sku.product === 'object' ? (sku.product as any).slug : '';
    
    const matchesSearch =
      sku.sku_code.toLowerCase().includes(q) ||
      productName.toLowerCase().includes(q) ||
      productSlug.toLowerCase().includes(q);

    const matchesStock =
      selectedStockStatus === 'all' || sku.stock_status === selectedStockStatus;

    const parentId = typeof sku.product === 'object' ? String((sku.product as any).id) : String(sku.product);
    const matchesProduct =
      selectedProduct === 'all' || parentId === selectedProduct;

    return matchesSearch && matchesStock && matchesProduct;
  });

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
            Hệ thống danh mục SKUs
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight mt-1">
            Quản lý mã SKUs B2B
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Xem và cập nhật nhanh tồn kho, quy cách đóng gói và đơn vị tính cho từng biến thể sản phẩm.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedOptions({});
            setActiveSku({ stock_status: 'in_stock', status: 'published', sku_code: '' });
            setSkuModalOpen(true);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Thêm mã SKU mới
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo mã SKU, tên sản phẩm cha..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Filter by Product */}
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none max-w-[200px]"
            >
              <option value="all">Tất cả sản phẩm cha</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Stock Status */}
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedStockStatus}
              onChange={(e) => setSelectedStockStatus(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái kho</option>
              <option value="in_stock">Còn hàng</option>
              <option value="low_stock">Sắp hết hàng</option>
              <option value="out_of_stock">Tạm hết hàng</option>
            </select>
          </div>
        </div>
      </div>

      {/* SKUs Flat Table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredSkus.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="h-12 w-12 text-slate-300 mb-3" />
            <span className="text-sm font-extrabold text-[#0F1E36]">
              Không tìm thấy mã SKU nào
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-450 uppercase tracking-wider">
                  <th className="px-6 py-4">Mã SKU</th>
                  <th className="px-6 py-4">Sản phẩm cha</th>
                  <th className="px-6 py-4">Quy cách & Đơn vị tính</th>
                  <th className="px-6 py-4">Trạng thái kho</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredSkus.map((sku) => {
                  const parentName = typeof sku.product === 'object' ? (sku.product as any).name : 'Sản phẩm không khả dụng';
                  const parentSlug = typeof sku.product === 'object' ? (sku.product as any).slug : '';
                  return (
                    <tr key={sku.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* SKU Code */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 select-all">
                        {sku.sku_code}
                      </td>

                      {/* Parent Product */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#0F1E36] leading-tight">
                            {parentName}
                          </span>
                          {parentSlug && (
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                              /{parentSlug}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Pack Size & Unit */}
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-600">
                          {sku.pack_size ? `${sku.unit} (${sku.pack_size})` : sku.unit || '---'}
                        </span>
                      </td>

                      {/* Stock Status Inline Select */}
                      <td className="px-6 py-4">
                        <select
                          value={sku.stock_status || 'in_stock'}
                          onChange={(e) => handleSkuStockChange(sku.id, e.target.value as any)}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-bold border focus:outline-none",
                            sku.stock_status === 'in_stock' && "bg-green-50 border-green-200 text-green-700",
                            sku.stock_status === 'low_stock' && "bg-orange-50 border-orange-200 text-orange-700",
                            sku.stock_status === 'out_of_stock' && "bg-red-50 border-red-200 text-red-700"
                          )}
                        >
                          <option value="in_stock">Còn hàng (In stock)</option>
                          <option value="low_stock">Sắp hết (Low stock)</option>
                          <option value="out_of_stock">Tạm hết (Out of stock)</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            sku.status === 'published' && "bg-green-50 text-green-600",
                            sku.status === 'draft' && "bg-slate-100 text-slate-600",
                            sku.status === 'archived' && "bg-red-50 text-red-650"
                          )}
                        >
                          {sku.status === 'published' ? 'Đang bật' : sku.status === 'draft' ? 'Nháp' : 'Lưu trữ'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Edit SKU */}
                          <button
                            onClick={() => {
                              const pId = typeof sku.product === 'object' ? (sku.product as any).id : Number(sku.product);
                              const p = products.find((prod) => prod.id === pId);

                              // Reconstruct selectedOptions from sku.attributes JSON
                              const opts: Record<number, number> = {};
                              if (p?.assigned_attributes && sku.attributes) {
                                for (const junction of p.assigned_attributes) {
                                  const attr = typeof (junction as any).product_attributes_id === 'object'
                                    ? (junction as any).product_attributes_id
                                    : null;
                                  if (!attr) continue;
                                  const attrVal = (sku.attributes as Record<string, unknown>)[attr.slug];
                                  if (attrVal && attr.options) {
                                    const matchOpt = attr.options.find((o: any) => o.value === attrVal);
                                    if (matchOpt) opts[attr.id] = matchOpt.id;
                                  }
                                }
                              }

                              setSelectedOptions(opts);
                              setActiveSku({
                                id: sku.id,
                                sku_code: sku.sku_code,
                                productId: pId,
                                unit: sku.unit || '',
                                pack_size: sku.pack_size || '',
                                stock_status: sku.stock_status,
                                status: sku.status
                              });
                              setSkuModalOpen(true);
                            }}
                            title="Sửa mã SKU"
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>

                          {/* Archive/Delete SKU */}
                          {sku.status !== 'archived' && (
                            <button
                              onClick={() => handleArchiveSku(sku.id)}
                              title="Lưu trữ SKU"
                              className="p-1 text-slate-400 hover:text-red-650 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Archive className="h-4.5 w-4.5" />
                            </button>
                          )}
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

      {/* Add / Edit SKU Modal */}
      {skuModalOpen && activeSku && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <h3 className="text-base font-extrabold text-[#0F1E36]">
                {activeSku.id ? 'Sửa thông tin SKU' : 'Thêm mã SKU mới'}
              </h3>
              <button
                onClick={() => { setSkuModalOpen(false); setSelectedOptions({}); }}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSkuSubmit} className="p-6 space-y-5">
              {/* Product Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Sản phẩm cha *</label>
                <select
                  required
                  value={activeSku.productId || ''}
                  onChange={(e) => handleProductChange(Number(e.target.value))}
                  disabled={!!activeSku.id}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none bg-slate-50 disabled:bg-slate-100"
                >
                  <option value="">-- Chọn sản phẩm cha --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Attributes Section */}
              {activeSku.productId && (
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider block">
                    Chọn thuộc tính phân loại
                  </span>

                  {activeProductAttrs.length > 0 ? (
                    <>
                      {/* Prefix Display */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500">Tiền tố sản phẩm</span>
                        <input
                          type="text"
                          readOnly
                          value={products.find((p) => p.id === activeSku.productId)?.slug.toUpperCase() || ''}
                          className="px-3 py-1.5 rounded bg-slate-100 border border-slate-200 text-xs font-bold font-mono text-slate-500 cursor-not-allowed select-none focus:outline-none"
                        />
                      </div>

                      {/* Attribute Dropdowns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeProductAttrs.map((attr) => {
                          const sortedOptions = attr.options
                            ? [...attr.options].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
                            : [];
                          return (
                            <div key={attr.id} className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">
                                {attr.name} *
                              </label>
                              <select
                                required
                                value={selectedOptions[attr.id] || ''}
                                onChange={(e) => handleOptionChange(attr.id, Number(e.target.value))}
                                className="px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
                              >
                                <option value="">-- Chọn --</option>
                                {sortedOptions.map((opt) => (
                                  <option key={opt.id} value={opt.id}>
                                    {opt.value} ({opt.sku_suffix})
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    /* Fallback: no attributes defined for this product */
                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold text-amber-700 block">
                          Sản phẩm này chưa có thuộc tính phân loại.
                        </span>
                        <span className="text-[10px] text-amber-600">
                          Hãy thêm thuộc tính (Size, Color...) trong Directus Admin trước, hoặc nhập mã SKU thủ công bên dưới.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SKU Code */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase">Mã SKU Code *</label>
                  {activeProductAttrs.length > 0 ? (
                    <span className="text-[10px] text-blue-600 font-bold">Khóa tự động từ thuộc tính</span>
                  ) : (
                    <span className="text-[10px] text-amber-600 font-bold">Nhập thủ công</span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  readOnly={activeProductAttrs.length > 0}
                  value={activeSku.sku_code || ''}
                  onChange={activeProductAttrs.length === 0
                    ? (e) => setActiveSku({ ...activeSku, sku_code: e.target.value.toUpperCase().replace(/\s+/g, '') })
                    : undefined
                  }
                  placeholder={activeProductAttrs.length > 0 ? 'Chọn thuộc tính ở trên...' : 'Nhập mã SKU thủ công...'}
                  className={cn(
                    "px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-extrabold text-[#0F1E36] font-mono focus:outline-none",
                    activeProductAttrs.length > 0
                      ? "bg-slate-100 cursor-not-allowed select-all"
                      : "bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  )}
                />
              </div>

              {/* Unit */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Đơn vị tính</label>
                <input
                  type="text"
                  value={activeSku.unit || ''}
                  onChange={(e) => setActiveSku({ ...activeSku, unit: e.target.value })}
                  placeholder="Ví dụ: Hộp, Đôi, Cuộn..."
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Pack Size */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Quy cách đóng gói</label>
                <input
                  type="text"
                  value={activeSku.pack_size || ''}
                  onChange={(e) => setActiveSku({ ...activeSku, pack_size: e.target.value })}
                  placeholder="Ví dụ: 100 đôi/hộp, 10 cuộn/thùng"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Stock Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Tình trạng tồn kho</label>
                <select
                  value={activeSku.stock_status || 'in_stock'}
                  onChange={(e) => setActiveSku({ ...activeSku, stock_status: e.target.value as any })}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-750 focus:outline-none"
                >
                  <option value="in_stock">Còn hàng (In Stock)</option>
                  <option value="low_stock">Sắp hết (Low Stock)</option>
                  <option value="out_of_stock">Tạm hết hàng (Out of Stock)</option>
                </select>
              </div>

              {/* Status Select */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái phát hành</label>
                <select
                  value={activeSku.status || 'published'}
                  onChange={(e) => setActiveSku({ ...activeSku, status: e.target.value as any })}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-750 focus:outline-none"
                >
                  <option value="published">Hoạt động (Published)</option>
                  <option value="draft">Bản nháp (Draft)</option>
                  <option value="archived">Lưu trữ (Archived)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setSkuModalOpen(false); setSelectedOptions({}); }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Lưu SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
