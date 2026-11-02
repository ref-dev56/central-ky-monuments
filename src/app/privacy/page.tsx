import type { Metadata } from "next";
import RichText from "@/components/RichText";
import { anchorId, getPrivacy, getSettings, present, telHref } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const [privacy, settings] = await Promise.all([getPrivacy(), getSettings()]);
  return {
    title: `Privacy policy | ${settings.businessName}`,
    description: privacy.intro ?? undefined,
  };
}

export default async function PrivacyPage() {
  const [privacy, settings] = await Promise.all([getPrivacy(), getSettings()]);
  const sections = present(privacy.sections)
    .filter((s) => s.heading)
    .map((s) => ({ ...s, id: anchorId(s.heading) }));
  const toc = [...sections.map((s) => ({ id: s.id, heading: s.heading })), { id: "contact", heading: "Contact us" }];
  const updated = privacy.updated
    ? new Date(privacy.updated).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "America/New_York",
      })
    : null;
  const address = settings.address;
  const cityLine = [address?.city, [address?.state, address?.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-20 pt-12 sm:px-6 md:flex-row md:items-start md:gap-14 md:pt-16">
      <nav
        aria-label="On this page"
        className="flex flex-col rounded-xl border border-border p-5 md:sticky md:top-24 md:w-64 md:shrink-0"
      >
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
          On this page
        </p>
        {toc.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="flex min-h-9 items-center text-[15px] text-link hover:text-ink">
            {t.heading}
          </a>
        ))}
      </nav>

      <article className="flex min-w-0 max-w-[760px] flex-1 flex-col gap-8">
        <header className="flex flex-col gap-2.5">
          <h1 className="font-serif text-[40px] font-semibold leading-tight sm:text-[52px]">
            {privacy.title}
          </h1>
          {updated && <p className="text-sm text-muted">Last updated {updated}</p>}
          {privacy.intro && (
            <p className="text-[17px] leading-relaxed text-body">{privacy.intro}</p>
          )}
        </header>

        {sections.map((s) => (
          <section key={s.id} id={s.id} className="flex scroll-mt-24 flex-col gap-2.5">
            <h2 className="font-serif text-[28px] font-semibold">{s.heading}</h2>
            <RichText content={s.body} />
          </section>
        ))}

        <section id="contact" className="flex scroll-mt-24 flex-col gap-2.5 rounded-xl bg-stone p-6">
          <h2 className="font-serif text-[28px] font-semibold">Contact us</h2>
          <p className="text-base leading-[1.7] text-body">
            {settings.businessName}
            {address?.line1 && (
              <>
                <br />
                {address.line1}
                {cityLine && `, ${cityLine}`}
              </>
            )}
            {settings.phone && (
              <>
                <br />
                <a href={telHref(settings.phone)} className="text-link underline hover:text-ink">
                  {settings.phone}
                </a>
              </>
            )}
            {settings.email && (
              <>
                {" · "}
                <a href={`mailto:${settings.email}`} className="text-link underline hover:text-ink">
                  {settings.email}
                </a>
              </>
            )}
          </p>
        </section>
      </article>
    </main>
  );
}
