import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { AuthHero } from '@/components/auth/auth-hero';
import { AuthTabs } from '@/components/auth/auth-tabs';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { ASSETS } from '@/lib/assets';

/**
 * Layout dùng chung cho các trang auth (login, register, forgot-password).
 * Bố cục: nền phía sau + hai block tách biệt (ảnh | đăng nhập) canh giữa,
 * giới hạn max-width và chiều cao để không bị thu nhỏ quá mức khi resize.
 */
export default function AuthLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-100 to-slate-300 p-4 lg:p-8">
      <div className="flex w-full max-w-[1200px] flex-col overflow-hidden border border-border bg-card shadow-lg lg:h-[min(90vh,840px)] lg:flex-row">
        {/* Block 1 — Ảnh thương hiệu (sát block đăng nhập, không gap) */}
        <AuthHero />

        {/* Block 2 — Khung đăng nhập */}
        <div className="flex w-full flex-col bg-card lg:w-1/2">
          {/* Top bar — locale switcher trong luồng (không absolute) → không nhảy lệch khi zoom */}
          <div className="flex shrink-0 justify-end px-6 pt-5 sm:px-10 lg:px-12">
            <LocaleSwitcher />
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-10 pt-2 sm:px-10 lg:px-12">
            <div className="m-auto w-full max-w-md py-6">
              {/* Logo cho mobile (block ảnh ẩn dưới lg) */}
              <Link href="/" className="mb-8 inline-flex lg:hidden" aria-label="ULink Industries">
                <Image src={ASSETS.logo.full} alt="ULink Industries" width={150} height={42} priority />
              </Link>

              <AuthTabs />
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
