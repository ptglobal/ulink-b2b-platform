import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { RfqsClient } from '@/components/rfq/rfqs-client';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const isVi = locale === 'vi';
  const isJa = locale === 'ja';
  return {
    title: isVi
      ? 'Yêu cầu báo giá (RFQs) | ULink B2B'
      : isJa
      ? '見積依頼 (RFQs) | ULink B2B'
      : 'Request for Quotation (RFQs) | ULink B2B',
    description: isVi
      ? 'Quản lý và theo dõi danh sách yêu cầu báo giá'
      : isJa
      ? '見積依頼リストの管理と追跡'
      : 'Manage and track your requests for quotation'
  };
}

export default async function RfqsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  // Authenticate-only check
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(0,106,167,0.1),_transparent_40%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(248,250,252,1))] min-h-screen">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-8 sm:gap-8 lg:px-16 lg:py-12">
        <div className="max-w-3xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-brand">Portal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Yêu cầu báo giá (RFQs)
          </h1>
          <p className="mt-2 text-xs leading-6 text-muted-foreground sm:text-sm">
            Xem, tìm kiếm, lọc và kiểm tra chi tiết các yêu cầu báo giá của doanh nghiệp bạn được đồng bộ trực tiếp với hệ thống ULink.
          </p>
        </div>

        <RfqsClient user={user} />
      </div>
    </section>
  );
}
