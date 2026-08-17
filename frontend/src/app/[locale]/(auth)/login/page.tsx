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
    <div className="flex flex-col">
      {/* Main 2-Column Login Hero & Form Section */}
      <div className="grid items-stretch border-b border-[#dfe5ef] bg-white lg:grid-cols-12">
        {/* Left Column: Hero Card (5 Cols) */}
        <div className="lg:col-span-5">
          <LoginHeroCard />
        </div>

        {/* Right Column: Form Card (7 Cols) */}
        <div className="flex items-center justify-center border-t border-[#dfe5ef] bg-[#f8faff] p-6 sm:p-10 lg:col-span-7 lg:border-l lg:border-t-0 lg:p-16">
          <div className="w-full max-w-[540px] border border-[#e0e6f0] bg-white p-7 shadow-[0_12px_34px_rgba(32,55,98,.08)] sm:p-10"><LoginForm /></div>
        </div>
      </div>
      <LoginPartners />
      <LoginCta />
    </div>
  );
}
