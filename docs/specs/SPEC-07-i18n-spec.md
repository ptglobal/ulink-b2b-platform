# SPEC-07 — Internationalization (i18n) Specification

**Status:** Baseline · **Owner:** Dev A · **Implements:** `frontend/src/i18n/*`, `frontend/messages/*`, Directus Translations

## Locales
- `vi` (default), `en`, `ja`. Locale is the first URL segment; `localePrefix: 'always'`.

## Architecture
- **UI strings:** next-intl message catalogs `messages/{vi,en,ja}.json`, namespaced
  (`home`, `nav`, `footer`, …). No hard-coded user-facing text.
- **Content:** Directus **Translations** on text-bearing fields of every content
  collection; bootstrap provisions `languages` plus hidden `<collection>_translations`
  collections for the content model and frontend requests the active locale's
  translation.
- **Routing/SEO:** middleware handles locale; each page emits `hreflang` for all
  locales + `x-default`, and a canonical URL.
- **Static rendering:** `setRequestLocale(locale)` + `generateStaticParams` so each
  locale prerenders.

## Formatting
Dates, numbers, currency via next-intl/`Intl` per locale. Currency display: VND.

## Content-at-launch policy (delivery plan §9)
| Locale | Coverage at go-live |
|---|---|
| **VI** | 100% |
| **EN** | 100% of primary/structural pages |
| **JP** | Homepage, hubs, key product pages + structure; remainder via CMS afterward |

## Fallback
Missing a content translation → fall back to VI (default) and flag for editors. The
Directus locale order is bootstrapped as `vi`, `en`, `ja`, so `vi` stays the default
and fallback locale. Missing a UI key → build/CI should catch; never render the raw
key in production.

## Adding a locale / key
1. Add the locale to `routing.ts` + a `messages/<locale>.json`.
2. Enable the Directus translation for that language in Directus bootstrap.
3. Provide content; verify hreflang + switcher.

## QA
Language switch preserves the current page; no untranslated keys; hreflang validates;
JP/VN diacritics render correctly across browsers (incl. Safari).
