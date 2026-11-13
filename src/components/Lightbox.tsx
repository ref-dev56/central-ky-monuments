"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { GalleryStone } from "@/lib/content";
import ColorGrid, { type ColorOptions } from "./ColorGrid";
import ShareButton from "./ShareButton";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "./icons";

type Props = {
  stone: GalleryStone;
  position: number; // 1-based
  total: number;
  shareUrl: string;
  businessName: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  /** Granite colors offered for every design, and the visitor's pick (by slug). */
  colorOptions: ColorOptions;
  selectedColor: string | null;
  onSelectColor: (slug: string | null) => void;
};

/**
 * One stone, shown in a native <dialog>. Using the built-in dialog gives us
 * focus trapping, Escape-to-close and a backdrop for free.
 *  - Desktop: photo on the left, details on the right, arrows at the sides.
 *  - Phones: full screen, photo on top, details below, and the
 *    "Ask about this design" button pinned to the bottom.
 *  - "View colors" opens the granite colors over the details (desktop) or
 *    as a sheet from the bottom (phones). The pick is carried to the form.
 */
export default function Lightbox({
  stone,
  position,
  total,
  shareUrl,
  businessName,
  onClose,
  onPrev,
  onNext,
  colorOptions,
  selectedColor,
  onSelectColor,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [colorsOpen, setColorsOpen] = useState(false);
  const colorTrigger = useRef<HTMLButtonElement>(null);
  const colorsHeading = useRef<HTMLHeadingElement>(null);
  const { colors } = colorOptions;
  const color = colors.find((c) => c.slug === selectedColor) ?? null;

  const openColors = () => setColorsOpen(true);
  const closeColors = () => {
    setColorsOpen(false);
    // Back to the link that opened the panel (after it re-renders).
    requestAnimationFrame(() => colorTrigger.current?.focus());
  };
  const pickColor = (slug: string | null) => {
    onSelectColor(slug);
    closeColors();
  };

  // Move focus into the panel when it opens.
  useEffect(() => {
    if (colorsOpen) colorsHeading.current?.focus();
  }, [colorsOpen]);

  // Open as a modal when mounted; lock page scrolling while open.
  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const askHref =
    `/request-information/?stone=${encodeURIComponent(stone.sku)}` +
    (color ? `&color=${encodeURIComponent(color.slug)}` : "");
  const askLabel = color
    ? `Ask about this design in ${color.name}`
    : "Ask about this design";
  const shareTitle = `${stone.name} – ${businessName}`;
  const shareText = `A memorial design from ${businessName}: ${stone.name}`;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="lightbox-title"
      onClose={onClose}
      // Escape closes the colors panel first, then the lightbox.
      onCancel={(e) => {
        if (colorsOpen) {
          e.preventDefault();
          closeColors();
        }
      }}
      onKeyDown={(e) => {
        if (colorsOpen) return;
        if (e.key === "ArrowLeft") onPrev();
        if (e.key === "ArrowRight") onNext();
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-ink/75"
    >
      <div
        className="flex h-full items-center justify-center gap-4 sm:p-6"
        // Clicking the dark area around the panel closes the lightbox.
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <button
          type="button"
          onClick={onPrev}
          aria-label="Previous design"
          className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-ivory text-ink hover:bg-white sm:flex"
        >
          <ChevronLeftIcon className="size-6" />
        </button>

        <div className="flex h-full w-full flex-col overflow-hidden bg-card sm:h-[min(620px,calc(100dvh-48px))] sm:max-w-5xl sm:flex-row sm:rounded-xl">
          {/* Phone top bar */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-1.5 sm:hidden">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex size-11 items-center justify-center rounded-full hover:bg-stone"
            >
              <CloseIcon className="size-5" />
            </button>
            <div className="flex items-center">
              <button
                type="button"
                onClick={onPrev}
                aria-label="Previous design"
                className="flex size-11 items-center justify-center rounded-full hover:bg-stone"
              >
                <ChevronLeftIcon className="size-5" />
              </button>
              <span className="min-w-16 text-center text-sm text-muted">
                {position} of {total}
              </span>
              <button
                type="button"
                onClick={onNext}
                aria-label="Next design"
                className="flex size-11 items-center justify-center rounded-full hover:bg-stone"
              >
                <ChevronRightIcon className="size-5" />
              </button>
            </div>
            <ShareButton
              url={shareUrl}
              title={shareTitle}
              text={shareText}
              variant="icon"
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-24 sm:flex sm:overflow-hidden sm:pb-0">
            {/* Photo, shown at its own shape in a fixed-size box, so the modal
                doesn't change size from stone to stone */}
            <div className="flex h-[44dvh] items-center justify-center bg-stone p-6 sm:h-auto sm:flex-[1_1_45%] xl:flex-[1_1_55%]">
              <Image
                key={stone.sku}
                src={stone.image}
                alt={stone.imageAlt}
                width={stone.width}
                height={stone.height}
                sizes={`${stone.width}px`}
                loading="eager"
                // Shown at its own size at most, never enlarged.
                style={{ maxWidth: stone.width }}
                className="h-auto max-h-[calc(44dvh-48px)] w-full object-contain sm:max-h-[min(572px,calc(100dvh-96px))]"
              />
            </div>

            {/* Details (the colors panel covers this column on desktop) */}
            <div className="sm:relative sm:flex sm:min-h-0 sm:flex-[1_1_55%] xl:flex-[1_1_45%]">
              <div className="flex flex-col gap-4 p-5 sm:min-w-0 sm:flex-1 sm:overflow-y-auto sm:p-9">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {stone.series || stone.categoryName}
                    </span>
                    <h2
                      id="lightbox-title"
                      className="font-serif text-[32px] font-semibold leading-tight sm:text-[38px]"
                    >
                      {stone.name}
                    </h2>
                    <span className="text-sm text-muted">{stone.sku}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="hidden size-11 shrink-0 items-center justify-center rounded-full border border-border hover:bg-stone sm:flex"
                  >
                    <CloseIcon />
                  </button>
                </div>

                {stone.description && (
                  <p className="text-[15px] leading-relaxed text-body sm:text-base">
                    {stone.description}
                  </p>
                )}

                <dl className="grid grid-cols-[112px_1fr] items-center gap-x-4 gap-y-2.5 border-y border-border py-3 text-[15px]">
                  {colors.length > 0 && (
                    <>
                      <dt className="text-muted">Granite color</dt>
                      <dd>
                        {color ? (
                          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                            <Image
                              src={color.image}
                              alt=""
                              width={200}
                              height={120}
                              sizes="64px"
                              className="size-8 rounded-full object-cover ring-1 ring-ink/10"
                            />
                            <span className="font-medium text-ink">
                              {color.name}
                            </span>
                            {color.group === "special" && (
                              <span className="text-[13px] text-muted">
                                Special order
                              </span>
                            )}
                            <button
                              ref={colorTrigger}
                              type="button"
                              onClick={openColors}
                              aria-expanded={colorsOpen}
                              aria-label={`Change granite color (currently ${color.name})`}
                              className="min-h-11 text-sm text-link underline hover:text-ink"
                            >
                              Change
                            </button>
                          </span>
                        ) : (
                          <button
                            ref={colorTrigger}
                            type="button"
                            onClick={openColors}
                            aria-expanded={colorsOpen}
                            className="inline-flex min-h-11 items-center gap-2.5 text-link hover:text-ink"
                          >
                            <span aria-hidden="true" className="flex">
                              {colors
                                .filter((c) => c.group === "stock")
                                .filter((_, i) => i % 2 === 0)
                                .slice(0, 5)
                                .map((c, i) => (
                                  <Image
                                    key={c.slug}
                                    src={c.image}
                                    alt=""
                                    width={200}
                                    height={120}
                                    sizes="48px"
                                    className={`size-6 rounded-full border-2 border-card object-cover ${i ? "-ml-2" : ""}`}
                                  />
                                ))}
                            </span>
                            <span className="underline">
                              View {colors.length} colors
                            </span>
                          </button>
                        )}
                      </dd>
                    </>
                  )}
                  {stone.sizes.length > 0 && (
                    <>
                      <dt className="text-muted">
                        Size
                      </dt>
                      <dd>
                        {stone.sizes.map((size) => (
                          <span key={size} className="block">
                            {size}
                          </span>
                        ))}
                      </dd>
                    </>
                  )}
                </dl>

                {/* Desktop actions */}
                <div className="mt-auto hidden flex-col gap-3 sm:flex">
                  <Link
                    href={askHref}
                    className="flex min-h-[52px] items-center justify-center rounded-md bg-brand px-4 text-center text-base font-medium text-white hover:bg-ink"
                  >
                    {askLabel}
                  </Link>
                  <ShareButton
                    url={shareUrl}
                    title={shareTitle}
                    text={shareText}
                  />
                </div>
              </div>

              {colorsOpen && (
                <>
                  {/* Phones: dim the lightbox behind the sheet; tapping it closes the sheet */}
                  <div
                    aria-hidden="true"
                    onClick={closeColors}
                    className="fixed inset-0 z-20 bg-ink/55 sm:hidden"
                  />
                  <section
                    aria-labelledby="colors-title"
                    className="fixed inset-x-0 bottom-0 z-30 flex h-[82dvh] flex-col rounded-t-2xl bg-card shadow-2xl sm:absolute sm:inset-0 sm:h-auto sm:rounded-none sm:shadow-none"
                  >
                    {/* Desktop header */}
                    <div className="hidden items-center border-b border-border px-4 py-3 sm:flex">
                      <button
                        type="button"
                        onClick={closeColors}
                        className="flex min-h-11 items-center gap-1.5 rounded-md px-2.5 text-[15px] hover:bg-stone"
                      >
                        <ChevronLeftIcon className="size-5" />
                        Back to details
                      </button>
                    </div>
                    {/* Phone header */}
                    <div className="flex flex-col items-center pt-2 sm:hidden">
                      <span
                        aria-hidden="true"
                        className="h-1 w-10 rounded-full bg-border"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3 px-5 pt-2 sm:px-7 sm:pt-5">
                      <h3
                        id="colors-title"
                        ref={colorsHeading}
                        tabIndex={-1}
                        className="font-serif text-[26px] font-semibold outline-none sm:text-[30px]"
                      >
                        Granite colors
                      </h3>
                      <button
                        type="button"
                        onClick={closeColors}
                        aria-label="Close colors"
                        className="flex size-11 items-center justify-center rounded-full hover:bg-stone sm:hidden"
                      >
                        <CloseIcon className="size-5" />
                      </button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-3 sm:px-7">
                      <ColorGrid
                        {...colorOptions}
                        selected={selectedColor}
                        onSelect={pickColor}
                      />
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>

          {/* Phone: pinned call to action */}
          <div className="absolute inset-x-0 bottom-0 border-t border-border bg-card px-4 pb-6 pt-3 sm:hidden">
            <Link
              href={askHref}
              className="flex min-h-[52px] items-center justify-center rounded-md bg-brand px-4 text-center text-base font-medium text-white"
            >
              {askLabel}
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={onNext}
          aria-label="Next design"
          className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-ivory text-ink hover:bg-white sm:flex"
        >
          <ChevronRightIcon className="size-6" />
        </button>
      </div>
    </dialog>
  );
}
