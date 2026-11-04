import type { MetadataRoute } from "next";
import { PRELAUNCH_NOINDEX, SITE_URL } from "@/lib/seo";

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
    // Before launch, crawlers may still visit (so they can see each page's
    // "noindex"), but aren't pointed at the sitemap.
    sitemap: PRELAUNCH_NOINDEX ? undefined : `${SITE_URL}/sitemap.xml`,
  };
}
