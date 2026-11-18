import { getSettings, present } from "@/lib/content";
import { AreasPanel } from "./AreasExpand";

/**
 * "Areas we serve" band near the bottom of the homepage and category pages:
 * every town from Site settings → Service area, A–Z, in columns, so the list
 * can keep growing. The homepage banner links here (#areas).
 */
export default async function ServiceAreas({
  collapsible = false,
}: {
  /** Homepage: folded away under the banner until the banner link opens it. */
  collapsible?: boolean;
}) {
  const settings = await getSettings();
  const towns = present(settings.serviceArea).sort((a, b) =>
    a.localeCompare(b),
  );
  if (towns.length === 0) return null;
  const band = settings.serviceAreaBand;

  const content = (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:gap-12">
      <div className="flex flex-col gap-2 lg:w-72 lg:shrink-0">
        <h2
          id="areas-title"
          className="font-serif text-[30px] font-semibold leading-tight sm:text-[34px]"
        >
          {band?.heading || "Areas we serve"}
        </h2>
        {band?.intro && (
          <p className="leading-relaxed text-body">{band.intro}</p>
        )}
      </div>
      <ul className="grid flex-1 grid-cols-2 content-start gap-x-6 gap-y-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {towns.map((town) => (
          <li key={town} className="flex items-center gap-2.5 text-ink">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 rounded-full bg-sage"
            />
            {town}
          </li>
        ))}
      </ul>
    </div>
  );
  if (collapsible) return <AreasPanel>{content}</AreasPanel>;

  return (
    <section
      id="areas"
      aria-labelledby="areas-title"
      className="scroll-mt-16 border-t border-border bg-stone"
    >
      {content}
    </section>
  );
}
