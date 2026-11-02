"use client";

import { useEffect, useRef, useState } from "react";
import { LinkIcon, MailIcon, ShareIcon } from "./icons";

type Props = {
  url: string;
  title: string;
  /** Text for the email body / share sheet. */
  text: string;
  /** "button" = full-width outlined button (desktop lightbox),
   *  "icon" = round icon button (mobile lightbox top bar). */
  variant?: "button" | "icon";
};

/**
 * Phones and tablets: opens the device's own share sheet (Messages, email,
 * WhatsApp...). Desktop: a small menu with "Copy link" and "Email", which
 * behaves the same in every browser. No third-party scripts.
 */
export default function ShareButton({ url, title, text, variant = "button" }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  // Close the menu when clicking elsewhere.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function onShare() {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (touch && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // The visitor closed the share sheet; nothing to do.
      }
      return;
    }
    setCopied(false);
    setOpen((v) => !v);
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard blocked: fall back to selecting nothing; the Email
      // option still works.
    }
  }

  const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
    `${text}\n\n${url}`,
  )}`;

  return (
    <div ref={wrapper} className="relative flex">
      {variant === "icon" ? (
        <button
          type="button"
          onClick={onShare}
          aria-label="Share this design"
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex size-11 items-center justify-center rounded-full text-ink hover:bg-stone"
        >
          <ShareIcon className="size-5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={onShare}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md border border-input-border bg-card text-[15px] text-ink hover:bg-stone"
        >
          <ShareIcon />
          Share
        </button>
      )}

      {open && (
        <div
          role="menu"
          aria-label="Share options"
          onKeyDown={(e) => e.key === "Escape" && (e.stopPropagation(), setOpen(false))}
          className={`absolute z-10 flex w-60 flex-col rounded-lg border border-border bg-white p-1.5 shadow-lg ${
            variant === "icon" ? "right-0 top-full mt-2" : "bottom-full left-0 right-0 mb-2 w-auto"
          }`}
        >
          <button
            type="button"
            role="menuitem"
            onClick={onCopy}
            className="flex min-h-11 items-center gap-2.5 rounded-md px-3 text-left text-[15px] text-ink hover:bg-stone"
          >
            <LinkIcon />
            Copy link
            {copied && (
              <span role="status" className="ml-auto text-[13px] font-medium text-brand">
                Link copied
              </span>
            )}
          </button>
          <a
            role="menuitem"
            href={mailto}
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center gap-2.5 rounded-md px-3 text-[15px] text-ink hover:bg-stone"
          >
            <MailIcon />
            Email
          </a>
        </div>
      )}
    </div>
  );
}
