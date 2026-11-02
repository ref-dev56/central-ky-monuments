import client from "../../tina/__generated__/client";

/**
 * Data helpers. Every page reads content through these functions at build
 * time, so components never talk to the Tina client directly.
 */

/** The single Site settings document (content/settings/site.json). */
export async function getSettings() {
  const { data } = await client.queries.settings({ relativePath: "site.json" });
  return data.settings;
}

export type Settings = Awaited<ReturnType<typeof getSettings>>;

/** All categories, sorted by their "Sort order" field. */
export async function getCategories() {
  const { data } = await client.queries.categoryConnection();
  return (data.categoryConnection.edges ?? [])
    .map((edge) => edge?.node)
    .filter((category) => category != null)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

/** All stones (first 500), in file order. */
export async function getStones() {
  const { data } = await client.queries.stoneConnection({ first: 500 });
  return (data.stoneConnection.edges ?? [])
    .map((edge) => edge?.node)
    .filter((stone) => stone != null);
}

/** "(859) 555-0142" -> "tel:+18595550142" */
export function telHref(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return undefined;
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}
