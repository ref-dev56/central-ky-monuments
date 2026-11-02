import type { Metadata } from "next";
import ContactBand from "@/components/ContactBand";
import PageIntro from "@/components/PageIntro";
import { anchorId, getFaq, getSettings, present } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const [faq, settings] = await Promise.all([getFaq(), getSettings()]);
  return {
    title: `Frequently asked questions | ${settings.businessName}`,
    description: faq.intro ?? undefined,
  };
}

export default async function FaqPage() {
  const [faq, settings] = await Promise.all([getFaq(), getSettings()]);
  const topics = present(faq.topics)
    .map((t) => ({
      title: t.title ?? "",
      id: anchorId(t.title),
      questions: present(t.questions).filter((q) => q.question && q.answer),
    }))
    .filter((t) => t.title && t.questions.length > 0);

  // FAQPage structured data, so search engines and AI tools can read the answers.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: topics.flatMap((t) =>
      t.questions.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    ),
  };

  return (
    <main className="flex flex-1 flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <PageIntro title={faq.title} intro={faq.intro} />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 pt-8 sm:px-6 md:flex-row md:items-start md:gap-14 md:pt-12">
        {/* Topics: a scrolling row on phones, a sticky list beside the questions on larger screens */}
        <nav
          aria-label="FAQ topics"
          className="-mx-4 overflow-x-auto px-4 md:sticky md:top-24 md:mx-0 md:w-60 md:shrink-0 md:overflow-visible md:px-0"
        >
          <p className="mb-2 hidden text-xs font-semibold uppercase tracking-wider text-muted md:block">
            Topics
          </p>
          <ul className="flex gap-2 md:flex-col md:gap-0">
            {topics.map((t) => (
              <li key={t.id} className="shrink-0">
                <a
                  href={`#${t.id}`}
                  className="flex min-h-11 items-center whitespace-nowrap rounded-full border border-border bg-card px-4 text-[15px] text-body hover:text-ink md:whitespace-normal md:rounded-none md:border-0 md:bg-transparent md:px-0"
                >
                  {t.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-10">
          {topics.map((t, ti) => (
            <section key={t.id} id={t.id} aria-labelledby={`${t.id}-h`} className="scroll-mt-24">
              <h2 id={`${t.id}-h`} className="mb-2 font-serif text-[30px] font-semibold">
                {t.title}
              </h2>
              {t.questions.map((q, qi) => (
                <details
                  key={q.question}
                  open={ti === 0 && qi === 0}
                  className="group border-b border-border"
                >
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[17px] font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                    {q.question}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-2xl leading-none text-brand transition-transform group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mb-5 max-w-[680px] text-base leading-relaxed text-body">
                    {q.answer}
                  </p>
                </details>
              ))}
            </section>
          ))}

          <ContactBand
            inline
            heading="Still have questions?"
            text={
              settings.phone
                ? `Call ${settings.phone} or send us a note and we’ll get back to you.`
                : "Send us a note and we’ll get back to you."
            }
            linkLabel="Request information"
          />
        </div>
      </div>
    </main>
  );
}
