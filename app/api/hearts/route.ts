import { createHash, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { databaseConfigured, sameOrigin } from "../../lib/config";
import { isActive } from "../../lib/data";
import { listOffers } from "../../lib/repository";
import { getSupabase } from "../../lib/supabase";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  if (!databaseConfigured()) return new Response(null, { status: 503 });
  const input = await request.json().catch(() => null);
  if (
    typeof input?.id !== "string" ||
    input.id.length > 100 ||
    typeof input.enabled !== "boolean"
  )
    return new Response(null, { status: 400 });
  const offer = (await listOffers()).find(
    (item) => item.id === input.id && isActive(item),
  );
  if (!offer) return new Response(null, { status: 404 });
  const cookie = (await cookies()).get("ps-visitor")?.value;
  const visitor =
    cookie && /^[a-f0-9-]{36}$/.test(cookie) ? cookie : randomUUID();
  const { data, error } = await getSupabase().rpc("bnp_set_heart", {
    p_offer_id: offer.id,
    p_visitor: createHash("sha256").update(visitor).digest("hex"),
    p_enabled: input.enabled,
  });
  if (error) return new Response(null, { status: 503 });
  const response = NextResponse.json({
    count: Number(data),
    enabled: input.enabled,
  });
  response.cookies.set("ps-visitor", visitor, {
    httpOnly: true,
    sameSite: "lax",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: 31536000,
  });
  return response;
}
