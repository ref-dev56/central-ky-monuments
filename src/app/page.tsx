import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import CategoryTabs from "@/components/CategoryTabs";
import ContactBand from "@/components/ContactBand";
import Gallery from "@/components/Gallery";
import {
  getCategories,
  getGalleryStones,
  getHome,
  getSettings,
  present,
} from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

/** Which part of the banner photo stays in view when the screen is narrow. */
const HERO_FOCUS: Record<string, string> = {
  left: "object-[25%_60%]",
  center: "object-[center_60%]",
  right: "object-[75%_60%]",
};

export async function generateMetadata(): Promise<Metadata> {
  const [settings, home] = await Promise.all([getSettings(), getHome()]);
  return pageMetadata({
    settings,
    path: "/",
    seo: home.seo,
    title: `${settings.businessName} | Granite Headstones & Memorials`,
    description: home.heroIntro,
  });
}

export default async function Home() {
  const [settings, home, categories, stones] = await Promise.all([
    getSettings(),
    getHome(),
    getCategories(),
    getGalleryStones(),
  ]);
  const towns = present(settings.serviceArea);
  // Typed text in the CMS wins; blank = list the towns from the service area.
  const customEyebrow = home.heroEyebrow?.trim();

  return (
    <main className="flex flex-1 flex-col">
      {/* Photo hero */}
      <section className="relative isolate overflow-hidden bg-ink">
        {home.heroImage && (
          <Image
            src={home.heroImage}
            alt=""
            fill
            preload
            sizes="100vw"
            className={`-z-10 object-cover ${HERO_FOCUS[home.heroFocus ?? "center"] ?? HERO_FOCUS.center}`}
          />
        )}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink/55" />
        <div className="mx-auto flex min-h-[420px] max-w-6xl flex-col justify-end gap-4 px-4 pb-12 pt-24 sm:min-h-[540px] sm:px-6 sm:pb-16">
          {customEyebrow ? (
            <p className="text-sm font-medium tracking-wide text-sage-tint">{customEyebrow}</p>
          ) : (
            towns.length > 0 && (
              <p className="text-sm font-medium tracking-wide text-sage-tint">
                {/* "Lexington · Georgetown · …"; screen readers hear "Serving Lexington, Georgetown, …" */}
                <span className="sr-only">Serving </span>
                {towns.map((town, i) => (
                  <Fragment key={town}>
                    {/* Each town stays with its dot; the line wraps between towns */}
                    <span className="whitespace-nowrap">
                      {town}
                      {i < towns.length - 1 && (
                        <>
                          <span className="sr-only">,</span>
                          <span aria-hidden="true" className="ml-2 mr-1 opacity-70">
                            ·
                          </span>
                        </>
                      )}
                    </span>{" "}
                  </Fragment>
                ))}
              </p>
            )
          )}
          <h1 className="max-w-3xl font-serif text-[44px] font-semibold leading-[1.02] text-white sm:text-[64px]">
            {home.heroHeadline || settings.businessName}
          </h1>
          {home.heroIntro && (
            <p className="max-w-xl text-lg leading-relaxed text-stone">
              {home.heroIntro}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-6">
            <a
              href="#designs"
              className="inline-flex min-h-[50px] items-center rounded-md bg-ivory px-6 font-medium text-ink hover:bg-white"
            >
              {home.primaryButton || "Browse designs"}
            </a>
            <Link
              href="/request-information/"
              className="font-medium text-white underline-offset-4 hover:underline"
            >
              {home.secondaryButton || "Talk with us"}
            </Link>
          </div>
        </div>
      </section>

      {/* Category tabs + collage */}
      <div
        id="designs"
        className="mx-auto w-full max-w-6xl scroll-mt-16 px-4 pb-16 pt-6 sm:px-6 sm:pt-8"
      >
        <CategoryTabs categories={categories} />
        <div className="pt-8">
          <Gallery
            stones={stones}
            businessName={settings.businessName}
            label="All designs"
          />
        </div>
      </div>

      <ContactBand />
    </main>
  );
}
