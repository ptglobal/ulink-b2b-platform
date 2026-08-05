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

  return (
    <section className="relative overflow-hidden bg-white min-h-screen">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-8 sm:gap-8 lg:px-16 lg:py-12">
        <QuickOrderClient user={user} />
      </div>
    </section>
  );
}
