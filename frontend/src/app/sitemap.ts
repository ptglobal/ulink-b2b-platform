import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', '/regional-hubs', '/solutions', '/industries', '/resources', '/quick-order', '/about'];

  return paths.flatMap((p) =>
    routing.locales.map((l) => ({
      url: `${base}/${l}${p}`,
      changeFrequency: 'weekly' as const,
      priority: p === '' ? 1 : 0.7
    }))
  );
}
