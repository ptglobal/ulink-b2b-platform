import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <section className="container py-24 md:py-32">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{t('eyebrow')}</p>
      <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
        {t('title')}
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t('subtitle')}</p>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/quick-order"
          className="bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          {t('ctaPrimary')}
        </Link>
        <Link
          href="/solutions"
          className="border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
        >
          {t('ctaSecondary')}
        </Link>
      </div>
    </section>
  );
}
