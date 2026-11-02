# Central Kentucky Monuments

Brochure and gallery website for Central Kentucky Monuments: a filterable collage of memorial stones, a lightbox for each stone, and a request-information form that sends leads to a salesperson.

## Stack

- **Next.js 16** (App Router) built as a **static export** (`output: "export"`), so the site is plain HTML/CSS/JS in `out/` and can be hosted on any static host.
- **TypeScript**
- **Tailwind CSS v4**, with brand colors and fonts defined in `src/app/globals.css` (`@theme`).
- **Fonts:** Inter and Cormorant Garamond, self-hosted from npm (`@fontsource`), with no requests to Google at runtime.
- **CMS (planned):** TinaCMS, with content stored as files in this repo.
- **Lead form (planned):** Google Apps Script on a Google Sheet (adds a row and emails the salesperson).

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev     # local dev server at http://localhost:3000
npm run build   # static export to ./out
npm run lint
```

## Notes

- Next.js image optimization is disabled (`images.unoptimized`) because a static export has no server; images are resized at build time instead.
- Cache Components / Partial Prerendering are off because they can't run in a static export.
- `trailingSlash: true` writes each page as `folder/index.html`, which works on every static host without redirect rules.
