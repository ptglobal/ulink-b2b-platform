import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient } from '@/lib/directus';
import { fetchProductCategories } from '@/lib/product-data';
import { readItems } from '@directus/sdk';
import { ProductsClient } from '@/components/admin/products-client';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: 'Quản lý Sản phẩm & SKUs | ULink Admin' };
}

export default async function AdminProductsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  // Authenticate user server-side
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  // Fetch products and categories directly using write client (bypasses cache for real-time CRUD accuracy)
  let products: any[] = [];
  let categories: any[] = [];
  let globalAttributes: any[] = [];

  try {
    const client = createWriteDirectusClient();
    const [productsRes, categoriesRes, attrsRes] = await Promise.all([
      client.request(
        readItems('products', {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: [
            'id',
            'name',
            'slug',
            'brand',
            'short_description',
            'specifications',
            'status',
            'category.id',
            'category.name',
            'category.slug',
            'skus.id',
            'skus.sku_code',
            'skus.stock_status',
            'skus.unit',
            'skus.pack_size',
            'skus.status',
            'assigned_attributes.id',
            'assigned_attributes.product_attributes_id'
          ],
          sort: ['-id'],
          limit: -1
        } as any)
      ),
      fetchProductCategories(),
      client.request(
        readItems('product_attributes' as any, {
          fields: ['id', 'name', 'slug', 'sort', 'options.id', 'options.value', 'options.sku_suffix', 'options.sort'],
          sort: ['sort', 'id'],
          limit: -1
        } as any)
      )
    ]);

    products = productsRes || [];
    categories = categoriesRes || [];
    globalAttributes = attrsRes || [];
  } catch (err) {
    console.error('Failed to load products/categories in admin dashboard:', err);
  }

  return (
    <section className="relative min-h-screen bg-slate-50">
      <ProductsClient initialProducts={products} categories={categories} globalAttributes={globalAttributes} />
    </section>
  );
}
