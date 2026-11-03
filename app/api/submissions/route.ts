import { categories } from "../../lib/data";
import { getSupabase } from "../../lib/supabase";
import { databaseConfigured, sameOrigin } from "../../lib/config";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  if (!databaseConfigured())
    return Response.json(
      {
        error:
          "Formularz wymaga podłączenia Supabase. Instrukcja znajduje się w README.",
      },
      { status: 503 },
    );
  try {
    const data = await request.json();
    if (data.website) return Response.json({ ok: true });
    const kind =
      data.kind === "company" || data.kind === "ad" ? data.kind : "offer";
    if (kind !== "offer")
      data.title = kind === "company" ? "Nowa firma" : "Zapytanie o baner";
    data.kind = kind;
    if (
      typeof data.company !== "string" ||
      typeof data.title !== "string" ||
      data.company.length < 2 ||
      data.company.length > 150 ||
      (kind !== "offer" && data.company.length > 120) ||
      !categories.some((category) => category.id === data.category) ||
      typeof data.source !== "string" ||
      data.source.length > (kind === "offer" ? 1000 : 500) ||
      (kind === "company" &&
        (typeof data.conditions !== "string" ||
          data.conditions.length > 2000)) ||
      (kind === "ad" &&
        (typeof data.contact !== "string" ||
          data.contact.length > 254 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact))) ||
      data.title.length < 3 ||
      data.title.length > 200 ||
      !/^https?:\/\//.test(data.source || "") ||
      !data.confirmed ||
      JSON.stringify(data).length > 15000
    )
      return Response.json(
        { error: "Sprawdź wymagane pola i link do oferty." },
        { status: 400 },
      );
    const { error } = await getSupabase().from("bnp_submissions").insert({
      id: crypto.randomUUID(),
      data,
      created: new Date().toISOString(),
    });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Nie udało się zapisać zgłoszenia." },
      { status: 500 },
    );
  }
}
