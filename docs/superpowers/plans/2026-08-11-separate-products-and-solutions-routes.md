# Separate Products (`/products`) and Solutions (`/solutions`) Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate the physical product catalog routes (`/products`, `/products/[slug]`, `/products/categories/[slug]`) from industry solution package routes (`/solutions`, `/solutions/[slug]`) so each route has a distinct URL path and clear structural boundary.

**Architecture:** Create dedicated product catalog pages under `frontend/src/app/[locale]/(main)/products/` while keeping `/solutions` focused on industry solutions overview and service capabilities. Update all header, footer, card, and breadcrumb links across the frontend.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, TailwindCSS v4, directus-sdk.

## Global Constraints

- Preserve all existing product detail UI design (image slider gallery, B2B price range block, MOQ quantity selector, 2x2 key specs grid, related products card bottom row).
- Keep backward compatibility redirects so legacy `/solutions/[slug]` product links gracefully handle product requests.
- All product links must point to `/${locale}/products/[slug]`.
- All category links must point to `/${locale}/products/categories/[slug]`.

---

### Task 1: Create Dedicated Product Detail Page (`/products/[slug]`)

**Files:**
- Modify: `frontend/src/app/[locale]/(main)/products/[slug]/page.tsx`
- Consumes: `fetchProductBySlug`, `ProductImageGallery`, `ProductDetailClient`
- Produces: Fully functional product detail page at `/${locale}/products/[slug]`

- [ ] **Step 1: Implement Product Detail Page under `/products/[slug]`**

Write the full implementation in `frontend/src/app/[locale]/(main)/products/[slug]/page.tsx` handling DB product fetching, image gallery slider, B2B pricing block, 2x2 key specs, quality standards, and related products links pointing to `/${locale}/products/[slug]`.

- [ ] **Step 2: Verify page renders cleanly**

Run node verification script to fetch `http://localhost:3000/vi/products/sticky-roller-refill-4inch` and confirm status `200 OK`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/\[locale\]/\(main\)/products/\[slug\]/page.tsx
git commit -m "feat: implement dedicated product detail page under /products/[slug]"
```

---

### Task 2: Create Category Product List Page (`/products/categories/[slug]`)

**Files:**
- Create: `frontend/src/app/[locale]/(main)/products/categories/[slug]/page.tsx`
- Consumes: `CategoryProductsClient`, `fetchProducts`, `fetchProductCategories`
- Produces: Category product listing page at `/${locale}/products/categories/[slug]`

- [ ] **Step 1: Create category page under `/products/categories/[slug]/page.tsx`**

Write `CategoryProductsPage` fetching DB products and categories, rendering `CategoryProductsClient`.

- [ ] **Step 2: Verify category page**

Run node verification script to fetch `http://localhost:3000/vi/products/categories/cleanroom-consumables` and confirm status `200 OK`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/\[locale\]/\(main\)/products/categories/\[slug\]/page.tsx
git commit -m "feat: add category products page under /products/categories/[slug]"
```

---

### Task 3: Create Main Products Catalog Page (`/products`)

**Files:**
- Create: `frontend/src/app/[locale]/(main)/products/page.tsx`
- Consumes: `fetchProducts`, `fetchProductCategories`, `CategoryProductsClient`
- Produces: All products catalog listing page at `/${locale}/products`

- [ ] **Step 1: Create `/products/page.tsx`**

Implement main products catalog listing page fetching all DB products and rendering the product grid with category sidebar filtering.

- [ ] **Step 2: Verify products page**

Run node verification script to fetch `http://localhost:3000/vi/products` and confirm status `200 OK`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/\[locale\]/\(main\)/products/page.tsx
git commit -m "feat: add main products catalog page under /products"
```

---

### Task 4: Update Global Site Navigation (Header & Footer Links)

**Files:**
- Modify: `frontend/src/components/layout/site-header.tsx`
- Modify: `frontend/src/components/layout/site-footer.tsx`
- Modify: `frontend/src/components/home/product-categories.tsx`
- Modify: `frontend/src/components/solutions/category-products-client.tsx`

- [ ] **Step 1: Update Site Header navigation links**

Update `Sản phẩm` link to `/${locale}/products` and `Giải pháp` link to `/${locale}/solutions`.

- [ ] **Step 2: Update Site Footer navigation links**

Update product category footer links to `/products/categories/[slug]`.

- [ ] **Step 3: Update Home Product Categories links**

Update homepage category cards to link to `/${locale}/products/categories/[slug]`.

- [ ] **Step 4: Update CategoryProductsClient breadcrumb and product card links**

Update breadcrumb link to `/${locale}/products` and product detail link to `/${locale}/products/[slug]`.

- [ ] **Step 5: Verify links**

Run node verification script checking that header and footer URLs reflect `/products` and `/solutions`.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/layout/site-header.tsx frontend/src/components/layout/site-footer.tsx frontend/src/components/home/product-categories.tsx frontend/src/components/solutions/category-products-client.tsx
git commit -m "refactor: update navigation links to separate /products and /solutions routes"
```

---

### Task 5: Add Backward Compatibility Redirects on `/solutions/[slug]`

**Files:**
- Modify: `frontend/src/app/[locale]/(main)/solutions/[slug]/page.tsx`

- [ ] **Step 1: Add redirect for product slugs under `/solutions/[slug]`**

If the slug requested under `/solutions/[slug]` is a physical product (e.g. `sticky-roller-refill-4inch`), redirect with `redirect(`/${locale}/products/${slug}`)`.

- [ ] **Step 2: Verify redirect**

Fetch `http://localhost:3000/vi/solutions/sticky-roller-refill-4inch` and confirm it returns `307/308` redirect or renders product page seamlessly.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/\[locale\]/\(main\)/solutions/\[slug\]/page.tsx
git commit -m "feat: add backward compatibility redirect from /solutions/[slug] to /products/[slug]"
```
