import { hasSupabasePublic } from "@/lib/env";
import { createServerSupabase } from "@/lib/supabase-server";
import type { Brief } from "@/lib/types";
import { one } from "@/lib/types";

const briefSelect = "id, paper_id, title, slug, summary, content, category, seo_title, seo_description, status, published_at, created_at, papers (id, title, authors, doi, source_url, publication_date, venue, field, importance_score, ai_confidence)";

export async function getPublishedBriefs(limit = 24, category?: string): Promise<Brief[]> {
  if (!hasSupabasePublic()) return [];
  const db = createServerSupabase();
  let query = db.from("briefs").select(briefSelect).eq("status", "published").order("published_at", { ascending: false }).limit(limit);
  if (category) query = query.eq("category", category);
  try {
    const { data, error } = await query;
    if (error) {
      console.error("[PARI] getPublishedBriefs:", error.message, error.code || "");
      return [];
    }
    return (data ?? []) as Brief[];
  } catch (err) {
    console.error("[PARI] getPublishedBriefs threw:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function getPublishedBrief(slug: string): Promise<Brief | null> {
  if (!hasSupabasePublic()) return null;
  const db = createServerSupabase();
  try {
    const { data, error } = await db.from("briefs").select(briefSelect).eq("slug", slug).eq("status", "published").maybeSingle();
    if (error) {
      console.error("[PARI] getPublishedBrief:", error.message, error.code || "");
      return null;
    }
    return (data as Brief) ?? null;
  } catch (err) {
    console.error("[PARI] getPublishedBrief threw:", err instanceof Error ? err.message : err);
    return null;
  }
}

export async function searchPublishedBriefs(q: string): Promise<Brief[]> {
  if (!hasSupabasePublic() || !q.trim()) return [];
  const db = createServerSupabase();
  const term = q.trim().replace(/%/g, "");
  try {
    const { data, error } = await db
      .from("briefs")
      .select(briefSelect)
      .eq("status", "published")
      .or(`title.ilike.%${term}%,summary.ilike.%${term}%,category.ilike.%${term}%`)
      .order("published_at", { ascending: false })
      .limit(30);
    if (error) {
      console.error("[PARI] searchPublishedBriefs:", error.message, error.code || "");
      return [];
    }
    return (data ?? []) as Brief[];
  } catch (err) {
    console.error("[PARI] searchPublishedBriefs threw:", err instanceof Error ? err.message : err);
    return [];
  }
}

export function paperFrom(brief: Brief) {
  return one(brief.papers);
}
