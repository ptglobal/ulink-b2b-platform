import { readItems } from '@directus/sdk';
import { publicDirectus, type RegionalHub, type HubIndustrialZone } from './directus';

/**
 * Regional hub data used on the homepage map section.
 * Fetched server-side from Directus (public/anonymous read).
 */
export interface RegionalHubWithZones extends RegionalHub {
  industrial_zones: Pick<HubIndustrialZone, 'id' | 'name'>[];
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
          { industrial_zones: ['id', 'name'] }
        ],
        sort: ['id'],
        limit: -1
      })
    );
    return hubs as RegionalHubWithZones[];
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
