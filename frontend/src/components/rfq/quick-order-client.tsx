'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Upload,
  Plus,
  FileText,
  X,
  Phone,
  Mail,
  ChevronRight,
  Shield,
  Headphones,
  Truck,
  Award,
  Check,
  Info,
  Package
} from '@/components/icons';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/auth-helpers';
import Image from 'next/image';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { getTranslatedName } from '@/lib/i18n-content';
import {
  type CartItem,
  readCart,
  persistCart,
  saveDraft,
  readDraft,
  clearDraft
} from './cart-types';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';

/* ───────────────────── types ───────────────────── */

interface SkuItem {
  id: number;
  sku_code: string;
  product_name?: string;
  unit: string;
  pack_size: string;
}

interface MetaData {
  customer: {
    company_name?: string;
    contact_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    hub?: number;
    industry?: string;
  } | null;
  hubs: Array<{ id: number; name: string; slug: string }>;
  industries: Array<{ id: number; name: string; slug: string }>;
  skus: SkuItem[];
  products?: Array<{
    id: number;
    slug: string;
    name: string;
    hero: string | null;
    translations?: Array<{ languages_code: string; name: string }>;
    skus?: Array<{ unit: string | null }>;
  }>;
}

interface UploadedFile {
  name: string;
  size: number;
}

/* ───────────────────── helpers ──────────────────── */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/* ───────────────────── component ────────────────── */

