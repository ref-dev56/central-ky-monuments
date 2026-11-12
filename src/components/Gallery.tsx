"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryStone } from "@/lib/content";
import type { ColorOptions } from "./ColorGrid";
import Lightbox from "./Lightbox";

type Props = {
  stones: GalleryStone[];
  businessName: string;
  /** Screen-reader heading for the gallery, e.g. "All designs". */
  label: string;
  /** Granite colors offered for every design. */
  colorOptions: ColorOptions;
};

const COLUMNS = 3;

/**
 * Splits stones into columns, always adding the next photo to the shortest
 * column (by photo height relative to width). This is what gives the
 * Pinterest-style stagger while keeping the column bottoms even.
 */
function toColumns(stones: GalleryStone[]) {
  const columns = Array.from({ length: COLUMNS }, () => ({
    height: 0,
    items: [] as { stone: GalleryStone; index: number }[],
  }));
  stones.forEach((stone, index) => {
    const shortest = columns.reduce((a, b) => (b.height < a.height ? b : a));
    shortest.items.push({ stone, index });
    shortest.height += stone.height / stone.width + 0.05; // + gap
  });
  return columns;
}

/** Updates ?stone= in the address bar without reloading or adding history. */
function setStoneParam(sku: string | null) {
  const url = new URL(window.location.href);
  if (sku) url.searchParams.set("stone", sku);
  else url.searchParams.delete("stone");
  window.history.replaceState(window.history.state, "", url);
}

/**
 * Masonry collage + lightbox.
 * - Desktop/tablet: 3 staggered columns. Phones: the columns stack into a
 *   single column (pure CSS, no layout shift while the page loads).
 * - Opening a stone sets ?stone=SKU so the address bar is always a
 *   shareable link; visiting such a link opens that stone on load.
 */
export default function Gallery({
  stones,
  businessName,
  label,
  colorOptions,
}: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  // The color a visitor picks stays chosen as they browse other designs.
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState("");
  const lastTile = useRef<HTMLButtonElement | null>(null);

  const open = useCallback(
    (index: number) => {
      setOpenIndex(index);
      setStoneParam(stones[index].sku);
      setShareUrl(window.location.href);
    },
    [stones],
  );

  // On first load, open the stone named in ?stone= (case-insensitive).
  useEffect(() => {
    const sku = new URLSearchParams(window.location.search).get("stone");
    if (!sku) return;
    const index = stones.findIndex(
      (s) => s.sku.toLowerCase() === sku.toLowerCase(),
    );
    // Opening from a link is a deliberate, one-time sync with the URL.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (index >= 0) open(index);
  }, [stones, open]);

  const close = () => {
    setOpenIndex(null);
    setStoneParam(null);
    lastTile.current?.focus();
  };
  const step = (delta: number) => {
    if (openIndex === null) return;
    open((openIndex + delta + stones.length) % stones.length);
  };

  return (
    <section aria-label={label}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {toColumns(stones).map((column, c) => (
          <div key={c} className="flex min-w-0 flex-1 flex-col gap-4">
            {column.items.map(({ stone, index }) => (
              <button
                key={stone.sku}
                type="button"
                aria-label={`View ${stone.name}`}
                onClick={(e) => {
                  lastTile.current = e.currentTarget;
                  open(index);
                }}
                className="group block overflow-hidden rounded-md bg-stone focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
              >
                <Image
                  src={stone.image}
                  alt=""
                  width={stone.width}
                  height={stone.height}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  loading={index < COLUMNS ? "eager" : "lazy"}
                  className="block h-auto w-full transition duration-300 group-hover:scale-[1.015] group-hover:opacity-90"
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      {openIndex !== null && (
        <Lightbox
          stone={stones[openIndex]}
          position={openIndex + 1}
          total={stones.length}
          shareUrl={shareUrl}
          businessName={businessName}
          onClose={close}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
          colorOptions={colorOptions}
          selectedColor={selectedColor}
          onSelectColor={setSelectedColor}
        />
      )}
    </section>
  );
}
