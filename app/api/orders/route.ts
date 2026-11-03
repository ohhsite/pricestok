import { createHash, timingSafeEqual } from "node:crypto";
import { getSupabase } from "../../lib/supabase";
import { databaseConfigured } from "../../lib/config";
export async function GET(req: Request) {
  if (!databaseConfigured())
    return new Response("Unavailable", { status: 503 });
  const url = new URL(req.url),
    id = url.searchParams.get("id"),
    token = url.searchParams.get("token");
  if (!id || !token || token.length !== 64)
    return new Response("Not found", { status: 404 });
  const { data, error } = await getSupabase()
    .from("bnp_orders")
    .select("id,status,plan,access_hash,offer_id,approved_at")
    .eq("id", id)
    .maybeSingle();
  if (error) return new Response("Unavailable", { status: 500 });
  const hash = createHash("sha256").update(token).digest("hex");
  if (
    !data ||
    !data.access_hash ||
    !timingSafeEqual(Buffer.from(hash), Buffer.from(data.access_hash))
  )
    return new Response("Not found", { status: 404 });
  return Response.json(
    {
      status: data.status,
      plan: data.plan,
      published: data.status === "published",
      offerId: data.offer_id,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Referrer-Policy": "no-referrer",
      },
    },
  );
}
