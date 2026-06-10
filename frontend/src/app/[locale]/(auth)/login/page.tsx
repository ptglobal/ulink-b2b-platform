import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LoginForm } from '@/components/auth/login-form';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('tabLogin') };
}

export default function LoginPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <LoginForm />;
}
