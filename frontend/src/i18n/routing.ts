import { defineRouting } from 'next-intl/routing';

// VI / EN / JP per the delivery plan §9. VI is the default locale.
export const routing = defineRouting({
  locales: ['vi', 'en', 'ja'],
  defaultLocale: 'vi',
  localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];
