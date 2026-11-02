import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import BackLink from "@/components/BackLink";
import RequestForm from "@/components/RequestForm";
import {
  getGalleryStones,
  getRequestPage,
  getSettings,
  telHref,
} from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, copy] = await Promise.all([getSettings(), getRequestPage()]);
  return pageMetadata({
    settings,
    path: "/request-information/",
    seo: copy.seo,
    title: `${copy.title || "Request information"} | ${settings.businessName}`,
    description:
      copy.intro ||
      "Ask about a memorial design or tell us what you have in mind. No cost and no obligation.",
  });
}

export default async function RequestPage() {
  const [settings, copy, stones] = await Promise.all([
    getSettings(),
    getRequestPage(),
    getGalleryStones(),
  ]);
  const phoneHref = telHref(settings.phone);
  const steps = (copy.nextSteps ?? []).filter((s): s is string => !!s);
  const hours = (settings.hours ?? []).filter((h): h is string => !!h);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-wrap items-start gap-14 px-4 pb-20 pt-10 sm:px-6 sm:pt-12">
      <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-8">
        <div className="flex flex-col gap-3">
          <BackLink />
          <h1 className="font-serif text-[40px] font-semibold leading-[1.05] sm:text-[52px]">
            {copy.title || "Request information"}
          </h1>
          {copy.intro && (
            <p className="max-w-[620px] text-[17px] leading-relaxed text-body">
              {copy.intro}
            </p>
          )}
        </div>
        <RequestForm
          stones={stones.map(({ sku, name, image }) => ({ sku, name, image }))}
          phone={settings.phone}
          phoneHref={phoneHref}
          submitLabel={copy.submitLabel}
        />
      </div>

      <aside className="flex flex-[1_1_320px] flex-col gap-5">
        {settings.phone && (
          <div className="flex flex-col gap-3 rounded-[10px] bg-stone p-7">
            <h2 className="font-serif text-[28px] font-semibold">
              Prefer to talk?
            </h2>
            <a
              href={phoneHref}
              className="text-xl font-semibold text-ink hover:underline"
            >
              {settings.phone}
            </a>
            {hours.length > 0 && (
              <p className="text-[15px] leading-relaxed text-body">
                {hours.map((h) => (
                  <span key={h} className="block">
                    {h}
                  </span>
                ))}
              </p>
            )}
          </div>
        )}
        {steps.length > 0 && (
          <div className="flex flex-col gap-4 rounded-[10px] border border-border p-7">
            <h2 className="font-serif text-[28px] font-semibold">
              {copy.nextStepsHeading || "What happens next"}
            </h2>
            <ol className="flex list-decimal flex-col gap-3 pl-5 text-[15px] leading-relaxed text-body">
              {steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        )}
      </aside>
    </main>
  );
}
