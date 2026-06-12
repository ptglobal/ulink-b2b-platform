import { setRequestLocale } from 'next-intl/server';
import { AboutSidebar } from '@/components/layout/about-sidebar';
import { AboutBreadcrumb } from '@/components/layout/about-breadcrumb';

export default function AboutLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);

  return (
    <div className="w-full bg-background">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-16">
        {/* Breadcrumb — full width on top */}
        <AboutBreadcrumb />

        {/* Sidebar + page content below */}
        <div className="flex flex-col gap-8 pb-12 lg:flex-row">
          <AboutSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
