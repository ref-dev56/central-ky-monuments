import client from "../../tina/__generated__/client";

// Temporary placeholder that proves the CMS connection: it reads Site
// settings and the stone list from Tina at build time. The real home page
// (photo hero, category tabs, gallery, lightbox) comes in phase 2.
export default async function Home() {
  const { data: settingsData } = await client.queries.settings({
    relativePath: "site.json",
  });
  const { data: stoneData } = await client.queries.stoneConnection();

  const settings = settingsData.settings;
  const stones = (stoneData.stoneConnection.edges ?? [])
    .map((edge) => edge?.node)
    .filter((stone) => stone != null);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <p className="text-sm font-medium tracking-wide text-muted">
        Serving {settings.serviceArea?.slice(0, 3).join(", ")} and nearby
      </p>
      <h1 className="font-serif text-5xl font-semibold leading-tight">
        {settings.businessName}
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-body">
        Site under construction. {stones.length}{" "}
        {stones.length === 1 ? "stone" : "stones"} loaded from the CMS:
      </p>
      <ul className="list-disc pl-6 text-body">
        {stones.map((stone) => (
          <li key={stone.sku}>
            {stone.name} ({stone.sku}) – {stone.category.name}
          </li>
        ))}
      </ul>
      <a
        href="#"
        className="inline-flex min-h-11 w-fit items-center rounded-md bg-brand px-5 font-medium text-white"
      >
        Request information
      </a>
    </main>
  );
}
