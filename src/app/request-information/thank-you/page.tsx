import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { getSettings, telHref } from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  // Only reachable after sending the form, so keep it out of search results.
  return pageMetadata({
    settings,
    path: "/request-information/thank-you/",
    title: `Thank you | ${settings.businessName}`,
    noindex: true,
  });
}

export default async function ThankYouPage() {
  const settings = await getSettings();
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-start gap-5 px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-serif text-[40px] font-semibold leading-tight sm:text-[52px]">
        Thank you
      </h1>
      {settings.request?.thankYou && (
        <p className="text-[17px] leading-relaxed text-body">{settings.request.thankYou}</p>
      )}
      {settings.phone && (
        <a
          href={telHref(settings.phone)}
          className="text-xl font-semibold text-ink hover:underline"
        >
          {settings.phone}
        </a>
      )}
      <Link
        href="/"
        className="mt-4 inline-flex min-h-[50px] items-center rounded-md bg-brand px-6 font-medium text-white hover:bg-ink"
      >
        Back to all designs
      </Link>
    </main>
  );
}
