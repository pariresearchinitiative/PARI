export type ScoutJudgement = {
  keep: boolean;
  field: string;
  reason: string;
  importance_score: number;
};

export type PaperInput = {
  title: string;
  authors: string[];
  abstract?: string | null;
  venue?: string | null;
  doi?: string | null;
  field?: string | null;
};

export type PaperAnalysis = {
  research_question: string;
  methodology: string;
  findings: string[];
  limitations: string[];
  evidence: string[];
  why_it_matters: string;
  novelty_score: number;
  importance_score: number;
  confidence_score: number;
};

export type GeneratedBrief = {
  title: string;
  summary: string;
  seo_title: string;
  seo_description: string;
  category: string;
  content: {
    one_line_summary: string;
    what_happened: string;
    research_question: string;
    in_simple_words: string;
    methodology: string;
    key_findings: string[];
    limitations: string[];
    why_it_matters: string;
  };
  social_draft: string;
};

export type Verification = {
  citation_status: "passed" | "flagged" | "insufficient_source";
  verifier_status: "passed" | "flagged" | "insufficient_source";
  notes: string[];
  confidence: number;
};

export type ScoutInput = {
  title: string;
  abstract?: string | null;
  field?: string | null;
  venue?: string | null;
  cited_by?: number | null;
};

export type ReviseInput = {
  brief: unknown;
  paper: unknown;
  instruction: string;
};
