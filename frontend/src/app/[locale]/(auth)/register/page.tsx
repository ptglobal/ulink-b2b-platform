import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RegisterForm } from '@/components/auth/register-form';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('tabRegister') };
}

export default function RegisterPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <RegisterForm />;
}
