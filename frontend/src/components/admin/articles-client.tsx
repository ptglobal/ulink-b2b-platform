'use client';

import React, { useState, useTransition, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit,
  Trash,
  FileText,
  X,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Globe,
  Calendar,
  User,
  Home
} from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { getTranslatedField } from '@/lib/i18n-content';
import { saveArticle, deleteArticle, uploadImage } from '@/app/[locale]/admin/articles/actions';

interface Translation {
  id?: number;
  languages_code: string;
  title: string;
  body?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

interface Article {
  id: number;
  status: 'published' | 'draft' | 'archived';
  slug: string;
  cover?: string | null;
  author?: string | null;
  published_at?: string | null;
  translations?: Translation[];
}

interface ArticlesClientProps {
  initialArticles: Article[];
  locale: string;
  directusUrl?: string;
  error?: string;
}

export function ArticlesClient({
  initialArticles,
  locale,
  directusUrl = 'http://localhost:8055',
  error
}: ArticlesClientProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<
    | (Partial<Article> & {
        title: string;
        body: string;
        meta_title: string;
        meta_description: string;
      })
    | null
  >(null);
  const [formError, setFormError] = useState('');

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'content' | 'seo'>('content');

  // Filter articles by search query
  const filteredArticles = articles.filter((art) => {
    const title = getTranslatedField(art, 'title', locale).toLowerCase();
    const slug = art.slug.toLowerCase();
    const author = (art.author || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    return title.includes(q) || slug.includes(q) || author.includes(q);
  });

  // Handle upload cover image
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await uploadImage(formData);
      if (res.success && res.id) {
        setActiveArticle((prev) => (prev ? { ...prev, cover: res.id } : null));
        setFormError('');
      } else {
        setFormError('Upload ảnh thất bại: ' + res.error);
      }
    } catch (err) {
      setFormError('Đã xảy ra lỗi khi upload: ' + String(err));
    } finally {
      setIsUploading(false);
    }
  };

