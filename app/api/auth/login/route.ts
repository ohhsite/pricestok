import { NextResponse } from "next/server";
import { getSupabase } from "../../../lib/supabase";
import { sameOrigin, databaseConfigured } from "../../../lib/config";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  if (!databaseConfigured())
    return NextResponse.json(
      { error: "Najpierw skonfiguruj Supabase według README." },
      { status: 503 },
    );
  try {
    const { email, password } = await req.json();
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.toLowerCase() !== (process.env.ADMIN_EMAIL || "").toLowerCase()
    )
      return NextResponse.json(
        { error: "Nieprawidłowy e-mail lub hasło." },
        { status: 401 },
      );
    const { data, error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.session)
      return NextResponse.json(
        { error: "Nieprawidłowy e-mail lub hasło." },
        { status: 401 },
      );
    const res = NextResponse.json({ ok: true });
    res.cookies.set("bnp-admin", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.session.expires_in,
    });
    return res;
  } catch {
    return NextResponse.json(
      { error: "Nie udało się zalogować." },
      { status: 400 },
    );
  }
}
