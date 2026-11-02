"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { GalleryStone } from "@/lib/content";
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
};

/**
 * One stone, shown in a native <dialog>. Using the built-in dialog gives us
 * focus trapping, Escape-to-close and a backdrop for free.
 *  - Desktop: photo on the left, details on the right, arrows at the sides.
 *  - Phones: full screen, photo on top, details below, and the
 *    "Ask about this design" button pinned to the bottom.
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
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

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

  const askHref = `/request-information/?stone=${encodeURIComponent(stone.sku)}`;
  const shareTitle = `${stone.name} – ${businessName}`;
  const shareText = `A memorial design from ${businessName}: ${stone.name}`;

  return (
    <dialog
      ref={dialog}
      aria-labelledby="lightbox-title"
      onClose={onClose}
      onKeyDown={(e) => {
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

        <div className="flex h-full w-full flex-col overflow-hidden bg-card sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:max-w-5xl sm:flex-row sm:rounded-xl">
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
            <ShareButton url={shareUrl} title={shareTitle} text={shareText} variant="icon" />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-24 sm:flex sm:overflow-hidden sm:pb-0">
            {/* Photo, shown at its own shape */}
            <div className="flex items-center justify-center bg-stone sm:min-h-[460px] sm:flex-[1_1_55%]">
              <Image
                key={stone.sku}
                src={stone.image}
                alt={stone.imageAlt}
                width={stone.width}
                height={stone.height}
                loading="eager"
                className="max-h-[48vh] w-auto object-contain sm:max-h-[min(720px,calc(100dvh-48px))]"
              />
            </div>

            {/* Details */}
            <div className="flex flex-col gap-4 p-5 sm:flex-[1_1_45%] sm:overflow-y-auto sm:p-9">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {stone.categoryName}
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

              <dl className="grid grid-cols-[112px_1fr] gap-x-4 gap-y-2.5 border-y border-border py-4 text-[15px]">
                {stone.materials.length > 0 && (
                  <>
                    <dt className="text-muted">Available in</dt>
                    <dd>{stone.materials.join(", ")}</dd>
                  </>
                )}
                {stone.sizes.length > 0 && (
                  <>
                    <dt className="text-muted">{stone.sizes.length > 1 ? "Sizes" : "Size"}</dt>
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
                  className="flex min-h-[52px] items-center justify-center rounded-md bg-brand text-base font-medium text-white hover:bg-ink"
                >
                  Ask about this design
                </Link>
                <ShareButton url={shareUrl} title={shareTitle} text={shareText} />
              </div>
            </div>
          </div>

          {/* Phone: pinned call to action */}
          <div className="absolute inset-x-0 bottom-0 border-t border-border bg-card px-4 pb-6 pt-3 sm:hidden">
            <Link
              href={askHref}
              className="flex min-h-[52px] items-center justify-center rounded-md bg-brand text-base font-medium text-white"
            >
              Ask about this design
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
