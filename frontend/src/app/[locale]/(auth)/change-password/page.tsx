import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { getCurrentUser } from '@/lib/auth-helpers';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('changePassword') };
}

// Always render fresh — never let the browser restore this page from the
// back-forward cache after the password has already been changed. The form
// itself listens for `pageshow { persisted: true }` and force-redirects to
// /login in that case, but `force-dynamic` + `revalidate=0` adds a
// server-side layer of defence so the response itself isn't cacheable.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Server-side guard: only logged-in users can change their password in
// place (the form requires `current_password`). Anonymous visitors who
// want to recover their account should use /forgot-password instead.
export default async function ChangePasswordPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/change-password');
  return <ChangePasswordForm />;
}