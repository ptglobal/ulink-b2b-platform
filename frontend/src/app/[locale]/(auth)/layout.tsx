import { setRequestLocale } from 'next-intl/server';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

/**
 * Layout dùng chung cho các trang auth (login, register, forgot-password).
 * Tích hợp Header & Footer tiêu chuẩn đồng bộ với toàn bộ hệ thống ULink.
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
    <div className="ulink-system flex min-h-screen w-full flex-col bg-background">
      <a href="#auth-content" className="ulink-skip-link">
        Skip to authentication form
      </a>
      <SiteHeader />
      <main id="auth-content" className="flex-1 bg-[#f8faff]">
        <div className="mx-auto w-full max-w-[1440px]">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
