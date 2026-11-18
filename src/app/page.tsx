import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import CategoryTabs from "@/components/CategoryTabs";
import ContactBand from "@/components/ContactBand";
import Gallery from "@/components/Gallery";
import ServiceAreas from "@/components/ServiceAreas";
import {
  getCategories,
  getColors,
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
  const [settings, home, categories, stones, colors] = await Promise.all([
    getSettings(),
    getHome(),
    getCategories(),
    getGalleryStones(),
    getColors(),
  ]);
  // MOCKUP ONLY: MOCK_AREAS picks the banner option, MOCK_EXTRA_TOWNS adds sample towns.
  const MOCK = process.env.MOCK_AREAS ?? "2";
  const towns = [
    ...present(settings.serviceArea),
    ...(process.env.MOCK_EXTRA_TOWNS
      ? ["Versailles", "Nicholasville", "Danville", "Winchester", "Paris", "Mount Sterling", "Midway", "Springfield", "Stanford", "Carlisle"]
      : []),
  ];
  const ANCHORS = 3;
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
          {MOCK === "1" ? (
            <p className="text-sm font-medium tracking-wide text-sage-tint">
              {customEyebrow || "Serving Central Kentucky"}
            </p>
          ) : (
            towns.length > 0 && (
              <p className="text-sm font-medium tracking-wide text-sage-tint">
                <span className="sr-only">Serving </span>
                {towns.slice(0, ANCHORS).map((town) => (
                  <Fragment key={town}>
                    <span className="whitespace-nowrap">
                      {town}
                      <span className="sr-only">,</span>
                      <span aria-hidden="true" className="ml-2 mr-1 opacity-70">
                        ·
                      </span>
                    </span>{" "}
                  </Fragment>
                ))}
                {towns.length > ANCHORS && (
                  <a
                    href="#areas"
                    className="whitespace-nowrap underline decoration-sage-tint/60 underline-offset-4 hover:text-white"
                  >
                    and {towns.length - ANCHORS} more communities
                  </a>
                )}
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

      <ServiceAreas towns={towns} phone={settings.phone} />

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
            colorOptions={{
              colors,
              intro: settings.colors?.intro,
              specialNote: settings.colors?.specialOrderNote,
            }}
          />
        </div>
      </div>

      <ContactBand />
    </main>
  );
}
