import { notFound } from 'next/navigation';
import type {
  CategoryInfo,
  ProductItem
} from '@/components/solutions/category-products-client';
import { fetchProductCategories, fetchProducts } from '@/lib/product-data';
import { getTranslatedField, getTranslatedName } from '@/lib/i18n-content';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import type { ProductCategory } from '@/lib/directus';

function parentId(category: ProductCategory): number | null {
  if (typeof category.parent === 'number') return category.parent;
  return category.parent?.id ?? null;
}

export async function loadCategoryPageData(locale: string, slug: string) {
  const [{ products: databaseProducts }, databaseCategories] = await Promise.all([
    fetchProducts({ limit: 100 }),
    fetchProductCategories()
  ]);

  const currentCategory = databaseCategories.find((category) => category.slug === slug);
  const isAll = slug === 'all';

  if (!isAll && !currentCategory) notFound();

  const category: CategoryInfo = isAll
    ? {
        id: 0,
        name: locale === 'vi' ? 'Tất cả sản phẩm' : locale === 'ja' ? 'すべての製品' : 'All products',
        slug: 'all',
        description: ''
      }
    : {
        id: currentCategory!.id,
        name: getTranslatedName(currentCategory!, locale) || currentCategory!.name,
        slug: currentCategory!.slug,
        description:
          getTranslatedField(currentCategory!, 'description', locale) ||
          currentCategory!.description ||
          '',
        subCategories: databaseCategories
          .filter((candidate) => parentId(candidate) === currentCategory!.id)
          .map((candidate) => ({
            id: candidate.id,
            name: getTranslatedName(candidate, locale) || candidate.name,
            slug: candidate.slug
          }))
      };

  const products: ProductItem[] = databaseProducts.map((product) => {
    const firstSku = product.skus?.find((sku) => sku.status === 'published') || product.skus?.[0];
    const productCategory =
      typeof product.category === 'object' && product.category !== null
        ? product.category
        : null;

    return {
      id: product.id,
      name: getTranslatedName(product, locale) || product.name,
      slug: product.slug,
      brand: product.brand || 'ULink',
      categoryName: productCategory
        ? getTranslatedName(productCategory, locale) || productCategory.name
        : category.name,
      categorySlug: productCategory?.slug || slug,
      shortDescription:
        getTranslatedField(product, 'short_description', locale) ||
        product.short_description ||
        '',
      stockStatus:
        firstSku?.stock_status === 'out_of_stock'
          ? 'on_order'
          : firstSku?.stock_status || 'in_stock',
      image: product.hero ? `${getDirectusUrl()}/assets/${product.hero}` : undefined,
      unit: firstSku?.unit ?? '',
      packSize: firstSku?.pack_size ?? '',
      specs: []
    };
  });

  return {
    category,
    products,
    categories: databaseCategories.map((item) => ({
      id: item.id,
      name: getTranslatedName(item, locale) || item.name,
      slug: item.slug
    }))
  };
}
