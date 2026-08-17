import { readSingleton } from '@directus/sdk';
import { publicDirectus, type SiteSettings } from '@/lib/directus';

export const FALLBACK_SITE_SETTINGS: SiteSettings = {
  contact_email: 'contact@ulinkindustries.com',
  contact_phone: '0247 309 9899',
  address: 'Lô CN05 KCN Đồng Văn IV, xã Đại Cương, Kim Bảng, Hà Nam, Việt Nam'
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await publicDirectus.request(
      readSingleton('site_settings', {
        fields: ['contact_email', 'contact_phone', 'address']
      })
    );

    return { ...FALLBACK_SITE_SETTINGS, ...settings };
  } catch {
    return FALLBACK_SITE_SETTINGS;
  }
}
