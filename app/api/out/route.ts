import { listOffers } from "../../lib/repository";
import { isActive } from "../../lib/data";
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id"),
    o = (await listOffers()).find((o) => o.id === id && isActive(o));
  if (!o) return new Response("Oferta niedostępna", { status: 404 });
  return Response.redirect(o.source, 302);
}
