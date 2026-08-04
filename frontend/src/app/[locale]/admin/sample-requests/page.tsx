import type { Metadata } from 'next';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { SampleRequestsClient } from '@/components/admin/sample-requests-client';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'sampleRequest.admin' });
  return { title: t('listTitle') };
}

export default async function SampleRequestsPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background to-muted/30 min-h-screen">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-8 sm:px-8 sm:gap-8 lg:px-16 lg:py-12">
        <SampleRequestsClient locale={locale} />
      </div>
    </section>
  );
}
