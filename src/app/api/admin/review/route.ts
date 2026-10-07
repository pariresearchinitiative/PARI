import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { reviseBrief } from "@/lib/ai";
import { runDailyPipeline } from "@/lib/pipeline";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { BriefContent } from "@/lib/types";

async function require() {
  const admin = await getAdminUser();
  if (!admin) return null;
  return admin;
}

export async function POST(req: Request) {
  const admin = await require();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const action = body.action as string;
  const db = supabaseAdmin();

  if (action === "pipeline") {
    const result = await runDailyPipeline();
    return NextResponse.json({ ok: true, result });
  }

  const queueId = body.queueId as string;
  if (!queueId) return NextResponse.json({ error: "queueId required" }, { status: 400 });

  const { data: item, error } = await db
    .from("review_queue")
    .select("*, briefs(*), papers(*)")
    .eq("id", queueId)
    .maybeSingle();
  if (error || !item) return NextResponse.json({ error: "Review item not found" }, { status: 404 });

  if (action === "approve") {
    await db
      .from("briefs")
      .update({ status: "published", published_at: new Date().toISOString() })
      .eq("id", item.brief_id);
    await db
      .from("review_queue")
      .update({ state: "approved", reviewed_at: new Date().toISOString(), reviewer_note: body.note || null })
      .eq("id", queueId);
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    await db.from("briefs").update({ status: "rejected" }).eq("id", item.brief_id);
    await db.from("papers").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", item.paper_id);
    await db
      .from("review_queue")
      .update({ state: "rejected", reviewed_at: new Date().toISOString(), reviewer_note: body.note || null })
      .eq("id", queueId);
    return NextResponse.json({ ok: true });
  }

  if (action === "request_changes") {
    const instruction = String(body.instruction || "").trim();
    if (!instruction) return NextResponse.json({ error: "instruction required" }, { status: 400 });
    const brief = item.briefs as { content: BriefContent; title: string; summary: string; seo_title?: string; seo_description?: string };
    const paper = item.papers;
    const revised = await reviseBrief({ brief, paper, instruction });
    const content: BriefContent = {
      ...revised.content,
      original_research: brief.content?.original_research ?? {
        authors: [],
        journal: null,
        publication_date: null,
        doi: null,
        source_url: null
      }
    };
    await db
      .from("briefs")
      .update({
        title: revised.title || brief.title,
        summary: revised.summary || brief.summary,
        seo_title: revised.seo_title,
        seo_description: revised.seo_description,
        content
      })
      .eq("id", item.brief_id);
    await db
      .from("review_queue")
      .update({
        state: "pending",
        change_request: instruction,
        reviewer_note: instruction
      })
      .eq("id", queueId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
