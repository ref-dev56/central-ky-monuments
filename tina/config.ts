import { defineConfig } from "tinacms";

/**
 * TinaCMS configuration.
 *
 * Content is stored as JSON files in this repo (under /content), so every
 * edit made in the CMS is a normal Git commit. Images uploaded through the
 * CMS are saved to /public/uploads.
 *
 * Three collections:
 *   - Stones:        one file per memorial in the gallery
 *   - Categories:    the filter tabs and category pages
 *   - Site settings: one file with logo, phone, address, hours, etc.
 */

// The Git branch Tina reads and writes. On hosts like Netlify/Vercel the
// branch name comes from the build environment; locally it defaults to main.
const branch =
  process.env.NEXT_PUBLIC_TINA_BRANCH ||
  process.env.HEAD || // Netlify
  process.env.VERCEL_GIT_COMMIT_REF || // Vercel
  process.env.CF_PAGES_BRANCH || // Cloudflare Pages
  "main";

/** Turns "Monuments & Crosses" into "monuments-crosses". */
const slugify = (value?: string) =>
  (value ?? "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default defineConfig({
  branch,

  // Filled in once the TinaCloud project is created (needed only for editing
  // on the live site; local editing works without them).
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  // The editor UI is built into /public/admin and served at /admin.
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  // Uploaded images are stored in the repo at /public/uploads.
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      {
        name: "stone",
        label: "Stones",
        path: "content/stones",
        format: "json",
        ui: {
          // Name each file after its SKU, e.g. content/stones/ckm-002.json
          filename: {
            readonly: true,
            slugify: (values) => slugify(values?.sku),
          },
        },
        fields: [
          {
            type: "string",
            name: "name",
            label: "Name",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "sku",
            label: "SKU",
            description:
              "Unique ID, e.g. CKM-002. Used in shareable links (?stone=CKM-002), so avoid changing it after launch.",
            required: true,
          },
          {
            type: "reference",
            name: "category",
            label: "Category",
            collections: ["category"],
            required: true,
            ui: {
              // Show "Upright headstones" in the dropdown instead of the file name.
              optionComponent: (values: Record<string, unknown>) =>
                typeof values?.name === "string" ? values.name : undefined,
            },
          },
          {
            type: "string",
            name: "description",
            label: "Description",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "materials",
            label: "Available materials",
            description: "Add each material with the + button, e.g. Gray granite",
            list: true,
          },
          {
            type: "string",
            name: "sizes",
            label: "Available sizes",
            description: 'Add each size with the + button, e.g. 24" × 30" × 6"',
            list: true,
          },
          {
            type: "image",
            name: "image",
            label: "Image",
            description:
              "One photo per stone. Upload at about 1600px on the short side.",
            required: true,
          },
          {
            type: "string",
            name: "imageAlt",
            label: "Image description (alt text)",
            description:
              "Short description for screen readers and search engines, e.g. Black granite upright headstone with a curved top.",
          },
        ],
      },
      {
        name: "category",
        label: "Categories",
        path: "content/categories",
        format: "json",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => slugify(values?.name),
          },
        },
        fields: [
          {
            type: "string",
            name: "name",
            label: "Name",
            description: "Shown on the category tab, e.g. Upright headstones",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "slug",
            label: "URL slug",
            description:
              "The category page address, e.g. upright-headstones becomes /upright-headstones/. Lowercase letters, numbers and hyphens only.",
            required: true,
          },
          {
            type: "number",
            name: "order",
            label: "Sort order",
            description: "Tabs are shown from lowest to highest.",
          },
          {
            type: "string",
            name: "intro",
            label: "Intro text",
            description:
              "Two or three sentences shown at the top of the category page (helps search engines).",
            ui: { component: "textarea" },
          },
        ],
      },
      {
        name: "settings",
        label: "Site settings",
        path: "content/settings",
        format: "json",
        // A single settings file: it can be edited but not duplicated or deleted.
        ui: {
          allowedActions: { create: false, delete: false },
        },
        fields: [
          {
            type: "string",
            name: "businessName",
            label: "Business name",
            isTitle: true,
            required: true,
          },
          { type: "image", name: "logo", label: "Logo" },
          {
            type: "object",
            name: "home",
            label: "Home page",
            fields: [
              {
                type: "image",
                name: "heroImage",
                label: "Hero photo",
                description:
                  "Wide, calm photo shown behind the headline. At least 2000px wide.",
              },
              {
                type: "string",
                name: "heroEyebrow",
                label: "Small line above the headline",
              },
              { type: "string", name: "heroHeadline", label: "Headline" },
              {
                type: "string",
                name: "heroIntro",
                label: "Intro text",
                ui: { component: "textarea" },
              },
            ],
          },
          {
            type: "object",
            name: "request",
            label: "Request information page",
            fields: [
              {
                type: "string",
                name: "intro",
                label: "Intro text",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "nextSteps",
                label: "What happens next",
                list: true,
                description: "Each step in the numbered list beside the form.",
              },
              {
                type: "string",
                name: "thankYou",
                label: "Thank-you message",
                description: "Shown after someone sends the form.",
                ui: { component: "textarea" },
              },
            ],
          },
          {
            type: "image",
            name: "logoMark",
            label: "Logo mark (small, for mobile header)",
          },
          { type: "string", name: "phone", label: "Phone number" },
          {
            type: "string",
            name: "email",
            label: "Public email address",
            description:
              "Shown on the site. Lead form submissions are routed separately in the Google Sheet.",
          },
          {
            type: "object",
            name: "address",
            label: "Mailing address",
            fields: [
              { type: "string", name: "line1", label: "Street or PO Box" },
              { type: "string", name: "city", label: "City" },
              { type: "string", name: "state", label: "State" },
              { type: "string", name: "zip", label: "ZIP" },
            ],
          },
          {
            type: "string",
            name: "hours",
            label: "Hours",
            description: "Add each line with the + button, e.g. Mon–Fri 9am–5pm",
            list: true,
          },
          {
            type: "string",
            name: "serviceArea",
            label: "Service area (towns and counties)",
            list: true,
          },
          {
            type: "object",
            name: "social",
            label: "Social links",
            list: true,
            ui: {
              itemProps: (item) => ({ label: item?.label || "New link" }),
            },
            fields: [
              { type: "string", name: "label", label: "Label (e.g. Facebook)" },
              { type: "string", name: "url", label: "URL" },
            ],
          },
        ],
      },
    ],
  },
});
