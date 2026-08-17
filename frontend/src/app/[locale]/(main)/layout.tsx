import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { getTranslations } from 'next-intl/server';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('nav');

  return (
    <div className="ulink-system flex min-h-screen w-full flex-col">
      <a href="#main-content" className="ulink-skip-link">
        {t('skipToContent')}
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
