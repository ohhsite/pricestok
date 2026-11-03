import "server-only";
import { databaseConfigured } from "./config";
import { getSupabase } from "./supabase";

export type Company = {
  slug: string;
  name: string;
  category: string;
  description: string;
  address: string;
  website: string;
};

export async function listCompanies(): Promise<Company[]> {
  if (!databaseConfigured()) return [];
  const { data, error } = await getSupabase()
    .from("bnp_companies")
    .select("*")
    .order("name");
  if (error) throw error;
  return data || [];
}
