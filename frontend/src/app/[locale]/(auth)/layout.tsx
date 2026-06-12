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
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      {/* Block 1 — Ảnh thương hiệu (full height) */}
      <AuthHero />

      {/* Block 2 — Khung đăng nhập */}
      <div className="flex h-screen w-full flex-col bg-card lg:w-1/2">
        {/* Top bar */}
        <div className="flex shrink-0 items-center justify-between px-6 pt-5 sm:px-10 lg:px-12">
          <Link href="/" className="inline-flex" aria-label="ULink Industries">
            <Image src={ASSETS.logo.full} alt="ULink Industries" width={140} height={39} priority />
          </Link>
          <LocaleSwitcher />
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto px-6 pb-6 pt-1 sm:px-10 lg:px-12">
          <div className="m-auto w-full max-w-md py-4">
            <AuthTabs />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
