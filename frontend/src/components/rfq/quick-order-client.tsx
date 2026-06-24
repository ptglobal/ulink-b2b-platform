'use client';

import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Loader2,
  FileSpreadsheet,
  ArrowRight,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuthUser } from '@/lib/auth-helpers';

interface SkuItem {
  id: number;
  sku_code: string;
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
}

export function QuickOrderClient({ user }: { user: AuthUser | null }) {
  // Cart state
  const [cart, setCart] = useState<Array<{ sku: string; qty: number }>>([]);
  const [meta, setMeta] = useState<MetaData | null>(null);
  const [loadingMeta, setLoadingMeta] = useState(true);

  // Form states
  const [formCompany, setFormCompany] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formHub, setFormHub] = useState('');
  const [formIndustry, setFormIndustry] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formScheduled, setFormScheduled] = useState(false);
  const [formDeliveryDate, setFormDeliveryDate] = useState('');

  // SKU Selector state
  const [selectedSku, setSelectedSku] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  // Bulk import state
  const [bulkInput, setBulkInput] = useState('');
  const [bulkError, setBulkError] = useState<string | null>(null);

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdRfqId, setCreatedRfqId] = useState<string | number | null>(null);

  // Load cart and metadata on mount
  useEffect(() => {
    // Read cart
    try {
      const raw = localStorage.getItem('rfq-cart');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }

    // Read metadata
    async function fetchMetadata() {
      try {
        setLoadingMeta(true);
        const res = await fetch('/api/customer');
        if (res.ok) {
          const data: MetaData = await res.json();
          setMeta(data);

          // Auto-fill form if customer profile exists
          if (data.customer) {
            setFormCompany(data.customer.company_name || '');
            setFormContact(data.customer.contact_name || '');
            setFormEmail(data.customer.email || user?.email || '');
            setFormPhone(data.customer.phone || '');
            setFormAddress(data.customer.address || '');
            setFormHub(data.customer.hub ? String(data.customer.hub) : '');
            setFormIndustry(data.customer.industry || '');
          } else if (user) {
            // Logged in user but no customer profile yet
            setFormContact(`${user.last_name ?? ''} ${user.first_name ?? ''}`.trim());
            setFormEmail(user.email);
          }
        }
      } catch (err) {
        console.error('Failed to load metadata', err);
      } finally {
        setLoadingMeta(false);
      }
    }

    fetchMetadata();
  }, [user]);

  // Helper to save cart changes
  const saveCart = (newCart: Array<{ sku: string; qty: number }>) => {
    setCart(newCart);
    localStorage.setItem('rfq-cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('rfq-cart-changed'));
  };

  // Add single item to cart
  const handleAddSku = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku) return;

    const qty = Math.max(1, selectedQty);
    const existingIndex = cart.findIndex((item) => item.sku.toLowerCase() === selectedSku.toLowerCase());

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].qty += qty;
      saveCart(updated);
    } else {
      saveCart([...cart, { sku: selectedSku, qty }]);
    }

    // Reset input
    setSelectedSku('');
    setSelectedQty(1);
  };

  // Handle bulk import
  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault();
    setBulkError(null);

    if (!bulkInput.trim()) {
      setBulkError('Vui lòng nhập danh sách sản phẩm.');
      return;
    }

    const lines = bulkInput.split('\n');
    const newItems: Array<{ sku: string; qty: number }> = [];
    const invalidLines: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return; // skip empty lines

      // Support formats: "SKU, Qty" or "SKU Qty" or "SKU"
      const parts = trimmedLine.split(/[\s,]+/);
      const sku = parts[0].trim();
      let qty = 1;

      if (parts.length > 1) {
        const parsedQty = parseInt(parts[1].trim(), 10);
        if (!isNaN(parsedQty) && parsedQty > 0) {
          qty = parsedQty;
        } else {
          invalidLines.push(`Dòng ${index + 1}: "${trimmedLine}" (Số lượng không hợp lệ)`);
          return;
        }
      }

      if (!sku) {
        invalidLines.push(`Dòng ${index + 1}: "${trimmedLine}" (Mã SKU trống)`);
        return;
      }

      newItems.push({ sku, qty });
    });

    if (invalidLines.length > 0) {
      setBulkError(invalidLines.join('\n'));
      return;
    }

    // Merge into existing cart
    const updated = [...cart];
    newItems.forEach((newItem) => {
      const existingIndex = updated.findIndex((item) => item.sku.toLowerCase() === newItem.sku.toLowerCase());
      if (existingIndex >= 0) {
        updated[existingIndex].qty += newItem.qty;
      } else {
        updated.push(newItem);
      }
    });

    saveCart(updated);
    setBulkInput('');
  };

  // Remove item from cart
  const handleRemoveItem = (skuToRemove: string) => {
    const updated = cart.filter((item) => item.sku !== skuToRemove);
    saveCart(updated);
  };

  // Update item quantity directly
  const handleUpdateQty = (sku: string, newQty: number) => {
    const qty = Math.max(1, newQty);
    const updated = cart.map((item) => (item.sku === sku ? { ...item, qty } : item));
    saveCart(updated);
  };

  // Clear cart
  const handleClearCart = () => {
    saveCart([]);
  };

  // Handle RFQ Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const errors: Record<string, string> = {};

    // Validate fields
    if (!formCompany.trim()) errors.company = 'Tên doanh nghiệp là bắt buộc.';
    if (!formContact.trim()) errors.contact = 'Người liên hệ là bắt buộc.';
    
    if (!formEmail.trim()) {
      errors.email = 'Email là bắt buộc.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      errors.email = 'Email không đúng định dạng.';
    }

    if (!formPhone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc.';
    } else if (!/^[0-9+\s()-]{8,20}$/.test(formPhone.trim().replace(/\s/g, ''))) {
      // standard length check (8 to 20 digits/allowed characters)
      errors.phone = 'Số điện thoại phải có độ dài từ 8 đến 20 số.';
    }

    if (!formAddress.trim()) errors.address = 'Địa chỉ là bắt buộc.';
    if (!formHub) errors.hub = 'Vui lòng chọn Regional Hub.';
    if (!formIndustry) errors.industry = 'Vui lòng chọn ngành nghề.';

    if (formScheduled) {
      if (!formDeliveryDate) {
        errors.requested_delivery_date = 'Ngày giao hàng mong muốn là bắt buộc.';
      } else {
        const dateVal = new Date(formDeliveryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const parsedDate = new Date(dateVal.getFullYear(), dateVal.getMonth(), dateVal.getDate());
        if (parsedDate.getTime() < today.getTime()) {
          errors.requested_delivery_date = 'Ngày giao hàng mong muốn phải ở hiện tại hoặc tương lai.';
        }
      }
    }

    if (cart.length === 0) {
      setSubmitError('Giỏ hàng RFQ trống. Vui lòng thêm ít nhất một sản phẩm.');
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
          scheduled_delivery: formScheduled,
          requested_delivery_date: formScheduled ? formDeliveryDate : undefined,
          items: cart.map((item) => ({
            sku: item.sku.trim(),
            qty: item.qty
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
              fieldErrs[f] = 'Trường này là bắt buộc.';
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
      setCreatedRfqId(json.data?.id || null);
      setShowSuccess(true);
      saveCart([]); // Clear cart data
      
      // Reset non-customer fields
      if (!meta?.customer) {
        setFormCompany('');
        setFormContact('');
        setFormEmail('');
        setFormPhone('');
        setFormAddress('');
        setFormHub('');
        setFormIndustry('');
      }
      setFormMessage('');
      setFormScheduled(false);
      setFormDeliveryDate('');
    } catch (err: any) {
      setSubmitError(err.message || 'Gửi yêu cầu báo giá thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Header section with instructions */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 dark:bg-blue-950/10 dark:border-blue-900/30 flex gap-3 text-sm text-blue-800 dark:text-blue-400">
        <Info className="h-5 w-5 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Trang Đặt Hàng Nhanh (Quick Order)</p>
          <p className="text-xs opacity-90 leading-relaxed">
            Thêm nhanh các sản phẩm bằng cách chọn SKU hoặc dán danh sách mã SKU. Nhập thông tin doanh nghiệp ở biểu mẫu bên phải để nhận báo giá chi tiết trực tiếp từ ULink.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Cart management */}
        <div className="lg:col-span-7 space-y-6">
          {/* Add Item Panel */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-brand" />
              Thêm sản phẩm vào giỏ hàng
            </h3>

            {/* Single SKU Add Form */}
            <form onSubmit={handleAddSku} className="grid gap-4 sm:grid-cols-12 items-end">
              <div className="sm:col-span-8 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Chọn Sản phẩm / SKU</label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand font-medium"
                >
                  <option value="">-- Chọn SKU sản phẩm --</option>
                  {meta?.skus.map((sku) => (
                    <option key={sku.sku_code} value={sku.sku_code}>
                      {sku.sku_code} {sku.pack_size ? `(${sku.pack_size})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Số lượng</label>
                <input
                  type="number"
                  min={1}
                  value={selectedQty}
                  onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand text-right font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={!selectedSku}
                className="sm:col-span-2 inline-flex h-[38px] items-center justify-center gap-1 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition-all disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Thêm
              </button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-border/60"></div>
              <span className="flex-shrink mx-4 text-xs text-muted-foreground font-medium">HOẶC NHẬP HÀNG LOẠT</span>
              <div className="flex-grow border-t border-border/60"></div>
            </div>

            {/* Bulk Import Form */}
            <form onSubmit={handleBulkImport} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Nhập mã SKU và số lượng (định dạng: <code className="font-mono bg-muted px-1 py-0.5 rounded">Mã_SKU, Số_lượng</code>, mỗi dòng một sản phẩm)
                </label>
                <textarea
                  rows={4}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  placeholder="Ví dụ:&#10;sku-gloves-nitrile-s, 10&#10;sku-gloves-nitrile-m, 25"
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm font-mono outline-none focus:border-brand focus:ring-1 focus:ring-brand resize-none"
                />
              </div>

              {bulkError && (
                <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-xs text-rose-800 flex items-start gap-2 whitespace-pre-line dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/30">
                  <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{bulkError}</span>
                </div>
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand/20 bg-brand/5 px-4 py-2 text-xs font-semibold text-brand hover:bg-brand/10 transition-all"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Import hàng loạt
              </button>
            </form>
          </div>

          {/* Cart Items List */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-brand" />
                Giỏ hàng RFQ ({cart.length} sản phẩm)
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="text-xs text-muted-foreground hover:text-rose-600 font-medium transition-all"
                >
                  Xóa toàn bộ giỏ hàng
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-border/70 rounded-xl">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/45 mb-2" />
                <p className="text-sm font-medium text-muted-foreground">Chưa có sản phẩm nào trong giỏ hàng</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Chọn hoặc nhập sản phẩm để tạo yêu cầu báo giá.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-border/60">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-muted/40 text-muted-foreground text-xs uppercase font-semibold border-b border-border/60">
                    <tr>
                      <th className="px-4 py-3">Mã SKU</th>
                      <th className="px-4 py-3 text-right" style={{ width: '120px' }}>Số lượng</th>
                      <th className="px-4 py-3 text-right" style={{ width: '60px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {cart.map((item, idx) => {
                      const skuDetails = meta?.skus.find((s) => s.sku_code.toLowerCase() === item.sku.toLowerCase());
                      return (
                        <tr key={idx} className="hover:bg-muted/10 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-mono font-medium text-foreground">{item.sku}</div>
                            {skuDetails && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Đơn vị: {skuDetails.unit || '—'} {skuDetails.pack_size ? `| Quy cách: ${skuDetails.pack_size}` : ''}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min={1}
                              value={item.qty}
                              onChange={(e) => handleUpdateQty(item.sku, parseInt(e.target.value) || 1)}
                              className="w-20 rounded-lg border border-border/80 bg-background px-2 py-1 text-sm text-right font-medium focus:border-brand focus:ring-1 focus:ring-brand outline-none"
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.sku)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 transition-all"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Submit form */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6 sticky top-24">
            <div>
              <h3 className="text-md font-semibold text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand" />
                Thông tin gửi yêu cầu báo giá
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {meta?.customer
                  ? 'Thông tin đã được tự động điền từ hồ sơ doanh nghiệp của bạn.'
                  : 'Vui lòng nhập thông tin liên hệ và doanh nghiệp bên dưới.'}
              </p>
            </div>

            {showSuccess ? (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 text-center dark:bg-emerald-950/10 dark:border-emerald-900/30 space-y-4 animate-in zoom-in-95 duration-200">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/35">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-400">Gửi yêu cầu báo giá thành công!</h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-500 opacity-90 leading-relaxed">
                    Yêu cầu báo giá của bạn đã được tiếp nhận và xử lý. Mã RFQ của bạn là <strong className="font-mono text-xs">#{createdRfqId}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuccess(false);
                    setCreatedRfqId(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-all shadow"
                >
                  Tạo yêu cầu mới
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-xs text-rose-800 flex items-center gap-2 dark:bg-rose-950/10 dark:text-rose-400 dark:border-rose-900/30">
                    <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Company Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    Tên doanh nghiệp / công ty *
                  </label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => {
                      setFormCompany(e.target.value);
                      setFieldErrors((p) => ({ ...p, company: '' }));
                    }}
                    className={cn(
                      "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                      fieldErrors.company ? "border-rose-500" : "border-border/80"
                    )}
                    placeholder="Nhập tên công ty..."
                  />
                  {fieldErrors.company && (
                    <span className="text-[11px] text-rose-500 font-medium block">{fieldErrors.company}</span>
                  )}
                </div>

                {/* Contact Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Người liên hệ *</label>
                  <input
                    type="text"
                    value={formContact}
                    onChange={(e) => {
                      setFormContact(e.target.value);
                      setFieldErrors((p) => ({ ...p, contact: '' }));
                    }}
                    className={cn(
                      "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                      fieldErrors.contact ? "border-rose-500" : "border-border/80"
                    )}
                    placeholder="Tên người đại diện liên hệ..."
                  />
                  {fieldErrors.contact && (
                    <span className="text-[11px] text-rose-500 font-medium block">{fieldErrors.contact}</span>
                  )}
                </div>

                {/* Grid for Email and Phone */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Email liên hệ *</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => {
                        setFormEmail(e.target.value);
                        setFieldErrors((p) => ({ ...p, email: '' }));
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                        fieldErrors.email ? "border-rose-500" : "border-border/80"
                      )}
                      placeholder="email@doanhnghiep.com"
                    />
                    {fieldErrors.email && (
                      <span className="text-[11px] text-rose-500 font-medium block">{fieldErrors.email}</span>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Số điện thoại *</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => {
                        setFormPhone(e.target.value);
                        setFieldErrors((p) => ({ ...p, phone: '' }));
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                        fieldErrors.phone ? "border-rose-500" : "border-border/80"
                      )}
                      placeholder="Số điện thoại liên hệ..."
                    />
                    {fieldErrors.phone && (
                      <span className="text-[11px] text-rose-500 font-medium block">{fieldErrors.phone}</span>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Địa chỉ nhận hàng *</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => {
                      setFormAddress(e.target.value);
                      setFieldErrors((p) => ({ ...p, address: '' }));
                    }}
                    className={cn(
                      "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand",
                      fieldErrors.address ? "border-rose-500" : "border-border/80"
                    )}
                    placeholder="Số nhà, tên đường, khu công nghiệp..."
                  />
                  {fieldErrors.address && (
                    <span className="text-[11px] text-rose-500 font-medium block">{fieldErrors.address}</span>
                  )}
                </div>

                {/* Preferred Hub and Industry */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Regional Hub nhận *</label>
                    <select
                      value={formHub}
                      onChange={(e) => {
                        setFormHub(e.target.value);
                        setFieldErrors((p) => ({ ...p, hub: '' }));
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand font-medium",
                        fieldErrors.hub ? "border-rose-500" : "border-border/80"
                      )}
                    >
                      <option value="">Chọn Regional Hub...</option>
                      {meta?.hubs.map((hub) => (
                        <option key={hub.id} value={hub.id}>
                          {hub.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.hub && (
                      <span className="text-[11px] text-rose-500 font-medium block">{fieldErrors.hub}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Ngành nghề *</label>
                    <select
                      value={formIndustry}
                      onChange={(e) => {
                        setFormIndustry(e.target.value);
                        setFieldErrors((p) => ({ ...p, industry: '' }));
                      }}
                      className={cn(
                        "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand font-medium",
                        fieldErrors.industry ? "border-rose-500" : "border-border/80"
                      )}
                    >
                      <option value="">Chọn ngành nghề...</option>
                      {meta?.industries.map((ind) => (
                        <option key={ind.slug} value={ind.slug}>
                          {ind.name}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.industry && (
                      <span className="text-[11px] text-rose-500 font-medium block">{fieldErrors.industry}</span>
                    )}
                  </div>
                </div>

                {/* Delivery Option */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="scheduled_delivery_quick"
                      checked={formScheduled}
                      onChange={(e) => {
                        setFormScheduled(e.target.checked);
                        if (!e.target.checked) {
                          setFormDeliveryDate('');
                          setFieldErrors((p) => {
                            const next = { ...p };
                            delete next.requested_delivery_date;
                            return next;
                          });
                        }
                      }}
                      className="h-4 w-4 rounded border-border text-brand focus:ring-brand"
                    />
                    <label htmlFor="scheduled_delivery_quick" className="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                      Lên lịch giao hàng (Scheduled Delivery)
                    </label>
                  </div>

                  {formScheduled && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="text-[11px] font-medium text-muted-foreground block">Ngày giao hàng mong muốn *</label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formDeliveryDate}
                        onChange={(e) => {
                          setFormDeliveryDate(e.target.value);
                          setFieldErrors((p) => {
                            const next = { ...p };
                            delete next.requested_delivery_date;
                            return next;
                          });
                        }}
                        className={cn(
                          "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand font-medium",
                          fieldErrors.requested_delivery_date ? "border-rose-500" : "border-border/80"
                        )}
                      />
                      {fieldErrors.requested_delivery_date && (
                        <span className="text-[11px] text-rose-500 font-medium block">{fieldErrors.requested_delivery_date}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground block">Ghi chú thêm</label>
                  <textarea
                    rows={3}
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder="Quy cách đóng gói đặc thù, yêu cầu chứng chỉ kiểm định..."
                    className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow hover:bg-brand/90 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                  {submitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu báo giá'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
