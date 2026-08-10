import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DIRECTUS_URL = process.env.DIRECTUS_PUBLIC_URL || process.env.DIRECTUS_URL || 'http://localhost:8055';
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD || 'd1rectus_secret';

async function seedProductImages() {
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
    const res = await fetch(`${DIRECTUS_URL}/items/products?limit=-1&fields=id,slug,hero`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await res.json();
    const products = json.data || [];
    console.log(`Found ${products.length} products in DB.`);

    let updatedCount = 0;
    for (const p of products) {
      let imagePath = '/images/home/section2/solution-cleanroom.webp';
      
      const slug = (p.slug || '').toLowerCase();
      if (slug.includes('glove')) imagePath = '/images/home/section2/product-cut-gloves.webp';
      else if (slug.includes('wrap') || slug.includes('bag') || slug.includes('box') || slug.includes('packaging') || slug.includes('pe-stretch')) imagePath = '/images/home/section2/product-custom-pkg.webp';
      else if (slug.includes('tape') || slug.includes('esd') || slug.includes('chemical') || slug.includes('cleaner') || slug.includes('fluid')) imagePath = '/images/home/section2/product-hvac-tape.webp';
      else imagePath = '/images/home/section2/solution-cleanroom.webp';

      // Update product hero in Directus DB using admin token
      const updateRes = await fetch(`${DIRECTUS_URL}/items/products/${p.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ hero: imagePath })
      });

      if (updateRes.ok) {
        updatedCount++;
      } else {
        console.error(`Failed to update product ${p.id}:`, updateRes.statusText);
      }
    }

    console.log(`🎉 SUCCESS: Updated ${updatedCount}/${products.length} products in Directus DB with hero images!`);
  } catch (error) {
    console.error('Error seeding DB product images:', error);
  }
}

seedProductImages();
