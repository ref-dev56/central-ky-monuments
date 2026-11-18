/**
 * "Areas we serve" band: every town from Site settings → Service area, in
 * columns, so the list can grow without crowding the homepage banner.
 */
export default function ServiceAreas({
  towns,
  phone,
}: {
  towns: string[];
  phone?: string | null;
}) {
  if (towns.length === 0) return null;
  return (
    <section
      id="areas"
      aria-labelledby="areas-title"
      className="scroll-mt-16 border-b border-border bg-stone"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12 lg:flex-row lg:gap-12">
        <div className="flex flex-col gap-2 lg:w-72 lg:shrink-0">
          <h2
            id="areas-title"
            className="font-serif text-[30px] font-semibold leading-tight sm:text-[34px]"
          >
            Areas we serve
          </h2>
          <p className="leading-relaxed text-body">
            We work with families across Central Kentucky, including these
            communities and the surrounding counties.
          </p>
          {phone && (
            <p className="text-sm text-muted">
              Don’t see your town?{" "}
              <a
                href={`tel:+1${phone.replace(/\D/g, "")}`}
                className="whitespace-nowrap text-link underline hover:text-ink"
              >
                Call {phone}
              </a>
            </p>
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
    </section>
  );
}
