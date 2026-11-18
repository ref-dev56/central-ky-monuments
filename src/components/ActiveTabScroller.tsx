"use client";

import { useEffect } from "react";

/**
 * When the category tabs don't fit (phones, small laptops) the row scrolls
 * sideways; this brings the current tab into view so it isn't cut off.
 */
export default function ActiveTabScroller({ listId }: { listId: string }) {
  useEffect(() => {
    const list = document.getElementById(listId);
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !active || list.scrollWidth <= list.clientWidth) return;
    const left = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
    list.scrollLeft = Math.max(0, left - list.offsetLeft);
  }, [listId]);
  return null;
}
