import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import client from "../../tina/__generated__/client";

/**
 * Data helpers. Every page reads content through these functions at build
 * time, so components never talk to the Tina client directly.
 */

/** The single Site settings document (content/settings/site.json). */
export async function getSettings() {
  const { data } = await client.queries.settings({ relativePath: "site.json" });
  return data.settings;
}

export type Settings = Awaited<ReturnType<typeof getSettings>>;

/** All categories, sorted by their "Sort order" field. */
export async function getCategories() {
  const { data } = await client.queries.categoryConnection();
  return (data.categoryConnection.edges ?? [])
    .map((edge) => edge?.node)
    .filter((category) => category != null)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

/** All stones (first 500), in file order. */
export async function getStones() {
  const { data } = await client.queries.stoneConnection({ first: 500 });
  return (data.stoneConnection.edges ?? [])
    .map((edge) => edge?.node)
    .filter((stone) => stone != null);
}

/** What the gallery and lightbox need for one stone (plain, serializable). */
export type GalleryStone = {
  sku: string;
  name: string;
  description: string;
  materials: string[];
  sizes: string[];
  image: string;
  imageAlt: string;
  width: number;
  height: number;
  categoryName: string;
  categorySlug: string;
};

/** Reads an uploaded image's pixel size from /public at build time. */
export function readImageSize(src: string) {
  try {
    const file = path.join(process.cwd(), "public", decodeURI(src));
    const { width, height, orientation } = imageSize(fs.readFileSync(file));
    // Phone photos are often stored sideways with a "rotate me" flag;
    // swap the sides so the gallery reserves the shape people will see.
    if (width && height) {
      return orientation && orientation >= 5 ? { width: height, height: width } : { width, height };
    }
  } catch {
    // Missing or unreadable file: fall back to a 4:5 portrait shape.
  }
  return { width: 800, height: 1000 };
}

/**
 * Stones shaped for the gallery, optionally limited to one category.
 *
 * On "All designs" the categories are interleaved (one upright, one marker,
 * one bench, ...) so the collage mixes tall and wide shapes from the first
 * row instead of starting with a block of same-size uprights. Within a
 * category, stones are ordered by SKU so the layout is stable between builds.
 */
export async function getGalleryStones(categorySlug?: string) {
  const [stones, categories] = await Promise.all([
    getStones(),
    getCategories(),
  ]);

  const shaped = stones
    .filter((s) => !categorySlug || s.category.slug === categorySlug)
    .map((s): GalleryStone => ({
      sku: s.sku,
      name: s.name,
      description: s.description ?? "",
      materials: (s.materials ?? []).filter((m): m is string => !!m),
      sizes: (s.sizes ?? []).filter((m): m is string => !!m),
      image: s.image,
      imageAlt: s.imageAlt || s.name,
      ...readImageSize(s.image),
      categoryName: s.category.name,
      categorySlug: s.category.slug,
    }))
    .sort((a, b) => a.sku.localeCompare(b.sku));

  // Round-robin across categories, in their CMS sort order.
  const buckets = categories
    .map((c) => shaped.filter((s) => s.categorySlug === c.slug))
    .filter((bucket) => bucket.length > 0);
  const mixed: GalleryStone[] = [];
  for (let i = 0; mixed.length < shaped.length; i++) {
    for (const bucket of buckets) if (bucket[i]) mixed.push(bucket[i]);
    if (i > shaped.length) break; // safety net
  }
  // Stones whose category isn't in the list still appear, at the end.
  for (const s of shaped) if (!mixed.includes(s)) mixed.push(s);
  return mixed;
}

/** "(859) 873-3322" -> "tel:+18598733322" */
export function telHref(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return undefined;
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

/** The Home page banner (content/pages/home.json). */
export async function getHome() {
  const { data } = await client.queries.home({ relativePath: "home.json" });
  return data.home;
}

/** The Request information page and its thank-you page (content/pages/request.json). */
export async function getRequestPage() {
  const { data } = await client.queries.request({
    relativePath: "request.json",
  });
  return data.request;
}

/** The About page (content/pages/about.json). */
export async function getAbout() {
  const { data } = await client.queries.about({ relativePath: "about.json" });
  return data.about;
}

/** The FAQ page (content/pages/faq.json). */
export async function getFaq() {
  const { data } = await client.queries.faq({ relativePath: "faq.json" });
  return data.faq;
}

/** The privacy policy (content/pages/privacy.json). */
export async function getPrivacy() {
  const { data } = await client.queries.privacy({
    relativePath: "privacy.json",
  });
  return data.privacy;
}

/** Drops the empty entries Tina lists can contain. */
export function present<T>(items?: (T | null | undefined)[] | null): T[] {
  return (items ?? []).filter((item): item is T => item != null && item !== "");
}

/** Turns a heading into an anchor id: "Ordering and timing" → "ordering-and-timing". */
export function anchorId(text?: string | null) {
  return (text ?? "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
