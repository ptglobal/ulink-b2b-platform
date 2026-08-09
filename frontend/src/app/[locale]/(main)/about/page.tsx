import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { AboutHero } from '@/components/about/about-hero';
import { AboutStats } from '@/components/about/about-stats';
import { AboutLocation } from '@/components/about/about-location';
import { AboutInfrastructure } from '@/components/about/about-infrastructure';
import { AboutStandards } from '@/components/about/about-standards';
import { AboutSustainability } from '@/components/about/about-sustainability';
import { AboutNews } from '@/components/about/about-news';
import { AboutContact } from '@/components/about/about-contact';

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);

  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-16 py-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 py-2">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Trang chủ
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/about" className="hover:text-blue-600 transition-colors">
            Về chúng tôi
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-blue-600 font-semibold">Trung tâm phân phối Hà Nam</span>
        </nav>

        {/* 8 Section chính */}
        <AboutHero />
        <AboutStats />
        <div className="my-4 h-px w-full bg-slate-200" />
        <AboutLocation />
        <AboutInfrastructure />
        <AboutStandards />
        <AboutSustainability />
        <AboutNews />
        <AboutContact />
      </div>
    </div>
  );
}
