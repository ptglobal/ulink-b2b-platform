import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { CareersHero } from '@/components/about/careers/careers-hero';
import { CareersCulture } from '@/components/about/careers/careers-culture';
import { CareersNews } from '@/components/about/careers/careers-news';
import { CareersGallery } from '@/components/about/careers/careers-gallery';
import { CareersJobList } from '@/components/about/careers/careers-job-list';
import { CareersNewsletter } from '@/components/about/careers/careers-newsletter';
import { CareersContact } from '@/components/about/careers/careers-contact';

export default async function CareersPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
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
          <span className="text-blue-600 font-semibold">Cơ hội nghề nghiệp</span>
        </nav>

        {/* 7 Section chính */}
        <CareersHero />
        <CareersCulture />
        <CareersNews />
        <CareersGallery />
        <CareersJobList />
        <CareersNewsletter />
        <CareersContact />
      </div>
    </div>
  );
}
