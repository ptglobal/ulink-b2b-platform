'use client';

import { useState } from 'react';
import {
  FileText,
  CreditCard,
  Download,
  Printer,
  Copy,
  ArrowLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { AuthUser } from '@/lib/auth-helpers';

interface PaymentInvoiceClientProps {
  user: AuthUser | null;
  locale: string;
  dbProductMap?: Record<string, { hero: string | null; slug: string }>;
}

export default function PaymentInvoiceClient({
  user,
  locale,
  dbProductMap = {}
}: PaymentInvoiceClientProps) {
  const t = useTranslations('paymentInvoicePage');
  const DIRECTUS_URL = getDirectusUrlClient();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  function getDirectusUrlClient() {
    return process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
  }

  const formatPrice = (amount: number) => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount / 25000);
  };

  const handleCopyText = (textToCopy: string, fieldId: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 sm:px-8 lg:px-16 text-slate-800 text-left">
      
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
        <Link href="/" className="hover:text-brand transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <Link href="/order-tracking" className="hover:text-brand transition-colors">
          Đơn hàng của tôi
        </Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <span className="hover:text-brand transition-colors cursor-pointer">
          Chi tiết đơn hàng ULK-2026-98745
        </span>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <span className="text-slate-600 font-semibold">Thanh toán hóa đơn</span>
      </nav>

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Yêu cầu thanh toán hóa đơn #INV-2026-08974
            </h2>
            <span className="inline-flex items-center bg-[#FEF3C7] text-[#D97706] text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              Chờ thanh toán B2B
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Đơn hàng gốc: ULK-2026-98745 • Kỳ thanh toán định kỳ 30 ngày giao dịch doanh nghiệp
          </p>
        </div>
        <Link
          href="/order-confirmation"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand transition-all md:self-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại chi tiết đơn hàng
        </Link>
      </div>

      {/* Grid Layout */}
      <div className="grid gap-6 lg:grid-cols-12 pt-2">
        
        {/* LEFT COLUMN: VAT Invoice details, Bank details, Invoice items list */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* VAT Invoice Details Card */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-lg shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand" />
              Thông tin hóa đơn giá trị gia tăng (B2B)
            </h4>
            
            <div className="text-xs space-y-3.5 pt-1">
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Mã số hóa đơn:</span>
                <span className="font-bold text-slate-800 text-[13px]">INV-2026-08974</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Ngày phát hành:</span>
                <span className="font-semibold text-slate-700">14/03/2026</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Hạn thanh toán hóa đơn:</span>
                <span className="font-bold text-[#E11D48]">13/04/2026 (Trong vòng 30 ngày)</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Mã số thuế bên mua:</span>
                <span className="font-semibold text-slate-800">0110286665</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-slate-500 font-medium">Phương thức giao dịch:</span>
                <span className="font-bold text-slate-800">Hạn mức công nợ doanh nghiệp</span>
              </div>
            </div>
          </div>

          {/* B2B Bank Transfer Instructions Card */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-lg shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-brand" />
              Hướng dẫn chuyển khoản ngân hàng B2B
            </h4>
            
            <div className="text-xs space-y-3.5 pt-1">
              {/* Row 1 */}
              <div className="flex justify-between items-start gap-4 py-0.5">
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-medium">Ngân hàng thụ hưởng:</span>
                  <p className="font-bold text-slate-800 text-[12.5px]">NHTMCP Ngoại Thương Việt Nam (Vietcombank)</p>
                </div>
                <button
                  onClick={() => handleCopyText('NHTMCP Ngoại Thương Việt Nam (Vietcombank)', 'bank')}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors border border-blue-100 shrink-0"
                >
                  {copiedField === 'bank' ? 'Đã sao chép!' : 'Sao chép'}
                  <Copy className="h-3 w-3" />
                </button>
              </div>

              {/* Row 2 */}
              <div className="flex justify-between items-start gap-4 py-0.5">
                <div className="space-y-0.5">
                  <span className="text-slate-400 font-medium">Số tài khoản doanh nghiệp:</span>
                  <p className="font-mono font-bold text-slate-800 text-[14px]">1028 666 5999</p>
                </div>
                <button
                  onClick={() => handleCopyText('1028 666 5999', 'account')}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors border border-blue-100 shrink-0"
                >
                  {copiedField === 'account' ? 'Đã sao chép!' : 'Sao chép'}
                  <Copy className="h-3 w-3" />
                </button>
              </div>

              {/* Row 3 */}
              <div className="space-y-0.5 py-0.5">
                <span className="text-slate-400 font-medium">Tên đơn vị thụ hưởng:</span>
                <p className="font-bold text-slate-800 uppercase text-[12.5px]">CÔNG TY CỔ PHẦN CÔNG NGHỆ LOGISTICS ULINK</p>
              </div>

              {/* Required Memo Gray Block */}
              <div className="bg-[#F8FAFC] border border-slate-100 p-4 rounded flex justify-between items-center gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10.5px] text-slate-400 font-bold uppercase tracking-wider">
                    Nội dung chuyển khoản (bắt buộc):
                  </span>
                  <p className="font-mono font-black text-[#006AA7] text-[13px] sm:text-sm tracking-wide">
                    THANH TOAN HOA DON INV-2026-08974
                  </p>
                </div>
                <button
                  onClick={() => handleCopyText('THANH TOAN HOA DON INV-2026-08974', 'memo')}
                  className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1.5 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors border border-blue-100 shrink-0"
                >
                  {copiedField === 'memo' ? 'Đã sao chép!' : 'Sao chép'}
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-lg shadow-sm space-y-4">
            <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Chi tiết mặt hàng trong hóa đơn (02)
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold font-mono">
                Mã kiện bàn giao: ULK-PK-921
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Product 1 */}
              <div className="flex gap-4 py-3.5 first:pt-1 last:pb-1 items-start">
                <Link
                  href="/solutions/mang-quan-pallet-stretch-film"
                  className="relative h-14 w-14 shrink-0 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden hover:opacity-95 transition-opacity block"
                >
                  {dbProductMap['UL-PF-2002']?.hero ? (
                    <Image
                      src={`${DIRECTUS_URL}/assets/${dbProductMap['UL-PF-2002'].hero}`}
                      alt="Màng quấn Pallet"
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-slate-300" />
                  )}
                </Link>
                <div className="min-w-0 flex-1 space-y-1 text-left">
                  <Link
                    href="/solutions/mang-quan-pallet-stretch-film"
                    className="font-bold text-slate-900 text-xs sm:text-sm hover:text-brand transition-all block leading-tight"
                  >
                    Màng quấn Pallet - Stretch Film (Bản rộng 50cm, 2.4kg)
                  </Link>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Số lượng: 500 kg x 39.500đ / kg
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-800 shrink-0">
                  {formatPrice(19750000)}
                </span>
              </div>

              {/* Product 2 */}
              <div className="flex gap-4 py-3.5 first:pt-1 last:pb-1 items-start">
                <Link
                  href="/solutions/tui-pe-trong-suot-dung-thuc-pham"
                  className="relative h-14 w-14 shrink-0 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden hover:opacity-95 transition-opacity block"
                >
                  {dbProductMap['UL-PE-1008']?.hero ? (
                    <Image
                      src={`${DIRECTUS_URL}/assets/${dbProductMap['UL-PE-1008'].hero}`}
                      alt="Túi PE"
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  ) : (
                    <Package className="h-5 w-5 text-slate-300" />
                  )}
                </Link>
                <div className="min-w-0 flex-1 space-y-1 text-left">
                  <Link
                    href="/solutions/tui-pe-trong-suot-dung-thuc-pham"
                    className="font-bold text-slate-900 text-xs sm:text-sm hover:text-brand transition-all block leading-tight"
                  >
                    Túi PE trong suốt siêu dai - Đóng kiện hàng công nghiệp
                  </Link>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Số lượng: 200 kg x 28.000đ / kg
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-800 shrink-0">
                  {formatPrice(5600000)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary and action triggers */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Invoice Summary */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-lg shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Tổng cộng hóa đơn B2B
            </h4>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Tạm tính mặt hàng</span>
                <span className="font-bold text-slate-800">{formatPrice(25350000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thuế VAT B2B (8%)</span>
                <span className="font-bold text-slate-800">{formatPrice(2028000)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500">Phí vận tải ULink Fleet</span>
                <span className="font-bold text-emerald-600 text-right">Miễn phí (Ưu đãi B2B)</span>
              </div>

              <hr className="border-slate-200" />

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-sm font-bold text-slate-900">Tổng thanh toán</span>
                <span className="text-xl font-extrabold text-[#006AA7] leading-none">
                  {formatPrice(27378000)}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3.5">
            <button
              onClick={() => alert('Đang tạo và chuẩn bị tải xuống file PDF Hóa đơn tài chính B2B chính thức...')}
              className="w-full inline-flex items-center justify-center gap-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-3 text-sm font-bold shadow-sm transition-all text-center"
            >
              <Download className="h-4 w-4" />
              Tải hóa đơn PDF
            </button>

            <button
              onClick={() => window.print()}
              className="w-full inline-flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 py-2.5 text-xs font-bold transition-all text-center"
            >
              <Printer className="h-4 w-4" />
              In hóa đơn chứng từ gốc trực tiếp
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
