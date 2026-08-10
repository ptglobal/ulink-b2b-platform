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

// Real image file UUIDs existing in directus_files DB table
const ALL_IMAGE_UUIDS = [
  '58296a84-0a95-4674-8840-a178bc5fe2a1', // Gloves
  '2a98e72c-15a9-450f-bb7e-f823fbd5508a', // Wiper
  '362ab8d2-45e0-47b1-91a1-9a74288b209e', // Coverall
  '98bc72de-a890-4f99-bbcf-8ab05c12670f', // Sticky Mat
  'b78e24c2-9e90-4c7b-b8f2-89cdcb7a329a', // Mask
  'c73ee8a2-ea88-4682-9988-cbfa98ab2211', // Wrist Strap
  'd89ef2c2-be00-477c-a49e-bca9efda8822', // Table Mat
  'f47bb992-a1f9-4bba-9bcf-10cf8eac2211', // IPA
  'f82cf9a2-da00-4cfa-a9bf-13cf8eac3311'  // Latex
];

async function seedProductGalleries() {
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
    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const primaryHero = p.hero || ALL_IMAGE_UUIDS[i % ALL_IMAGE_UUIDS.length];
      
      // Select 3 distinct complementary gallery image UUIDs from DB
      const galleryUuids = ALL_IMAGE_UUIDS
        .filter(uuid => uuid !== primaryHero)
        .slice(i % 5, (i % 5) + 3);

      const galleryPayload = galleryUuids.map(fileId => ({
        directus_files_id: fileId
      }));

      // Update product hero & gallery in Directus DB
      const updateRes = await fetch(`${DIRECTUS_URL}/items/products/${p.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hero: primaryHero,
          gallery: galleryPayload
        })
      });

      if (updateRes.ok) {
        updatedCount++;
      } else {
        console.error(`Failed to update product ${p.id} (${p.slug}):`, updateRes.statusText);
      }
    }

    console.log(`🎉 SUCCESS: Populated MULTIPLE DB gallery images for ${updatedCount}/${products.length} products in Directus!`);
  } catch (error) {
    console.error('Error seeding DB product galleries:', error);
  }
}

seedProductGalleries();
