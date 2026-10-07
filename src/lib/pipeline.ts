import { analyzePaperStructured, getAiProviderName, scoutFilter, verifyBrief, writeBrief } from "@/lib/ai";
import { fetchOpenAlexWorks, normalizeTitle, type DiscoveredPaper } from "@/lib/openalex";
import { uniqueSlug } from "@/lib/slug";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { BriefContent } from "@/lib/types";

function authorsOf(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  return [];
}

export async function runScout() {
  const db = supabaseAdmin();
  const discovered = await fetchOpenAlexWorks(8);
  let inserted = 0;
  let skipped = 0;

  for (const paper of discovered) {
    if (await isDuplicate(paper)) {
      skipped += 1;
      continue;
    }
    const judgement = await scoutFilter({
      title: paper.title,
      abstract: paper.abstract,
      field: paper.field,
      venue: paper.venue,
      cited_by: paper.cited_by
    });
    if (!judgement.keep || judgement.importance_score < 45) {
      skipped += 1;
      continue;
    }
    const { error } = await db.from("papers").insert({
      title: paper.title,
      authors: paper.authors,
      abstract: paper.abstract,
      doi: paper.doi,
      source_url: paper.source_url,
      publication_date: paper.publication_date,
      field: judgement.field || paper.field,
      keywords: paper.keywords,
      venue: paper.venue,
      openalex_id: paper.openalex_id || null,
      status: "discovered",
      importance_score: judgement.importance_score
    });
    if (error) {
      if (error.code === "23505") skipped += 1;
      else throw error;
    } else inserted += 1;
  }

  return { discovered: discovered.length, inserted, skipped };
}

async function isDuplicate(paper: DiscoveredPaper) {
  const db = supabaseAdmin();
  if (paper.doi) {
    const { data } = await db.from("papers").select("id").eq("doi", paper.doi).maybeSingle();
    if (data) return true;
  }
  if (paper.openalex_id) {
    const { data } = await db.from("papers").select("id").eq("openalex_id", paper.openalex_id).maybeSingle();
    if (data) return true;
  }
  const { data: recent } = await db.from("papers").select("title").order("created_at", { ascending: false }).limit(200);
  const needle = normalizeTitle(paper.title);
  return (recent ?? []).some((row) => normalizeTitle(row.title) === needle);
}

export async function processNextPapers(limit = 2) {
  const db = supabaseAdmin();
  const { data: papers, error } = await db
    .from("papers")
    .select("*")
    .in("status", ["discovered", "filtered"])
    .order("importance_score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  const processed: string[] = [];
  const failed: string[] = [];

  for (const paper of papers ?? []) {
    try {
      await db.from("papers").update({ status: "processing", updated_at: new Date().toISOString() }).eq("id", paper.id);
      await processPaper(paper);
      processed.push(paper.id);
    } catch (err) {
      failed.push(paper.id);
      await db
        .from("papers")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", paper.id);
      console.error("PARI process failed", paper.id, err);
    }
  }
  return { processed: processed.length, failed: failed.length, ids: processed };
}

async function processPaper(paper: Record<string, unknown>) {
  const db = supabaseAdmin();
  const authors = authorsOf(paper.authors);
  const analysis = await analyzePaperStructured({
    title: String(paper.title),
    authors,
    abstract: (paper.abstract as string | null) ?? null,
    venue: (paper.venue as string | null) ?? null,
    doi: (paper.doi as string | null) ?? null,
    field: (paper.field as string | null) ?? null
  });

  const { data: analysisRow, error: analysisError } = await db
    .from("analyses")
    .insert({
      paper_id: paper.id,
      research_question: analysis.research_question,
      methodology: analysis.methodology,
      findings: analysis.findings,
      key_findings: analysis.findings,
      limitations: analysis.limitations,
      evidence: analysis.evidence,
      evidence_notes: analysis.evidence,
      why_it_matters: analysis.why_it_matters,
      novelty_score: analysis.novelty_score,
      importance_score: analysis.importance_score,
      confidence_score: analysis.confidence_score,
      confidence: analysis.confidence_score,
      verifier_status: "pending",
      citation_status: "unchecked"
    })
    .select("id")
    .single();
  if (analysisError) throw analysisError;

  const briefDraft = await writeBrief({
    paper: {
      title: paper.title,
      authors,
      abstract: paper.abstract,
      venue: paper.venue,
      doi: paper.doi,
      field: paper.field,
      publication_date: paper.publication_date,
      source_url: paper.source_url
    },
    analysis
  });

  const verification = await verifyBrief({
    paper: {
      title: paper.title,
      authors,
      doi: paper.doi,
      venue: paper.venue,
      publication_date: paper.publication_date,
      abstract: paper.abstract
    },
    analysis,
    brief: briefDraft
  });

  await db
    .from("analyses")
    .update({
      verifier_status: verification.verifier_status,
      citation_status: verification.citation_status,
      verifier_notes: verification.notes,
      confidence_score: verification.confidence ?? analysis.confidence_score,
      confidence: verification.confidence ?? analysis.confidence_score
    })
    .eq("id", analysisRow.id);

  const content: BriefContent = {
    one_line_summary: briefDraft.content.one_line_summary,
    what_happened: briefDraft.content.what_happened,
    research_question: briefDraft.content.research_question,
    in_simple_words: briefDraft.content.in_simple_words,
    methodology: briefDraft.content.methodology,
    key_findings: briefDraft.content.key_findings,
    limitations: briefDraft.content.limitations,
    why_it_matters: briefDraft.content.why_it_matters,
    original_research: {
      authors,
      journal: (paper.venue as string | null) ?? null,
      publication_date: (paper.publication_date as string | null) ?? null,
      doi: (paper.doi as string | null) ?? null,
      source_url: (paper.source_url as string | null) ?? null
    }
  };

  const slug = uniqueSlug(briefDraft.title || String(paper.title), String(paper.id));
  const { data: briefRow, error: briefError } = await db
    .from("briefs")
    .insert({
      paper_id: paper.id,
      title: briefDraft.title,
      slug,
      summary: briefDraft.summary || briefDraft.content.one_line_summary,
      content,
      category: briefDraft.category || paper.field,
      seo_title: briefDraft.seo_title,
      seo_description: briefDraft.seo_description,
      seo: {
        title: briefDraft.seo_title,
        description: briefDraft.seo_description,
        social_draft: briefDraft.social_draft
      },
      status: "in_review",
      read_time: 6
    })
    .select("id")
    .single();
  if (briefError) throw briefError;

  await db.from("review_queue").insert({
    paper_id: paper.id,
    brief_id: briefRow.id,
    state: "pending"
  });

  await db
    .from("papers")
    .update({
      status: "queued",
      importance_score: analysis.importance_score,
      ai_confidence: verification.confidence ?? analysis.confidence_score,
      updated_at: new Date().toISOString()
    })
    .eq("id", paper.id);
}

export async function runDailyPipeline() {
  const started = Date.now();
  const db = supabaseAdmin();
  try {
    const scout = await runScout();
    const process = await processNextPapers(2);
    const result = { scout, process, ms: Date.now() - started, ai: getAiProviderName() };
    await db.from("pipeline_runs").insert({ kind: "scout", status: "completed", meta: result });
    return result;
  } catch (error) {
    await db.from("pipeline_runs").insert({
      kind: "scout",
      status: "failed",
      meta: { error: error instanceof Error ? error.message : "unknown" }
    });
    throw error;
  }
}
