import Image from "next/image";
import Link from "next/link";
import { readImageSize, telHref, type Settings } from "@/lib/content";

const footerLinks = [
  { href: "/about/", label: "About us" },
  { href: "/faq/", label: "Frequently asked questions" },
  { href: "/request-information/", label: "Request information" },
  { href: "/privacy/", label: "Privacy policy" },
];

export default function SiteFooter({ settings }: { settings: Settings }) {
  const { businessName, legalName, logo, phone, email, address, hours, serviceArea, social } =
    settings;
  const socialLinks = (social ?? []).flatMap((s) =>
    s?.label && s?.url ? [{ label: s.label, url: s.url }] : [],
  );
  // "Versailles, KY 40383"; nothing at all when there's no city.
  const cityLine = address?.city
    ? [address.city, [address.state, address.zip].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ")
    : "";
  const towns = (serviceArea ?? []).filter(Boolean);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-stone">
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-10 px-4 pb-8 pt-12 sm:px-6">
        <div className="flex max-w-xs flex-[1_1_260px] flex-col gap-3.5">
          {logo ? (
            <Image
              src={logo}
              alt={businessName}
              {...readImageSize(logo)}
              className="h-10 w-auto self-start"
            />
          ) : (
            <span className="font-serif text-2xl font-semibold">{businessName}</span>
          )}
          <p className="text-[15px] leading-relaxed text-body">
            Helping families honor and remember their loved ones with granite
            memorials made to last generations.
          </p>
          {towns.length > 0 && (
            <p className="text-sm leading-relaxed text-muted">
              Serving {towns.join(", ")} and surrounding counties.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-[15px] leading-relaxed">
          <h2 className="font-semibold">Contact</h2>
          {phone && (
            <a href={telHref(phone)} className="text-link hover:text-ink">
              {phone}
            </a>
          )}
          {email && (
            <a href={`mailto:${email}`} className="text-link hover:text-ink">
              {email}
            </a>
          )}
          {(address?.line1 || cityLine) && (
            <address className="not-italic text-body">
              {address?.line1 && <span className="block">{address.line1}</span>}
              {cityLine && <span className="block">{cityLine}</span>}
            </address>
          )}
          {(hours ?? []).filter(Boolean).map((line) => (
            <span key={line} className="text-muted">
              {line}
            </span>
          ))}
          {socialLinks.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {socialLinks.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link hover:text-ink"
                  >
                    {link.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-1.5 text-[15px] leading-relaxed">
          <h2 className="font-semibold">More</h2>
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-link hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-6xl border-t border-border px-4 py-5 text-[13px] text-muted sm:px-6">
        © {year} {legalName || businessName}
      </div>
    </footer>
  );
}
