import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { ContactHero } from '@/components/contact/contact-hero';
import { ContactInfoCards } from '@/components/contact/contact-info-cards';
import { ContactCapabilities } from '@/components/contact/contact-capabilities';

export default async function ContactPage({
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
          <Link href="/contact" className="hover:text-blue-600 transition-colors">
            Liên hệ
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-blue-600 font-semibold">Hub Hà Nam - Trung tâm phân phối</span>
        </nav>

        {/* 3 Section chính */}
        <ContactHero />
        <ContactInfoCards />
        <ContactCapabilities />
      </div>
    </div>
  );
}
