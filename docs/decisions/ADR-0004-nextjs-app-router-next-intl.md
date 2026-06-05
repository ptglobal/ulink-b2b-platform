# ADR-0004 — Next.js App Router + next-intl

**Status:** Accepted · **Date:** 2026-06-03

## Context
Requirements demand strong SEO (PageSpeed ≥90, Core Web Vitals, correct URL/metadata),
tri-lingual VI/EN/JP with hreflang, and fast content pages. The spec names Next.js 14+.

## Decision
Use **Next.js 14 App Router** with **SSG/ISR** for content pages and **next-intl**
for localization. Locale is a URL segment (`/[locale]/…`, default `vi`); middleware
handles locale routing; `setRequestLocale` enables static rendering per locale.

## Consequences
- Content pages prerender per locale → fast, indexable, low JS.
- hreflang + canonical + per-page metadata driven from the CMS.
- Client interactivity (cart, filters, portal) isolated to client components.
- On-demand revalidation on Directus publish keeps static pages fresh.

## Alternatives considered
- **Pages Router** — older model; App Router is the current standard with better
  streaming/RSC.
- **Custom i18n** — more code, no hreflang/formatting helpers; next-intl is purpose-built.
