/** Expanded cart item — persisted to localStorage as 'rfq-cart' */
export interface CartItem {
  sku: string;
  product_name: string;
  note: string;
}

/** Read cart from localStorage, migrating old format if needed */
export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('rfq-cart');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Migrate old format { sku, qty } → new format { sku, product_name, note }
    return parsed.map((item: any) => {
      if ('product_name' in item) return { sku: item.sku, product_name: item.product_name, note: item.note || '' } as CartItem;
      // Legacy item
      return {
        sku: item.sku || '',
        product_name: '',
        note: ''
      } as CartItem;
    });
  } catch {
    return [];
  }
}

/** Persist cart to localStorage and notify listeners */
export function persistCart(cart: CartItem[]) {
  localStorage.setItem('rfq-cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('rfq-cart-changed'));
}

/** Parse CSV/text content into SKU list (one per line, or comma-separated) */
export function parseSkuText(text: string): string[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
