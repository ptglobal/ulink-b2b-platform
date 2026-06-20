import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '103.164.35.132' }, // test backend (Directus assets)
      { protocol: 'https', hostname: '**' }
    ]
  }
};

export default withNextIntl(nextConfig);
