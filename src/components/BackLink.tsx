"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * "Back to all designs". When the visitor came from a stone (?stone=SKU),
 * the link reopens that stone in the gallery.
 */
export default function BackLink() {
  const [href, setHref] = useState("/");
  useEffect(() => {
    const sku = new URLSearchParams(window.location.search).get("stone");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sku) setHref(`/?stone=${encodeURIComponent(sku)}`);
  }, []);
  return (
    <Link href={href} className="text-sm text-link hover:text-ink">
      &larr; Back to all designs
    </Link>
  );
}
