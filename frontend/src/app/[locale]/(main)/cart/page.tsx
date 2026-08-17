import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/auth-helpers';
import { fetchProducts } from '@/lib/product-data';
import { getTranslatedName, getTranslatedField } from '@/lib/i18n-content';
import CartClient from '@/components/cart/cart-client';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'cartPage' });
  return {
    title: `${t('title')} | ULink B2B`,
    description: t('title')
  };
}

// B2B Pricing helper based on product category/slug
function getProductPricing(slug: string, locale: string) {
  const isVi = locale === 'vi';
  const pricingMap: Record<string, { price: number; unit: string }> = {
    'nitrile-cleanroom-gloves': { price: 2500, unit: isVi ? 'đôi' : 'pair' },
    'polyester-cleanroom-wipers': { price: 250000, unit: isVi ? 'gói' : 'pack' },
    'tyvek-cleanroom-coverall': { price: 180000, unit: isVi ? 'bộ' : 'pcs' },
    'cleanroom-face-mask-3ply': { price: 75000, unit: isVi ? 'hộp' : 'box' },
    'esd-wrist-strap': { price: 45000, unit: isVi ? 'cái' : 'pcs' },
    'esd-table-mat-2layer': { price: 1200000, unit: isVi ? 'cuộn' : 'roll' },
    'ipa-cleanroom-grade-999': { price: 95000, unit: isVi ? 'chai' : 'bottle' },
    'sticky-mat-30-layers': { price: 150000, unit: isVi ? 'tấm' : 'sheet' },
    'esd-shielding-bag': { price: 3500, unit: isVi ? 'túi' : 'bag' },
    'sterile-latex-cleanroom-gloves': { price: 4500, unit: isVi ? 'đôi' : 'pair' }
  };
  return pricingMap[slug] || { price: 100000, unit: isVi ? 'cái' : 'pcs' };
}

export default async function CartPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  const user = await getCurrentUser();
  const t = await getTranslations({ locale, namespace: 'cartPage' });

  // Fetch all products to resolve cart item images/metadata
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

  // Fetch real suggested products from Directus (taking the first 4)
  const suggestedProducts = allDbProducts.slice(0, 4).map((prod) => {
    const pricing = getProductPricing(prod.slug, locale);
    const sku =
      (prod.skus ?? []).find((s: any) => s.status === 'published') || (prod.skus ?? [])[0];
    const skuCode = sku ? sku.sku_code : prod.slug.toUpperCase();

    const hub =
      prod.slug.includes('glove') || prod.slug.includes('latex')
        ? locale === 'vi'
          ? 'Hub Bình Dương, Việt Nam'
          : 'Binh Duong Hub, Vietnam'
        : locale === 'vi'
          ? 'Hub Hà Nam, Việt Nam'
          : 'Ha Nam Hub, Vietnam';

    const moqVal = sku?.pack_size ? parseInt(sku.pack_size) || 100 : 100;
    const moqText = locale === 'vi' ? `${moqVal} ${pricing.unit}` : `${moqVal} ${pricing.unit}`;

    return {
      sku: skuCode,
      slug: prod.slug,
      name: getTranslatedName(prod, locale),
      priceText:
        locale === 'vi'
          ? `${new Intl.NumberFormat('vi-VN').format(pricing.price)}đ /${pricing.unit}`
          : `$${(pricing.price / 25000).toFixed(2)} /${pricing.unit}`,
      moq: moqVal,
      moqText,
      desc: getTranslatedField(prod, 'short_description', locale) || '',
      hub,
      hero: prod.hero || null
    };
  });

  return (
    <section className="relative overflow-hidden bg-white min-h-screen py-8 lg:py-12">
      <CartClient
        user={user}
        locale={locale}
        suggestedProducts={suggestedProducts}
        dbProductMap={dbProductMap}
      />
    </section>
  );
}
