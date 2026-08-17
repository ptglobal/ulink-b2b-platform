'use client';

import { useState } from 'react';
import {
  Check,
  Building2,
  Truck,
  Package,
  MapPin,
  Clock,
  Copy,
  ArrowLeft,
  ChevronRight,
  FileText
} from '@/components/icons';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import type { AuthUser } from '@/lib/auth-helpers';

interface OrderConfirmationClientProps {
  user: AuthUser | null;
  locale: string;
  dbProductMap?: Record<string, { hero: string | null; slug: string }>;
}

export default function OrderConfirmationClient({
  user,
  locale,
  dbProductMap = {}
}: OrderConfirmationClientProps) {
  const t = useTranslations('orderConfirmationPage');
  const DIRECTUS_URL = getDirectusUrlClient();

  const [copiedTracking, setCopiedTracking] = useState(false);

  function getDirectusUrlClient() {
    return process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
  }

  const formatPrice = (amount: number) => {
    if (locale === 'vi') {
      return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
    }
    return (
      '$' +
      new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        amount / 25000
      )
    );
  };

  const handleCopyTracking = () => {
    navigator.clipboard.writeText('TRK-HA-9817245');
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 sm:px-8 lg:px-16 text-slate-800 text-left">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium"
      >
        <Link href="/" className="hover:text-brand transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <Link href="/order-tracking" className="hover:text-brand transition-colors">
          Đơn hàng của tôi
        </Link>
        <ChevronRight className="h-3 w-3 opacity-60" />
        <span className="text-slate-600 font-semibold">Chi tiết đơn hàng ULK-2026-98745</span>
      </nav>

      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Đơn hàng ULK-2026-98745
            </h2>
            <span className="inline-flex items-center bg-blue-50 text-blue-600 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border border-blue-100">
              Đang vận chuyển
            </span>
            <Link
              href="/order-tracking/payment-invoice"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-brand hover:underline transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              Xem Hóa đơn (#INV-2026-08974)
            </Link>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Đặt ngày 14/03/2026 • 15:20 | Cập nhật lần cuối: 5 phút trước
          </p>
        </div>
        <Link
          href="/order-tracking"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-brand transition-[color,background-color,border-color,box-shadow,opacity,transform] md:self-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách đơn hàng
        </Link>
      </div>

      {/* Progress Timeline Header */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Hành trình đơn hàng B2B
        </h3>

        {/* Step Progress Bar - Checkout styled */}
        <div className="flex w-full overflow-hidden text-xs sm:text-sm font-semibold rounded border border-slate-100">
          {/* Step 1: Giỏ hàng */}
          <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50/75 text-brand">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-extrabold text-white">
              ✓
            </span>
            <span className="font-bold tracking-wide">Giỏ hàng</span>
          </div>

          {/* Step 2: Thanh toán */}
          <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand text-white">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-brand">
              2
            </span>
            <span className="font-bold tracking-wide">Thanh toán</span>
          </div>

          {/* Step 3: Vận chuyển */}
          <Link
            href="/order-tracking/delivery-confirmation"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-400 hover:bg-slate-200/80 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-slate-300">
              3
            </span>
            <span className="font-bold tracking-wide">Vận chuyển (Đã giao)</span>
          </Link>

          {/* Step 4: Hoàn tất */}
          <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-300">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-slate-200">
              4
            </span>
            <span className="font-bold tracking-wide">Hoàn tất</span>
          </div>
        </div>
      </div>

      {/* Grid Columns */}
      <div className="grid gap-6 lg:grid-cols-12 pt-2">
        {/* LEFT COLUMN: Shipping details, journey log, items list */}
        <div className="lg:col-span-8 space-y-6">
          {/* Carrier Info Card */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-lg shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Truck className="h-5 w-5 text-brand" />
                Đơn vị vận chuyển B2B
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                <Clock className="h-4 w-4" />
                Dự kiến nhận: 16/03/2026
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Phương thức giao hàng:</span>
                <p className="font-bold text-slate-800">ULink Fleet (Giao hàng hỏa tốc B2B)</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Mã vận đơn B2B:</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-slate-800 text-[13px]">
                    TRK-HA-9817245
                  </span>
                  <button
                    onClick={handleCopyTracking}
                    className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-bold hover:bg-blue-100 transition-colors border border-blue-100"
                  >
                    {copiedTracking ? 'Đã sao chép!' : 'Sao chép'}
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Log Timeline Card */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-lg shadow-sm space-y-5">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Lịch sử hành trình chi tiết
            </h4>

            {/* Vertical timeline items */}
            <div className="relative pl-6 border-l border-slate-200 space-y-6 text-xs">
              {/* Event 1 */}
              <div className="relative">
                {/* Active blue marker circle */}
                <div className="absolute -left-[31px] top-0 h-4.5 w-4.5 rounded-full bg-blue-100 border border-brand flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-brand" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-blue-600">14:30 - 15/03/2026</span>
                  <p className="font-bold text-slate-800 text-sm">HUB Đồng Văn IV, Hà Nam</p>
                  <p className="text-slate-500 leading-relaxed">
                    Đang xếp dỡ lên xe tải trung chuyển liên tỉnh (ULink Fleet #29H-882.15)
                  </p>
                </div>
              </div>

              {/* Event 2 */}
              <div className="relative">
                {/* Gray marker circle */}
                <div className="absolute -left-[30px] top-0 h-4 w-4 rounded-full bg-white border border-slate-300 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-slate-400">09:15 - 15/03/2026</span>
                  <p className="font-bold text-slate-800 text-sm">
                    Nhà máy bao bì ULink, Kim Bảng, Hà Nam
                  </p>
                  <p className="text-slate-500 leading-relaxed">
                    Hoàn tất kiểm định xuất xưởng (QA/QC Đạt), niêm phong Pallet thành công.
                  </p>
                </div>
              </div>

              {/* Event 3 */}
              <div className="relative">
                {/* Gray marker circle */}
                <div className="absolute -left-[30px] top-0 h-4 w-4 rounded-full bg-white border border-slate-300 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-slate-400">16:45 - 14/03/2026</span>
                  <p className="font-bold text-slate-800 text-sm">Hệ thống B2B ULink</p>
                  <p className="text-slate-500 leading-relaxed">
                    Xác nhận thanh toán công nợ thành công. Đơn hàng chuyển sang bộ phận điều vận.
                  </p>
                </div>
              </div>

              {/* Event 4 */}
              <div className="relative">
                {/* Gray marker circle */}
                <div className="absolute -left-[30px] top-0 h-4 w-4 rounded-full bg-white border border-slate-300 flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                </div>
                <div className="space-y-1">
                  <span className="font-medium text-slate-400">15:20 - 14/03/2026</span>
                  <p className="font-bold text-slate-800 text-sm">Cổng thanh toán Doanh nghiệp</p>
                  <p className="text-slate-500 leading-relaxed">
                    Tiếp nhận yêu cầu mua hàng & hồ sơ RFQ tự động.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Ordered Products Card */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-lg shadow-sm space-y-4">
            <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Sản phẩm đã đặt (02)
              </h4>
              <span className="text-[11px] text-slate-400 font-semibold font-mono">
                Mã kiện hàng: ULK-PK-921
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
                    className="font-bold text-slate-900 text-xs sm:text-sm hover:text-brand transition-[color,background-color,border-color,box-shadow,opacity,transform] block leading-tight"
                  >
                    Màng quấn Pallet - Stretch Film (Bản rộng 50cm, 2.4kg)
                  </Link>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Số lượng: 500 kg x 39.500đ
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
                    className="font-bold text-slate-900 text-xs sm:text-sm hover:text-brand transition-[color,background-color,border-color,box-shadow,opacity,transform] block leading-tight"
                  >
                    Túi PE trong suốt siêu dai - Đóng kiện hàng công nghiệp
                  </Link>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Số lượng: 200 kg x 28.000đ
                  </p>
                </div>
                <span className="text-sm font-bold text-slate-800 shrink-0">
                  {formatPrice(5600000)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recipient Information & Totals Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Business Recipient Info */}
          <div className="bg-white border border-slate-200/80 p-5 rounded-lg shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 uppercase tracking-wider">
              Thông tin nhận hàng Doanh nghiệp
            </h4>
            <div className="space-y-3.5 text-xs text-left">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Tên doanh nghiệp nhận:</span>
                <p className="font-bold text-slate-800 text-[13px]">
                  CÔNG TY TNHH ULINK PARTNER VIỆT NAM
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Mã số thuế doanh nghiệp:</span>
                <p className="font-bold text-slate-800 text-[13px]">0110286665</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Người nhận bàn giao:</span>
                <p className="font-bold text-slate-800 text-[13px]">
                  Nguyễn Văn A - ĐT: 0912345678
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Địa chỉ bàn giao pallet:</span>
                <p className="font-bold text-slate-700 leading-relaxed text-[12px]">
                  Lô CN05 KCN Đồng Văn IV, xã Đại Cương, Kim Bảng, tỉnh Hà Nam
                </p>
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-background border border-slate-200/80 p-5 rounded-lg shadow-sm space-y-4 text-left">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200/60 pb-3 uppercase tracking-wider">
              Tổng cộng đơn hàng B2B
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
                <div className="text-right">
                  <span className="text-xl font-extrabold text-brand block leading-none">
                    {formatPrice(27378000)}
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium block mt-1.5">
                    Đã thanh toán qua công nợ doanh nghiệp thời hạn 30 ngày.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
