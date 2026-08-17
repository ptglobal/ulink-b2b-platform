import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: 'localhost', port: '8055' },
      { protocol: 'http', hostname: '103.164.35.132' }, // test backend (Directus assets)
      { protocol: 'http', hostname: '103.164.35.132', port: '8055' },
      { protocol: 'http', hostname: '103.164.35.132.nip.io', port: '8055' },
      { protocol: 'https', hostname: '**' }
    ]
  }
};

export default withNextIntl(nextConfig);
