import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryTabs from "@/components/CategoryTabs";
import ContactBand from "@/components/ContactBand";
import Gallery from "@/components/Gallery";
import { getCategories, getGalleryStones, getSettings } from "@/lib/content";

// Only the categories in the CMS get pages; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/[category]">,
): Promise<Metadata> {
  const { category: slug } = await props.params;
  const [categories, settings] = await Promise.all([getCategories(), getSettings()]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: `${category.name} in Central Kentucky | ${settings.businessName}`,
    description: category.intro ?? undefined,
  };
}

export default async function CategoryPage(props: PageProps<"/[category]">) {
  const { category: slug } = await props.params;
  const [settings, categories, stones] = await Promise.all([
    getSettings(),
    getCategories(),
    getGalleryStones(slug),
  ]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <main className="flex flex-1 flex-col">
      <section className="border-b border-border bg-stone">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-16">
          <h1 className="font-serif text-[40px] font-semibold leading-tight sm:text-[52px]">
            {category.name}
          </h1>
          {category.intro && (
            <p className="max-w-2xl text-lg leading-relaxed text-body">{category.intro}</p>
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <CategoryTabs categories={categories} active={category.slug} />
        <div className="pt-8">
          <Gallery stones={stones} businessName={settings.businessName} label={category.name} />
        </div>
      </div>

      <ContactBand />
    </main>
  );
}
