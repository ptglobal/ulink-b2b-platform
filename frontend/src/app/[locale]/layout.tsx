import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';
import { CarbonFeatureFlags } from '@/components/carbon-feature-flags';
import '@fontsource-variable/archivo';
import '@fontsource-variable/noto-sans';
import '@fontsource-variable/noto-sans-jp';
import '../carbon.scss';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ULink Industries — B2B Procurement Platform',
    template: '%s · ULink Industries'
  },
  description:
    'Auxiliary materials for cleanroom & packaging, delivered to Northern Vietnam industrial clusters.'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff'
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className="cds--white">
      <body className="min-h-screen bg-background font-sans antialiased">
        <CarbonFeatureFlags>
          <NextIntlClientProvider messages={messages}>
            <AuthProvider>
              {children}
              <Toaster position="top-center" reverseOrder={false} />
            </AuthProvider>
          </NextIntlClientProvider>
        </CarbonFeatureFlags>
      </body>
    </html>
  );
}
