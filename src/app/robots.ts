import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Built once into out/robots.txt.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The CMS editor and the form's thank-you page aren't useful in search.
      disallow: ["/admin/", "/request-information/thank-you/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
