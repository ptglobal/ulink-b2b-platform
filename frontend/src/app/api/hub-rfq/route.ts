import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient } from '@/lib/directus';
import { createItem } from '@directus/sdk';
import { handleRoute, jsonCreated, jsonErrorRaw } from '@/lib/route-helpers';
import { hubRfqSchema, type HubRfqInput } from '@/lib/validators';

/**
 * POST /api/hub-rfq
 * Create a new RFQ request linked to a specific regional hub.
 * Works for both visitors and authenticated users.
 * Uses admin token to bypass permissions (visitors don't have Directus sessions).
 */
export async function POST(req: Request) {
  return handleRoute<HubRfqInput>(req, { schema: hubRfqSchema }, async (data) => {
    const user = await getCurrentUser();

    try {
      const writeDirectus = createWriteDirectusClient();
      const created = await writeDirectus.request(
        createItem('rfq_requests', {
          hub: data.hub_id,
          contact_name: data.contact_name,
          company: data.company,
          phone: data.phone,
          email: data.email,
          message: data.message ?? null,
          source: 'web',
          status: 'new',
          user: user?.id ?? null
        } as Record<string, unknown>)
      );

      return jsonCreated({ id: (created as { id: number | string }).id });
    } catch (err) {
      console.error('Hub RFQ creation failed:', err);
      return jsonErrorRaw(502, 'bad_gateway', 'Failed to create RFQ request.');
    }
  });
}
