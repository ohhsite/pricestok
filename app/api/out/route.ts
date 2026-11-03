import { listOffers } from "../../lib/repository";
import { getSupabase } from "../../lib/supabase";
import { databaseConfigured } from "../../lib/config";
import { isActive } from "../../lib/data";
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id"),
    o = (await listOffers()).find((o) => o.id === id && isActive(o));
  if (!o) return new Response("Oferta niedostępna", { status: 404 });
  if (databaseConfigured())
    await getSupabase().rpc("bnp_increment_metric", {
      offer_id: o.id,
      metric_name: "clicks",
    });
  return Response.redirect(o.source, 302);
}
