import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LoginHeroCard } from '@/components/auth/login-hero-card';
import { LoginForm } from '@/components/auth/login-form';
import { LoginPartners } from '@/components/auth/login-partners';
import { LoginCta } from '@/components/auth/login-cta';
import { getCurrentUser } from '@/lib/auth-helpers';

type Props = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'auth' });
  return { title: t('tabLogin') };
}

export default async function LoginPage({ params: { locale } }: Props) {
  setRequestLocale(locale);
  const user = await getCurrentUser();
  if (user) redirect('/');

  return (
    <div className="flex flex-col gap-6">
      {/* Main 2-Column Login Hero & Form Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-stretch py-2">
        {/* Left Column: Hero Card (5 Cols) */}
        <div className="lg:col-span-5">
          <LoginHeroCard />
        </div>

        {/* Right Column: Form Card (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-6 sm:p-10 border border-slate-100 shadow-sm flex flex-col justify-between">
          <LoginForm />
        </div>
      </div>

      {/* Partners Logos Section */}
      <LoginPartners />

      {/* Direct Contact CTA Banner */}
      <LoginCta />
    </div>
  );
}
