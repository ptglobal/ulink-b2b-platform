/** Expanded cart item — persisted to localStorage as 'rfq-cart' */
export interface CartItem {
  sku: string;
  product_name: string;
  spec: string; // Quy cách kỹ thuật
  unit: string; // Đơn vị tính (ĐVT)
  quantity: number; // Số lượng (MOQ)
  note: string;
}

/** Create a blank cart item for adding new rows */
export function createBlankCartItem(): CartItem {
  return { sku: '', product_name: '', spec: '', unit: '', quantity: 0, note: '' };
}

/** Read cart from localStorage, migrating old format if needed */
export function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('rfq-cart');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Migrate old format { sku, qty } → new format
    return parsed.map(
      (item: any) =>
        ({
          sku: item.sku || '',
          product_name: item.product_name || '',
          spec: item.spec || '',
          unit: item.unit || '',
          quantity:
            typeof item.quantity === 'number'
              ? item.quantity
              : typeof item.qty === 'number'
                ? item.qty
                : 1,
          note: item.note || ''
        }) as CartItem
    );
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

/** Save draft form data to localStorage */
export function saveDraft(data: Record<string, unknown>) {
  localStorage.setItem('rfq-draft', JSON.stringify(data));
}

/** Read draft form data from localStorage */
export function readDraft(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem('rfq-draft');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Clear draft from localStorage */
export function clearDraft() {
  localStorage.removeItem('rfq-draft');
}
