import type { Metadata } from "next";
import Image from "next/image";
import ContactBand from "@/components/ContactBand";
import PageIntro from "@/components/PageIntro";
import { getAbout, getSettings, present, readImageSize } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  return {
    title: `About us | ${settings.businessName}`,
    description: about.intro ?? undefined,
  };
}

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  const paragraphs = (about.story ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const steps = present(about.steps);
  const towns = present(settings.serviceArea);
  const photo = about.photo ? { src: about.photo, ...readImageSize(about.photo) } : null;

  return (
    <main className="flex flex-1 flex-col">
      <PageIntro eyebrow="About us" title={about.title} intro={about.intro} />

      {/* Story */}
      {paragraphs.length > 0 && (
        <section className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-12 px-4 py-14 sm:px-6 sm:py-16">
          {photo && (
            <Image
              src={photo.src}
              alt={about.photoAlt ?? ""}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1024px) 560px, 100vw"
              className="h-auto w-full flex-[1_1_420px] rounded-xl object-cover sm:max-h-[440px]"
            />
          )}
          <div className={`flex flex-[1_1_420px] flex-col gap-4 ${photo ? "" : "max-w-3xl"}`}>
            {about.storyHeading && (
              <h2 className="font-serif text-[34px] font-semibold leading-tight">
                {about.storyHeading}
              </h2>
            )}
            {paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="text-[17px] leading-relaxed text-body">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      {steps.length > 0 && (
        <section className="border-y border-border bg-stone">
          <div className="mx-auto flex max-w-6xl flex-col gap-7 px-4 py-14 sm:px-6">
            {about.stepsHeading && (
              <h2 className="font-serif text-[34px] font-semibold leading-tight">
                {about.stepsHeading}
              </h2>
            )}
            <ol className="grid gap-5 md:grid-cols-3">
              {steps.map((step, i) => (
                <li key={step.title ?? i} className="flex flex-col gap-2.5 rounded-xl bg-card p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Step {i + 1}
                  </span>
                  <h3 className="font-serif text-2xl font-semibold">{step.title}</h3>
                  {step.text && (
                    <p className="text-[15px] leading-relaxed text-body">{step.text}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Where we serve */}
      {towns.length > 0 && (
        <section className="mx-auto flex w-full max-w-6xl flex-wrap items-start gap-12 px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-[1_1_420px] flex-col gap-4">
            <h2 className="font-serif text-[34px] font-semibold leading-tight">
              {about.serviceHeading || "Where we serve"}
            </h2>
            {about.serviceIntro && (
              <p className="max-w-xl text-[17px] leading-relaxed text-body">{about.serviceIntro}</p>
            )}
          </div>
          <ul className="grid flex-[1_1_420px] grid-cols-2 gap-x-6 gap-y-3 rounded-xl bg-sage-tint p-7 text-[17px]">
            {towns.map((town) => (
              <li key={town} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-sage" />
                {town}
              </li>
            ))}
          </ul>
        </section>
      )}

      <ContactBand
        heading={about.ctaHeading || "We’re here when you’re ready"}
        text={about.ctaText}
        linkLabel="Request information"
      />
    </main>
  );
}
