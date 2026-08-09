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
    <div className="flex min-h-screen w-full flex-col bg-slate-50/50">
      <SiteHeader />
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
