import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build the whole site as static HTML/CSS/JS in the `out` folder,
  // so it can be hosted on any static host (Netlify, Cloudflare Pages, etc.).
  output: "export",

  // `/about` is written as `/about/index.html`, which every static host serves
  // without extra redirect rules.
  trailingSlash: true,

  images: {
    // The default image optimizer needs a running server, which a static
    // export doesn't have. Images are resized at build time instead.
    unoptimized: true,
  },

  // Note: the template's `cacheComponents` / `partialPrefetching` options were
  // removed because Partial Prerendering can't run in a static export.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
