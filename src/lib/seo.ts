import type { Metadata } from "next";
import type { Settings } from "./content";

/** The live address. Override with NEXT_PUBLIC_SITE_URL (e.g. for a staging site). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://centralkymonuments.com").replace(
  /\/$/,
  "",
);

/** The "Search & sharing" fields from the CMS (all optional). */
export type SeoFields = {
  title?: string | null;
  description?: string | null;
  image?: string | null;
} | null;

type Options = {
  settings: Settings;
  /** The page's address, e.g. "/about/". */
  path: string;
  /** "Search & sharing" fields from the CMS, if the page has them. */
  seo?: SeoFields;
  /** Used when the CMS title is blank. */
  title: string;
  /** Used when the CMS description is blank (usually the page intro). */
  description?: string | null;
  noindex?: boolean;
};

/** Trims long intros to a search-friendly length at a word boundary. */
function clip(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, clean.lastIndexOf(" ", max - 1)).replace(/[,;:.]$/, "") + "…";
}

/**
 * Title, description, canonical address and link-preview (Open Graph) data
 * for a page. CMS values win; otherwise the page's own defaults are used.
 */
export function pageMetadata({ settings, path, seo, title, description, noindex }: Options): Metadata {
  const finalTitle = seo?.title?.trim() || title;
  const rawDescription = seo?.description?.trim() || description?.trim();
  const finalDescription = rawDescription ? clip(rawDescription) : undefined;
  const image = seo?.image || settings.shareImage || undefined;

  return {
    title: { absolute: finalTitle },
    description: finalDescription,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "website",
      locale: "en_US",
      url: path,
      siteName: settings.businessName,
      title: finalTitle,
      description: finalDescription,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: finalTitle,
      description: finalDescription,
      images: image ? [image] : undefined,
    },
  };
}
