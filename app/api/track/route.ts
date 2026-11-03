import { getSupabase } from "../../lib/supabase";
import { databaseConfigured, sameOrigin } from "../../lib/config";
import { listOffers } from "../../lib/repository";
import { isActive } from "../../lib/data";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Forbidden", { status: 403 });
  if (!databaseConfigured()) return Response.json({ ok: false });
  try {
    const { id } = await req.json();
    if (!(await listOffers()).some((o) => o.id === id && isActive(o)))
      return new Response("", { status: 404 });
    const { error } = await getSupabase().rpc("bnp_increment_metric", {
      offer_id: id,
      metric_name: "views",
    });
    if (error) throw error;
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
