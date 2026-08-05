import { fetchProductBySlug } from '../src/lib/product-data.js';

async function test() {
  try {
    const product = await fetchProductBySlug('esd-wrist-strap');
    console.log('SKUs:', JSON.stringify(product?.skus, null, 2));
  } catch (err) {
    console.error(err);
  }
}

test();
