'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BrandedMedia } from '@/components/media/branded-media';
import {
  ArrowLeft,
  ShieldCheck,
  Package,
  ArrowRight,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronRight,
  Boxes,
  Plus,
  Check,
  CheckCircle2
} from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { readCart, persistCart } from '../rfq/cart-types';

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
  allCategories
}: CategoryProductsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(category.slug || 'all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [addedProductIds, setAddedProductIds] = useState<Set<number>>(new Set());
  const mobileFilterButtonRef = useRef<HTMLButtonElement>(null);
  const mobileFilterCloseRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!addedToast) return;
    const timeout = window.setTimeout(() => setAddedToast(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [addedToast]);

  useEffect(() => {
    if (!mobileFilterOpen) return;

    const previousOverflow = document.body.style.overflow;
    const filterButton = mobileFilterButtonRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileFilterOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    const focusFrame = window.requestAnimationFrame(() => mobileFilterCloseRef.current?.focus());

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      filterButton?.focus();
    };
  }, [mobileFilterOpen]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: initialProducts.length };
    initialProducts.forEach((p) => {
      if (p.categorySlug) {
        counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
      }
    });
    return counts;
  }, [initialProducts]);

  // Filter products by Category & Subcategories
  const filteredProducts = useMemo(() => {
    const subSlugs = category.subCategories?.map((s) => s.slug) || [];
    let result = initialProducts.filter((product) => {
      if (selectedCategory === 'all') return true;
      if (product.categorySlug === selectedCategory) return true;
      if (
        selectedCategory === category.slug &&
        (subSlugs.includes(product.categorySlug) || !product.categorySlug)
      ) {
        return true;
      }
      return false;
    });

    if (result.length === 0 && initialProducts.length > 0) {
      result = [...initialProducts];
    }

    // Sorting logic
    if (sortBy === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'name_desc') {
      result.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [initialProducts, selectedCategory, category, sortBy]);

  // Active category display name
  const currentCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return 'Tất cả sản phẩm';
    const found = allCategories.find((c) => c.slug === selectedCategory);
    return found ? found.name : category.name;
  }, [selectedCategory, allCategories, category.name]);

  // Add product to RFQ cart
  const handleAddToCart = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();

    const cart = readCart();
    const existingIndex = cart.findIndex(
      (item) => item.product_name === product.name || item.sku === product.slug
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        sku: product.slug,
        product_name: product.name,
        spec: product.specs?.join(', ') || '',
        unit: product.unit || 'cái',
        quantity: 1,
        note: ''
      });
    }

    persistCart(cart);

    setAddedProductIds((prev) => new Set(prev).add(product.id));
    setAddedToast(product.name);
  };

  return (
    <div className="relative min-h-screen bg-background pb-16 pt-4 sm:pb-20 sm:pt-6">
      {/* ── BREADCRUMB HEADER ── */}
      <div className="ulink-container">
        <div className="mb-2 flex flex-wrap items-center gap-x-2 text-xs font-semibold text-slate-500 sm:mb-4">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center transition-colors hover:text-blue-600"
          >
            Trang chủ
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <Link
            href="/products"
            className="inline-flex min-h-11 items-center transition-colors hover:text-blue-600"
          >
            Sản phẩm & Vật tư
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="text-slate-900 font-bold">{currentCategoryName}</span>
        </div>

        {/* Back Link */}
        <Link
          href="/products"
          className="mb-3 inline-flex min-h-11 items-center gap-2 text-xs font-bold text-slate-600 transition-colors hover:text-blue-600 sm:mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Trang Giải pháp
        </Link>
      </div>

      {/* ── CATEGORY HERO BANNER ── */}
      <header className="ulink-container">
        <div className="relative overflow-hidden border border-border bg-card p-5 sm:p-9">
          <div
            className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/[0.055] blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-evidence/10 px-3 py-1 font-mono text-[10px] font-medium text-evidence">
                <ShieldCheck className="h-3.5 w-3.5" />
                Vật tư Công nghiệp & Phòng sạch ISO / ESD
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] font-medium text-muted-foreground">
                {filteredProducts.length} Sản phẩm
              </span>
            </div>

            <h1 className="text-3xl font-semibold leading-[1.06] tracking-[-0.03em] text-foreground sm:text-4xl">
              {currentCategoryName}
            </h1>

            <p className="mt-4 max-w-[68ch] text-sm leading-7 text-muted-foreground sm:text-base">
              {category.description ||
                `Tổng hợp các loại ${currentCategoryName.toLowerCase()} đạt tiêu chuẩn kiểm định phòng sạch ISO 14644-1, điện trở tĩnh điện ANSI/ESD S20.20 và chứng nhận CO/CQ chính hãng.`}
            </p>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER WITH LEFT SIDEBAR FILTER ── */}
      <div className="ulink-container mt-5 sm:mt-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-4 lg:gap-8">
          {/* ════════════════════════════════════════════════════════════
              LEFT SIDEBAR FILTER COLUMN (Only Product Categories)
             ════════════════════════════════════════════════════════════ */}
          <aside className="hidden lg:block lg:col-span-1 sticky top-24">
            <div className="space-y-4 rounded-lg border border-border bg-card p-4">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-blue-600 stroke-[2.5]" />
                  <h3 className="text-sm font-semibold text-foreground">Danh mục sản phẩm</h3>
                </div>
              </div>

              {/* PRODUCT CATEGORIES LIST */}
              <div className="space-y-1 text-xs">
                {/* All Categories Option */}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`flex min-h-10 w-full cursor-pointer items-center justify-between rounded-md px-3 text-left text-xs font-medium ${
                    selectedCategory === 'all'
                      ? 'bg-brand text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span>Tất cả danh mục</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      selectedCategory === 'all'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {categoryCounts['all'] || 0}
                  </span>
                </button>

                {/* Individual Categories */}
                {allCategories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  const count = categoryCounts[cat.slug] || 0;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`flex min-h-10 w-full cursor-pointer items-center justify-between rounded-md px-3 text-left text-xs font-medium ${
                        isSelected
                          ? 'bg-brand text-white'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <span className="truncate pr-2">{cat.name}</span>
                      {count > 0 && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ════════════════════════════════════════════════════════════
              RIGHT COLUMN: TOOLBAR & PRODUCT CARDS GRID
             ════════════════════════════════════════════════════════════ */}
          <main className="space-y-5 lg:col-span-3 lg:space-y-6">
            {/* Top Toolbar */}
            <div className="grid grid-cols-2 items-center gap-3 border border-border bg-card p-3 lg:flex lg:justify-between lg:p-4">
              {/* Left: Result Count & Mobile Filter Toggle */}
              <div className="contents lg:flex lg:items-center lg:gap-3">
                {/* Mobile Filter Button */}
                <button
                  ref={mobileFilterButtonRef}
                  onClick={() => setMobileFilterOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={mobileFilterOpen}
                  aria-controls="mobile-product-filter"
                  className="ulink-pressable inline-flex h-12 items-center justify-center gap-2 border border-brand/25 bg-brand/10 px-3 text-xs font-semibold text-brand lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                  Danh mục sản phẩm
                </button>

                <p className="order-3 col-span-2 border-t border-border pt-3 text-xs font-semibold leading-5 text-slate-700 lg:order-none lg:border-0 lg:pt-0 sm:text-sm">
                  Hiển thị{' '}
                  <span className="font-extrabold text-blue-600">{filteredProducts.length}</span>{' '}
                  sản phẩm thuộc{' '}
                  <span className="font-extrabold text-slate-900">{currentCategoryName}</span>
                </p>
              </div>

              {/* Right: Sort Order Selector */}
              <div className="flex min-w-0 shrink-0 items-center gap-2">
                <span className="text-xs text-slate-400 font-bold hidden sm:inline">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sắp xếp sản phẩm"
                  className="h-12 min-w-0 w-full cursor-pointer border border-input bg-card px-3 text-xs font-medium text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 sm:w-auto lg:h-11"
                >
                  <option value="popular">Nổi bật nhất</option>
                  <option value="newest">Sản phẩm mới nhất</option>
                  <option value="name_asc">Tên A → Z</option>
                  <option value="name_desc">Tên Z → A</option>
                </select>
              </div>
            </div>

            {/* PRODUCT GRID LIST */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
                <Package className="h-16 w-16 text-slate-300 mb-4" />
                <h3 className="text-lg font-extrabold text-slate-800">
                  Chưa có sản phẩm trong danh mục này
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Vui lòng chọn danh mục sản phẩm khác ở cột bên trái.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="ulink-pressable mt-6 flex h-11 items-center gap-2 bg-brand px-5 text-xs font-semibold text-white hover:bg-brand-strong"
                >
                  <RotateCcw className="h-4 w-4" />
                  Xem tất cả sản phẩm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="ulink-media-zoom group flex flex-col overflow-hidden border border-border bg-card transition-colors hover:border-brand"
                  >
                    {/* Product Image Area */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative block aspect-[16/10] w-full overflow-hidden border-b border-slate-100 bg-slate-50 sm:aspect-[4/3]"
                    >
                      <BrandedMedia
                        src={product.image}
                        alt={product.name}
                        className="absolute inset-0"
                        imageClassName="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        compactBrand
                      />

                      {/* Brand Tag Top Left */}
                      <span className="absolute left-3 top-3 rounded-md bg-foreground px-2.5 py-1 font-mono text-[10px] font-medium text-white">
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
                    <div className="flex flex-1 flex-col justify-between space-y-4 p-4 sm:p-5">
                      <div>
                        {/* Category Label */}
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {product.categoryName}
                        </span>

                        {/* Title */}
                        <Link
                          href={`/products/${product.slug}`}
                          className="mt-1 flex min-h-11 items-start py-1"
                        >
                          <h3 className="text-sm font-extrabold text-foreground line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Short Description */}
                        {product.shortDescription && (
                          <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
                            {product.shortDescription}
                          </p>
                        )}
                      </div>

                      {/* Action Buttons: Xem chi tiết & ADD TO RFQ */}
                      <div className="flex flex-col items-stretch gap-2 border-t border-slate-100 pt-3 min-[380px]:flex-row min-[380px]:items-center min-[380px]:justify-between">
                        <Link
                          href={`/products/${product.slug}`}
                          className="inline-flex min-h-11 items-center justify-center gap-1 px-3 text-xs font-bold text-slate-500 transition-colors hover:bg-muted hover:text-blue-600 min-[380px]:justify-start"
                        >
                          Chi tiết
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`ulink-pressable inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-[3px] px-4 text-xs font-bold ${
                            addedProductIds.has(product.id)
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {addedProductIds.has(product.id) ? (
                            <>
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              Đã thêm
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                              Thêm vào RFQ
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          FLOATING TOAST NOTIFICATION ON ADD TO RFQ
         ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            role="status"
            aria-live="polite"
            className="fixed inset-x-4 z-50 flex items-center gap-3 border border-[#26344d] bg-[#0b1b3a] p-3 text-white shadow-[0_16px_48px_rgba(11,27,58,0.28)] sm:inset-x-auto sm:right-6 sm:w-auto sm:p-4"
            style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
            initial={{ opacity: 0, transform: 'translateY(16px)' }}
            animate={{ opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transform: 'translateY(12px)' }}
            transition={
              reduceMotion ? { duration: 0 } : { duration: 0.24, ease: [0.23, 1, 0.32, 1] }
            }
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="text-xs min-w-0">
              <p className="font-extrabold text-white">Đã thêm vào Yêu cầu Báo giá!</p>
              <p className="text-slate-300 truncate max-w-[220px] font-medium mt-0.5">
                {addedToast}
              </p>
            </div>
            <Link
              href="/quick-order"
              className="ulink-pressable ml-auto inline-flex min-h-11 shrink-0 items-center bg-[#1769e2] px-3 text-xs font-bold text-white hover:bg-[#0f57bd]"
            >
              Xem RFQ &gt;
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════════
          MOBILE FILTER DRAWER / MODAL
         ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end lg:hidden">
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Đóng bộ lọc"
              className="fixed inset-0 bg-[#0b1b3a]/60"
              onClick={() => setMobileFilterOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : { duration: 0.18 }}
            />

            {/* Drawer Content */}
            <motion.div
              id="mobile-product-filter"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-product-filter-title"
              className="ulink-safe-bottom relative flex max-h-[86dvh] w-full flex-col overflow-hidden rounded-t-[16px] bg-white shadow-[0_-16px_48px_rgba(11,27,58,0.2)]"
              initial={{ transform: 'translateY(100%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(100%)' }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 0.34, ease: [0.23, 1, 0.32, 1] }
              }
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-blue-600" />
                  <h3 id="mobile-product-filter-title" className="text-sm font-bold text-slate-900">
                    Danh mục sản phẩm
                  </h3>
                </div>
                <button
                  ref={mobileFilterCloseRef}
                  type="button"
                  aria-label="Đóng bộ lọc"
                  onClick={() => setMobileFilterOpen(false)}
                  className="ulink-pressable flex h-12 w-12 items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto overscroll-contain px-5 py-4">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setMobileFilterOpen(false);
                  }}
                  className={`ulink-pressable min-h-12 w-full px-4 text-left text-xs font-semibold ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white font-extrabold'
                      : 'text-slate-700 bg-slate-50'
                  }`}
                >
                  Tất cả danh mục ({categoryCounts['all'] || 0})
                </button>

                {allCategories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.slug);
                      setMobileFilterOpen(false);
                    }}
                    className={`ulink-pressable flex min-h-12 w-full items-center justify-between truncate px-4 text-left text-xs font-semibold ${
                      selectedCategory === c.slug
                        ? 'bg-blue-600 text-white font-extrabold'
                        : 'text-slate-700 bg-slate-50'
                    }`}
                  >
                    <span className="truncate pr-2">{c.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        selectedCategory === c.slug
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {categoryCounts[c.slug] || 0}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
