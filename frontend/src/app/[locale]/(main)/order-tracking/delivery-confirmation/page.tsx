import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import DeliveryConfirmationClient from '@/components/delivery-confirmation/delivery-confirmation-client';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'deliveryConfirmationPage' });
  return {
    title: `${t('title')} | ULink B2B`,
    description: t('title')
  };
}

export default async function DeliveryConfirmationPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  const user = await getCurrentUser();

  return (
    <section className="relative overflow-hidden bg-white min-h-screen py-8 lg:py-12">
      <DeliveryConfirmationClient
        user={user}
        locale={locale}
      />
    </section>
  );
}
