import { getStones } from "@/lib/content";

// Temporary placeholder body between the real header and footer. The real
// home page (photo hero, category tabs, gallery, lightbox) comes next.
export default async function Home() {
  const stones = await getStones();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-16 sm:px-6">
      <h1 className="font-serif text-5xl font-semibold leading-tight">
        Memorials that honor a life well lived
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-body">
        Home page coming next. {stones.length} stones loaded from the CMS.
      </p>
      <div aria-hidden="true" className="h-[1200px]" />
    </main>
  );
}