  // Submit Save Article
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!activeArticle?.title || !activeArticle?.slug) {
      setFormError('Vui lòng nhập tiêu đề bài viết và slug.');
      return;
    }

    startTransition(async () => {
      const res = await saveArticle({
        id: activeArticle.id,
        title: activeArticle.title || '',
        slug: activeArticle.slug || '',
        body: activeArticle.body || '',
        cover: activeArticle.cover,
        author: activeArticle.author || undefined,
        published_at: activeArticle.published_at || null,
        status: activeArticle.status || 'draft',
        meta_title: activeArticle.meta_title || '',
        meta_description: activeArticle.meta_description || '',
        locale
      });

      if (res.success) {
        setModalOpen(false);
        setActiveArticle(null);
        setFormError('');
        window.location.reload();
      } else {
        setFormError(res.error || 'Không thể lưu bài viết. Vui lòng thử lại.');
      }
    });
  };

  // Handle Archive Article (Soft Delete)
  const handleArchiveArticle = async (id: number) => {
    if (
      confirm('Bạn có chắc chắn muốn lưu trữ bài viết này? Bài viết sẽ ẩn khỏi trang tài nguyên.')
    ) {
      startTransition(async () => {
        const res = await deleteArticle(id);
        if (res.success) {
          setArticles((prev) => prev.filter((a) => a.id !== id));
          toast.success('Đã lưu trữ bài viết thành công.');
        } else {
          toast.error('Không thể lưu trữ bài viết: ' + res.error);
        }
      });
    }
  };

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6 mb-8">
        <div>
          <span className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">
            Hệ thống CMS
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-1">
            Quản lý Bài viết & Tin tức
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 leading-relaxed">
            Viết và biên tập các bài blog chia sẻ kiến thức phòng sạch, cẩm nang tĩnh điện và tin
            tức thị trường B2B.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs sm:text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <Home className="h-4 w-4 text-blue-600" />
            Về Trang chủ
          </Link>
          <button
            onClick={() => {
              setActiveArticle({
                status: 'draft',
                title: '',
                body: '',
                slug: '',
                author: '',
                published_at: new Date().toISOString().substring(0, 16),
                meta_title: '',
                meta_description: '',
                cover: null
              });
              setModalOpen(true);
              setFormError('');
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Viết bài mới
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-extrabold text-rose-900 block mb-1">
              Đã xảy ra lỗi khi tải dữ liệu bài viết từ API
            </span>
            <pre className="font-mono text-[11px] bg-white/60 p-2.5 rounded-lg mt-2 overflow-x-auto border border-rose-100/50 max-h-40 whitespace-pre-wrap select-all">
              {error}
            </pre>
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm mb-8">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài viết theo tiêu đề, slug, tác giả..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
      </div>

      {/* Articles List */}
      <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden">
        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="h-12 w-12 text-slate-300 mb-3" />
            <span className="text-sm font-extrabold text-foreground">Chưa có bài viết nào</span>
            <span className="text-xs text-slate-400 mt-1">
              Nhấp vào nút Viết bài mới ở trên để đăng tải nội dung đầu tiên.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Bài viết</th>
                  <th className="px-6 py-4">Tác giả</th>
                  <th className="px-6 py-4">Ngày xuất bản</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                {filteredArticles.map((art) => {
                  const title = getTranslatedField(art, 'title', locale);
                  const coverUrl = art.cover
                    ? `${directusUrl}/assets/${art.cover}?width=80&height=50&fit=cover`
                    : null;
                  const publishDate = art.published_at
                    ? new Date(art.published_at).toLocaleDateString(
                        locale === 'vi' ? 'vi-VN' : 'en-US',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }
                      )
                    : 'Chưa đặt';

                  return (
                    <tr key={art.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Cover & Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {coverUrl ? (
                            <img
                              src={coverUrl}
                              alt={title}
                              className="h-10 w-16 object-cover rounded-lg border border-slate-100 bg-slate-50 shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-extrabold text-foreground line-clamp-1 leading-tight">
                              {title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono mt-1 select-all">
                              /{art.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {art.author || 'ULink Team'}
                      </td>

                      {/* Published At */}
                      <td className="px-6 py-4 text-slate-500 font-medium">{publishDate}</td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold',
                            art.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          )}
                        >
                          {art.status === 'published' ? 'Công khai' : 'Nháp'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const existingTitle = getTranslatedField(art, 'title', locale);
                              const existingBody = getTranslatedField(art, 'body', locale);
                              const existingMetaTitle = getTranslatedField(
                                art,
                                'meta_title',
                                locale
                              );
                              const existingMetaDescription = getTranslatedField(
                                art,
                                'meta_description',
                                locale
                              );

                              setActiveArticle({
                                id: art.id,
                                slug: art.slug,
                                status: art.status,
                                cover: art.cover,
                                author: art.author,
                                published_at: art.published_at
                                  ? new Date(art.published_at).toISOString().substring(0, 16)
                                  : null,
                                title: existingTitle,
                                body: existingBody,
                                meta_title: existingMetaTitle,
                                meta_description: existingMetaDescription
                              });
                              setModalOpen(true);
                              setFormError('');
                            }}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                            title="Sửa bài viết"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleArchiveArticle(art.id)}
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-rose-600 transition-colors"
                            title="Lưu trữ (Xóa)"
                          >
                            <Trash className="h-4 w-4" />
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

      {/* Modal: Write or Edit Article */}
      {modalOpen && activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="my-8 w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-250 border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  {activeArticle.id ? 'Cập nhật bài viết' : 'Soạn bài viết mới'}
                </h2>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Viết nội dung bài viết và tối ưu hóa SEO để tăng lượng truy cập.
                </p>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setActiveArticle(null);
                  setFormError('');
                }}
                className="p-1.5 rounded-lg hover:bg-slate-150 text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 px-6 bg-slate-50/50 gap-4">
              <button
                type="button"
                onClick={() => setActiveFormTab('content')}
                className={cn(
                  'px-4 py-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 focus:outline-none',
                  activeFormTab === 'content'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                <FileText className="h-4 w-4" />
                Nội dung bài viết
              </button>
              <button
                type="button"
                onClick={() => setActiveFormTab('seo')}
                className={cn(
                  'px-4 py-3 text-xs font-extrabold border-b-2 transition-all flex items-center gap-1.5 focus:outline-none',
                  activeFormTab === 'seo'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                )}
              >
                <Globe className="h-4 w-4" />
                Ảnh bìa & Cấu hình SEO
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col max-h-[70vh] overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 bg-white">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs font-bold text-rose-600 flex items-center gap-2 animate-in fade-in duration-200 mb-5">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}
                {/* Tab 1: Content fields */}
                {activeFormTab === 'content' && (
                  <div className="flex flex-col gap-5">
                    {/* Title */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Tiêu đề bài viết *
                      </label>
                      <input
                        type="text"
                        required
                        value={activeArticle.title || ''}
                        onChange={(e) => {
                          const title = e.target.value;
                          const slug = activeArticle.id
                            ? activeArticle.slug || ''
                            : title
                                .toLowerCase()
                                .normalize('NFD')
                                .replace(/[\u0300-\u036f]/g, '')
                                .replace(/[đĐ]/g, 'd')
                                .replace(/[^a-z0-9\s-]/g, '')
                                .replace(/\s+/g, '-')
                                .replace(/-+/g, '-')
                                .replace(/^-+|-+$/g, '');
                          setActiveArticle({ ...activeArticle, title, slug });
                        }}
                        placeholder="Nhập tiêu đề bài viết..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-extrabold text-foreground focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650 shadow-sm"
                      />
                    </div>

                    {/* Grid: Slug, Author, Status, Published At */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Slug */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                          Slug (Đường dẫn tĩnh) *
                        </label>
                        <input
                          type="text"
                          required
                          value={activeArticle.slug || ''}
                          onChange={(e) =>
                            setActiveArticle({
                              ...activeArticle,
                              slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                            })
                          }
                          placeholder="duong-dan-bai-viet"
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650 bg-slate-50/20"
                        />
                      </div>

                      {/* Author */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" />
                          Tác giả
                        </label>
                        <input
                          type="text"
                          value={activeArticle.author || ''}
                          onChange={(e) =>
                            setActiveArticle({ ...activeArticle, author: e.target.value })
                          }
                          placeholder="ULink Team"
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Status */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                          Trạng thái phát hành
                        </label>
                        <select
                          value={activeArticle.status || 'draft'}
                          onChange={(e) =>
                            setActiveArticle({ ...activeArticle, status: e.target.value as any })
                          }
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none bg-white shadow-sm"
                        >
                          <option value="draft">Bản nháp (Draft)</option>
                          <option value="published">Công khai (Published)</option>
                        </select>
                      </div>

                      {/* Published At */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          Ngày hiển thị
                        </label>
                        <input
                          type="datetime-local"
                          value={activeArticle.published_at || ''}
                          onChange={(e) =>
                            setActiveArticle({ ...activeArticle, published_at: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-650 focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650 bg-white"
                        />
                      </div>
                    </div>

                    {/* Body textarea */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Nội dung bài viết (HTML / Text)
                      </label>
                      <textarea
                        rows={10}
                        value={activeArticle.body || ''}
                        onChange={(e) =>
                          setActiveArticle({ ...activeArticle, body: e.target.value })
                        }
                        placeholder="Soạn thảo nội dung bài viết. Bạn có thể sử dụng các thẻ HTML như <p>, <h2>, <strong> để trình bày..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium font-mono focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650 bg-slate-50/10 leading-relaxed min-h-[220px]"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 2: Image & SEO fields */}
                {activeFormTab === 'seo' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Left side: Cover Image upload */}
                    <div className="flex flex-col gap-4">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                        Ảnh bìa bài viết (Cover Image)
                      </label>

                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-50/20 hover:bg-slate-50/50 transition-colors">
                        {activeArticle.cover ? (
                          <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-slate-100 shadow-md bg-slate-100 mb-4 animate-fade-in">
                            <img
                              src={`${directusUrl}/assets/${activeArticle.cover}`}
                              alt="Cover preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setActiveArticle({ ...activeArticle, cover: null })}
                              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white transition-colors shadow"
                              title="Xóa ảnh"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="py-8">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                              <ImageIcon className="h-6 w-6 text-slate-400" />
                            </div>
                            <span className="text-xs font-bold text-foreground">
                              Tải lên hình ảnh đại diện
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Khuyến nghị kích thước tỷ lệ 16:9 (ví dụ: 1200x675px)
                            </span>
                          </div>
                        )}

                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                        />

                        <button
                          type="button"
                          disabled={isUploading}
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex h-9 items-center justify-center gap-1.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-foreground hover:bg-slate-50 transition-all shadow-sm bg-white hover:border-slate-350 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Upload className="h-3.5 w-3.5 text-slate-400" />
                          {isUploading
                            ? 'Đang tải lên...'
                            : activeArticle.cover
                              ? 'Thay đổi hình ảnh'
                              : 'Chọn hình ảnh từ máy'}
                        </button>
                      </div>
                    </div>

                    {/* Right side: Meta settings */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 mb-2">
                        <Globe className="h-4 w-4 text-blue-500" />
                        <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                          Tối ưu hóa tìm kiếm (SEO Metadata)
                        </h3>
                      </div>

                      {/* Meta Title */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                          Thẻ tiêu đề SEO (Meta Title)
                        </label>
                        <input
                          type="text"
                          value={activeArticle.meta_title || ''}
                          onChange={(e) =>
                            setActiveArticle({ ...activeArticle, meta_title: e.target.value })
                          }
                          placeholder="Nhập Meta Title (Khoảng 50-60 ký tự)..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650"
                        />
                      </div>

                      {/* Meta Description */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">
                          Thẻ mô tả SEO (Meta Description)
                        </label>
                        <textarea
                          rows={4}
                          value={activeArticle.meta_description || ''}
                          onChange={(e) =>
                            setActiveArticle({ ...activeArticle, meta_description: e.target.value })
                          }
                          placeholder="Mô tả bài viết một cách ngắn gọn, súc tích (Khoảng 150-160 ký tự)..."
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-650 focus:border-blue-650 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setFormError('');
                    setActiveArticle(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-550 hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploading}
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-blue-600 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Đang lưu...' : 'Lưu bài viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
