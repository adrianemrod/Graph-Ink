# GraphInk Media — website

The official website for **GraphInk Media**, a Philippine print production brand.
It's built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 and Framer Motion.

## Run it

```bash
npm install
cp .env.example .env.local   # optional in development
npm run dev                  # http://localhost:3000
npm run lint
npm run build && npm start   # production
```

In development, quote and contact submissions are printed to the server console (the `log` adapter).

## Before launch: what the owner needs to supply

| What | Where |
| --- | --- |
| Official logo file | `public/brand/graphink-logo.jpeg` (see `public/brand/README.md`) |
| Phone, email, address, Messenger/Facebook, WhatsApp (only if real), hours | `src/config/site.ts` |
| Public site URL | `NEXT_PUBLIC_SITE_URL` |
| A delivery provider for quote/contact forms | `QUOTE_PROVIDER` + its keys (see `.env.example`) |
| Paper weights / real stock list (optional) | `src/content/materials.ts` |
| Remove any service or standard you don't offer yet | `src/content/services.ts` (`available: false`), `src/content/brand.ts` |
| Real portfolio photos (when available) | `public/portfolio/` + `src/content/portfolio.ts` (`kind: "client"`) |
| Legal review of the privacy and terms templates | `src/app/privacy`, `src/app/terms` |

Empty contact fields are hidden everywhere, including structured data. The `LocalBusiness`
schema is only output once a real address **and** phone are set.

## Structure

```
src/
  config/site.ts          business details, nav, SEO, analytics, upload limits
  content/                editable copy: services, materials, industries, portfolio, faq, process, brand, quote options
  app/                    routes (App Router), API routes, sitemap, robots, OG image
  components/
    brand/                Logo, print marks (crop/registration/CMYK strip), FacetGlyph
    home/                 homepage sections (Hero, PressVisual, PrintJourney, MaterialShowcase, PrintVisualizer, …)
    print/PrintArtwork    procedural SVG print compositions (used instead of stock photos)
    quote/                QuoteWizard, fields, FileUpload, QuoteSuccess
    layout/               Navbar, Footer, StickyCTA, PageLoader
    ui/                   Button, Magnetic, Reveal, SectionHeading, FAQAccordion, Icons, MotionProvider
  lib/
    quote/                shared validation, delivery adapters (resend, webhook, formspree, log), abuse guard
    analytics.ts          track() → GA4 / Meta Pixel when configured
    brand.ts              logo detection + intrinsic size
    seo.ts                metadata + JSON-LD helpers
```

## Routes

`/` · `/services` · `/services/{paper-printing, business-printing, marketing-collateral, custom-printing}` ·
`/portfolio` · `/about` · `/process` · `/faq` · `/contact` · `/quote` · `/privacy` · `/terms` ·
`/api/quote` · `/api/contact` · `/sitemap.xml` · `/robots.txt`

## Quote system

- The wizard has 8 steps. The draft is saved to `sessionStorage`, and `?product=<id>` preselects a product.
- The same validation runs on the client and the server (`src/lib/quote/schema.ts`).
- Duplicate submissions are blocked (the button disables and an idempotency key is sent). The server adds a honeypot and a per-IP rate limit.
- No prices are ever shown.
- **File uploads:** these are limited to 10 MB per file and 25 MB in total (set in `siteConfig.quote`). Serverless hosts cap request bodies (Vercel ≈ 4.5 MB), so for production either:
  - lower the limits, or
  - switch to direct-to-storage uploads (Supabase Storage, S3, Vercel Blob).

  The wizard also accepts a cloud link for large files.

## Analytics events

`quote_started`, `quote_step_completed`, `quote_submitted`, `contact_clicked`, `phone_clicked`,
`facebook_clicked`, `service_viewed`, `portfolio_viewed`. These fire only when `NEXT_PUBLIC_GA_ID` and/or
`NEXT_PUBLIC_META_PIXEL_ID` are set.

## Honesty rules baked in

The site contains no fabricated clients, testimonials, statistics, awards, turnaround promises or prices.
All portfolio items are labeled **Conceptual showcase** until real work is added.
