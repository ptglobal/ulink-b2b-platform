import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { fetchProducts } from '@/lib/product-data';
import CheckoutClient from '@/components/checkout/checkout-client';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'checkoutPage' });
  return {
    title: `${t('title')} | ULink B2B`,
    description: t('title')
  };
}

export default async function CheckoutPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  const user = await getCurrentUser();

  // Fetch all products to resolve cart item images/metadata in the order summary list
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
      <CheckoutClient user={user} locale={locale} dbProductMap={dbProductMap} />
    </section>
  );
}
