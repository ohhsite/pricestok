import { adminAllowed } from "../../../lib/admin";
import { listCategories } from "../../../lib/categories";
import { listCompanies } from "../../../lib/companies";
import { getSupabase } from "../../../lib/supabase";
import { sameOrigin } from "../../../lib/config";

export async function GET() {
  if (!(await adminAllowed()))
    return Response.json({ error: "Zaloguj się ponownie." }, { status: 403 });
  try {
    return Response.json(await listCompanies(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      {
        error:
          "Nie udało się pobrać firm. Sprawdź Supabase i migrację panel.sql.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req) || !(await adminAllowed()))
    return Response.json({ error: "Brak dostępu." }, { status: 403 });
  const raw = await req.text();
  if (raw.length > 10000)
    return Response.json({ error: "Za długi opis." }, { status: 413 });
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Nieprawidłowe dane." }, { status: 400 });
  }
  const { name, category, description, address, website } = input || {};
  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.length > 120 ||
    !(await listCategories()).some((c) => c.id === category) ||
    typeof description !== "string" ||
    description.length > 2000 ||
    typeof address !== "string" ||
    address.length > 200 ||
    typeof website !== "string" ||
    website.length > 500 ||
    (website && !/^https?:\/\/[^\s]+$/i.test(website))
  )
    return Response.json(
      { error: "Sprawdź nazwę, kategorię i adres strony firmy." },
      { status: 400 },
    );
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
  if (!slug)
    return Response.json(
      { error: "Nazwa musi zawierać litery lub cyfry." },
      { status: 400 },
    );
  const { error } = await getSupabase()
    .from("bnp_companies")
    .insert({
      slug,
      name: name.trim(),
      category,
      description,
      address,
      website,
    });
  if (error)
    return Response.json(
      {
        error:
          error.code === "23505"
            ? "Firma o tej nazwie jest już w katalogu."
            : "Nie udało się zapisać firmy.",
      },
      { status: error.code === "23505" ? 409 : 500 },
    );
  return Response.json({ ok: true });
}
