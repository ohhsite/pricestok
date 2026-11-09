import { adminAllowed } from "../../../lib/admin";
import { listCategories } from "../../../lib/categories";
import { sameOrigin } from "../../../lib/config";
import { getSupabase } from "../../../lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request) || !(await adminAllowed()))
    return Response.json({ error: "Brak dostępu." }, { status: 403 });
  const raw = await request.text();
  if (raw.length > 14000) return Response.json({ error: "Za długa treść." }, { status: 413 });
  const input = JSON.parse(raw);
  const { id, name, parent, title, description, content } = input;
  const all = await listCategories();
  if (input.action === "delete") {
    const category = all.find((c) => c.id === id);
    if (!category) return Response.json({ ok: true });
    const db = getSupabase();
    const [offers, companies] = await Promise.all([
      import("../../../lib/repository").then(({ listOffers }) => listOffers(true)),
      db.from("bnp_companies").select("slug").eq("category", id).limit(1),
    ]);
    if (companies.error) return Response.json({ error: "Nie udało się sprawdzić powiązanych firm." }, { status: 500 });
    if (all.some((c) => c.parent === id) || offers.some((o) => o.category === id) || companies.data.length)
      return Response.json({ error: "Najpierw przenieś oferty, firmy i podkategorie." }, { status: 409 });
    const { error } = await db.from("bnp_categories").upsert({ id, name: category.name, deleted: true });
    return error
      ? Response.json({ error: "Uruchom migrację kategorie-usuwanie.sql i spróbuj ponownie." }, { status: 500 })
      : Response.json({ ok: true });
  }
  if (
    typeof id !== "string" || id.length > 80 || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) ||
    typeof name !== "string" || !name.trim() || name.length > 80 ||
    typeof title !== "string" || title.length > 120 ||
    typeof description !== "string" || description.length > 320 ||
    typeof content !== "string" || content.length > 10000 ||
    (parent !== "" && (parent === id || !all.some((c) => c.id === parent && !c.parent) ||
      all.some((c) => c.parent === id)))
  ) return Response.json({ error: "Sprawdź nazwę, adres i kategorię nadrzędną." }, { status: 400 });
  const existing = all.find((category) => category.id === id);
  if (existing && input.editing !== id)
    return Response.json({ error: "Ten adres jest już używany." }, { status: 409 });
  const db = getSupabase();
  const stored = await db.from("bnp_categories").select("*").eq("id", id).maybeSingle();
  const { error } = await db.from("bnp_categories")
    .upsert({ id, name: name.trim(), parent: parent || null, title, description, content,
      ...(stored.data?.deleted ? { deleted: false } : {}) });
  return error
    ? Response.json({ error: "Nie udało się zapisać kategorii. Uruchom supabase/kategorie.sql." }, { status: 500 })
    : Response.json({ ok: true });
}
