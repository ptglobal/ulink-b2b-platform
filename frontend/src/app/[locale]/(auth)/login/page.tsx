import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LoginForm } from '@/components/auth/login-form';
import { getCurrentUser } from '@/lib/auth-helpers';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('tabLogin') };
}

// Server-side guard: an already-authenticated visitor has no business seeing
// the login form. Sending them to "/" here makes the browser-back gesture
// from any post-login page a no-op — by the time the page renders, they're
// already at home.
export default async function LoginPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (user) redirect('/');
  return <LoginForm />;
}
