import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { SettingsView, type SettingsCustomer } from '@/components/auth/settings-view';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('settingsTitle') };
}

export default async function SettingsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  // Authenticated-only — `/settings` is rendered inside `(main)` group so
  // we gate it here rather than the layout (which is shared by every public
  // route under `(main)`, e.g. home / solutions / industries).
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }
  // After the `redirect(...)` guard above, `user` is non-null. TS does not
  // narrow it across the intervening try/catch + cookie fetch below, so we
  // assert here — the redirect guard makes the `!` safe.
  const me = user!;

  // Customer record holds company_name / contact_name / phone — the user
  // object from /users/me only carries auth fields. Fetch the related
  // customer row (filter by user FK) so we can show it in the profile block.
  // We forward the same session cookie so RBAC applies.
  let customer: SettingsCustomer | null = null;
  try {
    const store = await cookies();
    const session = store.get('directus_session_token')?.value;
    const refresh = store.get('directus_refresh_token')?.value;
    const cookieHeader = [
      session ? `directus_session_token=${session}` : null,
      refresh ? `directus_refresh_token=${refresh}` : null
    ]
      .filter(Boolean)
      .join('; ');

    if (cookieHeader) {
      const url = `${getDirectusUrl()}/items/customers?filter[user][_eq]=${encodeURIComponent(me!.id)}&limit=1&fields=id,company_name,contact_name,phone`;
      const res = await fetch(url, { headers: { cookie: cookieHeader }, cache: 'no-store' });
      if (res.ok) {
        const json = (await res.json()) as { data?: Array<SettingsCustomer> };
        customer = json.data?.[0] ?? null;
      }
    }
  } catch {
    // Fail soft — the profile block will simply not show company/phone.
    // The change-password flow is unaffected since it only needs user.email.
  }

  return (
    <SettingsView
      user={{
        id: me!.id,
        email: me!.email,
        first_name: me!.first_name ?? null,
        last_name: me!.last_name ?? null
      }}
      customer={customer}
    />
  );
}
