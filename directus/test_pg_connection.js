import pg from 'pg';
const { Client } = pg;

async function test() {
  const client = new Client({
    connectionString: 'postgresql://ulink:f23cae6a9666268c75893a67@localhost:5432/ulink'
  });
  try {
    await client.connect();
    console.log('Successfully connected to Postgres!');

    console.log('Truncating tables...');
    await client.query(`
      TRUNCATE TABLE 
        products_regional_hubs, 
        rfq_assignment_rules, 
        hub_team_members, 
        hub_industrial_zones, 
        deliveries, 
        order_items, 
        invoices, 
        orders, 
        rfq_requests, 
        regional_hubs, 
        regional_hubs_translations, 
        hub_industrial_zones_translations 
      RESTART IDENTITY CASCADE
    `);
    console.log('Truncated successfully.');

    console.log('Deleting obsolete provinces...');
    const res = await client.query(`
      DELETE FROM vn_provinces 
      WHERE code IN ('vn-ha-nam', 'vn-nam-dinh', 'vn-hai-duong', 'vn-bac-giang', 'vn-vinh-phuc')
    `);
    console.log('Deleted obsolete provinces count:', res.rowCount);

  } catch (err) {
    console.error('Operation failed:', err);
  } finally {
    await client.end();
  }
}

test();
