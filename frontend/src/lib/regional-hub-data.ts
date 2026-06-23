import { readItems } from '@directus/sdk';
import { publicDirectus, type RegionalHub, type HubIndustrialZone } from './directus';

/**
 * Regional hub data used on the homepage map section.
 * Fetched server-side from Directus (public/anonymous read).
 */
export interface RegionalHubWithZones extends Omit<RegionalHub, 'industrial_zones'> {
  industrial_zones: Pick<HubIndustrialZone, 'id' | 'name'>[];
  translations?: { id: number; languages_code: string; name: string }[];
}

/**
 * Fetch all published regional hubs with their industrial zones.
 * Used by the homepage to render the Visual Static Map section.
 *
 * ISR: page-level revalidation handles cache invalidation —
 * see content-revalidation.ts for webhook-based on-demand revalidation.
 */
export async function fetchRegionalHubs(): Promise<RegionalHubWithZones[]> {
  try {
    const hubs = await publicDirectus.request(
      readItems('regional_hubs', {
        filter: { status: { _eq: 'published' } },
        fields: [
          'id',
          'name',
          'slug',
          'hub_code',
          'coordinates',
          'operating_status',
          'warehouse_total_area',
          'standard_delivery_time',
          'on_time_rate',
          { industrial_zones: ['id', 'name'] },
          // @ts-expect-error — Directus SDK field types are overly strict for translation relations
          { translations: ['id', 'languages_code', 'name'] }
        ],
        sort: ['id'],
        limit: -1
      })
    );
    return hubs as unknown as RegionalHubWithZones[];
  } catch (err) {
    // Graceful degradation — return empty array so the homepage still renders
    console.error('[regional-hub-data] Failed to fetch hubs:', err);
    return [];
  }
}

/**
 * Parse the Directus `coordinates` string ("lat,lng") into numeric values.
 * Returns null if the string is missing or malformed.
 */
export function parseCoordinates(
  coordinates: string | null | undefined
): { lat: number; lon: number } | null {
  if (!coordinates) return null;
  const parts = coordinates.split(',').map((s) => s.trim());
  if (parts.length < 2) return null;
  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
}

export interface RegionalHubDetail extends Omit<RegionalHub, 'province' | 'district' | 'industrial_zones' | 'team_members'> {
  province?: { name: string; code: string } | null;
  district?: { name: string; code: string } | null;
  industrial_zones?: { id: number; name: string; image?: string | null }[];
  team_members?: { id: number; name: string; role?: string | null; years_experience?: number | null; photo?: string | null }[];
  translations?: { id: number; languages_code: string; name: string }[];
}

/**
 * Fetch a single published regional hub by its slug with relations.
 */
export async function fetchRegionalHubBySlug(slug: string): Promise<RegionalHubDetail | null> {
  try {
    const hubs = await publicDirectus.request(
      readItems('regional_hubs', {
        filter: {
          slug: { _eq: slug },
          status: { _eq: 'published' }
        },
        fields: [
          'id',
          'name',
          'slug',
          'hub_code',
          'detail_address',
          'operating_status',
          'coordinates',
          'warehouse_total_area',
          'warehouse_utilized_area',
          'warehouse_available_area',
          'warehouse_storage_tons',
          'warehouse_pallets',
          'standard_delivery_time',
          'on_time_rate',
          'on_time_rate_delta',
          'orders_today',
          'order_capacity_per_day',
          'avg_delivery_time',
          'person_in_charge_name',
          'person_in_charge_title',
          'person_in_charge_phone',
          'current_personnel_count',
          // @ts-expect-error — Directus SDK field types are overly strict for nested relations
          { province: ['name', 'code'] },
          // @ts-expect-error — Directus SDK field types are overly strict for nested relations
          { district: ['name', 'code'] },
          { industrial_zones: ['id', 'name', 'image'] },
          { team_members: ['id', 'name', 'role', 'years_experience', 'photo'] },
          // @ts-expect-error — Directus SDK field types are overly strict for translation relations
          { translations: ['id', 'languages_code', 'name'] }
        ],
        limit: 1
      })
    );
    return hubs && hubs.length > 0 ? (hubs[0] as RegionalHubDetail) : null;
  } catch (err) {
    console.error(`[regional-hub-data] Failed to fetch hub by slug ${slug}:`, err);
    return null;
  }
}

/**
 * Get localized name of a regional hub or fallback to base name.
 */
export function getHubName(
  hub: { name: string; translations?: { languages_code: string; name: string }[] | null },
  locale: string
): string {
  if (hub.translations && Array.isArray(hub.translations)) {
    const t = hub.translations.find((trans) => trans.languages_code === locale);
    if (t && t.name) return t.name;
  }
  return hub.name;
}


