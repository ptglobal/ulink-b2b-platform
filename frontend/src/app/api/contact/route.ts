import { createItem } from '@directus/sdk';
import { ApiError } from '@/lib/api-error';
import { createWriteDirectusClient } from '@/lib/directus';
import { handleRoute, jsonCreated } from '@/lib/route-helpers';
import { contactSchema, type ContactInput } from '@/lib/validators';
import { saveContactRequest } from '@/lib/contact-request.server';

export async function POST(req: Request) {
  return handleRoute<ContactInput>(req, { schema: contactSchema }, async (data) => {
    try {
      const created = await saveContactRequest(data, {
        writeContactRequest: async (payload) => {
          const writeDirectus = createWriteDirectusClient();
          return writeDirectus.request(createItem('contact_requests', payload)) as Promise<{
            id: number | string;
          }>;
        }
      });

      return jsonCreated({ id: created.id });
    } catch (error) {
      console.error('Contact request creation failed:', error);
      throw new ApiError(502, 'bad_gateway', 'Failed to create contact request.');
    }
  });
}
