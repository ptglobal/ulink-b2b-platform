import { setRequestLocale } from 'next-intl/server';
import { CategoryProductsClient } from '@/components/solutions/category-products-client';
import { loadCategoryPageData } from '@/lib/category-page-data';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CategoryProductsPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const data = await loadCategoryPageData(locale, slug);

  return (
    <CategoryProductsClient
      category={data.category}
      products={data.products}
      allCategories={data.categories}
      locale={locale}
    />
  );
}
