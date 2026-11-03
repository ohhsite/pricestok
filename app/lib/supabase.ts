import "server-only";
import { createClient } from "@supabase/supabase-js";
export function getSupabase() {
  const url = process.env.SUPABASE_URL,
    key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key)
    throw new Error("Skonfiguruj Supabase przed zapisem danych.");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
