"use client";

import { useEffect, useRef } from "react";
import ColorGrid, { type ColorOptions } from "./ColorGrid";
import { CloseIcon } from "./icons";

type Props = ColorOptions & {
  selected: string | null;
  onSelect: (slug: string | null) => void;
  onClose: () => void;
};

/**
 * The granite color swatches in a pop-up, for the Request information form.
 * A native <dialog> gives focus trapping and Escape-to-close.
 */
export default function ColorPickerDialog({
  selected,
  onSelect,
  onClose,
  ...options
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialog.current;
    if (el && !el.open) el.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="picker-title"
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-2xl bg-card p-0 backdrop:bg-ink/60 sm:m-auto sm:max-h-[min(760px,90dvh)] sm:max-w-[600px] sm:rounded-xl"
    >
      <div className="flex max-h-[inherit] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border py-2 pl-6 pr-3">
          <h2
            id="picker-title"
            className="font-serif text-[28px] font-semibold"
          >
            Granite colors
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close colors"
            className="flex size-11 items-center justify-center rounded-full hover:bg-stone"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 pt-5">
          <ColorGrid
            {...options}
            selected={selected}
            onSelect={(slug) => {
              onSelect(slug);
              onClose();
            }}
          />
        </div>
      </div>
    </dialog>
  );
}
