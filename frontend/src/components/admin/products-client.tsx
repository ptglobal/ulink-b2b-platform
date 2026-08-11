'use client';

import React, { useState, useTransition } from 'react';
import { Search, Plus, Edit2, Archive, Loader2, Package, Tag, Layers, PlusCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product, ProductCategory, ProductSku, ProductAttribute } from '@/lib/directus';
import { updateSkuStock, deleteProduct, saveProduct, saveSku } from '@/app/[locale]/admin/products/actions';

interface ProductsClientProps {
  initialProducts: Product[];
  categories: ProductCategory[];
  globalAttributes: ProductAttribute[];
}

export function ProductsClient({ initialProducts, categories, globalAttributes }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Partial<Product> | null>(null);
  const [activeProductSpecs, setActiveProductSpecs] = useState<Array<{ key: string; val: string }>>([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<number[]>([]);

  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [activeSku, setActiveSku] = useState<Partial<ProductSku> & { productId?: number } | null>(null);

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  // Quick Inline Status Update for SKU
  const handleSkuStockChange = async (skuId: number, newStock: 'in_stock' | 'low_stock' | 'out_of_stock') => {
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => {
        if (!p.skus) return p;
        return {
          ...p,
          skus: p.skus.map((s) => (s.id === skuId ? { ...s, stock_status: newStock } : s))
        };
      })
    );

    const res = await updateSkuStock(skuId, newStock);
    if (!res.success) {
      alert('Không thể cập nhật trạng thái kho: ' + res.error);
      // Revert if error
      setProducts(initialProducts);
    }
  };

  // Archive Product
  const handleArchiveProduct = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn lưu trữ sản phẩm này? Sản phẩm sẽ bị ẩn trên trang công khai.')) {
      // Optimistic delete
      setProducts((prev) => prev.filter((p) => p.id !== id));

      const res = await deleteProduct(id);
      if (!res.success) {
        alert('Không thể lưu trữ sản phẩm: ' + res.error);
        setProducts(initialProducts);
      }
    }
  };

  // Save Product (Create or Update)
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct?.name || !activeProduct?.slug) {
      alert('Vui lòng nhập tên sản phẩm và đường dẫn slug.');
      return;
    }

    // Convert specs array back to Record
    const specRecord: Record<string, string> = {};
    activeProductSpecs.forEach((s) => {
      if (s.key.trim()) specRecord[s.key.trim()] = s.val.trim();
    });

    startTransition(async () => {
      const res = await saveProduct({
        id: activeProduct.id,
        name: activeProduct.name!,
        slug: activeProduct.slug!,
        brand: activeProduct.brand || undefined,
        categoryId: activeProduct.category ? Number(activeProduct.category) : undefined,
        short_description: activeProduct.short_description || undefined,
        specifications: Object.keys(specRecord).length > 0 ? specRecord : undefined,
        status: activeProduct.status || 'draft',
        assignedAttributeIds: selectedAttributeIds
      });

      if (res.success) {
        setProductModalOpen(false);
        setActiveProduct(null);
        window.location.reload(); // Reload to fetch fresh data server-side
      } else {
        alert('Không thể lưu sản phẩm: ' + res.error);
      }
    });
  };

  // Save SKU (Create or Update)
  const handleSaveSkuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSku?.sku_code || !activeSku.productId) {
      alert('Vui lòng điền mã SKU.');
      return;
    }

    startTransition(async () => {
      const res = await saveSku({
        id: activeSku.id,
        sku_code: activeSku.sku_code!,
        productId: activeSku.productId!,
        unit: activeSku.unit || undefined,
        pack_size: activeSku.pack_size || undefined,
        stock_status: activeSku.stock_status || 'in_stock',
        status: 'published'
      });

      if (res.success) {
        setSkuModalOpen(false);
        setActiveSku(null);
        window.location.reload();
      } else {
        alert('Không thể lưu SKU: ' + res.error);
      }
    });
  };

  // Add Dynamic Spec Row
  const addSpecRow = () => {
    setActiveProductSpecs([...activeProductSpecs, { key: '', val: '' }]);
  };

  // Remove Spec Row
  const removeSpecRow = (idx: number) => {
    setActiveProductSpecs(activeProductSpecs.filter((_, i) => i !== idx));
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    // Search
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      (p.skus && p.skus.some((s) => s.sku_code.toLowerCase().includes(q)));

    // Category
    const categoryObj = p.category as any;
    const matchesCategory =
      selectedCategory === 'all' ||
      (categoryObj && (String(categoryObj.id) === selectedCategory || categoryObj.slug === selectedCategory));

    // Status
    const matchesStatus = selectedStatus === 'all' || p.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
            Hệ thống Danh mục
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight mt-1">
            Quản lý Sản phẩm & SKUs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Xem danh sách sản phẩm, quản lý mã SKU và cập nhật nhanh tình trạng tồn kho hàng hóa.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveProduct({ status: 'draft' });
            setActiveProductSpecs([]);
            setSelectedAttributeIds([]);
            setProductModalOpen(true);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Tạo sản phẩm mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tên sản phẩm, mã SKU, nhãn hiệu..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản thảo</option>
              <option value="archived">Lưu trữ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products list table */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-slate-300 mb-3" />
            <span className="text-sm font-extrabold text-[#0F1E36]">
              Không tìm thấy sản phẩm nào
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
                  <th className="px-6 py-4">Tên Sản phẩm / Slug</th>
                  <th className="px-6 py-4">Thương hiệu / Danh mục</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Quản lý SKU & Tồn kho</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filteredProducts.map((prod) => {
                  const categoryName = (prod.category as any)?.name || 'Chưa phân loại';
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Product Name */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#0F1E36] leading-tight">
                            {prod.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono mt-1 select-all">
                            /{prod.slug}
                          </span>
                        </div>
                      </td>

                      {/* Brand & Category */}
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <span className="text-slate-500 font-medium">
                            {prod.brand || '---'}
                          </span>
                          <span className="inline-flex items-center self-start px-2 py-0.5 rounded bg-blue-50 text-[10px] font-bold text-blue-600">
                            {categoryName}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            prod.status === 'published' && "bg-green-50 text-green-600",
                            prod.status === 'draft' && "bg-slate-100 text-slate-600",
                            prod.status === 'archived' && "bg-red-50 text-red-650"
                          )}
                        >
                          {prod.status === 'published' ? 'Đã đăng' : prod.status === 'draft' ? 'Nháp' : 'Lưu trữ'}
                        </span>
                      </td>

                      {/* SKUs List & Inline Update */}
                      <td className="px-6 py-5">
                        {prod.skus && prod.skus.length > 0 ? (
                          <div className="space-y-2">
                            {prod.skus.map((sku) => (
                              <div key={sku.id} className="flex items-center gap-3">
                                <span className="text-[11px] font-mono font-semibold text-slate-600 select-all min-w-[70px]">
                                  {sku.sku_code}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {sku.pack_size ? `${sku.unit} (${sku.pack_size})` : sku.unit}
                                </span>

                                {/* Quick stock update */}
                                <select
                                  value={sku.stock_status || 'in_stock'}
                                  onChange={(e) => handleSkuStockChange(sku.id, e.target.value as any)}
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-bold border focus:outline-none",
                                    sku.stock_status === 'in_stock' && "bg-green-50 border-green-200 text-green-700",
                                    sku.stock_status === 'low_stock' && "bg-orange-50 border-orange-200 text-orange-700",
                                    sku.stock_status === 'out_of_stock' && "bg-red-50 border-red-200 text-red-700"
                                  )}
                                >
                                  <option value="in_stock">Còn hàng</option>
                                  <option value="low_stock">Sắp hết</option>
                                  <option value="out_of_stock">Hết hàng</option>
                                </select>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa có mã SKU</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Add SKU */}
                          <button
                            onClick={() => {
                              setActiveSku({ productId: prod.id, stock_status: 'in_stock' });
                              setSkuModalOpen(true);
                            }}
                            title="Thêm mã SKU"
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <PlusCircle className="h-4.5 w-4.5" />
                          </button>

                          {/* Edit Product */}
                          <button
                            onClick={() => {
                              setActiveProduct(prod);
                              // Load specs key-value dynamic rows
                              const specRows = Object.entries(prod.specifications || {}).map(([key, val]) => ({
                                key,
                                val
                              }));
                              setActiveProductSpecs(specRows);
                              // Load assigned attribute IDs from M2M
                              const attrIds = (prod.assigned_attributes || [])
                                .map((a: any) => typeof a.product_attributes_id === 'object' ? a.product_attributes_id.id : a.product_attributes_id)
                                .filter(Boolean);
                              setSelectedAttributeIds(attrIds);
                              setProductModalOpen(true);
                            }}
                            title="Chỉnh sửa sản phẩm"
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>

                          {/* Archive/Delete */}
                          {prod.status !== 'archived' && (
                            <button
                              onClick={() => handleArchiveProduct(prod.id)}
                              title="Lưu trữ sản phẩm"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
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

      {/* Product Form Modal (Create or Edit) */}
      {productModalOpen && activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white rounded-2xl w-full max-w-3xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#0F1E36]">
                {activeProduct.id ? 'Cập nhật Thông tin Sản phẩm' : 'Thêm Sản phẩm mới'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSaveProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={activeProduct.name || ''}
                    onChange={(e) => {
                      const name = e.target.value;
                      setActiveProduct((prev) => ({
                        ...prev,
                        name,
                        slug: prev?.id ? prev.slug : generateSlug(name)
                      }));
                    }}
                    placeholder="Ví dụ: Găng tay Nitrile chống hóa chất"
                    className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Đường dẫn Slug *</label>
                  <input
                    type="text"
                    required
                    value={activeProduct.slug || ''}
                    readOnly={!activeProduct.id}
                    onChange={(e) => setActiveProduct({ ...activeProduct, slug: generateSlug(e.target.value) })}
                    placeholder="Ví dụ: gang-tay-nitrile-chong-hoa-chat"
                    className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Brand */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Thương hiệu / Nhãn hàng</label>
                  <input
                    type="text"
                    value={activeProduct.brand || ''}
                    onChange={(e) => setActiveProduct({ ...activeProduct, brand: e.target.value })}
                    placeholder="Ví dụ: Honeywell"
                    className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>

                {/* Category Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Danh mục chính</label>
                  <select
                    value={(activeProduct.category as any)?.id || activeProduct.category || ''}
                    onChange={(e) => setActiveProduct({ ...activeProduct, category: e.target.value ? Number(e.target.value) : undefined })}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái phát hành</label>
                  <select
                    value={activeProduct.status || 'draft'}
                    onChange={(e) => setActiveProduct({ ...activeProduct, status: e.target.value as any })}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="draft">Bản nháp (Draft)</option>
                    <option value="published">Xuất bản công khai (Published)</option>
                    <option value="archived">Lưu trữ (Archived)</option>
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Mô tả tóm tắt ngắn</label>
                <textarea
                  rows={2}
                  value={activeProduct.short_description || ''}
                  onChange={(e) => setActiveProduct({ ...activeProduct, short_description: e.target.value })}
                  placeholder="Viết tóm tắt hiển thị trên danh sách lưới sản phẩm..."
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 w-full"
                />
              </div>

              {/* Assigned Attributes (Multi-select from global master data) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Thuộc tính phân loại biến thể</label>
                  <span className="text-[10px] text-slate-400 font-semibold">Chọn từ master data</span>
                </div>

                {globalAttributes.length > 0 ? (
                  <div className="space-y-2">
                    {globalAttributes.map((attr) => {
                      const isChecked = selectedAttributeIds.includes(attr.id);
                      const optionPreview = attr.options
                        ? attr.options.map((o) => o.value).join(', ')
                        : '';
                      return (
                        <label
                          key={attr.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                            isChecked
                              ? "bg-blue-50 border-blue-200"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedAttributeIds((prev) =>
                                isChecked
                                  ? prev.filter((id) => id !== attr.id)
                                  : [...prev, attr.id]
                              );
                            }}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-slate-700 block">{attr.name}</span>
                            {optionPreview && (
                              <span className="text-[10px] text-slate-400 block mt-0.5 truncate">
                                Giá trị: {optionPreview}
                              </span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[11px] block text-center py-2">
                    Chưa có thuộc tính master data. Thêm trong Directus Admin.
                  </span>
                )}
              </div>

              {/* Specifications (Dynamic specifications block) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Bảng Thông số Kỹ thuật</label>
                  <button
                    type="button"
                    onClick={addSpecRow}
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm thuộc tính
                  </button>
                </div>

                <div className="space-y-3">
                  {activeProductSpecs.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input
                        type="text"
                        required
                        value={spec.key}
                        onChange={(e) => {
                          const updated = [...activeProductSpecs];
                          updated[idx].key = e.target.value;
                          setActiveProductSpecs(updated);
                        }}
                        placeholder="Tên thông số (e.g. Chất liệu)"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none"
                      />
                      <input
                        type="text"
                        required
                        value={spec.val}
                        onChange={(e) => {
                          const updated = [...activeProductSpecs];
                          updated[idx].val = e.target.value;
                          setActiveProductSpecs(updated);
                        }}
                        placeholder="Giá trị (e.g. Cao su Nitrile)"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeSpecRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {activeProductSpecs.length === 0 && (
                    <span className="text-slate-400 italic text-[11px] block text-center py-2">Chưa thêm thông số nào</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-xs font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SKU Form Modal (Create SKU) */}
      {skuModalOpen && activeSku && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-[#0F1E36]">
                Thêm mã SKU mới
              </h3>
              <button
                onClick={() => setSkuModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveSkuSubmit} className="p-6 space-y-5">
              {/* SKU Code */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Mã SKU Code *</label>
                <input
                  type="text"
                  required
                  value={activeSku.sku_code || ''}
                  onChange={(e) => setActiveSku({ ...activeSku, sku_code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                  placeholder="Ví dụ: NITRILE-BLUE-L"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Unit */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Đơn vị tính</label>
                <input
                  type="text"
                  value={activeSku.unit || ''}
                  onChange={(e) => setActiveSku({ ...activeSku, unit: e.target.value })}
                  placeholder="Ví dụ: Hộp, Đôi, Thùng..."
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
                  placeholder="Ví dụ: 100 đôi/hộp, 50 cuộn/thùng"
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

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSkuModalOpen(false)}
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
                  Thêm SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
