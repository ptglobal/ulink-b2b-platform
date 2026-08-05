import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { QuickOrderClient } from '@/components/rfq/quick-order-client';
import { Link } from '@/i18n/navigation';
import { ChevronRight } from 'lucide-react';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'quickOrderPage' });
  return {
    title: `${t('title')} | ULink B2B`,
    description: t('description')
  };
}

export default async function QuickOrderPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  // Get current user (can be guest/visitor, so null is allowed)
  const user = await getCurrentUser();
  const t = await getTranslations({ locale, namespace: 'quickOrderPage' });

  return (
    <section className="relative overflow-hidden bg-white min-h-screen">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-8 sm:gap-8 lg:px-16 lg:py-12">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-brand">
            {t('breadcrumbHome')}
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
          <span className="font-medium text-foreground">{t('breadcrumbRfq')}</span>
        </nav>

        <div className="max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            {t('subtitle')}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-3xl">
            {t('description')}
          </p>
        </div>

        <QuickOrderClient user={user} />
      </div>
    </section>
  );
}
