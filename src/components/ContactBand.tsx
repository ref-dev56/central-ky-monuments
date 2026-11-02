import Link from "next/link";

/** Soft call-to-action panel shown below the gallery. */
export default function ContactBand() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="flex flex-wrap items-center justify-between gap-6 rounded-xl bg-sage-tint px-6 py-8 sm:px-11 sm:py-10">
        <div className="flex max-w-2xl flex-col gap-2">
          <h2 className="font-serif text-[30px] font-semibold leading-tight sm:text-[34px]">
            Don&rsquo;t see quite what you&rsquo;re looking for?
          </h2>
          <p className="leading-relaxed text-body">
            Every design can be adapted in size, color and lettering. Tell us
            what you have in mind and we&rsquo;ll help you find the right
            memorial.
          </p>
        </div>
        <Link
          href="/request-information/"
          className="inline-flex min-h-[50px] items-center rounded-md bg-brand px-6 font-medium text-white hover:bg-ink"
        >
          Talk with us
        </Link>
      </div>
    </section>
  );
}
