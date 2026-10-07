import { ReviewDesk } from "@/components/admin/ReviewDesk";
import { requireAdmin } from "@/lib/auth";
import { hasSupabaseAdmin, supabaseAdmin } from "@/lib/supabase-admin";
import type { Metadata } from "next";
import { one, type Analysis, type Brief, type Paper, type ReviewItem } from "@/lib/types";

export const metadata: Metadata = {
  title: "Admin review",
  robots: { index: false, follow: false }
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!hasSupabaseAdmin()) {
    return (
      <main className="mx-auto max-w-page px-5 py-12">
        <h1 className="serif text-4xl font-semibold">Review queue</h1>
        <p className="mt-4 text-muted">Add Supabase keys in `.env.local` and run `supabase/schema.sql` to activate the desk.</p>
      </main>
    );
  }

  const db = supabaseAdmin();
  const { data: queue } = await db
    .from("review_queue")
    .select("*, briefs(*), papers(*)")
    .in("state", ["pending", "changes_requested"])
    .order("created_at", { ascending: false });

  const paperIds = (queue ?? []).map((row) => row.paper_id).filter(Boolean);
  const { data: analyses } = paperIds.length
    ? await db
        .from("analyses")
        .select("paper_id, importance_score, confidence_score, verifier_status, citation_status, created_at")
        .in("paper_id", paperIds)
        .order("created_at", { ascending: false })
    : { data: [] as Analysis[] };

  const latestAnalysis = new Map<string, Analysis>();
  for (const row of (analyses ?? []) as Analysis[]) {
    if (!latestAnalysis.has(row.paper_id)) latestAnalysis.set(row.paper_id, row);
  }

  const items = (queue ?? []).map((row) => {
    const brief = one(row.briefs as Brief | Brief[] | null);
    const paper = one(row.papers as Paper | Paper[] | null);
    const analysis = latestAnalysis.get(row.paper_id);
    return {
      id: row.id as string,
      title: brief?.title || paper?.title || "Untitled",
      category: brief?.category || paper?.field || "—",
      importance: analysis?.importance_score ?? paper?.importance_score ?? null,
      confidence: analysis?.confidence_score ?? paper?.ai_confidence ?? null,
      citation: analysis?.citation_status || "unchecked",
      verification: analysis?.verifier_status || "pending",
      createdAt: row.created_at as string,
      status: row.state as string,
      briefId: row.brief_id as string
    };
  });

  return <ReviewDesk email={admin.email} items={items} />;
}
