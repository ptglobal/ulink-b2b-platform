import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { fetchProducts } from '@/lib/product-data';
import PaymentInvoiceClient from '@/components/payment-invoice/payment-invoice-client';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'paymentInvoicePage' });
  return {
    title: `${t('title')} | ULink B2B`,
    description: t('title')
  };
}

export default async function PaymentInvoicePage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  const user = await getCurrentUser();

  // Fetch products to map thumbnails
  const { products: allDbProducts } = await fetchProducts({ limit: 100 });
  const dbProductMap: Record<string, { hero: string | null; slug: string }> = {};

  for (const prod of allDbProducts) {
    dbProductMap[prod.slug] = { hero: prod.hero || null, slug: prod.slug };
    if (prod.skus) {
      for (const s of prod.skus) {
        dbProductMap[s.sku_code] = { hero: prod.hero || null, slug: prod.slug };
      }
    }
  }

  return (
    <section className="relative overflow-hidden bg-white min-h-screen py-8 lg:py-12">
      <PaymentInvoiceClient user={user} locale={locale} dbProductMap={dbProductMap} />
    </section>
  );
}
