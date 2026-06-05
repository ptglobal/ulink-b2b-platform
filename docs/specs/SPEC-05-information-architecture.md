# SPEC-05 — Information Architecture & Sitemap

**Status:** Baseline · **Owner:** BA/Dev A · **Related:** SPEC-02, SPEC-08

## Sitemap
```
/[locale]                         Home
├─ /regional-hubs[/[slug]]        Hubs index → Dong Van 4 / Bac Thang Long / Bac Ninh / Hung Yen / Hai Phong
├─ /solutions[/[category]]        Cleanroom / Packaging (+ sub-categories)
├─ /products/[slug]               Product Detail
├─ /industries/[slug]             Electronics / Pharmaceutical / Cosmetics / Food & Beverage
├─ /resources                     Resource Center hub
│  ├─ /documents                  Technical Documents
│  ├─ /certifications             ISO Certifications
│  ├─ /case-studies               Case Studies
│  ├─ /blog[/[slug]]              Blog & News
│  └─ /downloads                  Download Center
├─ /quick-order                   SKU input · bulk upload · RFQ cart · submit
├─ /portal                        (auth) dashboard
│  ├─ /orders[/[id]]              Order History
│  ├─ /deliveries                 Scheduled Delivery
│  ├─ /debt                       Công nợ
│  └─ /re-order                   Re-order
└─ /about                         Company · Competencies · Sustainability · Careers · Contact

/api/sku/[code]                   cached SKU lookup
/api/rfq                          RFQ submit
/sitemap.xml  /robots.txt         SEO
```

## Route ↔ data map
| Route | Collection(s) | Render |
|---|---|---|
| `/` | hero_banners, partners, case_studies, products | ISR |
| `/regional-hubs/[slug]` | regional_hubs | ISR |
| `/solutions/[category]` | product_categories, products | ISR |
| `/products/[slug]` | products, product_skus, documents | ISR |
| `/industries/[slug]` | industries, products | ISR |
| `/resources/*` | documents, iso_certifications, case_studies, blog_posts | ISR |
| `/quick-order` | product_skus (via /api/sku), rfq_requests | client + API |
| `/portal/*` | customers, orders, invoices, deliveries | SSR (auth) |
| `/about` | pages | ISR |

## Navigation
- **Primary nav:** Hubs, Solutions, Industries, Resources, Quick Order, About (+ locale switch, Portal login).
- **Footer:** company, hubs, solutions, resources, contact, legal, language.
- **Breadcrumbs:** on products, resources, hub detail.

## URL rules
Locale-prefixed (`/vi`, `/en`, `/ja`); lowercase slug; stable, human-readable;
canonical + hreflang per page (SPEC-08).
