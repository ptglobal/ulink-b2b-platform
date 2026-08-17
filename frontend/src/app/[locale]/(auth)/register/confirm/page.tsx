import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RegisterConfirmForm } from '@/components/auth/register-confirm-form';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('registerConfirmTitle') };
}

export default function RegisterConfirmPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  return <RegisterConfirmForm />;
}
