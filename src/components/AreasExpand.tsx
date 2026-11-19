"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ChevronDownIcon } from "./icons";

/**
 * The homepage banner's "the surrounding communities" link opens the full
 * town list in a panel directly under the banner; a button in the panel
 * folds it back up. The list is always in the page (for search engines),
 * just collapsed until asked for.
 */
type Ctx = { open: boolean; setOpen: (open: boolean) => void };
const AreasContext = createContext<Ctx>({ open: false, setOpen: () => {} });

export function AreasProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <AreasContext.Provider value={{ open, setOpen }}>
      {children}
    </AreasContext.Provider>
  );
}

export function AreasToggleLink({ children }: { children: ReactNode }) {
  const { open, setOpen } = useContext(AreasContext);
  return (
    <button
      type="button"
      id="areas-toggle"
      aria-expanded={open}
      aria-controls="areas"
      onClick={() => setOpen(!open)}
      className="inline-flex items-baseline gap-1 text-left underline decoration-sage-tint/60 underline-offset-4 hover:text-white"
    >
      {children}
      <ChevronDownIcon
        className={`size-3.5 self-center transition-transform duration-300 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

export function AreasPanel({ children }: { children: ReactNode }) {
  const { open, setOpen } = useContext(AreasContext);
  const panel = useRef<HTMLElement>(null);
  const opened = useRef(false);

  // When it opens, bring the list into view if it starts below the fold.
  useEffect(() => {
    if (open) {
      opened.current = true;
      const el = panel.current;
      const timer = setTimeout(() => {
        if (el && el.getBoundingClientRect().top > window.innerHeight * 0.6) {
          el.scrollIntoView({ block: "start" });
        }
        el?.querySelector<HTMLElement>("[data-collapse]")?.focus({
          preventScroll: true,
        });
      }, 320);
      return () => clearTimeout(timer);
    }
    if (opened.current) document.getElementById("areas-toggle")?.focus();
  }, [open]);

  return (
    <section
      ref={panel}
      id="areas"
      aria-labelledby="areas-title"
      inert={!open}
      className={`grid scroll-mt-16 transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
    >
      <div className="overflow-hidden">
        <div className="border-b border-border bg-stone">
          {children}
          <div className="mx-auto -mt-2 flex max-w-6xl px-4 pb-10 sm:px-6 lg:-mt-4 lg:justify-end">
            <button
              type="button"
              data-collapse
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-input-border bg-card px-4 text-sm font-medium text-ink hover:bg-ivory"
            >
              Hide the list
              <ChevronDownIcon className="size-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
