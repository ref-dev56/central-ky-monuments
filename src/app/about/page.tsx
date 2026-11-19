import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import PageIntro from "@/components/PageIntro";
import { getAbout, getSettings, present, readImageSize } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  return pageMetadata({
    settings,
    path: "/about/",
    seo: about.seo,
    title: `About us | ${settings.businessName}`,
    description: about.intro,
  });
}

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  const paragraphs = (about.story ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const steps = present(about.steps);
  const towns = present(settings.serviceArea).sort((a, b) => a.localeCompare(b));
  const photo = about.photo ? { src: about.photo, ...readImageSize(about.photo) } : null;
  const ctaParagraphs = (about.ctaText ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const phoneHref = settings.phone ? `tel:+1${settings.phone.replace(/\D/g, "")}` : null;

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
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16">
          <div className="flex flex-col gap-4">
            <h2 className="font-serif text-[34px] font-semibold leading-tight">
              {about.serviceHeading || "Where we serve"}
            </h2>
            {about.serviceIntro && (
              <p className="max-w-3xl text-[17px] leading-relaxed text-body">{about.serviceIntro}</p>
            )}
          </div>
          {/* A–Z down each column, then across: 2 columns on phones, 3 on tablets, 4 on desktop */}
          <ul className="columns-2 gap-x-6 rounded-xl bg-sage-tint p-7 text-[17px] sm:columns-3 lg:columns-4">
            {towns.map((town) => (
              <li key={town} className="flex break-inside-avoid items-center gap-2.5 py-1.5">
                <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-sage" />
                {town}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Closing: meet the Director of Sales, then the call to action */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="grid overflow-hidden rounded-xl bg-sage-tint md:grid-cols-2">
          <div className="flex flex-col justify-center gap-5 px-6 py-10 sm:px-11 sm:py-12">
            {about.ctaEyebrow && (
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                {about.ctaEyebrow}
              </p>
            )}
            <h2 className="font-serif text-[30px] font-semibold leading-tight sm:text-[34px]">
              {about.ctaHeading || "We’re here when you’re ready"}
            </h2>
            {ctaParagraphs.map((p) => (
              <p key={p} className="leading-relaxed text-body">
                {p}
              </p>
            ))}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
              <Link
                href="/request-information/"
                className="inline-flex min-h-[50px] items-center rounded-md bg-brand px-6 font-medium text-white hover:bg-ink"
              >
                {about.ctaButton || "Request information"}
              </Link>
              {phoneHref && (
                <a href={phoneHref} className="text-link underline hover:text-ink">
                  or call {settings.phone}
                </a>
              )}
            </div>
          </div>
          {about.ctaPhoto && (
            <div className="relative min-h-[380px] md:min-h-full">
              <Image
                src={about.ctaPhoto}
                alt={about.ctaPhotoAlt ?? ""}
                fill
                sizes="(min-width: 768px) 560px, 100vw"
                className="object-cover object-[50%_30%]"
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
