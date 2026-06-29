import { createDirectusClient, loginAdmin } from './lib/config.mjs';
import { readUsers, readItems } from '@directus/sdk';
import { SALES_ROLE_ID } from './lib/constants.mjs';

async function run() {
  const client = createDirectusClient();
  try {
    await loginAdmin(client);
    console.log('--- SEEDED SALES USERS ---');
    const users = await client.request(readUsers({
      filter: { role: { _eq: SALES_ROLE_ID } },
      fields: ['id', 'email', 'first_name', 'last_name', 'status']
    }));
    users.forEach(u => {
      console.log(`- Name: ${u.first_name} ${u.last_name || ''}`);
      console.log(`  Email: ${u.email}`);
      console.log(`  ID: ${u.id}`);
      console.log(`  Status: ${u.status}`);
      console.log();
    });

    console.log('--- RFQ ASSIGNMENT RULES ---');
    const rules = await client.request(readItems('rfq_assignment_rules', {
      fields: [
        'id',
        'priority',
        'is_default',
        'hub.name',
        'industry.name',
        'assigned_sales.email',
        'assigned_sales.first_name',
        'assigned_sales.last_name'
      ]
    }));
    rules.forEach(r => {
      const salesName = r.assigned_sales ? `${r.assigned_sales.first_name || ''} ${r.assigned_sales.last_name || ''} (${r.assigned_sales.email})` : 'Unassigned';
      if (r.is_default) {
        console.log(`Rule #${r.id} (DEFAULT): Fallback ➔ ${salesName}`);
      } else {
        console.log(`Rule #${r.id}: Hub: ${r.hub?.name || 'Any'} | Industry: ${r.industry?.name || 'Any'} | Priority: ${r.priority} ➔ ${salesName}`);
      }
    });

  } catch (err) {
    console.error('Error fetching data:', err?.errors || err);
  }
}

run();
