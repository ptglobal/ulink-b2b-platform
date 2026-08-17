import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient } from '@/lib/directus';
import { readItems } from '@directus/sdk';
import { SkusClient } from '@/components/admin/skus-client';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return { title: 'Quản lý Mã SKUs B2B | ULink Admin' };
}

export default async function AdminSkusPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  // Authenticate user server-side
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  let skus: any[] = [];
  let products: any[] = [];

  try {
    const client = createWriteDirectusClient();
    const [skusRes, productsRes] = await Promise.all([
      client.request(
        readItems('product_skus', {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: [
            'id',
            'sku_code',
            'stock_status',
            'unit',
            'pack_size',
            'status',
            'product.id',
            'product.name',
            'product.slug'
          ],
          sort: ['-id'],
          limit: -1
        } as any)
      ),
      client.request(
        readItems('products', {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: [
            'id',
            'name',
            'slug',
            'assigned_attributes.product_attributes_id.id',
            'assigned_attributes.product_attributes_id.name',
            'assigned_attributes.product_attributes_id.slug',
            'assigned_attributes.product_attributes_id.sort',
            'assigned_attributes.product_attributes_id.options.id',
            'assigned_attributes.product_attributes_id.options.value',
            'assigned_attributes.product_attributes_id.options.sku_suffix',
            'assigned_attributes.product_attributes_id.options.sort'
          ],
          sort: ['name'],
          limit: -1
        } as any)
      )
    ]);

    skus = skusRes || [];
    products = productsRes || [];
  } catch (err) {
    console.error('Failed to load SKUs/Products in admin dashboard:', err);
  }

  return (
    <section className="relative min-h-screen bg-slate-50">
      <SkusClient initialSkus={skus} products={products} />
    </section>
  );
}
