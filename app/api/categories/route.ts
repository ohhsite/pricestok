import { listCategories } from "../../lib/categories";
export async function GET() {
  return Response.json((await listCategories()).map(({ id, name, parent }) => ({ id, name, parent })), { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
