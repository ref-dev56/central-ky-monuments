import Link from "next/link";

type Props = {
  categories: { name: string; slug: string }[];
  /** Slug of the current category; omit on the home page ("All designs"). */
  active?: string;
  align?: "start" | "center";
};

/**
 * Underlined text tabs. Each tab is a real link to a category page, so
 * search engines can find them; the active tab is marked with
 * aria-current for screen readers. On phones the row scrolls sideways.
 */
export default function CategoryTabs({ categories, active, align = "start" }: Props) {
  const tabs = [{ name: "All designs", slug: "", href: "/" }].concat(
    categories.map((c) => ({ ...c, href: `/${c.slug}/` })),
  );

  return (
    <nav aria-label="Memorial categories" className="border-b border-border">
      <ul
        className={`-mb-px flex gap-7 overflow-x-auto px-1 [scrollbar-width:none] ${
          align === "center" ? "sm:justify-center" : ""
        }`}
      >
        {tabs.map((tab) => {
          const isActive = (active ?? "") === tab.slug;
          return (
            <li key={tab.href} className="shrink-0">
              <Link
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex min-h-12 items-center whitespace-nowrap border-b-2 text-[15px] ${
                  isActive
                    ? "border-brand font-semibold text-ink"
                    : "border-transparent text-muted hover:border-border hover:text-ink"
                }`}
              >
                {tab.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
