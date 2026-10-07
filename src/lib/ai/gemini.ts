import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ResearchAiProvider } from "@/lib/ai/provider";
import type {
  GeneratedBrief,
  PaperAnalysis,
  PaperInput,
  ReviseInput,
  ScoutInput,
  ScoutJudgement,
  Verification
} from "@/lib/ai/types";

const SYSTEM = `You are part of PARI (Pranav Academic & Research Initiative), a research translation platform.
Rules you MUST follow:
- Use ONLY the supplied paper metadata and abstract/text.
- Never invent authors, DOIs, statistics, journals, citations, or findings.
- If a fact is not in the source, say it is not stated in the available text.
- Prefer cautious language. Do not overclaim.
- Return valid JSON only.`;

function modelName() {
  return process.env.GEMINI_MODEL || "gemini-2.0-flash";
}

function client() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing GEMINI_API_KEY");
  return new GoogleGenerativeAI(key);
}

async function runJson(role: string, task: string, payload: unknown) {
  const genAI = client();
  const model = genAI.getGenerativeModel({
    model: modelName(),
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  });
  const result = await model.generateContent(
    `${SYSTEM}\n\nYour role: ${role}.\n${task}\n\nINPUT:\n${JSON.stringify(payload)}`
  );
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Gemini adapter. Selected automatically when GEMINI_API_KEY is set
 * (unless AI_PROVIDER=mock). The rest of PARI never imports this file directly.
 */
export const geminiProvider: ResearchAiProvider = {
  name: "gemini",

  async scoutFilter(paper: ScoutInput) {
    return runJson(
      "Scout + Filter/Deduplicator",
      `Decide if this paper is worth a PARI brief for students, researchers, and the public.
Keep only substantial research articles (not news blurbs, not empty editorials).
importance_score: 0-100 based on novelty, public interest, and scientific substance given ONLY this metadata.
field must be one of: AI & ML, Medicine & Biology, Climate & Environment, Physics & Space, Psychology, Economics, Materials Science, Robotics, Neuroscience, Other.
Return { keep: boolean, field: string, reason: string, importance_score: number }`,
      paper
    ) as Promise<ScoutJudgement>;
  },

  async analyzePaperStructured(paper: PaperInput) {
    return runJson(
      "Paper Analyst",
      `Analyze the paper from title, authors, venue, DOI, and abstract only.
If the full methods/results are not in the abstract, state that limitation explicitly.
Return {
  research_question: string,
  methodology: string,
  findings: string[],
  limitations: string[],
  evidence: string[],
  why_it_matters: string,
  novelty_score: number (0-100),
  importance_score: number (0-100),
  confidence_score: number (0-1)
}`,
      paper
    ) as Promise<PaperAnalysis>;
  },

  async writeBrief(input: { paper: Record<string, unknown>; analysis: PaperAnalysis }) {
    return runJson(
      "Brief Writer + SEO/Social Draft Generator",
      `Write an original PARI research brief. Do not copy the abstract verbatim.
Audience: students, researchers, and the general public. Tone: precise, calm, literate.
Category must match the paper field.
seo_title <= 60 chars. seo_description <= 155 chars.
social_draft: 1-2 sentences, no hype, include that this is a PARI explanation of a paper.
Return {
  title, summary, seo_title, seo_description, category, social_draft,
  content: {
    one_line_summary, what_happened, research_question, in_simple_words,
    methodology, key_findings: string[], limitations: string[], why_it_matters
  }
}`,
      input
    ) as Promise<GeneratedBrief>;
  },

  async verifyBrief(input: { paper: Record<string, unknown>; analysis: PaperAnalysis; brief: GeneratedBrief }) {
    return runJson(
      "Fact/Citation Verifier",
      `Check the brief against the paper metadata/abstract.
Flag any claim not supported by the source. Never invent a DOI or citation to "fix" a gap.
citation_status: passed if authors/DOI/venue/date in the brief match the input; flagged if they disagree; insufficient_source if missing.
verifier_status: passed / flagged / insufficient_source for scientific claims.
Return { citation_status, verifier_status, notes: string[], confidence: number (0-1) }`,
      input
    ) as Promise<Verification>;
  },

  async reviseBrief(input: ReviseInput) {
    return runJson(
      "Brief Writer",
      `Revise the PARI brief following the human instruction.
Do not add new scientific claims that are not in the paper/abstract.
Keep the same JSON shape as the existing brief content plus title and summary.
Return { title, summary, seo_title, seo_description, content: { one_line_summary, what_happened, research_question, in_simple_words, methodology, key_findings, limitations, why_it_matters } }`,
      input
    ) as Promise<GeneratedBrief>;
  }
};
