import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import { CategoryProductsClient, CategoryInfo, ProductItem } from '@/components/solutions/category-products-client';
import { fetchProducts, fetchProductCategories } from '@/lib/product-data';
import { getTranslatedName, getTranslatedField } from '@/lib/i18n-content';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { ASSETS } from '@/lib/assets';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const ALL_CATEGORIES_LIST = [
  { id: 1, name: 'Vật tư phòng sạch', slug: 'cleanroom-consumables' },
  { id: 2, name: 'Găng tay phòng sạch', slug: 'cleanroom-gloves' },
  { id: 3, name: 'Khăn lau phòng sạch', slug: 'cleanroom-wipers' },
  { id: 4, name: 'Quần áo phòng sạch', slug: 'cleanroom-apparel' },
  { id: 5, name: 'Khẩu trang phòng sạch', slug: 'cleanroom-masks' },
  { id: 6, name: 'Bao bì công nghiệp', slug: 'industrial-packaging' },
  { id: 7, name: 'Vật tư ESD', slug: 'esd-supplies' },
  { id: 8, name: 'Hóa chất phòng sạch', slug: 'cleanroom-chemicals' }
];

export default async function ProductsCatalogPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { products: dbProducts } = await fetchProducts({ limit: 100 });
  const dbCategories = await fetchProductCategories();

  const categoryInfo: CategoryInfo = {
    id: 0,
    name: locale === 'vi' ? 'Danh mục Sản phẩm B2B' : 'B2B Product Catalog',
    slug: 'all',
    description: locale === 'vi'
      ? 'Tổng hợp toàn bộ hệ thống vật tư tiêu hao phòng sạch, bao bì đóng gói công nghiệp và thiết bị chống tĩnh điện ESD chính hãng ULink Industries.'
      : 'Comprehensive catalog of cleanroom consumables, industrial packaging, and ESD anti-static supplies.'
  };

  const products: ProductItem[] = dbProducts.map((p) => {
    const firstSku = p.skus?.find((s) => s.status === 'published') || p.skus?.[0];
    const catObj = typeof p.category === 'object' && p.category !== null ? (p.category as any) : null;
    const categoryName = catObj ? (getTranslatedName(catObj, locale) || catObj.name) : 'Vật tư công nghiệp';

    const resolvedImage = p.hero
      ? `${getDirectusUrl()}/assets/${p.hero}`
      : ASSETS.home.solutionCleanroom;

    return {
      id: p.id,
      name: getTranslatedName(p, locale) || p.name,
      slug: p.slug,
      brand: p.brand || 'ULink',
      categoryName,
      categorySlug: catObj?.slug || 'cleanroom-consumables',
      shortDescription: getTranslatedField(p, 'short_description', locale) || p.short_description || '',
      stockStatus: (firstSku?.stock_status as any) || 'in_stock',
      image: resolvedImage,
      unit: firstSku?.unit ?? '',
      packSize: firstSku?.pack_size ?? '',
      specs: ['Tiêu chuẩn ISO / ESD', 'Chính hãng 100%']
    };
  });

  const categoriesList = dbCategories.length > 0
    ? dbCategories.map((c) => ({ id: c.id, name: getTranslatedName(c, locale) || c.name, slug: c.slug }))
    : ALL_CATEGORIES_LIST;

  return (
    <CategoryProductsClient
      category={categoryInfo}
      products={products}
      allCategories={categoriesList}
      locale={locale}
    />
  );
}
