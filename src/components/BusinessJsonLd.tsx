import type { Settings } from "@/lib/content";
import { present, telHref } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

/**
 * LocalBusiness structured data for search engines and AI tools.
 * Set up as a service-area business: it lists the towns served and the
 * mailing city, but no street address (the business uses a PO Box).
 */
export default function BusinessJsonLd({
  settings,
  description,
  image,
}: {
  settings: Settings;
  description?: string | null;
  image?: string | null;
}) {
  const abs = (src?: string | null) =>
    src ? new URL(src, SITE_URL).toString() : undefined;
  const phone = telHref(settings.phone)?.replace("tel:", "");
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#business`,
    name: settings.businessName,
    legalName: settings.legalName || undefined,
    description: description || undefined,
    url: `${SITE_URL}/`,
    logo: abs(settings.logo),
    image: abs(settings.shareImage || image),
    telephone: phone || undefined,
    email: settings.email || undefined,
    address: settings.address?.city
      ? {
          "@type": "PostalAddress",
          addressLocality: settings.address.city,
          addressRegion: settings.address.state || "KY",
          postalCode: settings.address.zip || undefined,
          addressCountry: "US",
        }
      : undefined,
    areaServed: present(settings.serviceArea).map((town) => ({
      "@type": "City",
      name: `${town}, KY`,
    })),
    sameAs: present(settings.social)
      .map((s) => s.url)
      .filter(Boolean),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
