import { createDirectusClient, loginAdmin } from '../lib/config.mjs';
import { customEndpoint } from '@directus/sdk';

async function main() {
  const client = createDirectusClient();
  await loginAdmin(client);
  
  await client.request(customEndpoint({
    path: '/fields/rfq_requests/approval_note',
    method: 'PATCH',
    body: JSON.stringify({
      meta: {
        conditions: [
          {
            name: 'Hide if not approved',
            rule: { status: { _neq: 'approved' } },
            hidden: true
          }
        ]
      }
    }),
    headers: { 'Content-Type': 'application/json' }
  }));

  await client.request(customEndpoint({
    path: '/fields/rfq_requests/reject_reason',
    method: 'PATCH',
    body: JSON.stringify({
      meta: {
        conditions: [
          {
            name: 'Require if rejected',
            rule: { status: { _eq: 'rejected' } },
            required: true
          },
          {
            name: 'Hide if not rejected',
            rule: { status: { _neq: 'rejected' } },
            hidden: true
          }
        ]
      }
    }),
    headers: { 'Content-Type': 'application/json' }
  }));

  console.log('Field conditions updated successfully!');
}

main().catch(console.error);
