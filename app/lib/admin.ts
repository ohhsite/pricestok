import "server-only";
import { cookies } from "next/headers";
import { getSupabase } from "./supabase";
import { databaseConfigured } from "./config";
export async function adminAllowed() {
  if (!databaseConfigured() || !process.env.ADMIN_EMAIL) return false;
  const token = (await cookies()).get("bnp-admin")?.value;
  if (!token) return false;
  const { data, error } = await getSupabase().auth.getUser(token);
  return (
    !error &&
    !!data.user?.email &&
    data.user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
  );
}
