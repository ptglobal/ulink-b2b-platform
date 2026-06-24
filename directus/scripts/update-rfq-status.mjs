import { createDirectusClient, loginAdmin } from '../lib/config.mjs';
import { customEndpoint } from '@directus/sdk';

async function main() {
  const client = createDirectusClient();
  await loginAdmin(client);
  
  await client.request(customEndpoint({
    path: '/fields/rfq_requests/status',
    method: 'PATCH',
    body: JSON.stringify({
      meta: {
        interface: 'select-dropdown',
        options: {
          choices: [
            { text: 'Pending (Đang chờ)', value: 'pending', color: '#fbbf24' },
            { text: 'Approved (Duyệt)', value: 'approved', color: '#10b981' },
            { text: 'Rejected (Từ chối)', value: 'rejected', color: '#ef4444' }
          ]
        }
      },
      schema: { default_value: 'pending' }
    }),
    headers: { 'Content-Type': 'application/json' }
  }));
  console.log('Status field updated successfully!');
}

main().catch(console.error);
