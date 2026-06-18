import type { Metadata } from 'next';
import { Inter, IBM_Plex_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { getCurrentUser } from '@/lib/auth-helpers';
import { AuthProvider, type AuthUser } from '@/lib/auth-context';
import '../globals.css';

// Brand typography: Inter (UI/body) + IBM Plex Mono (nhãn, eyebrow, mã SKU)
const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-sans'
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono'
});

export const metadata: Metadata = {
  title: {
    default: 'ULink Industries — B2B Procurement Platform',
    template: '%s · ULink Industries'
  },
  description:
    'Auxiliary materials for cleanroom & packaging, delivered to Northern Vietnam industrial clusters.'
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

  // Resolve the session server-side so the initial render is hydration-correct
  // (avoids a client-side flash from "loading" to "authenticated").
  const [messages, initialUser] = await Promise.all([
    getMessages(),
    getCurrentUser() as Promise<AuthUser | null>
  ]);

  return (
    <html lang={locale} className={`${inter.variable} ${ibmPlexMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
