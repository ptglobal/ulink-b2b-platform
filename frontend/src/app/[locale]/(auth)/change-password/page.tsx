import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChangePasswordForm } from '@/components/auth/change-password-form';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('changePassword') };
}

export default function ChangePasswordPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <ChangePasswordForm />;
}