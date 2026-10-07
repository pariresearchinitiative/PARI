import { BriefBody } from "@/components/BriefBody";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { BriefContent } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ReviewActions } from "@/components/admin/ReviewActions";

export const dynamic = "force-dynamic";

export default async function AdminBriefPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const db = supabaseAdmin();
  const { data: brief } = await db.from("briefs").select("*").eq("id", params.id).maybeSingle();
  if (!brief) notFound();
  const { data: queue } = await db.from("review_queue").select("*").eq("brief_id", brief.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { data: analysis } = await db.from("analyses").select("*").eq("paper_id", brief.paper_id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const content = brief.content as BriefContent | null;

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <Link href="/admin" className="text-sm text-muted hover:text-ink">
        ← Queue
      </Link>
      <p className="mt-6 text-xs uppercase tracking-[0.18em] text-accent">{brief.category} · {brief.status}</p>
      <h1 className="serif mt-3 text-4xl font-semibold">{brief.title}</h1>
      <p className="mt-4 text-lg text-muted">{brief.summary}</p>
      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm text-muted">
        <div>Importance: {analysis?.importance_score ?? "—"}</div>
        <div>Confidence: {analysis?.confidence_score ?? "—"}</div>
        <div>Citations: {analysis?.citation_status ?? "—"}</div>
        <div>Verification: {analysis?.verifier_status ?? "—"}</div>
      </dl>
      {queue ? <ReviewActions queueId={queue.id} /> : null}
      {content ? <BriefBody content={content} /> : <p className="mt-8 text-muted">No content yet.</p>}
    </main>
  );
}
