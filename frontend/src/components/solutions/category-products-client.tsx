'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Package,
  ArrowRight,
  FileText,
  Bookmark,
  MapPin,
  Sparkles,
  Zap,
  Layers,
  Shirt,
  Hand,
  FlaskConical
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ASSETS } from '@/lib/assets';

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
  description: string;
  iconName?: string;
  parentName?: string | null;
  subCategories?: Array<{ id: number; name: string; slug: string }>;
}

export interface ProductItem {
  id: number;
  name: string;
  slug: string;
  brand: string;
  categoryName: string;
  categorySlug: string;
  shortDescription: string;
  stockStatus: 'in_stock' | 'low_stock' | 'on_order';
  image?: string;
  specs?: string[];
  unit?: string;
  packSize?: string;
}

interface CategoryProductsClientProps {
  category: CategoryInfo;
  products: ProductItem[];
  allCategories: Array<{ id: number; name: string; slug: string }>;
  locale: string;
}

export function CategoryProductsClient({
  category,
  products: initialProducts,
  allCategories,
  locale
}: CategoryProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Extract unique brands for filtering
  const brands = Array.from(new Set(initialProducts.map((p) => p.brand).filter(Boolean)));

  // Filter products by query, brand, and stock status
  const filteredProducts = initialProducts.filter((product) => {
    const matchesQuery =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    const matchesStatus = selectedStatus === 'all' || product.stockStatus === selectedStatus;

    return matchesQuery && matchesBrand && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 pt-8">
      {/* ── BREADCRUMB HEADER ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-brand transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/solutions" className="hover:text-brand transition-colors">
            Giải pháp & Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">{category.name}</span>
        </div>

        {/* Back Link */}
        <Link
          href="/solutions"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Danh mục Giải pháp
        </Link>
      </div>

      {/* ── CATEGORY HERO BANNER ── */}
      <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0F1E36] via-[#0D4397] to-[#1E40AF] p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
          {/* Background Decorative Accent */}
          <div className="absolute right-0 top-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-extrabold uppercase tracking-wider backdrop-blur-md border border-white/20">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-300" />
                Danh mục vật tư chuẩn ISO / ESD
              </span>
              <span className="text-xs text-blue-200 font-medium">
                {initialProducts.length} Sản phẩm B2B
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              {category.name}
            </h1>

            <p className="mt-4 text-xs sm:text-base text-blue-100/90 leading-relaxed font-medium">
              {category.description ||
                `Tổng hợp các loại ${category.name.toLowerCase()} đạt tiêu chuẩn kiểm định phòng sạch ISO 14644-1, điện trở tĩnh điện ANSI/ESD S20.20 và chứng nhận CO/CQ chính hãng.`}
            </p>

            {/* Sub-categories pill tags */}
            {category.subCategories && category.subCategories.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-white/15">
                <span className="text-xs text-blue-200 font-bold mr-1">Nhóm sản phẩm con:</span>
                {category.subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/solutions/categories/${sub.slug}`}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/25 text-white text-xs font-semibold transition-colors border border-white/15"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── FILTER & SEARCH BAR SECTION ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Tìm kiếm trong ${category.name.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Brand Filter */}
            {brands.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-sm"
                >
                  <option value="all">Tất cả thương hiệu ({brands.length})</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Stock Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-sm"
            >
              <option value="all">Tất cả trạng thái kho</option>
              <option value="in_stock">Sẵn kho giao 2H</option>
              <option value="low_stock">Sắp hết hàng</option>
              <option value="on_order">Sản xuất theo đơn MOQ</option>
            </select>
          </div>

        </div>
      </section>

      {/* ── PRODUCT GRID LIST ── */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 border border-slate-200/80 shadow-sm text-center flex flex-col items-center justify-center">
            <Package className="h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-lg font-extrabold text-slate-800">
              Không tìm thấy sản phẩm phù hợp
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc thương hiệu/trạng thái kho.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBrand('all');
                setSelectedStatus('all');
              }}
              className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-blue-500/40"
              >
                {/* Product Image Area */}
                <Link
                  href={`/solutions/${product.slug}`}
                  className="relative aspect-[4/3] w-full bg-slate-50 overflow-hidden border-b border-slate-100"
                >
                  <Image
                    src={product.image || ASSETS.home.solutionCleanroom}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Brand Tag Top Left */}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 text-white text-[10px] font-extrabold backdrop-blur-sm shadow">
                    {product.brand}
                  </span>

                  {/* Stock Status Badge Top Right */}
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm border ${
                      product.stockStatus === 'in_stock'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : product.stockStatus === 'low_stock'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {product.stockStatus === 'in_stock'
                      ? 'Sẵn kho 2H'
                      : product.stockStatus === 'low_stock'
                      ? 'Sắp hết'
                      : 'Đơn MOQ'}
                  </span>
                </Link>

                {/* Product Content Body */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    {/* Category Label */}
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {product.categoryName}
                    </span>

                    {/* Product Name */}
                    <Link href={`/solutions/${product.slug}`}>
                      <h3 className="mt-1 text-sm font-extrabold text-[#0F1E36] line-clamp-2 hover:text-blue-600 transition-colors leading-snug">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Short Description */}
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {product.shortDescription}
                    </p>

                    {/* Specifications List */}
                    {product.specs && product.specs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                        {product.specs.map((sp, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-semibold">
                            <CheckCircle2 className="h-3 w-3 text-blue-600 shrink-0" />
                            <span className="truncate">{sp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      href="/quick-order"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      Gửi Báo giá RFQ
                    </Link>
                    <Link
                      href={`/solutions/${product.slug}`}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors shrink-0"
                      title="Xem chi tiết sản phẩm"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── OTHER CATEGORIES NAVIGATION BAR AT BOTTOM ── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-3xl bg-white p-8 border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-extrabold text-[#0F1E36] mb-4">
            Khám phá các Danh mục Vật tư Công nghiệp khác:
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {allCategories
              .filter((c) => c.slug !== category.slug)
              .map((cat) => (
                <Link
                  key={cat.id}
                  href={`/solutions/categories/${cat.slug}`}
                  className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold transition-colors border border-slate-200/70"
                >
                  {cat.name}
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
