import { holiday } from "./lib/holiday";
import type { MetadataRoute } from "next";
import { siteUrl } from "./lib/config";
import { listOffers } from "./lib/repository";
import { listCategories } from "./lib/categories";
import { isActive } from "./lib/data";
import { databaseConfigured } from "./lib/config";
import { getSupabase } from "./lib/supabase";
import { listCompanies } from "./lib/companies";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const categories = await listCategories();
  const active = (await listOffers()).filter((o) => isActive(o));
  const profiles = databaseConfigured()
    ? await getSupabase()
        .from("bnp_billing")
        .select("id")
        .eq("plan", "company")
        .eq("approved", true)
        .eq("state", "active")
        .eq("blocked", false)
        .or("net.eq.20000,paid_until.gt." + new Date().toISOString())
    : { data: [], error: null };
  const companies = await listCompanies().catch(() => []);
  return [
    ...Object.values(holiday).map(({ slug }) => ({ url: base + "/" + slug })),
    { url: base + "/o-nas", changeFrequency: "monthly" as const },
    { url: base + "/firmy", changeFrequency: "weekly" as const },
    ...(profiles.data || []).map((p) => ({
      url: base + "/wizytowka/" + p.id,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: base, changeFrequency: "daily" as const, priority: 1 },
    ...categories
      .filter((c) => c.content?.trim() || active.some((o) => o.category === c.id ||
        categories.some((child) => child.id === o.category && child.parent === c.id)))
      .map((c) => ({
        url: base + "/kategoria/" + c.id,
        changeFrequency: "daily" as const,
        priority: 0.8,
      })),
    ...active.map((o) => ({
      url: base + "/promocja/" + o.slug,
      lastModified: new Date(o.verified + "T12:00:00Z"),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...[
      ...new Set([
        ...active.map((o) => o.companySlug),
        ...companies.map((c) => c.slug),
      ]),
    ].map((s) => ({
      url: base + "/firma/" + s,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
