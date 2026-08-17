async function test() {
  try {
    const res = await fetch(
      'http://localhost:8055/items/products?filter[slug][_eq]=esd-wrist-strap&fields=skus.sku_code,skus.attributes'
    );
    const json = await res.json();
    console.log('Direct response skus:', JSON.stringify(json.data?.[0]?.skus, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
