'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Search, FolderTree, AlertTriangle, Edit, Trash, Folder, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { saveCategory, deleteCategory } from '@/app/[locale]/admin/categories/actions';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parent?: { id: number; name: string } | null;
  status: 'published' | 'draft' | 'archived';
}

interface CategoriesClientProps {
  initialCategories: Category[];
  error?: string;
}

export function CategoriesClient({ initialCategories, error }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Partial<Category> | null>(null);

  // Filter categories based on search query
  const filteredCategories = categories.filter((cat) => {
    const q = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q) ||
      (cat.description && cat.description.toLowerCase().includes(q))
    );
  });

  // Handle Archive Category (Soft delete)
  const handleArchiveCategory = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn lưu trữ danh mục này?')) {
      startTransition(async () => {
        const res = await deleteCategory(id);
        if (res.success) {
          setCategories((prev) => prev.filter((c) => c.id !== id));
        } else {
          alert(res.error);
        }
      });
    }
  };

  // Submit Create or Update Category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory?.name || !activeCategory?.slug) {
      alert('Vui lòng điền tên danh mục và slug.');
      return;
    }

    startTransition(async () => {
      const res = await saveCategory({
        id: activeCategory.id,
        name: activeCategory.name!,
        slug: activeCategory.slug!,
        parent: activeCategory.parent?.id || null,
        description: activeCategory.description || undefined,
        status: activeCategory.status || 'published'
      });

      if (res.success) {
        setModalOpen(false);
        setActiveCategory(null);
        window.location.reload(); // Reload to fetch updated hierarchical data
      } else {
        alert('Không thể lưu danh mục: ' + res.error);
      }
    });
  };

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
            Cơ cấu sản phẩm
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F1E36] tracking-tight mt-1">
            Quản lý Danh mục
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Tạo và sắp xếp cấu trúc danh mục sản phẩm phòng sạch, chống tĩnh điện theo dạng cha-con.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveCategory({ status: 'published', parent: null });
            setModalOpen(true);
          }}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          Tạo danh mục mới
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-extrabold text-rose-900 block mb-1">
              Đã xảy ra lỗi khi tải dữ liệu danh mục từ API
            </span>
            <pre className="font-mono text-[11px] bg-white/60 p-2.5 rounded-lg mt-2 overflow-x-auto border border-rose-100/50 max-h-40 whitespace-pre-wrap select-all">
              {error}
            </pre>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm danh mục theo tên, slug, mô tả..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderTree className="h-12 w-12 text-slate-300 mb-3" />
            <span className="text-sm font-extrabold text-[#0F1E36]">
              Không tìm thấy danh mục nào
            </span>
            <span className="text-xs text-slate-400 mt-1">
              Thử thay đổi từ khóa tìm kiếm hoặc tạo một danh mục mới.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Tên Danh mục</th>
                  <th className="px-6 py-4">Đường dẫn (Slug)</th>
                  <th className="px-6 py-4">Mô tả</th>
                  <th className="px-6 py-4">Danh mục cha</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* Name */}
                    <td className="px-6 py-4 font-extrabold text-[#0F1E36]">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-blue-500 shrink-0" />
                        {cat.name}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500 select-all">
                      {cat.slug}
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 max-w-xs truncate text-slate-500">
                      {cat.description || '---'}
                    </td>

                    {/* Parent */}
                    <td className="px-6 py-4">
                      {cat.parent ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Không có (Gốc)</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold",
                          cat.status === 'published'
                            ? "bg-emerald-50 text-emerald-700"
                            : cat.status === 'draft'
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        )}
                      >
                        {cat.status === 'published' ? 'Đã xuất bản' : cat.status === 'draft' ? 'Bản thảo' : 'Lưu trữ'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setActiveCategory({
                              id: cat.id,
                              name: cat.name,
                              slug: cat.slug,
                              description: cat.description,
                              parent: cat.parent ? { id: cat.parent.id, name: cat.parent.name } : null,
                              status: cat.status
                            });
                            setModalOpen(true);
                          }}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                          title="Sửa danh mục"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleArchiveCategory(cat.id)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition-colors"
                          title="Lưu trữ (Xóa)"
                        >
                          <Trash className="h-4 w-4" />
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

      {/* Modal: Create or Edit Category */}
      {modalOpen && activeCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base sm:text-lg font-extrabold text-[#0F1E36]">
                {activeCategory.id ? 'Cập nhật danh mục' : 'Tạo danh mục mới'}
              </h2>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setActiveCategory(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              {/* Category Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={activeCategory.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    // Auto-slugify on create
                    const slug = activeCategory.id
                      ? activeCategory.slug || ''
                      : name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '');
                    setActiveCategory({ ...activeCategory, name, slug });
                  }}
                  placeholder="Ví dụ: Găng tay phòng sạch, Quần áo..."
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Slug */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Slug (Đường dẫn tĩnh) *</label>
                <input
                  type="text"
                  required
                  value={activeCategory.slug || ''}
                  onChange={(e) => setActiveCategory({ ...activeCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="gang-tay-phong-sach"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Parent Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Danh mục cha</label>
                <select
                  value={activeCategory.parent?.id || ''}
                  onChange={(e) => {
                    const id = e.target.value ? Number(e.target.value) : null;
                    const name = categories.find((c) => c.id === id)?.name || '';
                    setActiveCategory({
                      ...activeCategory,
                      parent: id ? { id, name } : null
                    });
                  }}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 bg-white"
                >
                  <option value="">Không có (Danh mục cấp cao nhất)</option>
                  {categories
                    .filter((c) => c.id !== activeCategory.id) // Cannot be parent of itself
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Mô tả ngắn</label>
                <textarea
                  rows={3}
                  value={activeCategory.description || ''}
                  onChange={(e) => setActiveCategory({ ...activeCategory, description: e.target.value })}
                  placeholder="Mô tả sơ lược về danh mục sản phẩm này..."
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái phát hành</label>
                <select
                  value={activeCategory.status || 'published'}
                  onChange={(e) => setActiveCategory({ ...activeCategory, status: e.target.value as any })}
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none bg-white"
                >
                  <option value="published">Đã xuất bản (Công khai)</option>
                  <option value="draft">Bản thảo (Nháp)</option>
                </select>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setActiveCategory(null);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
