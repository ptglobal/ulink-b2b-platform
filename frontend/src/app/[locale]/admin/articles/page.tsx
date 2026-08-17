import React from 'react';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, readItems } from '@directus/sdk';
import { cookies } from 'next/headers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { ArticlesClient } from '@/components/admin/articles-client';

async function getSessionClient() {
  const store = await cookies();
  const sessionToken = store.get('directus_session_token')?.value;
  const refreshToken = store.get('directus_refresh_token')?.value;

  if (sessionToken) {
    const cookieHeader = [
      `directus_session_token=${sessionToken}`,
      refreshToken ? `directus_refresh_token=${refreshToken}` : null
    ]
      .filter(Boolean)
      .join('; ');

    const cookieFetch: typeof globalThis.fetch = (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set('cookie', cookieHeader);
      return globalThis.fetch(input, { ...init, headers });
    };

    const url = getDirectusUrl();
    return createDirectus<Schema>(url, { globals: { fetch: cookieFetch } }).with(rest());
  }

  return createWriteDirectusClient();
}

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminArticlesPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Authenticate user
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  let articles: any[] = [];
  let error: string | undefined;
  try {
    const client = await getSessionClient();
    // 2. Fetch blog posts
    const res = await client.request(
      readItems(
        'blog_posts' as any,
        {
          filter: { status: { _in: ['published', 'draft'] } },
          fields: [
            'id',
            'status',
            'slug',
            'cover',
            'author',
            'published_at',
            'translations.id',
            'translations.languages_code',
            'translations.title',
            'translations.body',
            'translations.meta_title',
            'translations.meta_description'
          ],
          sort: ['-id'],
          limit: -1
        } as any
      )
    );
    articles = res || [];
  } catch (err) {
    console.error('Failed to load articles in admin dashboard:', err);
    try {
      error = JSON.stringify(err, null, 2);
    } catch {
      error = String(err);
    }
  }

  return <ArticlesClient initialArticles={articles} locale={locale} error={error} />;
}
