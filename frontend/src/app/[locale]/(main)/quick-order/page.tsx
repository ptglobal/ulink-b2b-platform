import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { QuickOrderClient } from '@/components/rfq/quick-order-client';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isVi = locale === 'vi';
  const isJa = locale === 'ja';
  return {
    title: isVi
      ? 'Đặt hàng nhanh (Quick Order) | ULink B2B'
      : isJa
      ? 'クイックオーダー (Quick Order) | ULink B2B'
      : 'Quick Order | ULink B2B',
    description: isVi
      ? 'Tạo nhanh yêu cầu báo giá bằng cách thêm trực tiếp SKU sản phẩm.'
      : isJa
      ? '製品SKUを直接追加して見積依頼を素早く作成します。'
      : 'Create requests for quotation quickly by directly adding product SKUs.'
  };
}

export default async function QuickOrderPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  // Get current user (can be guest/visitor, so null is allowed)
  const user = await getCurrentUser();

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(0,106,167,0.1),_transparent_40%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(248,250,252,1))] min-h-screen">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-8 sm:gap-8 lg:px-16 lg:py-12">
        <div className="max-w-3xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-brand">Portal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Đặt hàng nhanh (Quick Order)
          </h1>
          <p className="mt-2 text-xs leading-6 text-muted-foreground sm:text-sm">
            Tạo nhanh yêu cầu báo giá bằng cách chọn sản phẩm hoặc dán danh sách mã SKU trực tiếp vào giỏ hàng.
          </p>
        </div>

        <QuickOrderClient user={user} />
      </div>
    </section>
  );
}
