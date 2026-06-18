import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('forgotPassword') };
}

export default function ForgotPasswordPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <ForgotPasswordForm />;
}
