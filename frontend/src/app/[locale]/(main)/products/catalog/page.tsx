import React from 'react';
import { setRequestLocale } from 'next-intl/server';
import {
  CategoryProductsClient,
  CategoryInfo,
  ProductItem
} from '@/components/solutions/category-products-client';
import { fetchProducts, fetchProductCategories } from '@/lib/product-data';
import { getTranslatedName, getTranslatedField } from '@/lib/i18n-content';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ search?: string }>;
}

const FALLBACK_CATEGORIES = [
  { id: 1, name: 'Vật tư phòng sạch', slug: 'cleanroom-consumables' },
  { id: 2, name: 'Găng tay phòng sạch', slug: 'cleanroom-gloves' },
  { id: 3, name: 'Khăn lau phòng sạch', slug: 'cleanroom-wipers' },
  { id: 4, name: 'Quần áo phòng sạch', slug: 'cleanroom-apparel' },
  { id: 5, name: 'Khẩu trang phòng sạch', slug: 'cleanroom-masks' },
  { id: 6, name: 'Bao bì công nghiệp', slug: 'industrial-packaging' },
  { id: 7, name: 'Vật tư ESD', slug: 'esd-supplies' },
  { id: 8, name: 'Hóa chất phòng sạch', slug: 'cleanroom-chemicals' }
];

export default async function ProductsCatalogPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const query = (await searchParams)?.search?.trim() || undefined;
  setRequestLocale(locale);
  const [{ products: dbProducts }, dbCategories] = await Promise.all([
    fetchProducts({ limit: 100, search: query }),
    fetchProductCategories()
  ]);

  const categoryInfo: CategoryInfo = {
    id: 0,
    name: locale === 'vi' ? 'Danh mục Sản phẩm B2B' : 'B2B Product Catalog',
    slug: 'all',
    description:
      locale === 'vi'
        ? 'Toàn bộ vật tư phòng sạch, bao bì công nghiệp và thiết bị chống tĩnh điện ESD đang được quản lý trong hệ thống ULink Industries.'
        : 'The complete ULink Industries catalog of cleanroom, industrial packaging and ESD materials.'
  };

  const products: ProductItem[] = dbProducts.map((product) => {
    const firstSku = product.skus?.find((sku) => sku.status === 'published') || product.skus?.[0];
    const category =
      typeof product.category === 'object' && product.category !== null ? product.category : null;
    return {
      id: product.id,
      name: getTranslatedName(product, locale) || product.name,
      slug: product.slug,
      brand: product.brand || 'ULink',
      categoryName: category ? getTranslatedName(category, locale) || category.name : 'Vật tư công nghiệp',
      categorySlug: category?.slug || 'cleanroom-consumables',
      shortDescription:
        getTranslatedField(product, 'short_description', locale) || product.short_description || '',
      stockStatus: firstSku?.stock_status === 'out_of_stock' ? 'on_order' : firstSku?.stock_status || 'in_stock',
      image: product.hero ? `${getDirectusUrl()}/assets/${product.hero}` : undefined,
      unit: firstSku?.unit ?? '',
      packSize: firstSku?.pack_size ?? '',
      specs: ['Tiêu chuẩn ISO / ESD', 'Hồ sơ kỹ thuật đầy đủ']
    };
  });

  const allCategories = dbCategories.length
    ? dbCategories.map((category) => ({
        id: category.id,
        name: getTranslatedName(category, locale) || category.name,
        slug: category.slug
      }))
    : FALLBACK_CATEGORIES;

  return (
    <CategoryProductsClient
      category={categoryInfo}
      products={products}
      allCategories={allCategories}
      locale={locale}
    />
  );
}
