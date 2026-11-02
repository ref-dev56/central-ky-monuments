import type { MetadataRoute } from "next";
import { getCategories } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

// Built once into out/sitemap.xml.
export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await getCategories();
  const paths = [
    "/",
    ...categories.map((c) => `/${c.slug}/`),
    "/about/",
    "/faq/",
    "/request-information/",
    "/privacy/",
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
