import fs from 'fs';
import path from 'path';

function loadEnv() {
  try {
    const envPath = path.resolve('.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...vals] = trimmed.split('=');
          process.env[key.trim()] = vals.join('=').trim();
        }
      }
    }
  } catch (e) {
    console.error('Env load note:', e.message);
  }
}

loadEnv();

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL || process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'd1rectus_secret';

async function seedProductSkus() {
  try {
    console.log('Logging into Directus Admin API...');
    const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });

    if (!loginRes.ok) {
      throw new Error(`Admin login failed: ${loginRes.status} ${loginRes.statusText}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.data?.access_token;
    console.log('Successfully authenticated as Directus Admin!');

    console.log('Fetching all products from Directus DB...');
    const res = await fetch(`${DIRECTUS_URL}/items/products?limit=-1&fields=id,slug,skus.id`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    const products = json.data || [];
    console.log(`Found ${products.length} products in DB.`);

    let createdSkusCount = 0;
    for (const p of products) {
      if (!p.skus || p.skus.length === 0) {
        const skuPayloads = [
          {
            product: p.id,
            sku_code: `UL-${(p.slug || 'PRD').toUpperCase()}-2.4KG`,
            unit: 'kg',
            stock_status: 'in_stock',
            attributes: { size: '2.4 kg' },
            status: 'published'
          },
          {
            product: p.id,
            sku_code: `UL-${(p.slug || 'PRD').toUpperCase()}-3.0KG`,
            unit: 'kg',
            stock_status: 'in_stock',
            attributes: { size: '3.0 kg' },
            status: 'published'
          },
          {
            product: p.id,
            sku_code: `UL-${(p.slug || 'PRD').toUpperCase()}-4.0KG`,
            unit: 'kg',
            stock_status: 'in_stock',
            attributes: { size: '4.0 kg' },
            status: 'published'
          }
        ];

        for (const payload of skuPayloads) {
          const createSkuRes = await fetch(`${DIRECTUS_URL}/items/product_skus`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          if (createSkuRes.ok) {
            createdSkusCount++;
          }
        }
      }
    }

    console.log(`🎉 SUCCESS: Created ${createdSkusCount} SKUs for products missing SKUs in Directus DB!`);
  } catch (error) {
    console.error('Error seeding DB product SKUs:', error);
  }
}

seedProductSkus();
