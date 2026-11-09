import "server-only";
import { cache } from "react";
import { categories } from "./data";
import { databaseConfigured } from "./config";
import { getSupabase } from "./supabase";

export type Category = (typeof categories)[number] & {
  parent?: string | null;
  title?: string;
  description?: string;
  content?: string;
};

export const listCategories = cache(async (): Promise<Category[]> => {
  if (!databaseConfigured()) return categories;
  const { data, error } = await getSupabase()
    .from("bnp_categories").select("*").order("name");
  if (error) return categories;
  const byId = new Map<string, Category>(categories.map((category) => [category.id, category]));
  for (const row of data || []) {
    const { deleted, ...category } = row;
    if (deleted) byId.delete(category.id);
    else byId.set(category.id, { icon: "ShoppingBag", color: "#fff3d8", ...byId.get(category.id), ...category });
  }
  return [...byId.values()];
});
