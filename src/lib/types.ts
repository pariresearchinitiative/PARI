export type PaperStatus =
  | "discovered"
  | "filtered"
  | "processing"
  | "analyzed"
  | "queued"
  | "rejected"
  | "failed";

export type BriefStatus = "draft" | "in_review" | "published" | "rejected";

export type ReviewState = "pending" | "changes_requested" | "approved" | "rejected";

export type OriginalResearch = {
  authors: string[];
  journal: string | null;
  publication_date: string | null;
  doi: string | null;
  source_url: string | null;
};

export type BriefContent = {
  one_line_summary: string;
  what_happened: string;
  research_question: string;
  in_simple_words: string;
  methodology: string;
  key_findings: string[];
  limitations: string[];
  why_it_matters: string;
  original_research: OriginalResearch;
};

export type Paper = {
  id: string;
  title: string;
  authors: string[] | unknown;
  abstract: string | null;
  doi: string | null;
  source_url: string | null;
  publication_date: string | null;
  field: string | null;
  keywords: string[] | null;
  venue: string | null;
  status: string;
  importance_score: number | null;
  ai_confidence: number | null;
  created_at: string;
};

export type Analysis = {
  id: string;
  paper_id: string;
  research_question: string | null;
  methodology: string | null;
  findings: string[] | unknown;
  limitations: string[] | unknown;
  evidence: string[] | unknown;
  novelty_score: number | null;
  importance_score: number | null;
  confidence_score: number | null;
  verifier_status: string | null;
  citation_status: string | null;
  created_at: string;
};

export type Brief = {
  id: string;
  paper_id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: BriefContent | null;
  category: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: BriefStatus | string;
  published_at: string | null;
  created_at: string;
  papers?: Paper | Paper[] | null;
};

export type ReviewItem = {
  id: string;
  paper_id: string;
  brief_id: string;
  state: ReviewState | string;
  reviewer_note: string | null;
  change_request: string | null;
  created_at: string;
  reviewed_at: string | null;
  briefs?: Brief | Brief[] | null;
  papers?: Paper | Paper[] | null;
};

export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

export function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}
