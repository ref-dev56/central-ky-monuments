# Central Kentucky Monuments

Brochure and gallery website for Central Kentucky Monuments: a filterable collage of memorial stones, a lightbox for each stone, and a request-information form that sends leads to a salesperson.

## Stack

- **Next.js 16** (App Router) built as a **static export** (`output: "export"`), so the site is plain HTML/CSS/JS in `out/` and can be hosted on any static host.
- **TypeScript**
- **Tailwind CSS v4**, with brand colors and fonts defined in `src/app/globals.css` (`@theme`).
- **Fonts:** Inter and Cormorant Garamond, self-hosted from npm (`@fontsource`), with no requests to Google at runtime.
- **CMS:** TinaCMS, with content stored as JSON files in this repo (see below).
- **Lead form (planned):** Google Apps Script on a Google Sheet (adds a row and emails the salesperson).

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev     # site at http://localhost:3000, CMS editor at http://localhost:3000/admin/index.html
npm run build   # static export to ./out
npm run lint
```

## Content (TinaCMS)

The schema lives in `tina/config.ts`. Content is plain JSON in `content/`, and images uploaded in the editor go to `public/uploads/`.

| Collection | Folder | What it holds |
| --- | --- | --- |
| Stones | `content/stones/` | One file per memorial: name, SKU, category, description, materials, sizes, image, alt text |
| Categories | `content/categories/` | Tab name, URL slug, sort order, intro text |
| Site settings | `content/settings/site.json` | Business name, logos, phone, public email, mailing address, hours, service area, social links |

How it fits together:

- `npm run dev` starts Tina's local content API (port 4001) and Next.js together. Saving in the editor writes straight to the JSON files, which you then commit like any other change.
- Pages read content at build time through Tina's generated, typed client (`tina/__generated__/client`), e.g. `client.queries.stoneConnection()`.
- `tina/__generated__/` and `public/admin/` are regenerated on every dev/build and are not committed.
- The build currently runs Tina in **local mode** (`--local`). Editing on the live site needs a TinaCloud project; once that exists, set `NEXT_PUBLIC_TINA_CLIENT_ID` and `TINA_TOKEN` on the host and drop `--local --skip-cloud-checks` from the build script.
- Tina starts Next with `NODE_ENV=development`, so the build script forces `NODE_ENV=production` (via `cross-env`) for a correct production build.
- The lead form's destination email is deliberately **not** in the CMS; it lives in the Google Sheet's settings so it can't be changed from the browser.

## Notes

- Next.js image optimization is disabled (`images.unoptimized`) because a static export has no server; images are resized at build time instead.
- Cache Components / Partial Prerendering are off because they can't run in a static export.
- `trailingSlash: true` writes each page as `folder/index.html`, which works on every static host without redirect rules.
