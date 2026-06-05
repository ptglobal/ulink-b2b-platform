import { getTranslations } from 'next-intl/server';

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border">
      <div className="container flex h-16 items-center justify-between text-xs text-muted-foreground">
        <span className="font-mono">© {year} ULink Industries</span>
        <span>{t('rights')}</span>
      </div>
    </footer>
  );
}
