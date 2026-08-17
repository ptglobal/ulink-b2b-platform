import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * CMS administration is intentionally isolated from the customer website.
 *
 * The website login (`/[locale]/login`) is exclusively for B2B customers.
 * Editorial and operational users authenticate in Directus, which owns its
 * own session, roles and login screen. Keeping this redirect at the layout
 * boundary also covers every legacy `/[locale]/admin/*` URL.
 */
export default function AdminBoundary() {
  const directusUrl = process.env.DIRECTUS_PUBLIC_URL ?? process.env.DIRECTUS_URL;
  const cmsAdminUrl =
    process.env.CMS_ADMIN_URL ??
    (directusUrl ? `${directusUrl.replace(/\/$/, '')}/admin/` : 'http://localhost:8055/admin/');

  redirect(cmsAdminUrl);
}