export function QuickOrderClient({ user }: { user: AuthUser | null }) {
  const t = useTranslations('quickOrderPage');
  const locale = useLocale();

  /* ── cart state ── */
  const [cart, setCart] = useState<CartItem[]>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);

  interface SubmittedRfqInfo {
    code: string;
    company: string;
    industry: string;
    products: string;
    time: string;
    status: string;
  }
  const [submittedRfq, setSubmittedRfq] = useState<SubmittedRfqInfo | null>(null);

  /* ── form state ── */
  const [formCompany, setFormCompany] = useState('');
  const [formTaxId, setFormTaxId] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formHub, setFormHub] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formDeliveryTime, setFormDeliveryTime] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('');
  const [formOrderFrequency, setFormOrderFrequency] = useState('');
  const [formMessage, setFormMessage] = useState('');

  /* ── file upload (frontend-only) ── */
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  /* ── status ── */
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdRfqId, setCreatedRfqId] = useState<string | number | null>(null);
  const [draftSavedMsg, setDraftSavedMsg] = useState(false);

  /* ── load metadata + draft on mount ── */
  useEffect(() => {
    setCart(readCart());

    // Restore draft
    const draft = readDraft();
    if (draft) {
      setFormCompany((draft.company as string) || '');
      setFormTaxId((draft.taxId as string) || '');
      setFormContact((draft.contact as string) || '');
      setFormEmail((draft.email as string) || '');
      setFormPhone((draft.phone as string) || '');
      setFormAddress((draft.address as string) || '');
      setFormHub((draft.hub as string) || '');
      setFormIndustry((draft.industry as string) || '');
      setFormDeliveryTime((draft.deliveryTime as string) || '');
      setFormPaymentMethod((draft.paymentMethod as string) || '');
      setFormOrderFrequency((draft.orderFrequency as string) || '');
      setFormMessage((draft.message as string) || '');
    }

    async function fetchMetadata() {
      try {
        const res = await fetch('/api/customer');
        if (res.ok) {
          const data: MetaData = await res.json();
          setMeta(data);

          // Auto-fill form if customer profile exists and no draft
          if (data.customer && !draft) {
            setFormCompany(data.customer.company_name || '');
            setFormContact(data.customer.contact_name || '');
            setFormEmail(data.customer.email || user?.email || '');
            setFormPhone(data.customer.phone || '');
            setFormAddress(data.customer.address || '');
            setFormHub(data.customer.hub ? String(data.customer.hub) : '');
            setFormIndustry(data.customer.industry || '');
          } else if (user && !draft) {
            setFormContact(`${user.last_name ?? ''} ${user.first_name ?? ''}`.trim());
            setFormEmail(user.email);
          }
        }
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    }

    fetchMetadata();
  }, [user]);

  /* ── cart helpers ── */
  const saveCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    persistCart(newCart);
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setCart((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      persistCart(updated);
      return updated;
    });
  }, []);

  const handleUpdateCartField = useCallback(
    (index: number, field: keyof CartItem, value: string | number) => {
      setCart((prev) => {
        const updated = prev.map((item, i) => (i === index ? { ...item, [field]: value } : item));
        persistCart(updated);
        return updated;
      });
    },
    []
  );

  /* ── file upload handlers (frontend-only) ── */
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'];

  const processFiles = useCallback((files: FileList | File[]) => {
    const validFiles: UploadedFile[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_FILE_SIZE) continue;
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) continue;
      validFiles.push({ name: file.name, size: file.size });
    }
    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
      e.target.value = '';
    },
    [processFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleRemoveFile = useCallback((index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  /* ── draft save ── */
  const handleSaveDraft = useCallback(() => {
    saveDraft({
      company: formCompany,
      taxId: formTaxId,
      contact: formContact,
      email: formEmail,
      phone: formPhone,
      address: formAddress,
      hub: formHub,
      industry: formIndustry,
      deliveryTime: formDeliveryTime,
      paymentMethod: formPaymentMethod,
      orderFrequency: formOrderFrequency,
      message: formMessage
    });
    setDraftSavedMsg(true);
    setTimeout(() => setDraftSavedMsg(false), 2000);
  }, [
    formCompany,
    formTaxId,
    formContact,
    formEmail,
    formPhone,
    formAddress,
    formHub,
    formIndustry,
    formDeliveryTime,
    formPaymentMethod,
    formOrderFrequency,
    formMessage
  ]);

  /* ── submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errors: Record<string, string> = {};

    if (!formCompany.trim()) errors.company = t('required');
    if (!formContact.trim()) errors.contact = t('required');

    if (!formEmail.trim()) {
      errors.email = t('required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      errors.email = 'Email không đúng định dạng.';
    }

    if (!formPhone.trim()) {
      errors.phone = t('required');
    } else if (!/^[0-9+\s()-]{8,20}$/.test(formPhone.trim().replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại phải có độ dài từ 8 đến 20 số.';
    }

    if (!formAddress.trim()) errors.address = t('required');
    if (!formHub) errors.hub = t('required');
    if (!formIndustry) errors.industry = t('required');

    const validCartItems = cart.filter((item) => item.sku.trim() || item.product_name.trim());
    if (validCartItems.length === 0) {
      setSubmitError(t('cartEmpty'));
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: formCompany.trim(),
          contact: formContact.trim(),
          email: formEmail.trim(),
          phone: formPhone.trim(),
          address: formAddress.trim(),
          hub: parseInt(formHub),
          industry: formIndustry,
          message: formMessage.trim(),
          items: validCartItems.map((item) => ({
            sku: item.sku.trim() || item.product_name.trim(),
            qty: item.quantity || 1,
            note: item.note || undefined
          })),
          source: 'portal'
        })
      });

      const json = await res.json();

      if (!res.ok) {
        const errObj = json.error || {};
        const errCode = errObj.code || json.error;
        const errMessage = errObj.message || json.message;
        const errDetails = errObj.details || json.details;

        if (errCode === 'UNPROCESSABLE_ENTITY' && errDetails) {
          const fieldErrs: Record<string, string> = {};
          if (errDetails.missingFields) {
            errDetails.missingFields.forEach((f: string) => {
              fieldErrs[f] = t('required');
            });
          }
          if (errDetails.invalidFields) {
            Object.entries(errDetails.invalidFields).forEach(([f, codes]: any) => {
              fieldErrs[f] = `Giá trị không hợp lệ: ${codes.join(', ')}`;
            });
          }
          setFieldErrors(fieldErrs);
          throw new Error(errMessage || 'Dữ liệu yêu cầu không hợp lệ.');
        }
        throw new Error(errMessage || 'Gửi yêu cầu báo giá thất bại.');
      }

      // Success
      const rfqIdNum = json.data?.id || 8947;
      const formattedRfqCode = `RFQ-2026-${String(rfqIdNum).slice(-4).padStart(4, '0')}A`;

      const industryObj = meta?.industries.find((i) => i.slug === formIndustry);
      const industryLabel = industryObj ? industryObj.name : formIndustry;

      const productNames = validCartItems.map((item) => item.product_name || item.sku).join(' & ');

      const now = new Date();
      const timeString = `Hôm nay, lúc ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} (GMT+7)`;

      setSubmittedRfq({
        code: formattedRfqCode,
        company: formCompany.trim() || 'Công ty của Quý khách',
        industry: industryLabel || 'Chưa xác định',
        products: productNames || 'Sản phẩm B2B',
        time: timeString,
        status: 'Đang xử lý kỹ thuật'
      });

      setCreatedRfqId(json.data?.id || null);
      setShowSuccess(true);
      saveCart([]);
      clearDraft();

      // Reset form
      if (!meta?.customer) {
        setFormCompany('');
        setFormTaxId('');
        setFormContact('');
        setFormEmail('');
        setFormPhone('');
        setFormAddress('');
        setFormHub('');
        setFormIndustry('');
      }
      setFormDeliveryTime('');
      setFormPaymentMethod('');
      setFormOrderFrequency('');
      setFormMessage('');
      setUploadedFiles([]);
    } catch (err: any) {
      setSubmitError(err.message || 'Gửi yêu cầu báo giá thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (err?: string) =>
    cn(
      'h-11 w-full rounded-md border bg-card px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-2 focus:ring-brand/15',
      err ? 'border-destructive' : 'border-input'
    );

  const selectCls = (err?: string) =>
    cn(
      'h-11 w-full appearance-none rounded-md border bg-card px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow] focus:border-brand focus:ring-2 focus:ring-brand/15',
      err ? 'border-destructive' : 'border-input'
    );

  const sectionHeadCls = 'text-base font-semibold tracking-[-0.015em] text-foreground';

  /* ───────────────── RENDER ─────────────────── */

  if (showSuccess && submittedRfq) {
    return (
      <div className="w-full max-w-[800px] mx-auto text-center py-6 sm:py-10 space-y-8 text-slate-800 text-left">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[12px] text-muted-foreground justify-center"
        >
          <Link href="/" className="transition-colors hover:text-brand">
            {t('breadcrumbHome')}
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <span className="font-medium text-foreground">{t('breadcrumbRfq')}</span>
        </nav>

        {/* Soft Blue Circle Check Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EBF5FF] shadow-sm border border-blue-100/40">
          <Check className="h-6 w-6 text-brand stroke-[3]" />
        </div>

        {/* Heading & Subtext */}
        <div className="space-y-4 max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Yêu cầu báo giá đã được gửi thành công!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Cảm ơn Quý khách đã tin tưởng và lựa chọn ULink Industries. Yêu cầu của bạn đã được
            chuyển tới phòng chuyên môn kỹ thuật. Đội ngũ kỹ sư của chúng tôi đang tiến hành rà soát
            các yêu cầu kỹ thuật và sẽ liên hệ phản hồi chi tiết tới Quý khách trong vòng 24 giờ
            tới.
          </p>
        </div>

        {/* Card: Chi tiết yêu cầu */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 w-full max-w-[540px] mx-auto text-left shadow-sm space-y-6">
          <h3 className="text-sm font-extrabold text-foreground border-b border-slate-100 pb-3 uppercase tracking-wider">
            Chi tiết yêu cầu của Quý khách
          </h3>

          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400 font-medium">Mã số yêu cầu</span>
              <span className="font-extrabold text-slate-850 font-mono">{submittedRfq.code}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400 font-medium">Doanh nghiệp</span>
              <span
                className="font-extrabold text-slate-850 text-right max-w-[240px] truncate"
                title={submittedRfq.company}
              >
                {submittedRfq.company}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400 font-medium">Ngành nghề</span>
              <span className="font-extrabold text-slate-850">{submittedRfq.industry}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400 font-medium">Sản phẩm quan tâm</span>
              <span
                className="font-extrabold text-slate-850 text-right max-w-[285px] truncate"
                title={submittedRfq.products}
              >
                {submittedRfq.products}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400 font-medium">Thời gian tiếp nhận</span>
              <span className="font-extrabold text-slate-850">{submittedRfq.time}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400 font-medium">Trạng thái</span>
              <span className="font-bold text-emerald-650 bg-emerald-50 px-2.5 py-0.5 rounded text-[11px] uppercase tracking-wide">
                {submittedRfq.status}
              </span>
            </div>
          </div>

          {/* Info note */}
          <div className="bg-blue-50/50 text-brand-strong p-3 rounded-lg text-[11px] font-semibold flex items-start gap-2 border border-blue-100/35">
            <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Một bản sao chi tiết yêu cầu báo giá đã được gửi tự động tới email liên hệ của bạn.
            </p>
          </div>
        </div>

        {/* Action Button: Tạo yêu cầu mới */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => {
              setShowSuccess(false);
              setCreatedRfqId(null);
              setSubmittedRfq(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-brand/95 transition-[color,background-color,border-color,box-shadow,opacity,transform] shadow hover:scale-[1.01]"
          >
            {t('createNew')}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Suggestion block: Có thể Quý khách quan tâm */}
        {meta?.products && meta.products.length > 0 && (
          <div className="w-full text-left pt-12 border-t border-slate-100 mt-12 space-y-6">
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              Có thể Quý khách quan tâm
            </h3>

            {/* Suggested horizontal products grid */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
              {meta.products.slice(0, 4).map((product) => {
                const directusUrl = getDirectusUrl();
                const imageUrl = product.hero
                  ? `${directusUrl}/assets/${product.hero}?width=200&height=200&fit=cover`
                  : null;
                const translatedName = getTranslatedName(product, locale);
                const unit = product.skus?.[0]?.unit || 'cái';

                return (
                  <Link
                    key={product.id}
                    href={`/solutions/${product.slug}`}
                    className="bg-white border border-slate-150 p-4 rounded-xl flex flex-col justify-between hover:shadow-md transition-[color,background-color,border-color,box-shadow,opacity,transform] group"
                  >
                    <div className="space-y-2">
                      <div className="aspect-square bg-slate-50/60 rounded-lg flex items-center justify-center relative overflow-hidden">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={translatedName}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-slate-200 group-hover:scale-105 transition-transform" />
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-tight">
                        {translatedName}
                      </h4>
                    </div>
                    <div className="pt-3 border-t border-slate-50 mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{unit}</span>
                      <span className="text-[10px] font-extrabold text-blue-600 group-hover:underline">
                        Xem chi tiết &gt;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 text-left">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-[12px] text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-brand">
          {t('breadcrumbHome')}
        </Link>
        <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
        <span className="font-medium text-foreground">{t('breadcrumbRfq')}</span>
      </nav>

      {/* Page Header */}
      <div className="max-w-4xl">
        <p className="font-mono text-xs font-medium text-brand">
          {t('subtitle')}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          {t('description')}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 pt-2">
        {/* ════════ LEFT: Form ════════ */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Submit error */}
            {submitError && (
              <div className="rounded-xl border border-rose-100 p-3 text-sm text-rose-800 flex items-center gap-2 dark:border-rose-900/30">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* ── Section 1: Business Info ── */}
            <div className="space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6">
              <h3 className={sectionHeadCls}>{t('sectionBusiness')}</h3>

              {/* Company */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {t('companyLabel')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formCompany}
                  onChange={(e) => {
                    setFormCompany(e.target.value);
                    setFieldErrors((p) => ({ ...p, company: '' }));
                  }}
                  className={inputCls(fieldErrors.company)}
                  placeholder={t('companyPlaceholder')}
                />
                {fieldErrors.company && (
                  <span className="text-xs text-rose-500 font-medium">{fieldErrors.company}</span>
                )}
              </div>

              {/* Tax ID + Contact */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{t('taxIdLabel')}</label>
                  <input
                    type="text"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                    className={inputCls()}
                    placeholder={t('taxIdPlaceholder')}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t('contactLabel')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => {
                      setFormContact(e.target.value);
                      setFieldErrors((p) => ({ ...p, contact: '' }));
                    }}
                    className={inputCls(fieldErrors.contact)}
                    placeholder={t('contactPlaceholder')}
                  />
                  {fieldErrors.contact && (
                    <span className="text-xs text-rose-500 font-medium">{fieldErrors.contact}</span>
                  )}
                </div>
              </div>

              {/* Phone + Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t('phoneLabel')} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => {
                      setFormPhone(e.target.value);
                      setFieldErrors((p) => ({ ...p, phone: '' }));
                    }}
                    className={inputCls(fieldErrors.phone)}
                    placeholder={t('phonePlaceholder')}
                  />
                  {fieldErrors.phone && (
                    <span className="text-xs text-rose-500 font-medium">{fieldErrors.phone}</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{t('emailLabel')}</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => {
                      setFormEmail(e.target.value);
                      setFieldErrors((p) => ({ ...p, email: '' }));
                    }}
                    className={inputCls(fieldErrors.email)}
                    placeholder={t('emailPlaceholder')}
                  />
                  {fieldErrors.email && (
                    <span className="text-xs text-rose-500 font-medium">{fieldErrors.email}</span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('addressLabel')}</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => {
                    setFormAddress(e.target.value);
                    setFieldErrors((p) => ({ ...p, address: '' }));
                  }}
                  className={inputCls(fieldErrors.address)}
                  placeholder={t('addressPlaceholder')}
                />
                {fieldErrors.address && (
                  <span className="text-xs text-rose-500 font-medium">{fieldErrors.address}</span>
                )}
              </div>
            </div>

            {/* ── Section 2: Product Table ── */}
            <div className="space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6">
              <h3 className={sectionHeadCls}>{t('sectionProducts')}</h3>

              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-4 rounded-md border border-dashed border-border px-4 py-10 text-center">
                  <p className="text-sm text-muted-foreground max-w-md">{t('emptyCart')}</p>
                  <Link
                    href="/solutions/categories/cleanroom-consumables"
                    className="inline-flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-strong"
                  >
                    {t('viewProducts')}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border/60">
                  <table className="w-full border-collapse text-left text-sm min-w-[600px]">
                    <thead className="text-muted-foreground text-xs uppercase font-semibold border-b border-border/60">
                      <tr>
                        <th className="px-3 py-3 w-12 text-center">{t('colIndex')}</th>
                        <th className="px-3 py-3">{t('colProductSku')}</th>
                        <th className="px-3 py-3 w-[160px]">{t('colSpec')}</th>
                        <th className="px-3 py-3 w-[90px]">{t('colUnit')}</th>
                        <th className="px-3 py-3 w-[110px]">{t('colQuantity')}</th>
                        <th className="px-3 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {cart.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/10 transition-colors">
                          <td className="px-3 py-2.5 text-center text-xs text-muted-foreground font-mono">
                            {String(idx + 1).padStart(2, '0')}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-semibold text-foreground block text-sm">
                              {item.product_name || item.sku}
                            </span>
                            {item.sku && item.product_name && item.sku !== item.product_name && (
                              <span className="text-[11px] text-muted-foreground/70 font-mono mt-0.5 block">
                                SKU: {item.sku}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-slate-700">{item.spec || '-'}</td>
                          <td className="px-3 py-2.5 text-sm text-slate-700">{item.unit || '-'}</td>
                          <td className="px-3 py-2.5">
                            <input
                              type="number"
                              min={1}
                              value={item.quantity || ''}
                              onChange={(e) =>
                                handleUpdateCartField(
                                  idx,
                                  'quantity',
                                  Math.max(1, parseInt(e.target.value) || 1)
                                )
                              }
                              className="w-24 rounded-lg border border-border/80  px-2.5 py-1 text-sm outline-none transition-[color,background-color,border-color,box-shadow,opacity,transform] focus:border-brand focus:ring-1 focus:ring-brand font-semibold text-center"
                              placeholder="1"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ── Section 3: Additional Requirements & Delivery ── */}
            <div className="space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6">
              <h3 className={sectionHeadCls}>{t('sectionShipping')}</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t('industryLabel')}
                  </label>
                  <div className="relative">
                    <select
                      value={formIndustry}
                      onChange={(e) => {
                        setFormIndustry(e.target.value);
                        setFieldErrors((p) => ({ ...p, industry: '' }));
                      }}
                      className={selectCls(fieldErrors.industry)}
                    >
                      <option value="">{t('industryPlaceholder')}</option>
                      {meta?.industries.map((ind) => (
                        <option key={ind.slug} value={ind.slug}>
                          {ind.name}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90 pointer-events-none" />
                  </div>
                  {fieldErrors.industry && (
                    <span className="text-xs text-rose-500 font-medium">
                      {fieldErrors.industry}
                    </span>
                  )}
                </div>

                {/* Delivery Time */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t('deliveryTimeLabel')}
                  </label>
                  <div className="relative">
                    <select
                      value={formDeliveryTime}
                      onChange={(e) => setFormDeliveryTime(e.target.value)}
                      className={selectCls()}
                    >
                      <option value="">{t('deliveryTimePlaceholder')}</option>
                      <option value="7d">{t('deliveryTimeOpt1')}</option>
                      <option value="15-30d">{t('deliveryTimeOpt2')}</option>
                      <option value="30-60d">{t('deliveryTimeOpt3')}</option>
                      <option value="60d+">{t('deliveryTimeOpt4')}</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Payment Method */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t('paymentMethodLabel')}
                  </label>
                  <div className="relative">
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value)}
                      className={selectCls()}
                    >
                      <option value="">{t('paymentMethodPlaceholder')}</option>
                      <option value="tt">{t('paymentMethodOpt1')}</option>
                      <option value="lc">{t('paymentMethodOpt2')}</option>
                      <option value="cod">{t('paymentMethodOpt3')}</option>
                      <option value="other">{t('paymentMethodOpt4')}</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90 pointer-events-none" />
                  </div>
                </div>

                {/* Order Frequency */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {t('orderFrequencyLabel')}
                  </label>
                  <div className="relative">
                    <select
                      value={formOrderFrequency}
                      onChange={(e) => setFormOrderFrequency(e.target.value)}
                      className={selectCls()}
                    >
                      <option value="">{t('orderFrequencyPlaceholder')}</option>
                      <option value="weekly">{t('orderFrequencyOpt1')}</option>
                      <option value="monthly">{t('orderFrequencyOpt2')}</option>
                      <option value="quarterly">{t('orderFrequencyOpt3')}</option>
                      <option value="once">{t('orderFrequencyOpt4')}</option>
                    </select>
                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Hub */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t('hubLabel')}</label>
                <div className="relative">
                  <select
                    value={formHub}
                    onChange={(e) => {
                      setFormHub(e.target.value);
                      setFieldErrors((p) => ({ ...p, hub: '' }));
                    }}
                    className={selectCls(fieldErrors.hub)}
                  >
                    <option value="">{t('hubPlaceholder')}</option>
                    {meta?.hubs.map((hub) => (
                      <option key={hub.id} value={hub.id}>
                        {hub.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground rotate-90 pointer-events-none" />
                </div>
                {fieldErrors.hub && (
                  <span className="text-xs text-rose-500 font-medium">{fieldErrors.hub}</span>
                )}
              </div>

              {/* Special Request */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  {t('specialRequestLabel')}
                </label>
                <textarea
                  rows={3}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder={t('specialRequestPlaceholder')}
                  className="w-full rounded-lg border border-border/80  px-3 py-2.5 text-sm outline-none transition-[color,background-color,border-color,box-shadow,opacity,transform] focus:border-brand focus:ring-1 focus:ring-brand resize-none"
                />
              </div>
            </div>

            {/* ── Actions ── */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="inline-flex items-center gap-2 rounded-xl border border-border/80  px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted/40 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
              >
                {draftSavedMsg ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {t('draftSaved')}
                  </>
                ) : (
                  t('saveDraft')
                )}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow hover:bg-brand/90 transition-[color,background-color,border-color,box-shadow,opacity,transform] disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? t('submitting') : t('submitRfq')}
              </button>
            </div>
          </form>
        </div>

        {/* ════════ RIGHT: Sidebar ════════ */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            {/* Why ULink */}
            <div className="space-y-5 rounded-lg border border-border bg-card p-5 sm:p-6">
              <h3 className="text-lg font-bold text-foreground">{t('sidebarWhyTitle')}</h3>

              {[
                {
                  icon: Shield,
                  titleKey: 'sidebarBenefit1Title' as const,
                  descKey: 'sidebarBenefit1Desc' as const,
                  color: 'text-orange-500'
                },
                {
                  icon: Headphones,
                  titleKey: 'sidebarBenefit2Title' as const,
                  descKey: 'sidebarBenefit2Desc' as const,
                  color: 'text-blue-500'
                },
                {
                  icon: Truck,
                  titleKey: 'sidebarBenefit3Title' as const,
                  descKey: 'sidebarBenefit3Desc' as const,
                  color: 'text-emerald-500'
                },
                {
                  icon: Award,
                  titleKey: 'sidebarBenefit4Title' as const,
                  descKey: 'sidebarBenefit4Desc' as const,
                  color: 'text-purple-500'
                }
              ].map(({ icon: Icon, titleKey, descKey, color }, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className={cn('mt-0.5 shrink-0', color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(titleKey)}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {t(descKey)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* RFQ Process */}
            <div className="space-y-4 rounded-lg border border-border bg-card p-5 sm:p-6">
              <h3 className="text-lg font-bold text-foreground">{t('sidebarProcessTitle')}</h3>

              <div className="space-y-3">
                {[
                  { step: 1, key: 'sidebarStep1' as const, color: 'bg-brand text-white' },
                  { step: 2, key: 'sidebarStep2' as const, color: 'bg-blue-500 text-white' },
                  { step: 3, key: 'sidebarStep3' as const, color: 'bg-emerald-500 text-white' },
                  { step: 4, key: 'sidebarStep4' as const, color: 'bg-orange-500 text-white' }
                ].map(({ step, key, color }) => (
                  <div key={step} className="flex items-start gap-3">
                    <div
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        color
                      )}
                    >
                      {step}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed pt-0.5">{t(key)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgent Support */}
            <div className="space-y-4 rounded-lg border border-border bg-card p-5 sm:p-6">
              <h3 className="text-lg font-bold text-foreground">{t('sidebarUrgentTitle')}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('sidebarUrgentDesc')}
              </p>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Hotline:</span>
                  <a
                    href={`tel:${t('sidebarHotline').replace(/\s/g, '')}`}
                    className="text-lg font-bold text-brand hover:underline"
                  >
                    {t('sidebarHotline')}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Email:</span>
                  <a
                    href={`mailto:${t('sidebarEmail')}`}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    {t('sidebarEmail')}
                  </a>
                </div>
              </div>

              <a
                href={`tel:${t('sidebarHotline').replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl border-2 border-rose-500 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-[color,background-color,border-color,box-shadow,opacity,transform]"
              >
                <Phone className="h-4 w-4" />
                {t('sidebarCtaCall')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
