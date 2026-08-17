import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { getCurrentUser } from '@/lib/auth-helpers';

type Props = {
  params: { locale: string };
  // Token in URL is proof of intent (link was emailed only to that inbox).
  // We must render the form even when the user has no session — that's
  // the email-link flow's whole point.
  searchParams: { token?: string };
};

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

// Server-side guard:
//   - With ?token=… (email-link path): render unconditionally — the token
//     itself proves identity (it was emailed only to that inbox) and the
//     form's current_password check verifies knowledge.
//   - Without ?token=… (in-session path): require a session and redirect
//     anonymous visitors to /login?next=/change-password so they come back
//     here after signing in.
export default async function ChangePasswordPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale);
  if (searchParams.token) return <ChangePasswordForm />;
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/change-password');
  return <ChangePasswordForm />;
}
