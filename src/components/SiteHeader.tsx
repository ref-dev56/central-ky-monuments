"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PhoneIcon } from "./icons";

type Props = {
  businessName: string;
  logo?: string | null;
  logoMark?: string | null;
  phone?: string | null;
  phoneHref?: string;
};

/**
 * Sticky header. It shrinks slightly once the visitor scrolls, giving the
 * gallery more room. On phones it shows the small logo mark, a tap-to-call
 * icon and a shortened "Request info" button.
 */
export default function SiteHeader({
  businessName,
  logo,
  logoMark,
  phone,
  phoneHref,
}: Props) {
  const [scrolled, setScrolled] = useState(false);
  const onRequestPage = usePathname().startsWith("/request-information");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-ivory">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-[height] duration-200 sm:px-6 ${
          scrolled ? "h-16" : "h-16 sm:h-20"
        }`}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2">
          {/* Desktop: full logo */}
          {logo ? (
            <Image
              src={logo}
              alt={businessName}
              width={494}
              height={112}
              loading="eager"
              className={`hidden w-auto transition-[height] duration-200 sm:block ${
                scrolled ? "h-9" : "h-12"
              }`}
            />
          ) : (
            <span className="hidden font-serif text-2xl font-semibold sm:block">
              {businessName}
            </span>
          )}

          {/* Phone: logo mark + business name set in type */}
          {logoMark && (
            <Image
              src={logoMark}
              alt=""
              width={141}
              height={112}
              loading="eager"
              className="h-8 w-auto shrink-0 sm:hidden"
            />
          )}
          <span className="flex flex-col whitespace-nowrap font-serif text-[13px] font-semibold uppercase leading-[1.15] max-[379px]:hidden sm:hidden">
            {businessName.split(" ").length > 2 ? (
              <>
                <span>{businessName.split(" ").slice(0, -1).join(" ")}</span>
                <span>{businessName.split(" ").slice(-1)}</span>
              </>
            ) : (
              businessName
            )}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-6">
          {phone && phoneHref && (
            <a
              href={phoneHref}
              aria-label={`Call ${phone}`}
              className="flex size-11 items-center justify-center rounded-full border border-input-border text-brand sm:size-auto sm:gap-2 sm:rounded-none sm:border-0 sm:text-[15px] sm:font-medium sm:text-ink"
            >
              <PhoneIcon className="size-[18px] text-brand" />
              <span className="hidden sm:inline">{phone}</span>
            </a>
          )}
          <Link
            href="/request-information/"
            aria-current={onRequestPage ? "page" : undefined}
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-md bg-brand px-3.5 text-sm font-medium text-white hover:bg-ink sm:px-5 sm:text-[15px]"
          >
            <span className="sm:hidden">Request info</span>
            <span className="hidden sm:inline">Request information</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
