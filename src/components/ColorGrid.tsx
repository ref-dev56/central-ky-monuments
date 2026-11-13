"use client";

import Image from "next/image";
import type { GraniteColor } from "@/lib/content";
import { CheckIcon } from "./icons";

/** The colors list plus the editable copy shown with it. */
export type ColorOptions = {
  colors: GraniteColor[];
  intro?: string | null;
  specialNote?: string | null;
};

type Props = ColorOptions & {
  selected: string | null;
  onSelect: (slug: string | null) => void;
};

/**
 * Granite swatches in two groups (Stock colors, Special order). Each swatch
 * is a real button, so it works with a keyboard and screen readers.
 */
export default function ColorGrid({
  colors,
  intro,
  specialNote,
  selected,
  onSelect,
}: Props) {
  const groups = [
    {
      title: "Stock colors",
      note: null,
      items: colors.filter((c) => c.group === "stock"),
    },
    {
      title: "Special order",
      note: specialNote,
      items: colors.filter((c) => c.group === "special"),
    },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-5">
      {(intro || selected) && (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          {intro && (
            <p className="max-w-prose text-sm leading-relaxed text-body">
              {intro}
            </p>
          )}
          {selected && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="min-h-11 text-sm text-link underline hover:text-ink"
            >
              Clear my choice
            </button>
          )}
        </div>
      )}

      {groups.map((group) => (
        <section
          key={group.title}
          aria-label={group.title}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-0.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
              {group.title}
            </h4>
            {group.note && (
              <p className="text-[13px] text-muted">{group.note}</p>
            )}
          </div>
          <ul className="grid grid-cols-3 gap-x-2.5 gap-y-3.5 sm:grid-cols-4">
            {group.items.map((color) => {
              const isSelected = color.slug === selected;
              return (
                <li key={color.slug}>
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onSelect(color.slug)}
                    className="group flex w-full flex-col gap-1.5 text-left focus-visible:outline-none"
                  >
                    <span
                      className={`relative block aspect-[5/3] w-full overflow-hidden rounded-md ring-offset-2 ring-offset-card group-hover:opacity-90 group-focus-visible:ring-3 group-focus-visible:ring-brand ${
                        isSelected ? "ring-2 ring-brand" : "ring-1 ring-ink/10"
                      }`}
                    >
                      <Image
                        src={color.image}
                        alt=""
                        width={200}
                        height={120}
                        sizes="(min-width: 640px) 100px, 33vw"
                        className="size-full object-cover"
                      />
                      {isSelected && (
                        <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-brand text-white">
                          <CheckIcon className="size-3.5" />
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-[13px] leading-snug text-ink ${isSelected ? "font-semibold" : ""}`}
                    >
                      {color.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
