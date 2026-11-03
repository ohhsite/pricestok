import { databaseConfigured } from "../../../lib/config";
import { photoName } from "../../../lib/photos";
import { getSupabase } from "../../../lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!photoName.test(name) || !databaseConfigured())
    return new Response(null, { status: 404 });
  const { data } = getSupabase()
    .storage.from("bnp-offer-images")
    .getPublicUrl(name);
  return Response.redirect(data.publicUrl, 307);
}
