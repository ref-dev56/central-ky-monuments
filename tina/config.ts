import { defineConfig } from "tinacms";

/**
 * TinaCMS configuration.
 *
 * Content is stored as JSON files in this repo (under /content), so every
 * edit made in the CMS is a normal Git commit. Images uploaded through the
 * CMS are saved to /public/uploads.
 *
 * Collections:
 *   - Stones:        one file per memorial in the gallery
 *   - Categories:    the filter tabs and category pages
 *   - Granite colors: the swatches offered for every design
 *   - Home / Request / About / FAQ / Privacy: one file each in content/pages
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

/**
 * "Search & sharing" fields, added to every page that has its own address.
 * All optional: when blank, the site writes a sensible title and description.
 */
const seoField = {
  type: "object" as const,
  name: "seo",
  label: "Search & sharing",
  description: "Optional. How this page appears in Google and when a link is shared.",
  fields: [
    {
      type: "string" as const,
      name: "title",
      label: "Page title",
      description:
        "Shown as the link in Google results. Aim for under 60 characters. Leave blank to use the default.",
    },
    {
      type: "string" as const,
      name: "description",
      label: "Description",
      description:
        "The short summary under the link in Google. Aim for 120–155 characters. Leave blank to use the page intro.",
      ui: { component: "textarea" as const },
    },
    {
      type: "image" as const,
      name: "image",
      label: "Share image",
      description:
        "Shown when the link is shared by text or on social media. 1200 × 630 works best. Leave blank to use the site default.",
    },
  ],
};

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
          seoField,
        ],
      },
      {
        name: "color",
        label: "Granite colors",
        path: "content/colors",
        format: "json",
        ui: {
          filename: {
            readonly: true,
            slugify: (values) => slugify(values?.name),
          },
        },
        fields: [
          { type: "string", name: "name", label: "Color name", isTitle: true, required: true },
          {
            type: "string",
            name: "group",
            label: "Group",
            required: true,
            options: [
              { value: "stock", label: "Stock color" },
              { value: "special", label: "Special order" },
            ],
          },
          {
            type: "number",
            name: "order",
            label: "Order",
            description: "Position within its group (1 = first).",
          },
          {
            type: "image",
            name: "image",
            label: "Swatch photo",
            description: "A close-up of the polished granite. Shown at about 200 × 120.",
            required: true,
          },
        ],
      },
      {
        name: "home",
        label: "Home page",
        path: "content/pages",
        format: "json",
        match: { include: "home" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          {
            type: "string",
            name: "heroHeadline",
            label: "Headline",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "heroEyebrow",
            label: "Small line above the headline",
            description:
              "Leave blank to list the towns from Site settings → Service area automatically (Lexington · Georgetown · …).",
          },
          {
            type: "string",
            name: "heroIntro",
            label: "Intro text",
            ui: { component: "textarea" },
          },
          {
            type: "image",
            name: "heroImage",
            label: "Banner photo",
            description: "Wide, calm photo shown behind the headline. At least 2000px wide.",
          },
          {
            type: "string",
            name: "heroFocus",
            label: "Banner photo: part to keep on phones",
            description:
              "Phones show a narrow slice of the photo. Pick the side the main subject is on.",
            options: [
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ],
          },
          {
            type: "string",
            name: "primaryButton",
            label: "Main button label",
            description: "Scrolls down to the gallery. Default: Browse designs",
          },
          {
            type: "string",
            name: "secondaryButton",
            label: "Second button label",
            description: "Goes to the Request information page. Default: Talk with us",
          },
          seoField,
        ],
      },
      {
        name: "request",
        label: "Request information page",
        path: "content/pages",
        format: "json",
        match: { include: "request" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "title", label: "Headline", isTitle: true, required: true },
          { type: "string", name: "intro", label: "Intro text", ui: { component: "textarea" } },
          {
            type: "string",
            name: "submitLabel",
            label: "Send button label",
            description: "Default: Send request",
          },
          { type: "string", name: "nextStepsHeading", label: "Side box heading", description: "Default: What happens next" },
          {
            type: "string",
            name: "nextSteps",
            label: "What happens next",
            list: true,
            description: "Each step in the numbered list beside the form.",
          },
          { type: "string", name: "thankYouHeading", label: "Thank-you headline", description: "Default: Thank you" },
          {
            type: "string",
            name: "thankYou",
            label: "Thank-you message",
            description: "Shown after someone sends the form.",
            ui: { component: "textarea" },
          },
          seoField,
        ],
      },
      {
        name: "about",
        label: "About page",
        path: "content/pages",
        format: "json",
        match: { include: "about" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "title", label: "Headline", isTitle: true, required: true },
          {
            type: "string",
            name: "intro",
            label: "Intro",
            ui: { component: "textarea" },
          },
          {
            type: "image",
            name: "photo",
            label: "Photo (owner, team or showroom)",
            description: "Optional. Without a photo, the story spans the full width.",
          },
          { type: "string", name: "photoAlt", label: "Photo description (for screen readers)" },
          { type: "string", name: "storyHeading", label: "Story heading" },
          {
            type: "string",
            name: "story",
            label: "Story",
            description: "Leave a blank line between paragraphs.",
            ui: { component: "textarea" },
          },
          { type: "string", name: "stepsHeading", label: "Steps heading" },
          {
            type: "object",
            name: "steps",
            label: "How it works steps",
            list: true,
            ui: { itemProps: (item: { title?: string }) => ({ label: item?.title }) },
            fields: [
              { type: "string", name: "title", label: "Title" },
              { type: "string", name: "text", label: "Text", ui: { component: "textarea" } },
            ],
          },
          { type: "string", name: "serviceHeading", label: "Service area heading" },
          {
            type: "string",
            name: "serviceIntro",
            label: "Service area text",
            description: "The towns themselves come from Site settings → Service area.",
            ui: { component: "textarea" },
          },
          { type: "string", name: "ctaHeading", label: "Closing call-to-action heading" },
          { type: "string", name: "ctaText", label: "Closing call-to-action text" },
          seoField,
        ],
      },
      {
        name: "faq",
        label: "FAQ page",
        path: "content/pages",
        format: "json",
        match: { include: "faq" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "title", label: "Headline", isTitle: true, required: true },
          { type: "string", name: "intro", label: "Intro", ui: { component: "textarea" } },
          {
            type: "object",
            name: "topics",
            label: "Topics",
            list: true,
            ui: { itemProps: (item: { title?: string }) => ({ label: item?.title }) },
            fields: [
              { type: "string", name: "title", label: "Topic" },
              {
                type: "object",
                name: "questions",
                label: "Questions",
                list: true,
                ui: { itemProps: (item: { question?: string }) => ({ label: item?.question }) },
                fields: [
                  { type: "string", name: "question", label: "Question" },
                  {
                    type: "string",
                    name: "answer",
                    label: "Answer",
                    description:
                      "Two or three plain sentences that make sense on their own. Search engines and AI tools quote these.",
                    ui: { component: "textarea" },
                  },
                ],
              },
            ],
          },
          seoField,
        ],
      },
      {
        name: "privacy",
        label: "Privacy policy",
        path: "content/pages",
        format: "json",
        match: { include: "privacy" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "title", label: "Title", isTitle: true, required: true },
          { type: "datetime", name: "updated", label: "Last updated" },
          { type: "string", name: "intro", label: "Summary", ui: { component: "textarea" } },
          {
            type: "object",
            name: "sections",
            label: "Sections",
            list: true,
            ui: { itemProps: (item: { heading?: string }) => ({ label: item?.heading }) },
            fields: [
              { type: "string", name: "heading", label: "Heading" },
              { type: "rich-text", name: "body", label: "Text" },
            ],
          },
          seoField,
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
          {
            type: "string",
            name: "legalName",
            label: "Legal business name",
            description:
              "Shown in the copyright line and the privacy policy, e.g. Central KY Monuments, LLC. Leave blank to use the business name.",
          },
          { type: "image", name: "logo", label: "Logo" },
          {
            type: "image",
            name: "shareImage",
            label: "Default share image",
            description:
              "Used when a page has no share image of its own (link previews in texts and social media). 1200 × 630.",
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
            name: "colors",
            label: "Granite colors panel",
            fields: [
              {
                type: "string",
                name: "intro",
                label: "Intro text",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "specialOrderNote",
                label: "Special-order note",
                description:
                  "Optional line under the Special order heading, e.g. lead time or pricing. Leave blank to show none.",
              },
            ],
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
