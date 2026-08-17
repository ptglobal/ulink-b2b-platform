import { setRequestLocale, getTranslations } from 'next-intl/server';

export default async function AboutCapabilitiesPage({
  params: { locale }
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('aboutSidebar');

  return <h1 className="mt-2 text-[24px] font-bold text-primary">{t('capabilities')}</h1>;
}
