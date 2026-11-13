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
/** Column width on a full-width desktop (px); measured in the browser after load. */
const DEFAULT_COLUMN_WIDTH = 357;
const TILE_PADDING = 32; // p-4 on each tile
const GAP = 16; // gap-4 between tiles and columns

/** Height a stone's tile takes up in a column of the given width. */
function tileHeight(stone: GalleryStone, columnWidth: number) {
  // Images are never shown wider than their own pixels, so a small image
  // makes a shorter tile than its shape alone suggests.
  const shown = Math.min(stone.width, columnWidth - TILE_PADDING);
  return (shown * stone.height) / stone.width + TILE_PADDING + GAP;
}

/**
 * Splits stones into columns, always adding the next photo to the shortest
 * column. That gives the Pinterest-style stagger. A final pass then moves
 * the last tile of the tallest column to the shortest one whenever that
 * makes the column bottoms more even.
 */
function toColumns(stones: GalleryStone[], columnWidth: number) {
  const columns = Array.from({ length: COLUMNS }, () => ({
    height: 0,
    items: [] as { stone: GalleryStone; index: number; h: number }[],
  }));
  const shortest = () => columns.reduce((a, b) => (b.height < a.height ? b : a));
  const tallest = () => columns.reduce((a, b) => (b.height > a.height ? b : a));
  stones.forEach((stone, index) => {
    const col = shortest();
    const h = tileHeight(stone, columnWidth);
    col.items.push({ stone, index, h });
    col.height += h;
  });
  for (let i = 0; i < stones.length; i++) {
    const tall = tallest();
    const short = shortest();
    const last = tall.items.at(-1);
    // Moving it only helps if the tile is shorter than the difference.
    if (!last || last.h >= tall.height - short.height) break;
    tall.items.pop();
    tall.height -= last.h;
    short.items.push(last);
    short.height += last.h;
  }
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
  // Balance the columns for the width they really have on this screen.
  const grid = useRef<HTMLDivElement>(null);
  const [columnWidth, setColumnWidth] = useState(DEFAULT_COLUMN_WIDTH);
  useEffect(() => {
    const el = grid.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = (entry.contentRect.width - GAP * (COLUMNS - 1)) / COLUMNS;
      // Round to 4px so small resizes don't reshuffle the tiles.
      if (width > 0) setColumnWidth(Math.round(width / 4) * 4);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      <div ref={grid} className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {toColumns(stones, columnWidth).map((column, c) => (
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
                className="group flex items-center justify-center overflow-hidden rounded-md bg-stone p-4 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-brand"
              >
                <Image
                  src={stone.image}
                  alt=""
                  width={stone.width}
                  height={stone.height}
                  sizes={`${stone.width}px`}
                  loading={index < COLUMNS ? "eager" : "lazy"}
                  // Never wider than the image itself, so nothing is enlarged.
                  style={{ maxWidth: stone.width }}
                  className="block h-auto w-full transition-opacity duration-300 group-hover:opacity-85"
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
